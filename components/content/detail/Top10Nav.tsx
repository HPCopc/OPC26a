// components/content/detail/Top10Nav.tsx
// Moves between the Top 10 articles, which are listed only in the home
// page's Weekly Insights box: a one-line bar above the article and
// previous/next plus the full list below it.
import Link from 'next/link';
import type { ContentItem } from '@/lib/getContent';
import { contentPath } from '@/lib/contentPath';
import { WEEKLY_INSIGHTS_ANCHOR } from '@/lib/getHomeBoxes';

type Props = {
  items:     ContentItem[];   // the box's articles, newest first
  currentId: string;
};

const BACK_HREF = `/#${WEEKLY_INSIGHTS_ANCHOR}`;

function neighbours(items: ContentItem[], currentId: string) {
  const index = items.findIndex((i) => i.id === currentId);
  return {
    index,
    prev: index > 0 ? items[index - 1] : null,
    next: index >= 0 && index < items.length - 1 ? items[index + 1] : null,
  };
}

export function Top10NavBar({ items, currentId }: Props) {
  const { index, prev, next } = neighbours(items, currentId);
  if (index < 0) return null;

  return (
    <nav
      aria-label="Top 10 articles"
      className="flex items-center justify-between gap-3 mb-6 pb-3 border-b border-gray-200 text-sm"
    >
      <Link href={BACK_HREF} className="text-amber-700 font-semibold hover:underline whitespace-nowrap">
        ‹ Weekly Insights
      </Link>
      <div className="flex items-center gap-3 whitespace-nowrap">
        <span className="text-gray-500">
          <span className="hidden sm:inline">Top 10 · </span>{index + 1} of {items.length}
        </span>
        {prev
          ? <Link href={contentPath(prev)} className="text-amber-700 font-semibold hover:underline">‹ Prev</Link>
          : <span className="text-gray-300">‹ Prev</span>}
        {next
          ? <Link href={contentPath(next)} className="text-amber-700 font-semibold hover:underline">Next ›</Link>
          : <span className="text-gray-300">Next ›</span>}
      </div>
    </nav>
  );
}

export function Top10NavFooter({ items, currentId }: Props) {
  const { index, prev, next } = neighbours(items, currentId);
  if (index < 0) return null;

  const card = 'flex-1 block rounded-lg border border-gray-200 p-4 hover:border-amber-600 hover:bg-amber-50 transition-colors';

  return (
    <nav aria-label="Top 10 articles" className="mt-10 pt-6 border-t border-gray-200 flex flex-col gap-8">
      {(prev || next) && (
        // Next comes first on phones, where the two stack.
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          {prev ? (
            <Link href={contentPath(prev)} className={card}>
              <span className="block text-xs font-semibold text-amber-700 mb-1">‹ Previous</span>
              <span className="text-sm text-gray-800">{prev.title}</span>
            </Link>
          ) : <div className="hidden sm:block flex-1" />}
          {next ? (
            <Link href={contentPath(next)} className={`${card} sm:text-right`}>
              <span className="block text-xs font-semibold text-amber-700 mb-1">Next ›</span>
              <span className="text-sm text-gray-800">{next.title}</span>
            </Link>
          ) : <div className="hidden sm:block flex-1" />}
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">This week&apos;s Top 10</h2>
        <ol className="list-decimal pl-6 flex flex-col gap-1.5 text-sm">
          {items.map((item) => (
            <li key={item.id}>
              {item.id === currentId ? (
                <span aria-current="page" className="font-semibold text-gray-900">
                  {item.title} <span className="text-xs font-normal text-amber-700">◀ reading now</span>
                </span>
              ) : (
                <Link href={contentPath(item)} className="text-gray-800 hover:text-amber-700">
                  {item.title}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>

      <Link href={BACK_HREF} className="text-sm text-amber-700 font-semibold hover:underline">
        ‹ Back to Weekly Insights
      </Link>
    </nav>
  );
}
