import { getContentBySlug } from '@/lib/getContent';
import { notFound } from 'next/navigation';
import PublicContentDetail from '@/components/content/detail/PublicContentDetail';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ResourceDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getContentBySlug(slug);
  if (!item) notFound();

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <PublicContentDetail item={item} />
    </main>
  );
}