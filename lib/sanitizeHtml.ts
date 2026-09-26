/**
 * sanitizeHtml.ts
 * Cleans admin-authored rich text before it is rendered with
 * dangerouslySetInnerHTML. Keeps the formatting the TipTap editor
 * (StarterKit + Link) produces and strips anything that can run script:
 * <script>, event handlers (onerror=...), javascript: URLs, iframes, etc.
 *
 * Uses sanitize-html rather than DOMPurify because most of these pages
 * render on the server, where DOMPurify would need jsdom.
 */

import sanitize from 'sanitize-html';

const OPTIONS: sanitize.IOptions = {
  allowedTags: [
    'p', 'br', 'hr', 'span',
    'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'code', 'pre', 'blockquote',
    'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'a',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowProtocolRelative: false,
  transformTags: {
    // Links opening a new tab must not get a handle on this window.
    a: (tagName, attribs) =>
      attribs.target === '_blank'
        ? { tagName, attribs: { ...attribs, rel: 'noopener noreferrer nofollow' } }
        : { tagName, attribs },
  },
};

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';
  return sanitize(html, OPTIONS);
}
