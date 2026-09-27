// lib/postLoginRoute.ts
// One rule for where a signed-in user belongs, shared by the login page and
// the (protected) guard.
import { generateClient } from 'aws-amplify/data';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>({ authMode: 'userPool' });

export type UserProfile = Schema['UserProfile']['type'];

export type ProfileStatus =
  | { status: 'signedOut'; profile: null }
  | { status: 'noProfile'; profile: null }
  | { status: 'ready'; profile: UserProfile };

export async function getProfileStatus(): Promise<ProfileStatus> {
  let sub: string | undefined;
  try {
    // Reads the stored tokens; throws UserUnAuthenticatedException only when
    // there is no session. A failed token refresh (network blip) throws
    // something else and keeps the tokens, so rethrow it instead of calling
    // the user signed out.
    sub = (await getCurrentUser()).userId;
  } catch (e) {
    if ((e as Error)?.name === 'UserUnAuthenticatedException') {
      return { status: 'signedOut', profile: null };
    }
    throw e;
  }
  if (!sub) return { status: 'signedOut', profile: null };

  // The postConfirmation Lambda and onboarding both create the profile with id === sub.
  const { data, errors } = await client.models.UserProfile.get({ id: sub });
  if (errors?.length) throw new Error(errors[0].message);

  return data
    ? { status: 'ready', profile: data }
    : { status: 'noProfile', profile: null };
}

export async function getPostLoginRoute(): Promise<string> {
  const session = await fetchAuthSession();
  const groups = (session.tokens?.accessToken?.payload['cognito:groups'] as string[]) ?? [];
  if (groups.includes('ADMINS')) return '/admin';

  const { status, profile } = await getProfileStatus();
  if (status === 'signedOut') return '/login';
  if (status === 'noProfile' || profile.profileCompleted !== true) return '/onboarding';
  return '/';
}
