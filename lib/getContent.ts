/**
 * getContent.ts
 * Fetches Content items from DynamoDB for listing and detail pages.
 *
 * Auth strategy:
 *   - Listing pages: identityPool (guest access — everyone sees title + first paragraph)
 *   - Detail pages:  userPool (login required for news/videos/whitepapers)
 *                    identityPool (guest ok for resources/events)
 *
 * Pagination: nextToken cursor — pass null for first page, then pass
 *             the returned nextToken to fetch the next 10 items.
 */

import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data';
import { cookies } from 'next/headers';
import { cache } from 'react';
import config from '@/amplify_outputs.json';
import type { Schema } from '@/amplify/data/resource';

const getClient = () =>
  generateServerClientUsingCookies<Schema>({ config, cookies });

const PAGE_SIZE = 10;

// ─── Shared Types ────────────────────────────────────────────────────────────

export type ContentItem = {
  id: string;
  title: string;
  slug: string;
  body: string | null;
  topic: string;
  subcat1: string | null;
  subcat2: string | null;
  date: string;
  isPublic: boolean;
  imageUrl: string | null;
  // Video specific
  s3Key: string | null;
  // Whitepaper / Resource specific
  fileKey: string | null;
  // Event specific
  location: string | null;
  eventDate: string | null;
  maxAttendees: number | null;
  registrationUrl: string | null;
};

export type ContentListResult = {
  items: ContentItem[];
  nextToken: string | null;
};

// ─── Helper ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapItem(raw: any): ContentItem {
  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    body: raw.body ?? null,
    topic: raw.topic,
    subcat1: raw.subcat1 ?? null,
    subcat2: raw.subcat2 ?? null,
    date: raw.date,
    isPublic: raw.isPublic ?? false,
    imageUrl: raw.imageUrl ?? null,
    s3Key: raw.s3Key ?? null,
    fileKey: raw.fileKey ?? null,
    location: raw.location ?? null,
    eventDate: raw.eventDate ?? null,
    maxAttendees: raw.maxAttendees ?? null,
    registrationUrl: raw.registrationUrl ?? null,
  };
}

// ─── Listing Functions (guest auth — public listings) ────────────────────────

/**
 * Fetch items by topic.
 * Used by: /events, /resources (flat sections, no subcat)
 */
export const getContentByTopic = cache(
  async (
    topic: string,
    nextToken: string | null = null
  ): Promise<ContentListResult> => {
    try {
      const client = getClient();

      const { data, nextToken: next, errors } =
        await client.models.Content.listByTopic(
          { topic },
          {
            authMode: 'identityPool',
            limit: PAGE_SIZE,
            nextToken: nextToken ?? undefined,
            sortDirection: 'DESC', // newest first
          }
        );

      if (errors?.length) {
        console.error('[getContentByTopic] Errors:', errors);
        return { items: [], nextToken: null };
      }

      return {
        items: (data ?? [])
          .filter((item) => item.isPublished)
          .map(mapItem),
        nextToken: next ?? null,
      };
    } catch (err) {
      console.error(`[getContentByTopic] Failed for topic "${topic}":`, err);
      return { items: [], nextToken: null };
    }
  }
);

/**
 * Fetch items by subcat1.
 * Used by: /videos/[subcat], /whitepapers/[subcat], /news/[subcat1]
 */
export const getContentBySubcat1 = cache(
  async (
    subcat1: string,
    nextToken: string | null = null
  ): Promise<ContentListResult> => {
    try {
      const client = getClient();

      const { data, nextToken: next, errors } =
        await client.models.Content.listBySubcat1(
          { subcat1 },
          {
            authMode: 'identityPool',
            limit: PAGE_SIZE,
            nextToken: nextToken ?? undefined,
            sortDirection: 'DESC',
          }
        );

      if (errors?.length) {
        console.error('[getContentBySubcat1] Errors:', errors);
        return { items: [], nextToken: null };
      }

      return {
        items: (data ?? [])
          .filter((item) => item.isPublished)
          .map(mapItem),
        nextToken: next ?? null,
      };
    } catch (err) {
      console.error(`[getContentBySubcat1] Failed for subcat1 "${subcat1}":`, err);
      return { items: [], nextToken: null };
    }
  }
);

/**
 * Fetch items by subcat2.
 * Used by: /news/[subcat1]/[subcat2] listing page
 */
export const getContentBySubcat2 = cache(
  async (
    subcat2: string,
    nextToken: string | null = null
  ): Promise<ContentListResult> => {
    try {
      const client = getClient();

      const { data, nextToken: next, errors } =
        await client.models.Content.listBySubcat2(
          { subcat2 },
          {
            authMode: 'identityPool',
            limit: PAGE_SIZE,
            nextToken: nextToken ?? undefined,
            sortDirection: 'DESC',
          }
        );

      if (errors?.length) {
        console.error('[getContentBySubcat2] Errors:', errors);
        return { items: [], nextToken: null };
      }

      return {
        items: (data ?? [])
          .filter((item) => item.isPublished)
          .map(mapItem),
        nextToken: next ?? null,
      };
    } catch (err) {
      console.error(`[getContentBySubcat2] Failed for subcat2 "${subcat2}":`, err);
      return { items: [], nextToken: null };
    }
  }
);

// ─── Detail Functions ─────────────────────────────────────────────────────────

/**
 * Fetch a single Content item by slug.
 *
 * For public topics (events, resources): pass authMode = 'identityPool'
 * For protected topics (news, videos, whitepapers): pass authMode = 'userPool'
 * The detail page.tsx is responsible for checking login before calling this.
 */
export async function getContentBySlug(
  slug: string,
  requiresLogin: boolean
): Promise<ContentItem | null> {
  try {
    const client = getClient();

    const { data, errors } = await client.models.Content.listBySlug(
      { slug },
      {
        authMode: requiresLogin ? 'userPool' : 'identityPool',
        limit: 1,
      }
    );

    if (errors?.length || !data?.length) return null;

    const item = data[0];
    if (!item.isPublished) return null;

    return mapItem(item);
  } catch (err) {
    console.error(`[getContentBySlug] Failed for slug "${slug}":`, err);
    return null;
  }
}
