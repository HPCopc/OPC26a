/**
 * contentPath.ts
 * The one canonical URL for a content item. Cards link to it, and detail
 * pages redirect to it when opened under the wrong topic or categories.
 */

type PathFields = {
  slug:     string;
  topic:    string;
  subcat1?: string | null;
  subcat2?: string | null;
};

export function contentPath(item: PathFields): string {
  switch (item.topic) {
    case 'news':
    case 'top10':
      return `/${item.topic}/${item.subcat1 ?? '_'}/${item.subcat2 ?? 'general'}/${item.slug}`;
    case 'videos':
      return `/videos/${item.subcat1 ?? '_'}/${item.slug}`;
    default:
      // whitepapers, resources, events
      return `/${item.topic}/${item.slug}`;
  }
}
