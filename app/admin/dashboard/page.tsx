'use client';

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

type PageRecord = Schema['Page']['type'];
type PageStatus = 'draft' | 'published';

const emptyForm = {
  slug: '',
  title: '',
  sections: '[]',
  status: 'draft' as PageStatus,
  seo: '{}',
  featured: false,
  authorId: '',
};

export default function AdminDashboard() {
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  function showMessage(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  }

  function parseJsonField(value: string, fieldName: string): unknown | null {
    try {
      return JSON.parse(value);
    } catch {
      showMessage(`❌ Invalid JSON in ${fieldName} field`);
      return null;
    }
  }

  // ─── READ ────────────────────────────────────────────────
  async function fetchPages() {
    const { data } = await client.models.Page.list();
    setPages(data);
  }

  // ─── INSERT ──────────────────────────────────────────────
  async function handleCreate() {
    if (!form.slug.trim() || !form.title.trim()) {
      showMessage('❌ Slug and Title are required');
      return;
    }
    const sections = parseJsonField(form.sections, 'Sections');
    const seo = parseJsonField(form.seo, 'SEO');
    if (sections === null || seo === null) return;

    setLoading(true);
    try {
      await client.models.Page.create({
        slug: form.slug,
        title: form.title,
        sections,
        status: form.status,
        seo,
        featured: form.featured,
        authorId: form.authorId || undefined,
      });
      showMessage('✅ Page created!');
      setForm(emptyForm);
      fetchPages();
    } catch (e) {
      showMessage('❌ Error: ' + (e as Error).message);
    }
    setLoading(false);
  }

  // ─── UPDATE ──────────────────────────────────────────────
  async function handleUpdate() {
    if (!editingId) return;
    if (!form.slug.trim() || !form.title.trim()) {
      showMessage('❌ Slug and Title are required');
      return;
    }
    const sections = parseJsonField(form.sections, 'Sections');
    const seo = parseJsonField(form.seo, 'SEO');
    if (sections === null || seo === null) return;

    setLoading(true);
    try {
      await client.models.Page.update({
        id: editingId,
        slug: form.slug,
        title: form.title,
        sections,
        status: form.status,
        seo,
        featured: form.featured,
        authorId: form.authorId || undefined,
      });
      showMessage('✅ Page updated!');
      setEditingId(null);
      setForm(emptyForm);
      fetchPages();
    } catch (e) {
      showMessage('❌ Error: ' + (e as Error).message);
    }
    setLoading(false);
  }

  // ─── DELETE ──────────────────────────────────────────────
  async function handleDelete(id: string) {
    setLoading(true);
    try {
      await client.models.Page.delete({ id });
      showMessage('✅ Page deleted!');
      setDeleteConfirmId(null);
      fetchPages();
    } catch (e) {
      showMessage('❌ Error: ' + (e as Error).message);
    }
    setLoading(false);
  }

  // ─── LOAD INTO FORM FOR EDITING ──────────────────────────
  function startEdit(page: PageRecord) {
    setEditingId(page.id);
    setForm({
      slug: page.slug ?? '',
      title: page.title ?? '',
      sections: JSON.stringify(page.sections ?? [], null, 2),
      status: (page.status as PageStatus) ?? 'draft',
      seo: JSON.stringify(page.seo ?? {}, null, 2),
      featured: page.featured ?? false,
      authorId: page.authorId ?? '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage('');
  }

  // ─── UI ──────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Admin — Page Manager</h1>

      {message && (
        <p className="px-4 py-2 rounded-lg bg-gray-100 text-sm">{message}</p>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl space-y-4 w-80">
            <p className="font-medium">Delete this page?</p>
            <p className="text-sm text-gray-500">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-gray-200 rounded-lg text-sm font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FORM ── */}
      <div className="border rounded-xl p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-semibold">
          {editingId ? 'Edit Page' : 'Create New Page'}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Slug *</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="about-us"
              value={form.slug}
              onChange={e => setForm({ ...form, slug: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="About Us"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status *</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm"
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value as PageStatus })}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Author ID</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="optional"
              value={form.authorId}
              onChange={e => setForm({ ...form, authorId: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sections (JSON) *</label>
          <textarea
            className="w-full border rounded px-3 py-2 text-sm font-mono"
            rows={4}
            placeholder='[{"type": "hero", "content": "..."}]'
            value={form.sections}
            onChange={e => setForm({ ...form, sections: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">SEO (JSON)</label>
          <textarea
            className="w-full border rounded px-3 py-2 text-sm font-mono"
            rows={3}
            placeholder='{"title": "...", "description": "..."}'
            value={form.seo}
            onChange={e => setForm({ ...form, seo: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="featured"
            checked={form.featured}
            onChange={e => setForm({ ...form, featured: e.target.checked })}
          />
          <label htmlFor="featured" className="text-sm">Featured page</label>
        </div>

        <div className="flex gap-3">
          {editingId ? (
            <>
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Update Page'}
              </button>
              <button
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-200 rounded-lg text-sm font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleCreate}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Page'}
            </button>
          )}
        </div>
      </div>

      {/* ── PAGE LIST ── */}
      <div className="border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Slug</th>
              <th className="text-left px-4 py-3 font-medium">Title</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Featured</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pages.map(page => (
              <tr key={page.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{page.slug}</td>
                <td className="px-4 py-3">{page.title}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    page.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {page.status}
                  </span>
                </td>
                <td className="px-4 py-3">{page.featured ? '⭐' : '—'}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => startEdit(page)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(page.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No pages yet. Create one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}