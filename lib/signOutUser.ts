// Signs out, then removes any Cognito cookie still left, so a stale session
// can't be read back by the next sign-in.
import { signOut } from 'aws-amplify/auth';
import { clearCognitoCookies } from '@/utils/authCookies';

export async function signOutUser() {
  try {
    await signOut();
  } finally {
    clearCognitoCookies();
  }
}
