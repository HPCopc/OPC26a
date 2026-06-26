"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
          {item.subcat2 && (
            <Link href={`/news/${item.subcat1}/${item.subcat2}`} className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
              {label(item.subcat2)}
            </Link>
          )}
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

export default function NewsSubcat1Page() {
  const { subcat1 } = useParams<{ subcat1: string }>();
  const [articles, setArticles] = useState<ContentMeta[]>([]);
  const [subcat2s, setSubcat2s] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subcat1) return;
    async function fetchArticles() {
      try {
        const { data } = await client.models.ContentMeta.listContentMetaBySubcat1AndDate(
          { subcat1 },
          { sortDirection: "DESC", limit: 100 }
        );
        const items = (data ?? []).filter((i) => i.isPublished && i.topic === "news");
        setArticles(items);

        // Derive unique subcat2s from results
        const seen = new Set<string>();
        const cats: string[] = [];
        for (const item of items) {
          if (item.subcat2 && !seen.has(item.subcat2)) {
            seen.add(item.subcat2);
            cats.push(item.subcat2);
          }
        }
        setSubcat2s(cats);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, [subcat1]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 mb-8">
        <Link href="/news" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">News</Link>
        <span>/</span>
        <span className="text-zinc-700 dark:text-zinc-300 font-medium capitalize">{label(subcat1)}</span>
      </nav>

      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-medium mb-1">News · Topic</p>
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight capitalize">{label(subcat1)}</h1>
      </header>

      {/* subcat2 navigation */}
      {!loading && subcat2s.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-zinc-200 dark:border-zinc-800">
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
      )}

      {/* Article list */}
      {loading ? (
        <SkeletonList count={4} />
      ) : articles.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-zinc-400 mb-3">No articles in this topic yet.</p>
          <Link href="/news" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Browse all news</Link>
        </div>
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
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-24" />
            <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4" />
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
