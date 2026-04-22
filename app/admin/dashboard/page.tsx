'use client';

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { Amplify } from 'aws-amplify'; 
import outputs from '@/amplify_outputs.json';
Amplify.configure(outputs);

const client = generateClient<Schema>({ authMode: 'userPool' });

type PageRecord = Schema['Page']['type'];
type PageStatus = 'draft' | 'published';
type MenuView = 'main' | 'create' | 'update' | 'delete';

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
  const [currentView, setCurrentView] = useState<MenuView>('main');
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

  async function fetchPages() {
    const { data } = await client.models.Page.list();
    setPages(data);
  }

  useEffect(() => {
  const initialize = async () => {
    // Skip auth check during build
    await fetchPages();
  };
  initialize();
}, []);

  async function handleCreate() {
    if (!form.slug.trim() || !form.title.trim()) {
      showMessage('❌ Slug and Title are required');
      return;
    }
    const sections = parseJsonField(form.sections, 'Sections') as object[];
    const seo = parseJsonField(form.seo, 'SEO') as object;
    if (sections === null || seo === null) return;

    console.log('Creating with:', { slug: form.slug, title: form.title, sections, seo })
   
    setLoading(true);
    try {
      const result = await client.models.Page.create({
        slug: form.slug,
        title: form.title,
        sections: form.sections,   
        status: form.status,
        seo: form.seo,
        featured: form.featured,
        authorId: form.authorId || undefined,
      });

      console.log('Full result:', JSON.stringify(result, null, 2));
    
      if (result.errors && result.errors.length > 0) {
        console.error('Error details:', result.errors[0]);
       showMessage(`❌ Error: ${result.errors[0].message}`);
       return;
      }

      console.log('Create result:', result); 
      console.log('Errors:', result.errors);
      showMessage('✅ Page created! DD');
      setForm(emptyForm);
      fetchPages();
      setCurrentView('main'); // Return to main menu after create
    } catch (error) {
      console.error('Full error:', error); 
      showMessage('❌ Error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }      
  }

  async function handleUpdate() {
    if (!editingId) return;
    if (!form.slug.trim() || !form.title.trim()) {
      showMessage('❌ Slug and Title are required');
      return;
    }
    const sections = parseJsonField(form.sections, 'Sections') as object[];
    const seo = parseJsonField(form.seo, 'SEO') as object;
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
      setCurrentView('main'); // Return to main menu after update
    } catch (error ) {
      showMessage('❌ Error: ' + (error  as Error).message);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    setLoading(true);
    try {
      await client.models.Page.delete({ id });
      showMessage('✅ Page deleted!');
      setDeleteConfirmId(null);
      fetchPages();
      setCurrentView('main'); // Return to main menu after delete
    } catch (error ) {
      showMessage('❌ Error: ' + (error  as Error).message);
    }
    setLoading(false);
  }

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
    setCurrentView('update');
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setCurrentView('main');
  }

  // ─── MAIN MENU UI ──────────────────────────────────────────
  if (currentView === 'main') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-center">Page Manager</h1>
        
        {message && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-gray-100 text-center text-sm">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create Card */}
          <button
            onClick={() => setCurrentView('create')}
            className="group p-8 bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl hover:border-green-300 transition-all duration-200 text-left"
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform inline-block">
              ✨
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-green-600">Create a Page</h2>
            <p className="text-gray-500 text-sm">Add a new page to your website with custom content, SEO, and metadata.</p>
          </button>

          {/* Update Card */}
          <button
            onClick={() => setCurrentView('update')}
            className="group p-8 bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl hover:border-blue-300 transition-all duration-200 text-left"
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform inline-block">
              📝
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-blue-600">Update a Page</h2>
            <p className="text-gray-500 text-sm">Edit existing page content, SEO settings, or change publication status.</p>
          </button>

          {/* Delete Card */}
          <button
            onClick={() => setCurrentView('delete')}
            className="group p-8 bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl hover:border-red-300 transition-all duration-200 text-left"
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform inline-block">
              🗑️
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-red-600">Delete a Page</h2>
            <p className="text-gray-500 text-sm">Remove unwanted pages from your website permanently.</p>
          </button>
        </div>

        {/* Current Pages Summary */}
        <div className="mt-10 p-4 bg-gray-50 rounded-xl">
          <p className="text-center text-gray-600">
            📊 Total pages: <span className="font-bold text-gray-900">{pages.length}</span>
          </p>
        </div>
      </div>
    );
  }

  // ─── CREATE PAGE VIEW ──────────────────────────────────────
  if (currentView === 'create') {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentView('main')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            ← Back to Menu
          </button>
          <h1 className="text-2xl font-bold text-green-600">Create New Page</h1>
        </div>

        {message && <p className="px-4 py-2 rounded-lg bg-gray-100 text-sm">{message}</p>}

        <div className="border rounded-xl p-6 space-y-4 shadow-sm">
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
            <button
              onClick={handleCreate}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Page'}
            </button>
            <button
              onClick={() => {
                setForm(emptyForm);
                setCurrentView('main');
              }}
              className="px-4 py-2 bg-gray-200 rounded-lg text-sm font-medium hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── UPDATE PAGE VIEW (SELECT PAGE FIRST) ───────────────────
  if (currentView === 'update' && !editingId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setCurrentView('main')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            ← Back to Menu
          </button>
          <h1 className="text-2xl font-bold text-blue-600">Select Page to Update</h1>
        </div>

        {message && <p className="mb-4 px-4 py-2 rounded-lg bg-gray-100 text-sm">{message}</p>}

        <div className="border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Slug</th>
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
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
                  <td className="px-4 py-3">
                    <button
                      onClick={() => startEdit(page)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    No pages yet. Create one first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ─── UPDATE PAGE FORM (EDITING) ────────────────────────────
  if (currentView === 'update' && editingId) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setEditingId(null);
              setCurrentView('update');
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            ← Back to Page List
          </button>
          <h1 className="text-2xl font-bold text-blue-600">Edit Page</h1>
        </div>

        {message && <p className="px-4 py-2 rounded-lg bg-gray-100 text-sm">{message}</p>}

        <div className="border rounded-xl p-6 space-y-4 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Slug *</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.slug}
                onChange={e => setForm({ ...form, slug: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
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
              value={form.sections}
              onChange={e => setForm({ ...form, sections: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">SEO (JSON)</label>
            <textarea
              className="w-full border rounded px-3 py-2 text-sm font-mono"
              rows={3}
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
          </div>
        </div>
      </div>
    );
  }

  // ─── DELETE PAGE VIEW ──────────────────────────────────────
  if (currentView === 'delete') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setCurrentView('main')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            ← Back to Menu
          </button>
          <h1 className="text-2xl font-bold text-red-600">Delete a Page</h1>
        </div>

        {message && <p className="mb-4 px-4 py-2 rounded-lg bg-gray-100 text-sm">{message}</p>}

        {/* DELETE CONFIRM MODAL */}
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

        <div className="border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Slug</th>
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
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
                  <td className="px-4 py-3">
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
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    No pages to delete.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
}