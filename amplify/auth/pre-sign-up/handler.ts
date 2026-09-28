import type { PreSignUpTriggerHandler } from "aws-lambda";
import { isDisposableEmailDomain } from "disposable-email-domains-js";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { env } from "$amplify/env/pre-sign-up";
import type { Schema } from "../../data/resource";
import { domainCandidates, isDefaultBlocked } from "../../shared/blockedEmailDomains";

// Blocked in addition to the bundled blocklist: these were on the original
// hand-maintained list but are absent from disposable-email-domains-js@1.26.0.
const EXTRA_BLOCKED_DOMAINS = new Set([
  "tempmail.com",
  "throwaway.email",
]);

// Cognito gives this trigger 5 seconds. If the BlockedEmailDomain lookup
// hasn't answered by then (cold start, throttling), use the built-in list.
const LOOKUP_TIMEOUT_MS = 3000;

// Configured on first use, not at module load, so a config failure is caught
// by the fallback below instead of failing Lambda INIT (which Cognito would
// surface to the user as a sign-up error).
let cachedClient: ReturnType<typeof generateClient<Schema>> | null = null;

async function getClient() {
  if (!cachedClient) {
    const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env as any);
    Amplify.configure(resourceConfig, libraryOptions);
    cachedClient = generateClient<Schema>({ authMode: "iam" });
  }
  return cachedClient;
}

/** True if the domain or one of its parent domains is in the BlockedEmailDomain table. */
async function isBlockedInTable(domain: string): Promise<boolean> {
  const client = await getClient();
  const results = await Promise.all(
    domainCandidates(domain).map((candidate) => client.models.BlockedEmailDomain.get({ domain: candidate }))
  );
  const failed = results.find((r) => r.errors?.length);
  if (failed) throw new Error(failed.errors![0].message);
  return results.some((r) => r.data);
}

async function isBlocked(domain: string): Promise<boolean> {
  try {
    return await Promise.race([
      isBlockedInTable(domain),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`timed out after ${LOOKUP_TIMEOUT_MS}ms`)), LOOKUP_TIMEOUT_MS)
      ),
    ]);
  } catch (error) {
    // Stable marker for a CloudWatch metric filter / alarm.
    console.error(`BLOCKLIST_LOOKUP_FAILED domain=${domain}`, error);
    return isDefaultBlocked(domain);
  }
}

export const handler: PreSignUpTriggerHandler = async (event) => {
  // Only screen self-service sign-ups. Admin-created users (app/api/admin/users)
  // and federated sign-ins are already trusted.
  if (event.triggerSource !== "PreSignUp_SignUp") {
    return event;
  }

  const email = event.request.userAttributes["email"];

  if (!email) {
    throw new Error("Email is required.");
  }

  const domain = email.split("@")[1]?.toLowerCase();

  if (!domain) {
    throw new Error("Invalid email format.");
  }

  if (EXTRA_BLOCKED_DOMAINS.has(domain) || isDisposableEmailDomain(domain)) {
    throw new Error(
      `Registration is not allowed with disposable email domain: ${domain}. Please use a permanent email address.`
    );
  }

  if (await isBlocked(domain)) {
    throw new Error(
      `Please register with your company email address. Personal email addresses (${domain}) can't be used.`
    );
  }

  return event;
};
