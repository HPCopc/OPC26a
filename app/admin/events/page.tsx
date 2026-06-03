'use client';

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();
type Event = Schema['Event']['type'];

const emptyForm = {
  title: '', description: '', location: '',
  startDate: '', endDate: '', imageUrl: '',
  status: 'UPCOMING' as const, isFeatured: false,
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchEvents(); }, []);

  async function fetchEvents() {
    const { data } = await client.models.Event.list();
    setEvents(data.sort((a, b) => a.startDate.localeCompare(b.startDate)));
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
      description: event.description ?? '',
      location: event.location ?? '',
      startDate: event.startDate,
      endDate: event.endDate ?? '',
      imageUrl: event.imageUrl ?? '',
      status: event.status ?? 'UPCOMING',
      isFeatured: event.isFeatured ?? false,
    });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">Manage Events</h1>

      {/* Form */}
      <div className="bg-white border rounded-xl p-6 mb-10 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">
          {editingId ? 'Edit Event' : 'Add New Event'}
        </h2>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Event title *"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Description"
            rows={3}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Start Date *</label>
              <input
                type="datetime-local"
                className="border rounded-lg px-3 py-2 text-sm w-full"
                value={form.startDate}
                onChange={e => setForm({ ...form, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">End Date</label>
              <input
                type="datetime-local"
                className="border rounded-lg px-3 py-2 text-sm w-full"
                value={form.endDate}
                onChange={e => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Location"
            value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
          />
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Image URL"
            value={form.imageUrl}
            onChange={e => setForm({ ...form, imageUrl: e.target.value })}
          />
          <div className="flex gap-6 items-center">
            <select
              className="border rounded-lg px-3 py-2 text-sm"
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value as typeof form.status })}
            >
              <option value="UPCOMING">Upcoming</option>
              <option value="ONGOING">Ongoing</option>
              <option value="PAST">Past</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
              />
              Featured
            </label>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingId ? 'Update Event' : 'Add Event'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => { setEditingId(null); setForm(emptyForm); }}
                className="px-5 py-2 rounded-lg text-sm border hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Events list */}
      <div className="space-y-3">
        {events.map(event => (
          <div key={event.id} className="flex items-center justify-between border rounded-xl px-4 py-3 bg-white shadow-sm">
            <div>
              <p className="font-medium text-sm">{event.title}</p>
              <p className="text-xs text-gray-400">
                {new Date(event.startDate).toLocaleDateString()} · {event.status}
                {event.isFeatured && ' · ⭐ Featured'}
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