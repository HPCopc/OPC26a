/**
 * getContent.ts
 * Fetches ContentMeta + PublicContentBody or ProtectedContentBody from DynamoDB.
 * Topic drives which body table is queried:
 *   "events" | "resources"  → PublicContentBody  (no login)
 *   everything else         → ProtectedContentBody (login required)
 */

import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data';
import { cookies } from 'next/headers';
import { cache } from 'react';
import config from '@/amplify_outputs.json';
import type { Schema } from '@/amplify/data/resource';
import { topicSubcat1Key, topicSubcat2Key } from '@/lib/taxonomy';

const getClient = async () =>
  generateServerClientUsingCookies<Schema>({ config, cookies });

const PAGE_SIZE = 10;

// ─── Constants ────────────────────────────────────────────────────────────────

const PUBLIC_TOPICS = ['events', 'resources'];

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContentItem = {
  id:          string;
  title:       string;
  slug:        string;
  intro:       string | null;
  body:        string | null;
  topic:       string;
  subcat1:     string | null;
  subcat2:     string | null;
  date:        string;
  isPublished: boolean;
  isPublic:    boolean;  // derived from topic — true if events or resource
  imageUrl:    string | null;
  s3Key:       string | null;
  fileKey:     string | null;
  location:    string | null;
  eventDate:   string | null;
};

export type ContentListResult = {
  items:     ContentItem[];
  nextToken: string | null;
};

// ─── Helper ───────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMeta(raw: any, bodyData?: { body?: string | null; s3Key?: string | null; fileKey?: string | null }): ContentItem {
  return {
    id:          raw.id,
    title:       raw.title,
    slug:        raw.slug,
    intro:       raw.intro      ?? null,
    body:        bodyData?.body ?? null,
    topic:       raw.topic,
    subcat1:     raw.subcat1    ?? null,
    subcat2:     raw.subcat2    ?? null,
    date:        raw.date,
    isPublished: raw.isPublished ?? true,
    isPublic:    PUBLIC_TOPICS.includes(raw.topic),  // ← derived, not from DB
    imageUrl:    raw.imageUrl   ?? null,
    s3Key:       bodyData?.s3Key   ?? null,
    fileKey:     bodyData?.fileKey ?? null,
    location:    raw.location   ?? null,
    eventDate:   raw.eventDate  ?? null,
  };
}

// ─── Listing Functions ───────────────────────────────────────────────────────
// publishedContentList only returns published items, so drafts never reach
// the server (or anyone calling the API directly with the public key).
//
// DynamoDB applies the limit before the isPublished filter, so one call can
// come back short (or empty) when drafts sit among the newest items. Keep
// following nextToken until the page is full or the index runs out.

const MAX_QUERIES_PER_PAGE = 20;

async function listPublished(
  field:     'topic' | 'topicSubcat1' | 'topicSubcat2',
  value:     string,
  nextToken: string | null
): Promise<ContentListResult> {
  try {
    const client = await getClient();
    const items: ContentItem[] = [];
    let token = nextToken;

    for (let i = 0; i < MAX_QUERIES_PER_PAGE && items.length < PAGE_SIZE; i++) {
      const { data, errors } = await client.queries.publishedContentList(
        { field, value, limit: PAGE_SIZE - items.length, nextToken: token ?? undefined },
        { authMode: 'apiKey' }
      );
      if (errors?.length || !data) break;

      items.push(...(data.items ?? []).filter(i => i != null).map(i => mapMeta(i)));
      token = data.nextToken ?? null;
      if (!token) break;
    }

    return { items, nextToken: token };
  } catch {
    return { items: [], nextToken: null };
  }
}

export const getContentByTopic = cache(
  async (topic: string, nextToken: string | null = null): Promise<ContentListResult> =>
    listPublished('topic', topic, nextToken)
);

export const getContentBySubcat1 = cache(
  async (topic: string, subcat1: string, nextToken: string | null = null): Promise<ContentListResult> =>
    listPublished('topicSubcat1', topicSubcat1Key(topic, subcat1), nextToken)
);

export const getContentBySubcat2 = cache(
  async (
    topic:     string,
    subcat1:   string,
    subcat2:   string,
    nextToken: string | null = null
  ): Promise<ContentListResult> =>
    listPublished('topicSubcat2', topicSubcat2Key(topic, subcat1, subcat2), nextToken)
);

// ─── Detail Function ──────────────────────────────────────────────────────────

export async function getContentBySlug(
  slug: string
  // requiresLogin removed — topic drives the decision now
): Promise<ContentItem | null> {
  try {
    const client = await getClient();

    // 1. Fetch ContentMeta — always public; null for drafts
    const { data: meta, errors } = await client.queries.publishedContentBySlug(
      { slug },
      { authMode: 'apiKey' }
    );

    if (errors?.length || !meta) return null;

    const isPublic = PUBLIC_TOPICS.includes(meta.topic);

    // 2a. Public topic → PublicContentBody with apiKey (no login needed)
    if (isPublic) {
      const { data: body } = await client.queries.publishedPublicBody(
        { slug },
        { authMode: 'apiKey' }
      );
      return mapMeta(meta, body ?? undefined);
    }

    // 2b. Protected topic → ProtectedContentBody, requires login
    try {
      const { data: body } = await client.queries.publishedProtectedBody(
        { slug },
        { authMode: 'userPool' }
      );
      return mapMeta(meta, body ?? undefined);

    } catch {
      // Not logged in — return meta only, body will be null
      // Page/component should show a login gate
      return mapMeta(meta, undefined);
    }

  } catch (err) {
    console.error(`[getContentBySlug] Failed for slug "${slug}":`, err);
    return null;
  }
}
