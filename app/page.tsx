import HomeBoxCard from '@/components/HomeBoxCard';
import ScrollToBoxAnchor from '@/components/ScrollToBoxAnchor';
import { getHomeBoxes } from '@/lib/getHomeBoxes';
import { cookies } from 'next/headers';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { runWithAmplifyServerContext } from '@/utils/amplifyServerUtils';

// Boxes are admin-managed (/admin/home), so always render fresh.
export const dynamic = 'force-dynamic';

// Only decides whether to show Register buttons, so a failed check just
// counts as signed out.
async function isSignedIn(): Promise<boolean> {
  try {
    return await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: async (contextSpec) => !!(await fetchAuthSession(contextSpec)).tokens,
    });
  } catch {
    return false;
  }
}

export default async function HomePage() {
  const [boxes, signedIn] = await Promise.all([getHomeBoxes(), isSignedIn()]);   // boxes sorted by sortOrder
  const left  = boxes.filter((b) => b.column === 'left');
  const right = boxes.filter((b) => b.column === 'right');

  if (boxes.length === 0) {
    return <div className="max-w-6xl mx-auto px-4 py-10" />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <ScrollToBoxAnchor />
      {/* Phones: one column, rows in order (left box before right box). */}
      <div className="flex flex-col gap-6 md:hidden">
        {[...boxes]
          .sort((a, b) => a.sortOrder - b.sortOrder || (a.column === 'left' ? -1 : 1))
          .map((box) => <HomeBoxCard key={box.id} box={box} signedIn={signedIn} />)}
      </div>

      {/* Wider screens: two independent columns, as on the original site. */}
      <div className="hidden md:grid md:grid-cols-2 gap-6 items-start">
        <div className="flex flex-col gap-6">
          {left.map((box) => <HomeBoxCard key={box.id} box={box} signedIn={signedIn} />)}
        </div>
        <div className="flex flex-col gap-6">
          {right.map((box) => <HomeBoxCard key={box.id} box={box} signedIn={signedIn} />)}
        </div>
      </div>
    </div>
  );
}
