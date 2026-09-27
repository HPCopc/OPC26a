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
  params: Promise<{ slug: string }>;
};

export default async function WhitepaperDetailPage({ params }: Props) {
  const { slug } = await params;

  // ── Check if user is logged in ──────────────────────────────
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

  // ── Redirect to login if not logged in ──────────────────────
  if (!isLoggedIn) {
    redirect(`/login?from=/whitepapers/${slug}`);
  }

  // ── Fetch content ───────────────────────────────────────────
  const item = await getContentBySlug(slug);
  if (!item) notFound();

  // The slug lookup ignores topic and categories, so send any other URL
  // (e.g. /events/<news-slug>) to the item's real one.
  const path = contentPath(item);
  if (path !== `/whitepapers/${slug}`) redirect(path);

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <ProtectedContentDetail item={item} />
    </main>
  );
}