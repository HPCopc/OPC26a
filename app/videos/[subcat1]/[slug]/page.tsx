import { getContentBySlug } from '@/lib/getContent';
import { notFound, redirect } from 'next/navigation';
import ProtectedContentDetail from '@/components/content/detail/ProtectedContentDetail';
import { cookies } from 'next/headers';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import config from '@/amplify_outputs.json';

const { runWithAmplifyServerContext } = createServerRunner({ config });

type Props = {
  params: { subcat1: string; slug: string };
};

export default async function VideosDetailPage({ params }: Props) {
  const { subcat1, slug } = params;

  const fullSlug = `videos-${subcat1}-${slug}`;

  let isLoggedIn = false;
  try {
    await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      async operation(contextSpec) {
        const session = await fetchAuthSession(contextSpec);
        isLoggedIn = !!session?.tokens?.accessToken;
      },
    });
  } catch {
    isLoggedIn = false;
  }

  if (!isLoggedIn) {
    redirect(`/login?next=/videos/${subcat1}/${slug}`);
  }

  const item = await getContentBySlug(fullSlug);
  if (!item) notFound();

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <ProtectedContentDetail item={item} />
    </main>
  );
}
