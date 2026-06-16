"use client";

import Link from "next/link";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────
// ContentType values match the schema's `topic` field exactly.

export type ContentType =
  | "news"
  | "videos"
  | "whitepapers"
  | "resources"
  | "events";

export interface ContentCardItem {
  id:        string;
  slug:      string;
  title:     string;
  topic:     ContentType;       // schema: topic
  excerpt?:  string;            // derived from body via extractFirstParagraph()
  imageUrl?: string;            // schema: imageUrl
  date:      string;            // schema: date — YYYY-MM-DD
  subcat1?:  string | null;
  subcat2?:  string | null;
  // event-specific
  eventDate?:    string | null; // schema: eventDate (ISO datetime)
  location?:     string | null; // schema: location
  // video — no durationSeconds in schema; omit
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<ContentType, string> = {
  news:        "News",
  videos:      "Video",
  whitepapers: "Whitepaper",
  resources:   "Resource",
  events:      "Event",
};

const TYPE_COLORS: Record<ContentType, string> = {
  news:        "bg-amber-600  text-white",
  videos:      "bg-blue-700   text-white",
  whitepapers: "bg-slate-700  text-white",
  resources:   "bg-teal-700   text-white",
  events:      "bg-orange-600 text-white",
};

function buildHref(item: ContentCardItem): string {
  switch (item.topic) {
    case "news":
      // /news/[subcat1]/[subcat2]/[slug]
      return `/news/${item.subcat1 ?? "_"}/${item.subcat2 ?? "_"}/${item.slug}`;
    case "videos":
      // /videos/[subcat1]/[slug]
      return `/videos/${item.subcat1 ?? "_"}/${item.slug}`;
    case "whitepapers":
      // /whitepapers/[subcat1]/[slug]
      return `/whitepapers/${item.slug}`;
    case "resources":
      return `/resources/${item.slug}`;
    case "events":
      return `/events/${item.slug}`;
  }
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  // date field is YYYY-MM-DD; append T00:00:00 to avoid UTC shift
  const d = dateStr.includes("T") ? new Date(dateStr) : new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypeBadge({ topic }: { topic: ContentType }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-sm ${TYPE_COLORS[topic]}`}
    >
      {TYPE_LABELS[topic]}
    </span>
  );
}

function Thumbnail({
  url,
  title,
  topic,
}: {
  url?: string | null;
  title: string;
  topic: ContentType;
}) {
  return (
    <div className="relative w-full aspect-[16/9] bg-slate-100 overflow-hidden rounded-t-md flex-shrink-0">
      {url ? (
        <Image
          src={url}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      ) : (
        <PlaceholderIcon topic={topic} />
      )}

      {/* Video play overlay */}
      {topic === "videos" && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-blue-700 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

function PlaceholderIcon({ topic }: { topic: ContentType }) {
  const icons: Record<ContentType, React.ReactNode> = {
    news: (
      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14h6M9 10h4" />
      </svg>
    ),
    videos: (
      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    whitepapers: (
      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    resources: (
      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M14.828 14.828a4 4 0 015.656 0l.5.5a4 4 0 01-5.656 5.656l-1.1-1.1" />
      </svg>
    ),
    events: (
      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
      {icons[topic]}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export interface ContentCardProps {
  item:       ContentCardItem;
  /** Suppress thumbnail (compact row mode) */
  compact?:   boolean;
  className?: string;
}

export default function ContentCard({ item, compact = false, className = "" }: ContentCardProps) {
  const href = buildHref(item);

  return (
    <Link
      href={href}
      className={`group flex flex-col bg-white border border-slate-200 rounded-md overflow-hidden
        shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 ${className}`}
    >
      {/* Thumbnail */}
      {!compact && (
        <Thumbnail url={item.imageUrl} title={item.title} topic={item.topic} />
      )}

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-2">

        {/* Badge + date */}
        <div className="flex items-center gap-2">
          <TypeBadge topic={item.topic} />
          <span className="text-[11px] text-slate-400 font-medium">
            {formatDate(item.date)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-semibold text-slate-800 leading-snug
          group-hover:text-amber-700 transition-colors duration-150 line-clamp-3">
          {item.title}
        </h3>

        {/* Excerpt */}
        {item.excerpt && (
          <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2 flex-1">
            {item.excerpt}
          </p>
        )}

        {/* Event meta */}
        {item.topic === "events" && (item.eventDate || item.location) && (
          <div className="flex flex-col gap-0.5 mt-1 pt-2 border-t border-slate-100">
            {item.eventDate && (
              <span className="flex items-center gap-1.5 text-[12px] text-slate-500">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(item.eventDate)}
              </span>
            )}
            {item.location && (
              <span className="flex items-center gap-1.5 text-[12px] text-slate-500">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {item.location}
              </span>
            )}
         </div>
        )}

        {/* Whitepaper download hint */}
        {item.topic === "whitepapers" && (
          <span className="mt-auto pt-2 text-[12px] text-slate-400 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            PDF download
          </span>
        )}
      </div>
    </Link>
  );
}
