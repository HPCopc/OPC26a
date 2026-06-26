import { getContentBySlug } from '@/lib/getContent';
import { notFound, redirect } from 'next/navigation';
import ProtectedContentDetail from '@/components/content/detail/ProtectedContentDetail';
import { cookies } from 'next/headers';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import config from '@/amplify_outputs.json';

const { runWithAmplifyServerContext } = createServerRunner({ config });

type Props = {
  params: Promise<{ subcat1: string; subcat2: string; slug: string }>;
};

export default async function NewsArticleDetailPage({ params }: Props) {
  const { subcat1, subcat2, slug } = await params;

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
    redirect(`/login?next=/news/${subcat1}/${subcat2}/${slug}`);
  }

  const item = await getContentBySlug(slug);
  if (!item) notFound();

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <ProtectedContentDetail item={item} />
    </main>
  );
}