 import { getPage } from '@/lib/getPage';
import { getContentByTopic } from '@/lib/getContent';
import ContentList from '@/components/content/ContentList';
import type { ContentCardItem } from '@/components/content/ContentCard';
import { getSubcat1 } from '@/lib/taxonomy';
import Link from 'next/link';

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

  // ── Subcat1 nav links (Presentations, Seminars) ──
  const subcat1Items = getSubcat1('videos');

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

      {/* ── Subcat1 filter links ── */}
      {subcat1Items.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-8">
          <Link
            href="/videos"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white"
          >
            All
          </Link>
          {subcat1Items.map((s) => (
            <Link
              key={s.slug}
              href={`/videos/${s.slug}`}
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