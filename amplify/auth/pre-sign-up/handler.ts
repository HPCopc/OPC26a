import type { PreSignUpTriggerHandler } from "aws-lambda";

// Fallback hardcoded blocklist in case mailcheck.ai is down
const BLOCKED_DOMAINS = [
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "yopmail.com",
  "10minutemail.com",
  "throwaway.email",
  "trashmail.com",
  "maildrop.cc",
  "fakeinbox.com",
  "dispostable.com",
];

async function isDisposableDomain(domain: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://www.mailcheck.ai/api/${domain}`,
      {
        method: "GET",
        headers: { "Accept": "application/json" },
        // 3 second timeout
        signal: AbortSignal.timeout(3000),
      }
    );

    if (!response.ok) {
      // API failed — fall back to hardcoded list
      console.warn(`mailcheck.ai returned ${response.status}, using fallback`);
      return BLOCKED_DOMAINS.includes(domain);
    }

    const data = await response.json();
    console.log(`mailcheck.ai response for ${domain}:`, data);

    // mailcheck.ai returns { "disposable": true/false }
    return data.disposable === true;

  } catch (error) {
    // Network error — fall back to hardcoded list
    console.warn("mailcheck.ai unreachable, using fallback blocklist", error);
    return BLOCKED_DOMAINS.includes(domain);
  }
}

export const handler: PreSignUpTriggerHandler = async (event) => {
  const email = event.request.userAttributes["email"];

  if (!email) {
    throw new Error("Email is required.");
  }

  const domain = email.split("@")[1]?.toLowerCase();

  if (!domain) {
    throw new Error("Invalid email format.");
  }

  const disposable = await isDisposableDomain(domain);

  if (disposable) {
    throw new Error(
      `Sign up is not allowed with disposable email domain: ${domain}. Please use a permanent email address.`
    );
  }

  return event;
};