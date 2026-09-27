// Personal and home-ISP email domains that can't be used to sign up or to
// send the contact form. Shared by the pre-sign-up Lambda (as a fallback when
// the BlockedEmailDomain table can't be read), the admin "Add default list"
// button that seeds that table, and the contact form.
//
// Throwaway/disposable domains are not listed here: the pre-sign-up Lambda
// checks those with the disposable-email-domains-js package.
//
// Only the ISPs' consumer domains are listed (verizon.net, comcast.net),
// never their corporate ones (verizon.com, comcast.com), so their employees
// can still sign up.

export type BlockedDomainCategory = 'personal' | 'isp' | 'disposable' | 'other';

export const DEFAULT_BLOCKED_DOMAINS: { domain: string; category: BlockedDomainCategory }[] = [
  // Webmail
  ...[
    'gmail.com', 'googlemail.com',
    'yahoo.com', 'yahoo.co.uk', 'yahoo.ca', 'yahoo.co.in', 'yahoo.com.au', 'yahoo.fr', 'yahoo.de', 'yahoo.co.jp',
    'ymail.com', 'rocketmail.com',
    'hotmail.com', 'hotmail.co.uk', 'outlook.com', 'live.com', 'msn.com',
    'aol.com', 'icloud.com', 'me.com', 'mac.com',
    'proton.me', 'protonmail.com',
    'gmx.com', 'gmx.de', 'gmx.net', 'mail.com', 'zoho.com',
    'yandex.com', 'yandex.ru', 'mail.ru',
    'qq.com', '163.com', '126.com',
  ].map((domain) => ({ domain, category: 'personal' as const })),
  // Home internet providers
  ...[
    'verizon.net', 'comcast.net', 'xfinity.com', 'att.net', 'sbcglobal.net', 'bellsouth.net',
    'cox.net', 'charter.net', 'spectrum.net', 'earthlink.net', 'optonline.net',
    'frontier.com', 'windstream.net', 'centurylink.net',
  ].map((domain) => ({ domain, category: 'isp' as const })),
];

/** "  Jane@Mail.Yahoo.COM " -> "mail.yahoo.com"; also accepts a bare domain or "@domain". */
export function normalizeDomain(input: string): string {
  const s = input.trim().toLowerCase();
  return s.slice(s.lastIndexOf('@') + 1).replace(/\.+$/, '');
}

export function isValidDomain(domain: string): boolean {
  return /^(?!-)[a-z0-9-]{1,63}(\.[a-z0-9-]{1,63})+$/.test(domain);
}

/**
 * The domain and its parent domains, down to two labels, so a block on
 * "yahoo.co.jp" also catches "mail.yahoo.co.jp".
 * "a.mail.yahoo.co.jp" -> ["a.mail.yahoo.co.jp", "mail.yahoo.co.jp", "yahoo.co.jp", "co.jp"]
 */
export function domainCandidates(domain: string): string[] {
  const labels = domain.split('.');
  const out: string[] = [];
  for (let i = 0; i <= labels.length - 2; i++) out.push(labels.slice(i).join('.'));
  return out;
}

const DEFAULT_SET = new Set(DEFAULT_BLOCKED_DOMAINS.map((d) => d.domain));

/** True if the email's domain (or a parent of it) is on the default list. */
export function isDefaultBlocked(emailOrDomain: string): boolean {
  return domainCandidates(normalizeDomain(emailOrDomain)).some((d) => DEFAULT_SET.has(d));
}
