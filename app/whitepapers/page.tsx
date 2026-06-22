import { getPage } from '@/lib/getPage';
import { getContentByTopic } from '@/lib/getContent';
import ContentList from '@/components/content/ContentList';
import type { ContentCardItem } from '@/components/content/ContentCard';
import { cookies } from 'next/headers';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import { redirect } from 'next/navigation';
import config from '@/amplify_outputs.json';

const { runWithAmplifyServerContext } = createServerRunner({ config });

export default async function WhitepapersPage() {
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
    redirect('/login?next=/whitepapers');
  }

  const page = await getPage('whitepapers');
  const { items, nextToken } = await getContentByTopic('whitepapers');

  const cardItems: ContentCardItem[] = items.map((item) => ({
    id:      item.id,
    slug:    item.slug,
    title:   item.title,
    topic:   'whitepapers' as const,
    date:    item.date,
    excerpt: item.intro ?? undefined,
    imageUrl: item.imageUrl ?? undefined,
  }));

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">
        {page?.title ?? 'Whitepapers'}
      </h1>
      {page?.intro && (
        <div
          className="text-gray-500 mb-8"
          dangerouslySetInnerHTML={{ __html: page.intro }}
        />
      )}

      <ContentList
        initialItems={cardItems}
        initialNextToken={nextToken}
        contentType="whitepapers"
        requiresAuth={true}
        fetchPage={async (token) => {
          'use server';
          const { items: next, nextToken: nextNext } =
            await getContentByTopic('whitepapers', token);
          return {
            items: next.map((item) => ({
              id:      item.id,
              slug:    item.slug,
              title:   item.title,
              topic:   'whitepapers' as const,
              date:    item.date,
              excerpt: item.intro ?? undefined,
              imageUrl: item.imageUrl ?? undefined,
            })),
            nextToken: nextNext,
          };
        }}
        emptyMessage="No whitepapers available at this time."
      />
    </main>
  );
}