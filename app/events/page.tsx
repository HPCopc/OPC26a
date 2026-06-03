import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import EventCard from '@/app/components/EventCard';

const client = generateClient<Schema>();

async function getEvents() {
  const { data, errors } = await client.models.Event.list({
    filter: { status: { ne: 'PAST' } },
  });
  if (errors) throw new Error('Failed to fetch events');
  return data;
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Upcoming Events</h1>
      <p className="text-gray-500 mb-8">Stay up to date with the latest events</p>

      {events.length === 0 ? (
        <p className="text-gray-400">No upcoming events at this time.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </main>
  );
}