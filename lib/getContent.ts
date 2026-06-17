/**
 * getContent.ts
 * app/events/[slug]/page → EventDetail → lib/getContent
 * Fetches ContentMeta and ContentBody from DynamoDB.
 */

import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data';
import { cookies } from 'next/headers';
import { cache } from 'react';
import config from '@/amplify_outputs.json';
import type { Schema } from '@/amplify/data/resource';


const getClient = async () =>
  generateServerClientUsingCookies<Schema>({ config, cookies });

const PAGE_SIZE = 10;

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContentItem = {
  id:          string;
  title:       string;
  slug:        string;
  intro:       string | null;  // ContentMeta — public
  body:        string | null;  // ContentBody — logged-in only
  topic:       string;
  subcat1:     string | null;
  subcat2:     string | null;
  date:        string;
  isPublished: boolean;
  isPublic:    boolean;
  imageUrl:    string | null;
  s3Key:       string | null;  // ContentBody
  fileKey:     string | null;  // ContentBody
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
    intro:       raw.intro       ?? null,
    body:        bodyData?.body  ?? null,
    topic:       raw.topic,
    subcat1:     raw.subcat1     ?? null,
    subcat2:     raw.subcat2     ?? null,
    date:        raw.date,
    isPublished: raw.isPublished ?? true,
    isPublic:    raw.isPublic    ?? false,
    imageUrl:    raw.imageUrl    ?? null,
    s3Key:       bodyData?.s3Key   ?? null,
    fileKey:     bodyData?.fileKey ?? null,
    location:    raw.location    ?? null,
    eventDate:   raw.eventDate   ?? null,
  };
}

// ─── Listing Functions ────────────────────────────────────────────────────────

export const getContentByTopic = cache(
  async (
    topic:     string,
    nextToken: string | null = null
  ): Promise<ContentListResult> => {
    try {
      const client = await  getClient();
      const { data, nextToken: next, errors } =
        await client.models.ContentMeta.listContentMetaByTopicAndDate(
          { topic },
          {
            authMode:      'identityPool',
            limit:         PAGE_SIZE,
            nextToken:     nextToken ?? undefined,
            sortDirection: 'DESC',
          }
        );
      if (errors?.length) return { items: [], nextToken: null };
      return {
        items:     (data ?? []).filter(i => i.isPublished).map(i => mapMeta(i)),
        nextToken: next ?? null,
      };
    } catch {
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
      const client = await getClient();
      const { data, nextToken: next, errors } =
        await client.models.ContentMeta.listContentMetaBySubcat1AndDate(
          { subcat1 },
          {
            authMode:      'identityPool',
            limit:         PAGE_SIZE,
            nextToken:     nextToken ?? undefined,
            sortDirection: 'DESC',
          }
        );
      if (errors?.length) return { items: [], nextToken: null };
      return {
        items:     (data ?? []).filter(i => i.isPublished).map(i => mapMeta(i)),
        nextToken: next ?? null,
      };
    } catch {
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
      const client = await getClient();
      const { data, nextToken: next, errors } =
        await client.models.ContentMeta.listContentMetaBySubcat2AndDate(
          { subcat2 },
          {
            authMode:      'identityPool',
            limit:         PAGE_SIZE,
            nextToken:     nextToken ?? undefined,
            sortDirection: 'DESC',
          }
        );
      if (errors?.length) return { items: [], nextToken: null };
      return {
        items:     (data ?? []).filter(i => i.isPublished).map(i => mapMeta(i)),
        nextToken: next ?? null,
      };
    } catch {
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
    const client = await getClient();

    // 1. Fetch ContentMeta (always public)
    const { data, errors } = await client.models.ContentMeta.listContentMetaBySlug(
      { slug },
      {
        authMode: 'userPool',
        limit:    1,
      }
    );
     // ✅ ADD LOG 1 — did meta fetch work?
    console.log('🔍 [getContentBySlug] slug:', slug);
    console.log('🔍 [getContentBySlug] meta data:', JSON.stringify(data));
    console.log('❌ [getContentBySlug] meta errors:', JSON.stringify(errors));

    if (errors?.length || !data?.length) return null;
    const meta = data[0];

    // ✅ ADD LOG 2 — is it published?
    console.log('📋 [getContentBySlug] meta.isPublished:', meta.isPublished);
    
    if (!meta.isPublished) return null;

    // 2. Fetch ContentBody (logged-in users only)
    let bodyData = undefined;
    if (requiresLogin) {

      // ✅ ADD LOG 3 — about to fetch body
      console.log('🔐 [getContentBySlug] fetching body for id:', meta.id);

      const { data: bodyItems, errors: bodyErrors } = await client.models.ContentBody.get(
        { id: meta.id },
        { authMode: 'userPool' }
      );
      

           // ✅ ADD LOG 4 — did body fetch work?
      console.log('📦 [getContentBySlug] bodyItems:', JSON.stringify(bodyItems));
      console.log('❌ [getContentBySlug] bodyErrors:', JSON.stringify(bodyErrors));

      if (bodyItems) {
        bodyData = {
          body:    bodyItems.body    ?? null,
          s3Key:   bodyItems.s3Key   ?? null,
          fileKey: bodyItems.fileKey ?? null,
        };
      }
    }

    return mapMeta(meta, bodyData);
  } catch (err) {
    console.error(`[getContentBySlug] Failed for slug "${slug}":`, err);
    return null;
  }
}