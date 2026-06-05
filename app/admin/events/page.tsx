 'use client';

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();
// Public reads → apiKey
const { data } = await client.models.Event.list({ authMode: 'apiKey' });

// Admin writes → userPool (default, no change needed)
await client.models.Event.create(form);

type Event = Schema['Event']['type'];

const emptyForm = {
  title: '',
  description: '',
  location: '',
  date: '',        // ✅ was startDate
  slug: '',        // ✅ added — required in schema
  imageUrl: '',
  isPublished: true,   // ✅ was isFeatured
  maxAttendees: 0,     // ✅ added
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchEvents(); }, []);

   
  async function fetchEvents() {
  const { data } = await client.models.Event.list({ authMode: 'apiKey' });
  setEvents(data);
}
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await client.models.Event.update({ id: editingId, ...form });
      } else {
        await client.models.Event.create(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      await fetchEvents();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this event?')) return;
    await client.models.Event.delete({ id });
    await fetchEvents();
  }

  function handleEdit(event: Event) {
    setEditingId(event.id);
    setForm({
      title: event.title,
      description: event.description,
      location: event.location,
      date: event.date,                        // ✅ was startDate
      slug: event.slug,                        // ✅ added
      imageUrl: event.imageUrl ?? '',
      isPublished: event.isPublished ?? true,  // ✅ was isFeatured
      maxAttendees: event.maxAttendees ?? 0,   // ✅ added
    });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">Manage Events</h1>

      <div className="bg-white border rounded-xl p-6 mb-10 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">
          {editingId ? 'Edit Event' : 'Add New Event'}
        </h2>
        <div className="grid gap-4">
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Event title *"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Slug * (e.g. my-event-2026)"
            value={form.slug}
            onChange={e => setForm({ ...form, slug: e.target.value })}
          />
          <textarea
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Description *"
            rows={3}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Date *</label>
            <input
              type="datetime-local"
              className="border rounded-lg px-3 py-2 text-sm w-full"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Location *"
            value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
          />
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Image URL"
            value={form.imageUrl}
            onChange={e => setForm({ ...form, imageUrl: e.target.value })}
          />
          <input
            type="number"
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Max attendees"
            value={form.maxAttendees}
            onChange={e => setForm({ ...form, maxAttendees: Number(e.target.value) })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={e => setForm({ ...form, isPublished: e.target.checked })}
            />
            Published
          </label>
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingId ? 'Update Event' : 'Add Event'}
            </button>
            {editingId && (
              <button
                onClick={() => { setEditingId(null); setForm(emptyForm); }}
                className="px-5 py-2 rounded-lg text-sm border hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {events.map(event => (
          <div key={event.id} className="flex items-center justify-between border rounded-xl px-4 py-3 bg-white shadow-sm">
            <div>
              <p className="font-medium text-sm">{event.title}</p>
              <p className="text-xs text-gray-400">
                {new Date(event.date).toLocaleDateString()} · {event.isPublished ? 'Published' : 'Draft'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(event)}
                className="text-xs px-3 py-1.5 border rounded-lg hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(event.id)}
                className="text-xs px-3 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}