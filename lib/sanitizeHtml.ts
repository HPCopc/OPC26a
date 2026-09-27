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
    // Links to other sites open in a new tab (without a handle on this
    // window); links within the site stay in the same tab. Decided here
    // rather than in the editor, so older content follows the same rule.
    a: (tagName, attribs) => {
      const rest = { ...attribs };
      delete rest.target;
      delete rest.rel;
      return isExternalHref(attribs.href)
        ? { tagName, attribs: { ...rest, target: '_blank', rel: 'noopener noreferrer nofollow' } }
        : { tagName, attribs: rest };
    },
  },
};

/** http(s) links leave the site; paths, anchors, mailto: and tel: don't. */
export function isExternalHref(href: string | null | undefined): boolean {
  return !!href && /^https?:\/\//i.test(href.trim());
}

/**
 * An admin-entered link (buttons, box headers) if it's safe to render:
 * a site path ("/contact"), an anchor, or an http(s)/mailto/tel URL.
 * Anything else (javascript:, "//evil.com") comes back as null.
 */
export function safeHref(href: string | null | undefined): string | null {
  const h = href?.trim();
  if (!h) return null;
  if (h.startsWith('//') || h.startsWith('/\\')) return null; // protocol-relative
  if (h.startsWith('/') || h.startsWith('#')) return h;
  return /^(https?:\/\/|mailto:|tel:)/i.test(h) ? h : null;
}

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';
  return sanitize(html, OPTIONS);
}
