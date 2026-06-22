// components/content/detail/PublicContentDetail.tsx
// Renders public content: events and resources.
// Events show date/location meta box.
// Resources show a download button if fileKey is present.

import type { ContentItem } from '@/lib/getContent';

type Props = {
  item: ContentItem;
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

export default function PublicContentDetail({ item }: Props) {
  const isEvent    = item.topic === 'events';
  const isResource = item.topic === 'resource';

  return (
    <article className="max-w-4xl mx-auto px-4 py-10">

      {/* Hero image */}
      {item.imageUrl && (
        <div className="mb-8">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {item.title}
      </h1>

      {/* Event meta box — date & location */}
      {isEvent && (item.eventDate || item.date || item.location) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">

          {(item.eventDate || item.date) && (
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#00a86b] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Date & Time</p>
                <p className="text-sm text-gray-800">
                  {item.eventDate ? formatDateTime(item.eventDate) : formatDate(item.date)}
                </p>
              </div>
            </div>
          )}

          {item.location && (
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#00a86b] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Location</p>
                <p className="text-sm text-gray-800">{item.location}</p>
              </div>
            </div>
          )}
        </div>
      )}

     {/* Resource download button */} 

    {isResource && item.fileKey != null && (
      <div className="mb-8">
        <a href={`/api/resource-download?key=${encodeURIComponent(item.fileKey as string)}`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00a86b] text-white text-sm font-semibold rounded-lg hover:bg-[#008f5a] transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download Resource
        </a>
      </div>
    )}
      {/* Intro — always visible */}
      {item.intro && (
        <div
          className="prose prose-gray max-w-none mb-6
            prose-headings:font-bold prose-headings:text-gray-900
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-a:text-[#00a86b] prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: item.intro }}
        />
      )}

      {/* Body — full content, publicly visible */}
      {item.body && (
        <div
          className="prose prose-gray max-w-none mb-10
            prose-headings:font-bold prose-headings:text-gray-900
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-a:text-[#00a86b] prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900
            prose-ul:list-disc prose-ol:list-decimal"
          dangerouslySetInnerHTML={{ __html: item.body }}
        />
      )}

    </article>
  );
}