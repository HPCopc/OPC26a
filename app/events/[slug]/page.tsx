import { getContentBySlug } from '@/lib/getContent';
import { notFound, redirect } from 'next/navigation';
import EventDetail from '@/components/content/detail/EventDetail';
import { cookies } from 'next/headers';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import config from '@/amplify_outputs.json';

const { runWithAmplifyServerContext } = createServerRunner({ config });

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EventDetailPage({ params }: Props) {
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
  } catch {
    isLoggedIn = false;
  }

  // ── Redirect to login if not logged in ──────────────────────
  if (!isLoggedIn) {
    redirect(`/login?next=/events/${slug}`);
  }

  // ── Fetch content ───────────────────────────────────────────
  const item = await getContentBySlug(slug, true);
  if (!item) notFound();

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <EventDetail item={item} />
    </main>
  );
}