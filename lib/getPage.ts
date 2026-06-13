/**
 * getPage.ts
 * Fetches a Page record from DynamoDB by its slug.
 *
 * Used by every listing page to get the admin-editable title + intro.
 *
 * Slug convention:
 *   "news"                            → /news
 *   "news-markets"                    → /news/markets
 *   "news-markets-feature-of-the-week"→ /news/markets/feature-of-the-week
 *   "videos"                          → /videos
 *   "videos-seminars"                 → /videos/seminars
 *   "whitepapers"                     → /whitepapers
 *   "whitepapers-reports"             → /whitepapers/reports
 *   "resources"                       → /resources
 *   "events"                          → /events
 */

import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data';
import { cookies } from 'next/headers';
import { cache } from 'react';
import config from '@/amplify_outputs.json';
import type { Schema } from '@/amplify/data/resource';

const getClient = () =>
  generateServerClientUsingCookies<Schema>({ config, cookies });

export type PageRecord = {
  slug: string;
  title: string;
  intro: string | null;
  status: 'draft' | 'published' | null;
};

/**
 * Fetch a single Page record by slug.
 * Returns null if not found or not published.
 *
 * Wrapped in React cache() so multiple calls with the same slug
 * in one render only hit DynamoDB once.
 */
export const getPage = cache(async (slug: string): Promise<PageRecord | null> => {
  try {
    const client = getClient();

    const { data, errors } = await client.models.Page.get(
      { slug },
      { authMode: 'apiKey' }
   );

if (errors?.length || !data) return null;

const page = data;

if (page.status === 'draft') return null;

return {
   
  slug: page.slug,
  title: page.title,
  intro: page.intro ?? null,
  status: page.status ?? null,
};
 
  } catch (err) {
    console.error(`[getPage] Failed to fetch page with slug "${slug}":`, err);
    return null;
  }
});

/**
 * Fetch all Page records whose slug starts with a given prefix.
 * Used by the subnav to list all subtopics for a section.
 *
 * Example: getPagesByPrefix("news-") returns all news subtopic pages.
 * Example: getPagesByPrefix("news-markets-") returns all subcat2 pages under markets.
 */
export const getPagesByPrefix = cache(async (prefix: string): Promise<PageRecord[]> => {
  try {
    const client = getClient();

    // List all pages — Page table will be small (< 100 records total)
    const { data, errors } = await client.models.Page.list({
        limit: 100,
        authMode: 'apiKey',
    });

    if (errors?.length || !data?.length) return [];

    return data
      .filter(
        (p) =>
          p.slug.startsWith(prefix) &&
          p.status !== 'draft'
      )
      .map((p) => ({
         
        slug: p.slug,
        title: p.title,
        intro: p.intro ?? null,
        status: p.status ?? null,
      }))
      .sort((a, b) => a.slug.localeCompare(b.slug)); // consistent ordering
  } catch (err) {
    console.error(`[getPagesByPrefix] Failed for prefix "${prefix}":`, err);
    return [];
  }
});
