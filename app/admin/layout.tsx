import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth/server';
import { runWithAmplifyServerContext } from '@/utils/amplifyServerUtils';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      async operation(contextSpec) {
        const session = await fetchAuthSession(contextSpec);

        if (!session.tokens) redirect('/');

        const attributes = await fetchUserAttributes(contextSpec);

        if (attributes['custom:role'] !== 'admin') redirect('/');
      },
    });
  } catch {
    redirect('/');
  }

  return <>{children}</>;
}