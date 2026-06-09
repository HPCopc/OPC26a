import { getPage } from '@/lib/getPage';
import { getContentByTopic } from '@/lib/getContent';
import { extractFirstParagraph } from '@/lib/htmlUtils';
import ContentCard from '@/components/content/ContentCard';
import LoadMore from '@/components/content/LoadMore';

export default async function EventsPage() {
  // 1. Fetch page title + intro (admin editable)
  const page = await getPage('events');

  // 2. Fetch first 10 events
  const { items, nextToken } = await getContentByTopic('events');

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">

      {/* Page title + intro from Page record */}
      <h1 className="text-3xl font-bold mb-2">
        {page?.title ?? 'Events'}
      </h1>
      {page?.intro && (
        <div
          className="text-gray-500 mb-8"
          dangerouslySetInnerHTML={{ __html: page.intro }}
        />
      )}

      {/* Content listing */}
      {items.length === 0 ? (
        <p className="text-gray-400">No upcoming events at this time.</p>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map(item => (
              <ContentCard
                key={item.id}
                item={item}
                excerpt={extractFirstParagraph(item.body)}
                href={`/events/${item.slug}`}
              />
            ))}
          </div>

          {/* Load More button — only shown if more items exist */}
          {nextToken && (
            <LoadMore topic="events" initialToken={nextToken} />
          )}
        </>
      )}
    </main>
  );
}