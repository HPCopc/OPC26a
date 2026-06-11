/**
 * getContent.ts
 * Fetches Content items from DynamoDB for listing and detail pages.
 */

import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data';
import { cookies } from 'next/headers';
import { cache } from 'react';
import config from '@/amplify_outputs.json';
import type { Schema } from '@/amplify/data/resource';

const getClient = () =>
  generateServerClientUsingCookies<Schema>({ config, cookies });

const PAGE_SIZE = 10;

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContentItem = {
  id:              string;
  title:           string;
  slug:            string;
  body:            string | null;
  topic:           string;
  subcat1:         string | null;
  subcat2:         string | null;
  date:            string;
  isPublished:     boolean;
  isPublic:        boolean;
  imageUrl:        string | null;
  s3Key:           string | null;
  fileKey:         string | null;
  location:        string | null;
  eventDate:       string | null;
  maxAttendees:    number | null;
  registrationUrl: string | null;
};

export type ContentListResult = {
  items:     ContentItem[];
  nextToken: string | null;
};

// ─── Helper ───────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapItem(raw: any): ContentItem {
  return {
    id:              raw.id,
    title:           raw.title,
    slug:            raw.slug,
    body:            raw.body            ?? null,
    topic:           raw.topic,
    subcat1:         raw.subcat1         ?? null,
    subcat2:         raw.subcat2         ?? null,
    date:            raw.date,
    isPublished:     raw.isPublished     ?? true,
    isPublic:        raw.isPublic        ?? false,
    imageUrl:        raw.imageUrl        ?? null,
    s3Key:           raw.s3Key           ?? null,
    fileKey:         raw.fileKey         ?? null,
    location:        raw.location        ?? null,
    eventDate:       raw.eventDate       ?? null,
    maxAttendees:    raw.maxAttendees    ?? null,
    registrationUrl: raw.registrationUrl ?? null,
  };
}

// ─── Listing Functions ────────────────────────────────────────────────────────

export const getContentByTopic = cache(
  async (
    topic:     string,
    nextToken: string | null = null
  ): Promise<ContentListResult> => {
    try {
      const client = getClient();
      const { data, nextToken: next, errors } =
        await client.models.Content.listContentByTopic(
          { topic },
          {
            authMode:      'identityPool',
            limit:         PAGE_SIZE,
            nextToken:     nextToken ?? undefined,
            sortDirection: 'DESC',
          }
        );
      if (errors?.length) {
        console.error('[getContentByTopic] Errors:', errors);
        return { items: [], nextToken: null };
      }
      return {
        items:     (data ?? []).filter(i => i.isPublished).map(mapItem),
        nextToken: next ?? null,
      };
    } catch (err) {
      console.error(`[getContentByTopic] Failed for topic "${topic}":`, err);
      return { items: [], nextToken: null };
    }
  }
);

export const getContentBySubcat1 = cache(
  async (
    subcat1:   string,
    nextToken: string | null = null
  ): Promise<ContentListResult> => {
    try {
      const client = getClient();
      const { data, nextToken: next, errors } =
        await client.models.Content.listContentBySubcat1(
          { subcat1 },
          {
            authMode:      'identityPool',
            limit:         PAGE_SIZE,
            nextToken:     nextToken ?? undefined,
            sortDirection: 'DESC',
          }
        );
      if (errors?.length) {
        console.error('[getContentBySubcat1] Errors:', errors);
        return { items: [], nextToken: null };
      }
      return {
        items:     (data ?? []).filter(i => i.isPublished).map(mapItem),
        nextToken: next ?? null,
      };
    } catch (err) {
      console.error(`[getContentBySubcat1] Failed for subcat1 "${subcat1}":`, err);
      return { items: [], nextToken: null };
    }
  }
);

export const getContentBySubcat2 = cache(
  async (
    subcat2:   string,
    nextToken: string | null = null
  ): Promise<ContentListResult> => {
    try {
      const client = getClient();
      const { data, nextToken: next, errors } =
        await client.models.Content.listContentBySubcat2(
          { subcat2 },
          {
            authMode:      'identityPool',
            limit:         PAGE_SIZE,
            nextToken:     nextToken ?? undefined,
            sortDirection: 'DESC',
          }
        );
      if (errors?.length) {
        console.error('[getContentBySubcat2] Errors:', errors);
        return { items: [], nextToken: null };
      }
      return {
        items:     (data ?? []).filter(i => i.isPublished).map(mapItem),
        nextToken: next ?? null,
      };
    } catch (err) {
      console.error(`[getContentBySubcat2] Failed for subcat2 "${subcat2}":`, err);
      return { items: [], nextToken: null };
    }
  }
);

// ─── Detail Function ──────────────────────────────────────────────────────────

export async function getContentBySlug(
  slug:          string,
  requiresLogin: boolean
): Promise<ContentItem | null> {
  try {
    const client = getClient();
    const { data, errors } = await client.models.Content.listContentBySlug(
      { slug },
      {
        authMode: requiresLogin ? 'userPool' : 'identityPool',
        limit:    1,
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