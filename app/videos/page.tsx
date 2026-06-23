import { getPage } from '@/lib/getPage';
import { getContentByTopic } from '@/lib/getContent';
import ContentList from '@/components/content/ContentList';
import type { ContentCardItem } from '@/components/content/ContentCard';

export default async function VideosPage() {
  const page = await getPage('videos');
  const { items, nextToken } = await getContentByTopic('videos');

  const cardItems: ContentCardItem[] = items.map((item) => ({
    id:      item.id,
    slug:    item.slug,
    title:   item.title,
    topic:   'videos' as const,
    date:    item.date,
    excerpt: item.intro ?? undefined,
    imageUrl: item.imageUrl ?? undefined,
    subcat1: item.subcat1 ?? undefined,
  }));

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">
        {page?.title ?? 'Videos'}
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
        contentType="videos"
        fetchPage={async (token) => {
          'use server';
          const { items: next, nextToken: nextNext } =
            await getContentByTopic('videos', token);
          return {
            items: next.map((item) => ({
              id:      item.id,
              slug:    item.slug,
              title:   item.title,
              topic:   'videos' as const,
              date:    item.date,
              excerpt: item.intro ?? undefined,
              imageUrl: item.imageUrl ?? undefined,
              subcat1: item.subcat1 ?? undefined,
            })),
            nextToken: nextNext,
          };
        }}
        emptyMessage="No videos available at this time."
      />
    </main>
  );
}