import type { Schema } from '@/amplify/data/resource';

type Event = Schema['Event']['type'];

export default function EventCard({ event }: { event: Event }) {
  const start = new Date(event.startDate).toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
      {event.imageUrl && (
        <img src={event.imageUrl} alt={event.title} className="w-full h-40 object-cover" />
      )}
      <div className="p-4">
        {event.isFeatured && (
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
            Featured
          </span>
        )}
        <h2 className="text-lg font-semibold mt-1">{event.title}</h2>
        <p className="text-sm text-gray-500 mt-1">{start}</p>
        {event.location && (
          <p className="text-sm text-gray-400 mt-1">📍 {event.location}</p>
        )}
        {event.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{event.description}</p>
        )}
      </div>
    </div>
  );
}