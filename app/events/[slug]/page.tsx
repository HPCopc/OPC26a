import { getContentBySlug } from '@/lib/getContent';
import { notFound } from 'next/navigation';
import EventDetail from '@/components/content/detail/EventDetail';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;

  // Events are public — no login required
  // getContentBySlug routes to PublicContentBody automatically based on topic
  const item = await getContentBySlug(slug);
  if (!item) notFound();

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <EventDetail item={item} />
    </main>
  );
}