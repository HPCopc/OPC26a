import { getPage } from '@/lib/getPage';
import { getContentByTopic } from '@/lib/getContent';
import ContentList from '@/components/content/ContentList';
import type { ContentCardItem } from '@/components/content/ContentCard';
import { getSubcat1 } from '@/lib/taxonomy';
import Link from 'next/link';

export default async function NewsPage() {
  const page = await getPage('news');
  const { items, nextToken } = await getContentByTopic('news');

  const cardItems: ContentCardItem[] = items.map((item) => ({
    id:       item.id,
    slug:     item.slug,
    title:    item.title,
    topic:    'news' as const,
    date:     item.date,
    excerpt:  item.intro ?? undefined,
    imageUrl: item.imageUrl ?? undefined,
    subcat1:  item.subcat1 ?? undefined,
    subcat2:  item.subcat2 ?? undefined,
  }));

  const subcat1Items = getSubcat1('news');

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">
        {page?.title ?? 'News'}
      </h1>
      {page?.intro && (
        <div
          className="text-gray-500 mb-8"
          dangerouslySetInnerHTML={{ __html: page.intro }}
        />
      )}

      {subcat1Items.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-8">
          <Link
            href="/news"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white"
          >
            All
          </Link>
          {subcat1Items.map((s) => (
            <Link
              key={s.slug}
              href={`/news/${s.slug}`}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              {s.label}
            </Link>
          ))}
        </div>
      )}

      <ContentList
        initialItems={cardItems}
        initialNextToken={nextToken}
        contentType="news"
        fetchPage={async (token) => {
          'use server';
          const { items: next, nextToken: nextNext } =
            await getContentByTopic('news', token);
          return {
            items: next.map((item) => ({
              id:       item.id,
              slug:     item.slug,
              title:    item.title,
              topic:    'news' as const,
              date:     item.date,
              excerpt:  item.intro ?? undefined,
              imageUrl: item.imageUrl ?? undefined,
              subcat1:  item.subcat1 ?? undefined,
              subcat2:  item.subcat2 ?? undefined,
            })),
            nextToken: nextNext,
          };
        }}
        emptyMessage="No news available at this time."
      />
    </main>
  );
}