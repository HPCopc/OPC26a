import type { PreSignUpTriggerHandler } from "aws-lambda";
import { isDisposableEmailDomain } from "disposable-email-domains-js";

// Blocked in addition to the bundled blocklist: these were on the original
// hand-maintained list but are absent from disposable-email-domains-js@1.26.0.
const EXTRA_BLOCKED_DOMAINS = new Set([
  "tempmail.com",
  "throwaway.email",
]);

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
      `Sign up is not allowed with disposable email domain: ${domain}. Please use a permanent email address.`
    );
  }

  return event;
};
