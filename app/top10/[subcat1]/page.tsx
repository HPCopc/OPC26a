import { redirect } from 'next/navigation';

// Top 10 has no category pages; see app/top10/page.tsx.
export default function Top10Subcat1Page() {
  redirect('/');
}
