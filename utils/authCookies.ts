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
