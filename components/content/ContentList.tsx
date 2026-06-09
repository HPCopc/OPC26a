"use client";

import { useState, useTransition } from "react";
import ContentCard, { ContentCardItem, ContentType } from "./ContentCard";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FetchPageResult {
  items:     ContentCardItem[];
  nextToken: string | null;
}

export interface ContentListProps {
  initialItems:      ContentCardItem[];
  initialNextToken:  string | null;
  contentType?:      ContentType;
  /** true = show login gate instead of Load More for unauthenticated users */
  requiresAuth?:     boolean;
  isAuthenticated?:  boolean;
  /** Called with the current nextToken; returns next batch + new token */
  fetchPage?:        (nextToken: string) => Promise<FetchPageResult>;
  compact?:          boolean;
  emptyMessage?:     string;
  className?:        string;
}

// ─── Login Gate ───────────────────────────────────────────────────────────────

const TOPIC_LABELS: Record<ContentType, string> = {
  news:        "news articles",
  videos:      "videos",
  whitepapers: "whitepapers",
  resources:   "resources",
  events:      "events",
};

function LoginGate({ contentType }: { contentType?: ContentType }) {
  const label = contentType ? TOPIC_LABELS[contentType] : "content";
  return (
    <div className="flex flex-col items-center gap-4 py-12 px-6 border border-dashed border-slate-200 rounded-md bg-slate-50 text-center">
      <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-1">Members only</p>
        <p className="text-xs text-slate-500 max-w-xs">
          Sign in to access all {label} on OpportunityCrudes.com.
        </p>
      </div>
      <a
        href="/login"
        className="inline-flex items-center gap-2 px-4 py-2 rounded bg-amber-600 hover:bg-amber-700
          text-white text-sm font-semibold transition-colors duration-150"
      >
        Sign in
      </a>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div className="bg-white border border-slate-200 rounded-md overflow-hidden animate-pulse">
      {!compact && <div className="w-full aspect-[16/9] bg-slate-100" />}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="h-4 w-16 bg-slate-100 rounded-sm" />
          <div className="h-4 w-20 bg-slate-100 rounded-sm" />
        </div>
        <div className="h-4 w-full bg-slate-100 rounded" />
        <div className="h-4 w-3/4 bg-slate-100 rounded" />
        <div className="h-3 w-full bg-slate-100 rounded" />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ContentList({
  initialItems,
  initialNextToken,
  contentType,
  requiresAuth    = false,
  isAuthenticated = false,
  fetchPage,
  compact         = false,
  emptyMessage,
  className       = "",
}: ContentListProps) {
  const [items, setItems]         = useState<ContentCardItem[]>(initialItems);
  const [nextToken, setNextToken] = useState<string | null>(initialNextToken);
  const [isPending, startTransition] = useTransition();
  const [error, setError]         = useState<string | null>(null);

  const hasMore       = nextToken !== null;
  const showLoginGate = requiresAuth && !isAuthenticated && items.length > 0;
  const showLoadMore  = hasMore && fetchPage && (!requiresAuth || isAuthenticated);

  function handleLoadMore() {
    if (!fetchPage || !nextToken) return;
    startTransition(async () => {
      setError(null);
      try {
        const result = await fetchPage(nextToken);
        setItems((prev) => [...prev, ...result.items]);
        setNextToken(result.nextToken);
      } catch {
        setError("Failed to load more items. Please try again.");
      }
    });
  }

  // ── Empty state ──
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-slate-500">{emptyMessage ?? "No items found."}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-6 ${className}`}>

      {/* Grid / list */}
      <div className={
        compact
          ? "flex flex-col divide-y divide-slate-100"
          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      }>
        {items.map((item) => (
          <ContentCard
            key={item.id}
            item={item}
            compact={compact}
            className={compact ? "border-none shadow-none rounded-none py-3" : ""}
          />
        ))}
        {isPending && Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={`sk-${i}`} compact={compact} />
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}

      {showLoginGate && <LoginGate contentType={contentType} />}

      {showLoadMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleLoadMore}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded border border-slate-300
              bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            {isPending ? (
              <>
                <svg className="w-4 h-4 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Loading…
              </>
            ) : (
              "Load more"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
