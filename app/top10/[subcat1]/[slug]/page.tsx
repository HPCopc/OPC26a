import { getContentBySlug } from '@/lib/getContent';
import { contentPath } from '@/lib/contentPath';
import { notFound, redirect } from 'next/navigation';
import ProtectedContentDetail from '@/components/content/detail/ProtectedContentDetail';
import { cookies } from 'next/headers';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import config from '@/amplify_outputs.json';
import { hasCognitoSession } from '@/utils/authCookies';

const { runWithAmplifyServerContext } = createServerRunner({ config });

type Props = {
  params: Promise<{ subcat1: string; slug: string }>;
};

export default async function Top10ArticleDetailPage({ params }: Props) {
  const { subcat1, slug } = await params;

  let isLoggedIn = false;
  try {
    await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      async operation(contextSpec) {
        const session = await fetchAuthSession(contextSpec);
        isLoggedIn = !!session?.tokens?.accessToken;
      },
    });
  } catch (e) {
    // A failed check with a session cookie is a transient error, not a
    // sign-out: surface it instead of redirecting to /login.
    const cookieNames = (await cookies()).getAll().map((c) => c.name);
    if (hasCognitoSession(cookieNames)) throw e;
    isLoggedIn = false;
  }

  if (!isLoggedIn) {
    redirect(`/login?from=/top10/${subcat1}/${slug}`);
  }

  const item = await getContentBySlug(slug);
  if (!item) notFound();

  // The slug lookup ignores topic and categories, so send any other URL
  // (e.g. /events/<news-slug>) to the item's real one.
  const path = contentPath(item);
  if (path !== `/top10/${subcat1}/${slug}`) redirect(path);

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <ProtectedContentDetail item={item} />
    </main>
  );
}