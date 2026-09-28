// Amplify stores the Cognito session in cookies named
// CognitoIdentityServiceProvider.<clientId>.<user>.<token>. If a session check
// throws while one of these is present, the user is probably still signed in
// and the failure was transient (network, Cognito hiccup), so callers should
// show an error rather than send them to /login.
export function hasCognitoSession(cookieNames: string[]): boolean {
  return cookieNames.some(
    (name) => name.startsWith('CognitoIdentityServiceProvider.') && name.endsWith('.refreshToken'),
  );
}

// ── Browser only ─────────────────────────────────────────────────────────────

const COGNITO_PREFIX = 'CognitoIdentityServiceProvider.';

function cognitoCookieNames(): string[] {
  return document.cookie
    .split(';')
    .map((c) => c.split('=')[0].trim())
    .filter((name) => name.startsWith(COGNITO_PREFIX));
}

function expire(name: string, domain?: string) {
  document.cookie = `${name}=; Max-Age=0; Path=/` + (domain ? `; Domain=${domain}` : '');
}

/**
 * The site used to pin the auth cookies to the host's domain, while the
 * server writes them host-only when it refreshes a session. The two are
 * different cookies with the same name, so sign-out left the server's copy
 * behind and the next sign-in could read it back ("Unable to get user
 * session following successful sign-in"). Removes the old domain-pinned
 * copies; host-only cookies are what both sides use now.
 */
export function removeDomainPinnedCognitoCookies(domain: string) {
  cognitoCookieNames().forEach((name) => expire(name, domain));
}

/** Removes every Cognito cookie, host-only and domain-pinned alike. */
export function clearCognitoCookies() {
  const host = window.location.hostname;
  cognitoCookieNames().forEach((name) => {
    expire(name);
    expire(name, host);
  });
}
