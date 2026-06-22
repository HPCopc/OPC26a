/**
 * getContent.ts
 * Fetches ContentMeta + PublicContentBody or ProtectedContentBody from DynamoDB.
 * Topic drives which body table is queried:
 *   "events" | "resource"  → PublicContentBody  (no login)
 *   everything else         → ProtectedContentBody (login required)
 */

import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data';
import { cookies } from 'next/headers';
import { cache } from 'react';
import config from '@/amplify_outputs.json';
import type { Schema } from '@/amplify/data/resource';

const getClient = async () =>
  generateServerClientUsingCookies<Schema>({ config, cookies });

const PAGE_SIZE = 10;

// ─── Constants ────────────────────────────────────────────────────────────────

const PUBLIC_TOPICS = ['events', 'resource'];

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

// ─── Listing Functions (unchanged) ───────────────────────────────────────────

export const getContentByTopic = cache(
  async (
    topic:     string,
    nextToken: string | null = null
  ): Promise<ContentListResult> => {
    try {
      const client = await getClient();
      let data: any[] | undefined;
      let next: string | null | undefined;
      let errors: any[] | undefined = undefined;

      try {
        ({ data, nextToken: next, errors } =
          await client.models.ContentMeta.listContentMetaByTopicAndDate(
            { topic },
            {
              authMode:      'userPool',
              limit:         PAGE_SIZE,
              nextToken:     nextToken ?? undefined,
              sortDirection: 'DESC',
            }
          ));
      } catch {
        ({ data, nextToken: next, errors } =
          await client.models.ContentMeta.listContentMetaByTopicAndDate(
            { topic },
            {
              authMode:      'identityPool',
              limit:         PAGE_SIZE,
              nextToken:     nextToken ?? undefined,
              sortDirection: 'DESC',
            }
          ));
      }

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
      let data: any[] | undefined;
      let next: string | null | undefined;
      let errors: any[] | undefined = undefined;

      try {
        ({ data, nextToken: next, errors } =
          await client.models.ContentMeta.listContentMetaBySubcat1AndDate(
            { subcat1 },
            {
              authMode:      'userPool',
              limit:         PAGE_SIZE,
              nextToken:     nextToken ?? undefined,
              sortDirection: 'DESC',
            }
          ));
      } catch {
        ({ data, nextToken: next, errors } =
          await client.models.ContentMeta.listContentMetaBySubcat1AndDate(
            { subcat1 },
            {
              authMode:      'identityPool',
              limit:         PAGE_SIZE,
              nextToken:     nextToken ?? undefined,
              sortDirection: 'DESC',
            }
          ));
      }

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
      let data: any[] | undefined;
      let next: string | null | undefined;
      let errors: any[] | undefined = undefined;

      try {
        ({ data, nextToken: next, errors } =
          await client.models.ContentMeta.listContentMetaBySubcat2AndDate(
            { subcat2 },
            {
              authMode:      'userPool',
              limit:         PAGE_SIZE,
              nextToken:     nextToken ?? undefined,
              sortDirection: 'DESC',
            }
          ));
      } catch {
        ({ data, nextToken: next, errors } =
          await client.models.ContentMeta.listContentMetaBySubcat2AndDate(
            { subcat2 },
            {
              authMode:      'identityPool',
              limit:         PAGE_SIZE,
              nextToken:     nextToken ?? undefined,
              sortDirection: 'DESC',
            }
          ));
      }

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
  slug: string
  // requiresLogin removed — topic drives the decision now
): Promise<ContentItem | null> {
  try {
    const client = await getClient();

    // 1. Fetch ContentMeta — always public
    const { data, errors } = await client.models.ContentMeta.listContentMetaBySlug(
      { slug },
      { authMode: 'apiKey', limit: 1 }
    );

    console.log('🔍 [getContentBySlug] slug:', slug);
    console.log('🔍 [getContentBySlug] meta data:', JSON.stringify(data));
    console.log('❌ [getContentBySlug] meta errors:', JSON.stringify(errors));

    if (errors?.length || !data?.length) return null;
    const meta = data[0];

    console.log('📋 [getContentBySlug] meta.topic:', meta.topic);

    if (!meta.isPublished) return null;

    const isPublic = PUBLIC_TOPICS.includes(meta.topic);

    // 2a. Public topic → query PublicContentBody with apiKey (no login needed)
    if (isPublic) {
      const { data: bodyItems, errors: bodyErrors } =
        await client.models.PublicContentBody.listPublicContentBodyByMetaId(
          { metaId: meta.id },
          { authMode: 'apiKey', limit: 1 }
        );

      console.log('📦 [getContentBySlug] PublicContentBody:', JSON.stringify(bodyItems));
      console.log('❌ [getContentBySlug] bodyErrors:', JSON.stringify(bodyErrors));

      const body = bodyItems?.[0];
      return mapMeta(meta, body ? {
        body:    body.body    ?? null,
        s3Key:   body.s3Key   ?? null,
        fileKey: body.fileKey ?? null,
      } : undefined);
    }

    // 2b. Protected topic → query ProtectedContentBody, requires login
    try {
      const { data: bodyItems, errors: bodyErrors } =
        await client.models.ProtectedContentBody.listProtectedContentBodyByMetaId(
          { metaId: meta.id },
          { authMode: 'userPool', limit: 1 }
        );

      console.log('🔐 [getContentBySlug] ProtectedContentBody:', JSON.stringify(bodyItems));
      console.log('❌ [getContentBySlug] bodyErrors:', JSON.stringify(bodyErrors));

      const body = bodyItems?.[0];
      return mapMeta(meta, body ? {
        body:    body.body    ?? null,
        s3Key:   body.s3Key   ?? null,
        fileKey: body.fileKey ?? null,
      } : undefined);

    } catch {
      // Not logged in — return meta only, body will be null
      // Page/component should show a login gate
      console.log('🔒 [getContentBySlug] user not logged in, returning meta only');
      return mapMeta(meta, undefined);
    }

  } catch (err) {
    console.error(`[getContentBySlug] Failed for slug "${slug}":`, err);
    return null;
  }
}