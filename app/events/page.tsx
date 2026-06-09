import { getPage } from '@/lib/getPage';
import { getContentByTopic } from '@/lib/getContent';
import { extractFirstParagraph } from '@/lib/htmlUtils';
import ContentList from '@/components/content/ContentList';
import type { ContentCardItem } from '@/components/content/ContentCard';

export default async function EventsPage() {
  const page = await getPage('events');
  const { items, nextToken } = await getContentByTopic('events');

  const cardItems: ContentCardItem[] = items.map((item) => ({
    id:              item.id,
    slug:            item.slug,
    title:           item.title,
    topic:           'events' as const,
    date:            item.date,
    excerpt:         extractFirstParagraph(item.body ?? ''),
    imageUrl:        item.imageUrl ?? undefined,
    location:        item.location ?? undefined,
    eventDate:       item.eventDate ?? undefined,
    registrationUrl: item.registrationUrl ?? undefined,
  }));

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">
        {page?.title ?? 'Events'}
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
        contentType="events"
        requiresAuth={false}
        fetchPage={async (token) => {
          'use server';
          const { items: next, nextToken: nextNext } =
            await getContentByTopic('events', token);
          return {
            items: next.map((item) => ({
              id:              item.id,
              slug:            item.slug,
              title:           item.title,
              topic:           'events' as const,
              date:            item.date,
              excerpt:         extractFirstParagraph(item.body ?? ''),
              imageUrl:        item.imageUrl ?? undefined,
              location:        item.location ?? undefined,
              eventDate:       item.eventDate ?? undefined,
              registrationUrl: item.registrationUrl ?? undefined,
            })),
            nextToken: nextNext,
          };
        }}
        emptyMessage="No upcoming events at this time."
      />
    </main>
  );
}
