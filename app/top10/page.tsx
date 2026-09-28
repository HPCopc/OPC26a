import { redirect } from 'next/navigation';

// Top 10 articles are listed only in the home page's Weekly Insights box.
export default function Top10Page() {
  redirect('/');
}
