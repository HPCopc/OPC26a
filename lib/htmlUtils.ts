//extractFirstParagraph()
/**
 * htmlUtils.ts
 * Utility functions for parsing TipTap HTML content.
 */

/**
 * Extracts the text content of the first <p> tag from a TipTap HTML string.
 * Used in listing cards to show a preview of the full article body.
 *
 * @param html - Raw TipTap HTML string (e.g. "<p>First para</p><p>Second</p>")
 * @returns Plain text of the first paragraph, or empty string if none found.
 */
export function extractFirstParagraph(html: string | null | undefined): string {
  if (!html) return '';

  // Match the first <p>...</p> block (non-greedy, handles nested tags)
  const match = html.match(/<p[^>]*>(.*?)<\/p>/is);
  if (!match) return '';

  // Strip any inner HTML tags (e.g. <strong>, <em>, <a>) to get plain text
  const plainText = match[1].replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  return plainText
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}
