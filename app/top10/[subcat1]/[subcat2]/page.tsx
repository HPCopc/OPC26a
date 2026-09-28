import { getContentBySlug } from '@/lib/getContent';
import { contentPath } from '@/lib/contentPath';
import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ subcat1: string; subcat2: string }>;
};

// Top 10 has no category pages; its articles are listed only in the home
// page's Weekly Insights box. An old /top10/<cat>/<slug> article link lands
// here, so send it to the item's real URL.
export default async function Top10CategoryPage({ params }: Props) {
  const { subcat2 } = await params;
  const item = await getContentBySlug(subcat2);
  redirect(item?.topic === 'top10' ? contentPath(item) : '/');
}
