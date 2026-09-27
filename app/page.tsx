import HomeBoxCard from '@/components/HomeBoxCard';
import { getHomeBoxes } from '@/lib/getHomeBoxes';

// Boxes are admin-managed (/admin/home), so always render fresh.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const boxes = await getHomeBoxes();   // sorted by sortOrder
  const left  = boxes.filter((b) => b.column === 'left');
  const right = boxes.filter((b) => b.column === 'right');

  if (boxes.length === 0) {
    return <div className="max-w-6xl mx-auto px-4 py-10" />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Phones: one column, rows in order (left box before right box). */}
      <div className="flex flex-col gap-6 md:hidden">
        {[...boxes]
          .sort((a, b) => a.sortOrder - b.sortOrder || (a.column === 'left' ? -1 : 1))
          .map((box) => <HomeBoxCard key={box.id} box={box} />)}
      </div>

      {/* Wider screens: two independent columns, as on the original site. */}
      <div className="hidden md:grid md:grid-cols-2 gap-6 items-start">
        <div className="flex flex-col gap-6">
          {left.map((box) => <HomeBoxCard key={box.id} box={box} />)}
        </div>
        <div className="flex flex-col gap-6">
          {right.map((box) => <HomeBoxCard key={box.id} box={box} />)}
        </div>
      </div>
    </div>
  );
}
