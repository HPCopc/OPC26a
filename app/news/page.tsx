"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>({ authMode: "apiKey" });
type ContentMeta = Schema["ContentMeta"]["type"];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function label(slug: string) {
  return slug.replace(/-/g, " ");
}

// subcat1 → subcat2[] map
type SubcatMap = { subcat1: string; subcat2s: string[] }[];

function buildSubcatMap(items: ContentMeta[]): SubcatMap {
  const map = new Map<string, Set<string>>();
  for (const item of items) {
    if (!item.subcat1) continue;
    if (!map.has(item.subcat1)) map.set(item.subcat1, new Set());
    if (item.subcat2) map.get(item.subcat1)!.add(item.subcat2);
  }
  return Array.from(map.entries()).map(([subcat1, subcat2s]) => ({
    subcat1,
    subcat2s: Array.from(subcat2s),
  }));
}

function ArticleCard({ item }: { item: ContentMeta }) {
  const href = `/news/${item.subcat1}/${item.subcat2}/${item.slug}`;
  return (
    <article className="group flex gap-4 border-b border-zinc-200 dark:border-zinc-800 py-6 first:pt-0">
      {item.imageUrl && (
        <Link href={href} className="shrink-0">
          <img src={item.imageUrl} alt="" className="w-28 h-20 object-cover rounded-md bg-zinc-100 dark:bg-zinc-800" />
        </Link>
      )}
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wide font-medium">
          <Link href={`/news/${item.subcat1}`} className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
            {label(item.subcat1 ?? "")}
          </Link>
          <span>/</span>
          <Link href={`/news/${item.subcat1}/${item.subcat2}`} className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
            {label(item.subcat2 ?? "")}
          </Link>
          <span className="ml-auto normal-case tracking-normal">{formatDate(item.date)}</span>
        </div>
        <Link href={href}>
          <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100 leading-snug group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
            {item.title}
          </h2>
        </Link>
        {item.intro && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">{item.intro}</p>
        )}
      </div>
    </article>
  );
}

export default function NewsPage() {
  const [articles, setArticles] = useState<ContentMeta[]>([]);
  const [subcatMap, setSubcatMap] = useState<SubcatMap>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const { data } = await client.models.ContentMeta.listContentMetaByTopicAndDate(
          { topic: "news" },
          { sortDirection: "DESC", limit: 100 }
        );
        const items = (data ?? []).filter((i) => i.isPublished);
        setArticles(items);
        setSubcatMap(buildSubcatMap(items));
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-medium mb-1">Coverage</p>
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">News</h1>
      </header>

      {/* ── subcat1 / subcat2 map ── */}
      {!loading && subcatMap.length > 0 && (
        <div className="mb-10 pb-10 border-b border-zinc-200 dark:border-zinc-800 space-y-6">
          {subcatMap.map(({ subcat1, subcat2s }) => (
            <div key={subcat1}>
              {/* subcat1 heading — clickable */}
              <Link
                href={`/news/${subcat1}`}
                className="inline-block text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide mb-2 hover:text-blue-700 dark:hover:text-blue-400 transition-colors capitalize"
              >
                {label(subcat1)}
              </Link>

              {/* subcat2 links + All */}
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/news/${subcat1}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                >
                  All
                </Link>
                {subcat2s.map((s2) => (
                  <Link
                    key={s2}
                    href={`/news/${subcat1}/${s2}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors capitalize"
                  >
                    {label(s2)}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── article list ── */}
      {loading ? (
        <SkeletonList count={5} />
      ) : articles.length === 0 ? (
        <p className="text-sm text-zinc-400 py-12 text-center">No news articles published yet.</p>
      ) : (
        <div>{articles.map((item) => <ArticleCard key={item.id} item={item} />)}</div>
      )}
    </div>
  );
}

function SkeletonList({ count }: { count: number }) {
  return (
    <div>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex gap-4 py-6 border-b border-zinc-100 dark:border-zinc-800 animate-pulse">
          <div className="w-28 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-md shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-32" />
            <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4" />
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
