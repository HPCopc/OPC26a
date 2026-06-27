"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { getSubcat1, getSubcat2 } from "@/lib/taxonomy";

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

export default function NewsPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<ContentMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubcat1, setActiveSubcat1] = useState<string | null>(null);
  const [activeSubcat2, setActiveSubcat2] = useState<string | null>(null);

  const subcat1Items = getSubcat1("news");
  const subcat2Items = activeSubcat1 ? getSubcat2("news", activeSubcat1) : [];

  useEffect(() => {
    async function fetchNews() {
      try {
        const { data } = await client.models.ContentMeta.listContentMetaByTopicAndDate(
          { topic: "news" },
          { sortDirection: "DESC", limit: 100 }
        );
        const items = (data ?? []).filter((i) => i.isPublished);
        setArticles(items);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  // Filter articles based on active selections
  const filteredArticles = articles.filter((item) => {
    if (activeSubcat2) return item.subcat1 === activeSubcat1 && item.subcat2 === activeSubcat2;
    if (activeSubcat1) return item.subcat1 === activeSubcat1;
    return true;
  });

  function handleSubcat1Click(slug: string) {
    if (activeSubcat1 === slug) {
      // clicking active subcat1 deselects and goes back to All
      setActiveSubcat1(null);
      setActiveSubcat2(null);
    } else {
      setActiveSubcat1(slug);
      setActiveSubcat2(null);
    }
  }

  function handleSubcat2Click(slug: string) {
    setActiveSubcat2(activeSubcat2 === slug ? null : slug);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-medium mb-1">Coverage</p>
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">News</h1>
      </header>

      {/* ── Row 1: Subcat1 nav ── */}
      {subcat1Items.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-3">
          <button
            onClick={() => { setActiveSubcat1(null); setActiveSubcat2(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubcat1 === null
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700"
            }`}
          >
            All
          </button>
          {subcat1Items.map((s) => (
            <button
              key={s.slug}
              onClick={() => handleSubcat1Click(s.slug)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
                activeSubcat1 === s.slug
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Row 2: Subcat2 nav (only when a subcat1 is selected) ── */}
      {activeSubcat1 && subcat2Items.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-8 pb-8 border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveSubcat2(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubcat2 === null
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700"
            }`}
          >
            All
          </button>
          {subcat2Items.map((s) => (
            <button
              key={s.slug}
              onClick={() => handleSubcat2Click(s.slug)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
                activeSubcat2 === s.slug
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* ── spacing when no subcat2 row ── */}
      {(!activeSubcat1 || subcat2Items.length === 0) && (
        <div className="mb-8 border-b border-zinc-200 dark:border-zinc-800" />
      )}

      {/* ── Article list ── */}
      {loading ? (
        <SkeletonList count={5} />
      ) : filteredArticles.length === 0 ? (
        <p className="text-sm text-zinc-400 py-12 text-center">No news articles published yet.</p>
      ) : (
        <div>{filteredArticles.map((item) => <ArticleCard key={item.id} item={item} />)}</div>
      )}
    </div>
  );
}