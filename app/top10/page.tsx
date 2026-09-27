import { getPage } from '@/lib/getPage';
import { getContentByTopic } from '@/lib/getContent';
import ContentList from '@/components/content/ContentList';
import type { ContentCardItem } from '@/components/content/ContentCard';
import type { ContentItem } from '@/lib/getContent';
import { getSubcat1 } from '@/lib/taxonomy';
import Link from 'next/link';
import { sanitizeHtml } from '@/lib/sanitizeHtml';

function toCard(item: ContentItem): ContentCardItem {
  return {
    id:       item.id,
    slug:     item.slug,
    title:    item.title,
    topic:    'top10',
    date:     item.date,
    excerpt:  item.intro ?? undefined,
    imageUrl: item.imageUrl ?? undefined,
    subcat1:  item.subcat1 ?? undefined,
  };
}

export default async function Top10Page() {
  const page = await getPage('top10');
  const { items, nextToken } = await getContentByTopic('top10');
  const subcat1Items = getSubcat1('top10');

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">
        {page?.title ?? 'Top 10'}
      </h1>
      {page?.intro && (
        <div
          className="text-gray-500 mb-8"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.intro) }}
        />
      )}

      <div className="flex gap-2 flex-wrap mb-8">
        <Link
          href="/top10"
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white"
        >
          All
        </Link>
        {subcat1Items.map((s) => (
          <Link
            key={s.slug}
            href={`/top10/${s.slug}`}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            {s.label}
          </Link>
        ))}
      </div>

      <ContentList
        initialItems={items.map(toCard)}
        initialNextToken={nextToken}
        contentType="top10"
        fetchPage={async (token) => {
          'use server';
          const { items: next, nextToken: nextNext } = await getContentByTopic('top10', token);
          return { items: next.map(toCard), nextToken: nextNext };
        }}
        emptyMessage="No Top 10 articles available at this time."
      />
    </main>
  );
}
