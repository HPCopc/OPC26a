import { getPage } from '@/lib/getPage';
import { getContentBySubcat1 } from '@/lib/getContent';
import ContentList from '@/components/content/ContentList';
import type { ContentCardItem } from '@/components/content/ContentCard';
import { getSubcat1, getSubcat2, buildPageSlug } from '@/lib/taxonomy';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ subcat1: string }>;
};

export default async function NewsSubcat1Page({ params }: Props) {
  const { subcat1 } = await params;

  const subcat1Items = getSubcat1('news');
  const currentSubcat = subcat1Items.find((s) => s.slug === subcat1);
  if (!currentSubcat) notFound();

  const pageSlug = buildPageSlug('news', subcat1); // → "news-markets"
  const page = await getPage(pageSlug);
  const { items, nextToken } = await getContentBySubcat1(subcat1);

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

  const subcat2Items = getSubcat2('news', subcat1);

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">
        {page?.title ?? currentSubcat.label}
      </h1>
      {page?.intro && (
        <div
          className="text-gray-500 mb-8"
          dangerouslySetInnerHTML={{ __html: page.intro }}
        />
      )}

      {/* ── Subcat1 filter links ── */}
      <div className="flex gap-2 flex-wrap mb-4">
        <Link
          href="/news"
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          All
        </Link>
        {subcat1Items.map((s) => (
          <Link
            key={s.slug}
            href={`/news/${s.slug}`}
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

      {/* ── Subcat2 filter links ── */}
      {subcat2Items.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-8">
          {subcat2Items.map((s) => (
            <Link
              key={s.slug}
              href={`/news/${subcat1}/${s.slug}`}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200"
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
            await getContentBySubcat1(subcat1, token);
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
        emptyMessage={`No ${currentSubcat.label.toLowerCase()} articles available at this time.`}
      />
    </main>
  );
}