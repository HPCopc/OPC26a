 'use client';

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import EventCard from '@/app/components/EventCard';

const client = generateClient<Schema>();
type Event = Schema['Event']['type'];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      const { data } = await client.models.Event.list({
        filter: { isPublished: { eq: true } },
      });
      setEvents(data);
      setLoading(false);
    }
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-10">
        <p className="text-gray-400">Loading events...</p>
      </main>
    );
  }

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