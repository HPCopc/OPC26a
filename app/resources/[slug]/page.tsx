import { getContentBySlug } from '@/lib/getContent';
import { contentPath } from '@/lib/contentPath';
import { notFound, redirect } from 'next/navigation';
import PublicContentDetail from '@/components/content/detail/PublicContentDetail';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ResourceDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getContentBySlug(slug);
  if (!item) notFound();

  // The slug lookup ignores topic and categories, so send any other URL
  // (e.g. /events/<news-slug>) to the item's real one.
  const path = contentPath(item);
  if (path !== `/resources/${slug}`) redirect(path);

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <PublicContentDetail item={item} />
    </main>
  );
}