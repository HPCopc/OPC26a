import { getPage } from '@/lib/getPage';
import { getContentBySubcat1 } from '@/lib/getContent';
import ContentList from '@/components/content/ContentList';
import type { ContentCardItem } from '@/components/content/ContentCard';
import type { ContentItem } from '@/lib/getContent';
import { getSubcat1, buildPageSlug } from '@/lib/taxonomy';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sanitizeHtml } from '@/lib/sanitizeHtml';

type Props = {
  params: Promise<{ subcat1: string }>;
};

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

export default async function Top10Subcat1Page({ params }: Props) {
  const { subcat1 } = await params;

  const subcat1Items = getSubcat1('top10');
  const currentSubcat = subcat1Items.find((s) => s.slug === subcat1);
  if (!currentSubcat) notFound();

  const page = await getPage(buildPageSlug('top10', subcat1)); // → "top10-forecasts"
  const { items, nextToken } = await getContentBySubcat1('top10', subcat1);

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">
        {page?.title ?? `Top 10: ${currentSubcat.label}`}
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
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          All
        </Link>
        {subcat1Items.map((s) => (
          <Link
            key={s.slug}
            href={`/top10/${s.slug}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 ${
              s.slug === subcat1
                ? 'bg-amber-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
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
          const { items: next, nextToken: nextNext } =
            await getContentBySubcat1('top10', subcat1, token);
          return { items: next.map(toCard), nextToken: nextNext };
        }}
        emptyMessage={`No ${currentSubcat.label.toLowerCase()} articles available at this time.`}
      />
    </main>
  );
}
