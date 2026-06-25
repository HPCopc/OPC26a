"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

type ContentMeta = Schema["ContentMeta"]["type"];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ArticleCard({ item }: { item: ContentMeta }) {
  const href = item.subcat1
    ? item.subcat2
      ? `/news/${item.subcat1}/${item.subcat2}`
      : `/news/${item.subcat1}`
    : "/news";

  return (
    <article className="group flex flex-col gap-3 border-b border-zinc-200 dark:border-zinc-800 py-6 first:pt-0">
      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide font-medium">
        {item.subcat1 && (
          <Link
            href={`/news/${item.subcat1}`}
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            {item.subcat1.replace(/-/g, " ")}
          </Link>
        )}
        {item.subcat2 && (
          <>
            <span className="text-zinc-300 dark:text-zinc-600">/</span>
            <Link
              href={`/news/${item.subcat1}/${item.subcat2}`}
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              {item.subcat2.replace(/-/g, " ")}
            </Link>
          </>
        )}
        <span className="text-zinc-300 dark:text-zinc-600 ml-auto">
          {formatDate(item.date)}
        </span>
      </div>

      <div className="flex gap-4">
        {item.imageUrl && (
          <Link href={`/news/${item.slug}`} className="shrink-0">
            <img
              src={item.imageUrl}
              alt=""
              className="w-28 h-20 object-cover rounded-md bg-zinc-100 dark:bg-zinc-800"
            />
          </Link>
        )}
        <div className="flex flex-col gap-1.5 min-w-0">
          <Link href={`/news/${item.slug}`}>
            <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100 leading-snug group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
              {item.title}
            </h2>
          </Link>
          {item.intro && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
              {item.intro}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export default function NewsPage() {
  const [articles, setArticles] = useState<ContentMeta[]>([]);
  const [subcat1List, setSubcat1List] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const result = await client.models.ContentMeta.listContentMetaByTopicAndDate(
          { topic: "news" },
          { sortDirection: "DESC", limit: 100 }
        );
        const items = (result.data ?? []).filter((i) => i.isPublished);
        setArticles(items);

        // Derive unique subcat1 values, preserving order of first appearance
        const seen = new Set<string>();
        const cats: string[] = [];
        for (const item of items) {
          if (item.subcat1 && !seen.has(item.subcat1)) {
            seen.add(item.subcat1);
            cats.push(item.subcat1);
          }
        }
        setSubcat1List(cats);
      } catch (err) {
        console.error("Failed to fetch news:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Page header */}
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-medium mb-1">
          Coverage
        </p>
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
          News
        </h1>
      </header>

      {/* Subcat1 topic pills */}
      {subcat1List.length > 0 && (
        <nav
          aria-label="News topics"
          className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-zinc-200 dark:border-zinc-800"
        >
          {subcat1List.map((cat) => (
            <Link
              key={cat}
              href={`/news/${cat}`}
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 dark:hover:bg-zinc-100 dark:hover:text-zinc-900 dark:hover:border-zinc-100 transition-colors"
            >
              {cat.replace(/-/g, " ")}
            </Link>
          ))}
        </nav>
      )}

      {/* Articles */}
      {loading ? (
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="py-6 border-b border-zinc-100 dark:border-zinc-800 animate-pulse">
              <div className="h-3 w-24 bg-zinc-100 dark:bg-zinc-800 rounded mb-3" />
              <div className="flex gap-4">
                <div className="w-28 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-md shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4" />
                  <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-full" />
                  <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <p className="text-sm text-zinc-400 dark:text-zinc-500 py-12 text-center">
          No news articles published yet.
        </p>
      ) : (
        <div>
          {articles.map((item) => (
            <ArticleCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
