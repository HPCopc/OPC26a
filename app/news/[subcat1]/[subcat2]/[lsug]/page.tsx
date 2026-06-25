"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();
type ContentMeta = Schema["ContentMeta"]["type"];
type ProtectedContentBody = Schema["ProtectedContentBody"]["type"];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function label(slug: string) {
  return slug.replace(/-/g, " ");
}

export default function NewsArticlePage() {
  const { subcat1, subcat2, slug } = useParams<{ subcat1: string; subcat2: string; slug: string }>();

  const [meta, setMeta] = useState<ContentMeta | null>(null);
  const [body, setBody] = useState<ProtectedContentBody | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    async function fetch() {
      try {
        // 1. Fetch ContentMeta by slug GSI
        const { data: metaItems } = await client.models.ContentMeta.listContentMetaBySlug(
          { slug },
          { limit: 1 }
        );
        const metaItem = metaItems?.[0];
        if (!metaItem) { setNotFound(true); return; }
        setMeta(metaItem);

        // 2. Fetch ProtectedContentBody by metaId GSI
        const { data: bodyItems } = await client.models.ProtectedContentBody.listProtectedContentBodyByMetaId(
          { metaId: metaItem.id },
          { limit: 1 }
        );
        setBody(bodyItems?.[0] ?? null);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [slug]);

  if (loading) return <ArticleSkeleton />;

  if (notFound || !meta) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <p className="text-sm text-zinc-400 mb-3">Article not found.</p>
        <Link href="/news" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Back to news</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 mb-8">
        <Link href="/news" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">News</Link>
        <span>/</span>
        <Link href={`/news/${subcat1}`} className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors capitalize">
          {label(subcat1)}
        </Link>
        <span>/</span>
        <Link href={`/news/${subcat1}/${subcat2}`} className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors capitalize">
          {label(subcat2)}
        </Link>
      </nav>

      {/* Article header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wide font-medium mb-4">
          <span className="capitalize">{label(subcat1)}</span>
          <span>/</span>
          <span className="capitalize">{label(subcat2)}</span>
          <span className="ml-auto normal-case tracking-normal">{formatDate(meta.date)}</span>
        </div>
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight mb-4">
          {meta.title}
        </h1>
        {meta.intro && (
          <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">{meta.intro}</p>
        )}
      </header>

      {/* Hero image */}
      {meta.imageUrl && (
        <div className="mb-8">
          <img
            src={meta.imageUrl}
            alt=""
            className="w-full rounded-lg object-cover max-h-80 bg-zinc-100 dark:bg-zinc-800"
          />
        </div>
      )}

      {/* Article body */}
      {body?.body ? (
        <div
          className="prose prose-zinc dark:prose-invert prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: body.body }}
        />
      ) : (
        <p className="text-sm text-zinc-400 dark:text-zinc-500 italic">Content unavailable.</p>
      )}
    </div>
  );
}

function ArticleSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-3 w-48 bg-zinc-100 dark:bg-zinc-800 rounded mb-8" />
      <div className="h-3 w-32 bg-zinc-100 dark:bg-zinc-800 rounded mb-4" />
      <div className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4 mb-3" />
      <div className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded w-1/2 mb-6" />
      <div className="h-5 bg-zinc-100 dark:bg-zinc-800 rounded w-full mb-2" />
      <div className="h-5 bg-zinc-100 dark:bg-zinc-800 rounded w-5/6 mb-8" />
      <div className="w-full h-64 bg-zinc-100 dark:bg-zinc-800 rounded-lg mb-8" />
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded" style={{ width: `${85 + Math.random() * 15}%` }} />
        ))}
      </div>
    </div>
  );
}
