/**
 * getHomeBoxes.ts
 * The published home page boxes, in display order, each with its news
 * feed (if it has one) already fetched.
 */

import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data';
import { cookies } from 'next/headers';
import config from '@/amplify_outputs.json';
import type { Schema } from '@/amplify/data/resource';
import { getLatestContent, type ContentItem } from '@/lib/getContent';

export type HomeBoxButton = {
  label:  string;
  href:   string;
  style:  'primary' | 'secondary';
  newTab: boolean;
};

export type HomeBoxData = {
  id:              string;
  title:           string;
  titleLink:       string | null;
  column:          'left' | 'right';
  sortOrder:       number;
  description:     string | null;
  buttons:         HomeBoxButton[];
  buttonsPosition: 'above' | 'below';
  news:            ContentItem[] | null;   // null = box has no news feed
  newsNumbered:    boolean;
  moreLink:        string | null;          // null = no "more" link
  moreLabel:       string;
};

/** The listing page for a news feed, e.g. /news/markets or /top10/forecasts. */
export function feedListingPath(topic: string, subcat1?: string | null, subcat2?: string | null): string {
  if (subcat1 && subcat2) return `/${topic}/${subcat1}/${subcat2}`;
  if (subcat1) return `/${topic}/${subcat1}`;
  return `/${topic}`;
}

export async function getHomeBoxes(): Promise<HomeBoxData[]> {
  try {
    const client = generateServerClientUsingCookies<Schema>({ config, cookies });
    const { data, errors } = await client.queries.publishedHomeBoxes({ authMode: 'apiKey' });
    if (errors?.length || !data) return [];

    const boxes = data
      .filter((b): b is NonNullable<typeof b> => b != null)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    return await Promise.all(boxes.map(async (b): Promise<HomeBoxData> => {
      const topic = b.newsTopic || null;
      const news = topic
        ? await getLatestContent(topic, b.newsSubcat1 || null, b.newsSubcat2 || null, b.newsLimit || 5)
        : null;

      return {
        id:              b.id,
        title:           b.title,
        titleLink:       b.titleLink || null,
        column:          b.column === 'right' ? 'right' : 'left',
        sortOrder:       b.sortOrder ?? 0,
        description:     b.description || null,
        buttons:         (b.buttons ?? [])
          .filter((x): x is NonNullable<typeof x> => x != null && !!x.label && !!x.href)
          .map((x) => ({
            label:  x.label,
            href:   x.href,
            style:  x.style === 'secondary' ? 'secondary' : 'primary',
            newTab: !!x.newTab,
          })),
        buttonsPosition: b.buttonsPosition === 'above' ? 'above' : 'below',
        news,
        newsNumbered:    !!b.newsNumbered,
        moreLink:        b.showMore
          ? (b.moreLink || (topic ? feedListingPath(topic, b.newsSubcat1, b.newsSubcat2) : null))
          : null,
        moreLabel:       b.moreLabel || 'more ›',
      };
    }));
  } catch (err) {
    console.error('[getHomeBoxes] Failed:', err);
    return [];
  }
}
