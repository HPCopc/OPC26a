import { getPage } from '@/lib/getPage';
import { getContentByTopic } from '@/lib/getContent';
import ContentList from '@/components/content/ContentList';
import type { ContentCardItem } from '@/components/content/ContentCard';

export default async function ResourcesPage() {
  const page = await getPage('resources');
  const { items, nextToken } = await getContentByTopic('resources');

  const cardItems: ContentCardItem[] = items.map((item) => ({
    id:        item.id,
    slug:      item.slug,
    title:     item.title,
    topic:     'resources' as const,
    date:      item.date,
    excerpt:   item.intro ?? undefined,
    imageUrl:  item.imageUrl ?? undefined,
    location:  item.location ?? undefined,
    eventDate: item.eventDate ?? undefined,
  }));

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">
        {page?.title ?? 'Resources'}
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
        contentType="resources"
        requiresAuth={false}
        compact={true}
        fetchPage={async (token) => {
          'use server';
          const { items: next, nextToken: nextNext } =
            await getContentByTopic('resources', token);
          return {
            items: next.map((item) => ({
              id:        item.id,
              slug:      item.slug,
              title:     item.title,
              topic:     'resources' as const,
              date:      item.date,
              excerpt:   item.intro ?? undefined,
              imageUrl:  item.imageUrl ?? undefined,
              location:  item.location ?? undefined,
              eventDate: item.eventDate ?? undefined,
            })),
            nextToken: nextNext,
          };
        }}
        emptyMessage="No upcoming resources at this time."
      />
    </main>
  );
}