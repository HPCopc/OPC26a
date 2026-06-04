import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { runWithAmplifyServerContext } from '@/utils/amplifyServerUtils';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      async operation(contextSpec) {
        const session = await fetchAuthSession(contextSpec);

        if (!session.tokens) redirect('/');

        const groups = (session.tokens.accessToken.payload['cognito:groups'] as string[]) ?? [];
        
        if (!groups.includes('ADMINS')) redirect('/');
      },
    });
  } catch {
    redirect('/');
  }

  return <>{children}</>;
}