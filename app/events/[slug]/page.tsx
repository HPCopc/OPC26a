import { getContentBySlug } from '@/lib/getContent';
import { notFound } from 'next/navigation';
import EventDetail from '@/components/content/detail/EventDetail';

// ── Next.js 15: params is a Promise ──────────────────────────────────────────
type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;

  const item = await getContentBySlug(slug, false); // false = public, no login required

  if (!item) notFound();

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <EventDetail item={item} />
    </main>
  );
}
