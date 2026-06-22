// components/content/detail/ProtectedContentDetail.tsx
// Renders protected content: news, videos, whitepapers.
// Requires login — page handles the auth gate before rendering this.
// News/whitepapers show body text.
// Videos show S3 video player if s3Key is present.
// Whitepapers show download button if fileKey is present.

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

export default function ProtectedContentDetail({ item }: Props) {
  const isVideo       = item.topic === 'videos';
  const isWhitepaper  = item.topic === 'whitepapers';

  return (
    <article className="max-w-4xl mx-auto px-4 py-10">

      {/* Hero image — skip for videos */}
      {item.imageUrl && !isVideo && (
        <div className="mb-8">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {item.title}
      </h1>

      {/* Date */}
      {item.date && (
        <p className="text-sm text-gray-500 mb-6">{formatDate(item.date)}</p>
      )}

      {/* Video player */}
      {isVideo && item.s3Key && (
        <div className="mb-8 rounded-lg overflow-hidden bg-black aspect-video">
          <video
            controls
            className="w-full h-full"
            src={`/api/video-stream?key=${encodeURIComponent(item.s3Key)}`}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Whitepaper download button */}
      {isWhitepaper && item.fileKey != null && (
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
            Download Whitepaper
          </a>
        </div>
      )}

      {/* Intro — always visible to logged-in users */}
      {item.intro && (
        <div
          className="prose prose-gray max-w-none mb-6
            prose-headings:font-bold prose-headings:text-gray-900
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-a:text-[#00a86b] prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: item.intro }}
        />
      )}

      {/* Body — full content */}
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

      {/* Login gate — body is null when not logged in (shouldn't reach here but safety net) */}
      {!item.body && !item.intro && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 font-medium mb-2">Content unavailable</p>
          <p className="text-sm text-gray-400">Please contact support if this issue persists.</p>
        </div>
      )}

    </article>
  );
}