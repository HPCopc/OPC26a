'use client';
import RichEditor from '@/components/RichEditor';
import { useState, useEffect, useTransition } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import {
  TOPICS, getSubcat1, getSubcat2, buildPageSlug,
  type TaxonomyItem,
} from '@/lib/taxonomy';
import { useMessage } from '@/lib/utils';

const client = generateClient<Schema>({ authMode: 'userPool' });

// ─── Types ────────────────────────────────────────────────────────────────────

type PageRecord = Schema['Page']['type'];
type PageStatus = 'draft' | 'published';
type View = 'list' | 'create' | 'edit';
type Filter = 'all' | 'main' | 'subcat1' | 'subcat2';

function detectLevel(slug: string): Filter {
  const parts = slug.split('-');
  if (parts.length === 1) return 'main';
  // check if second segment is a known subcat1
  const topic = parts[0];
  const sc1Items = getSubcat1(topic);
  const sc1Slugs = sc1Items.map(i => i.slug);
  if (sc1Slugs.includes(parts[1])) {
    if (parts.length > 2) return 'subcat2';
    return 'subcat1';
  }
  return 'main';
}

const emptyForm = {
  topic:   '',
  subcat1: '',
  subcat2: '',
  title:   '',
  intro:   '',
  status:  'draft' as PageStatus,
  seo: '{"metaTitle": "", "metaDescription": "", "keywords": "", "ogTitle": "", "ogDescription": ""}',
  featured: false,
};

// ─── Small components ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string | null | undefined }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
      status === 'published'
        ? 'bg-green-100 text-green-700'
        : 'bg-yellow-100 text-yellow-700'
    }`}>
      {status ?? 'draft'}
    </span>
  );
}

function FilterBar({ active, onChange, counts }: {
  active: Filter;
  onChange: (f: Filter) => void;
  counts: Record<Filter, number>;
}) {
  const filters: { key: Filter; label: string }[] = [
    { key: 'all',     label: 'All'     },
    { key: 'main',    label: 'Main'    },
    { key: 'subcat1', label: 'Subcat1' },
    { key: 'subcat2', label: 'Subcat2' },
  ];
  return (
    <div className="flex gap-2">
      {filters.map(f => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 ${
            active === f.key
              ? 'bg-amber-600 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {f.label}
          <span className="ml-1.5 text-[10px] opacity-70">({counts[f.key]})</span>
        </button>
      ))}
    </div>
  );
}

// ─── Slug builder form ────────────────────────────────────────────────────────

function SlugBuilder({ form, setForm, disabled }: {
  form: typeof emptyForm;
  setForm: (f: typeof emptyForm) => void;
  disabled?: boolean;
}) {
  const subcat1Items = form.topic ? getSubcat1(form.topic) : [];
  const subcat2Items = form.topic && form.subcat1 ? getSubcat2(form.topic, form.subcat1) : [];
  const builtSlug    = buildPageSlug(form.topic, form.subcat1 || undefined, form.subcat2 || undefined);

  return (
    <div className="space-y-4">
      {/* Topic */}
      <div>
        <label className="block text-sm font-medium mb-1">Topic *</label>
        <select
          disabled={disabled}
          className="w-full border rounded px-3 py-2 text-sm disabled:bg-slate-50"
          value={form.topic}
          onChange={e => setForm({ ...form, topic: e.target.value, subcat1: '', subcat2: '' })}
        >
          <option value="">— select topic —</option>
          {TOPICS.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Subcat1 — only if topic has subcat1 */}
      {subcat1Items.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">Subcat1</label>
          <select
            disabled={disabled}
            className="w-full border rounded px-3 py-2 text-sm disabled:bg-slate-50"
            value={form.subcat1}
            onChange={e => setForm({ ...form, subcat1: e.target.value, subcat2: '' })}
          >
            <option value="">— main page only —</option>
            {subcat1Items.map((i: TaxonomyItem) => (
              <option key={i.slug} value={i.slug}>{i.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Subcat2 — only if subcat1 has subcat2 */}
      {subcat2Items.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">Subcat2</label>
          <select
            disabled={disabled}
            className="w-full border rounded px-3 py-2 text-sm disabled:bg-slate-50"
            value={form.subcat2}
            onChange={e => setForm({ ...form, subcat2: e.target.value })}
          >
            <option value="">— subcat1 page only —</option>
            {subcat2Items.map((i: TaxonomyItem) => (
              <option key={i.slug} value={i.slug}>{i.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Slug preview */}
      {form.topic && (
        <div>
          <label className="block text-sm font-medium mb-1">Slug preview</label>
          <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-mono text-slate-600">
            {builtSlug}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page form (create / edit) ────────────────────────────────────────────────

function PageForm({ form, setForm, onSave, onCancel, loading, isEdit }: {
  form: typeof emptyForm;
  setForm: (f: typeof emptyForm) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
  isEdit: boolean;
}) {
  return (
    <div className="space-y-5">
      {/* Slug builder — disabled when editing (slug is immutable) */}
      <div className="border rounded-xl p-5 bg-white shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Slug</h2>
        <SlugBuilder form={form} setForm={setForm} disabled={isEdit} />
        {isEdit && (
          <p className="text-xs text-slate-400">Slug cannot be changed after creation.</p>
        )}
      </div>

      {/* Core fields */}
      <div className="border rounded-xl p-5 bg-white shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Page details</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="e.g. Markets"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Intro</label>
          <RichEditor
            value={form.intro}
            onChange={(html) => setForm({ ...form, intro: html })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm"
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value as PageStatus })}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={e => setForm({ ...form, featured: e.target.checked })}
              />
              Featured page
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">SEO (JSON)</label>
          <textarea
            className="w-full border rounded px-3 py-2 text-sm font-mono"
            rows={3}
            placeholder='{"metaTitle": "...", "metaDescription": "...", "keywords": "..."}'
            value={form.seo}
            onChange={e => setForm({ ...form, seo: e.target.value })}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onSave}
          disabled={loading}
          className="px-5 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 disabled:opacity-50"
        >
          {loading ? 'Saving…' : isEdit ? 'Update Page' : 'Create Page'}
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminPagesPage() {
  const [view, setView]               = useState<View>('list');
  const [pages, setPages]             = useState<PageRecord[]>([]);
  const [filter, setFilter]           = useState<Filter>('all');
  const [form, setForm]               = useState(emptyForm);
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [deleteId, setDeleteId]       = useState<string | null>(null);
//  const [message, setMessage]         = useState('');
  const { message, showMessage } = useMessage();
  const [isPending, startTransition]  = useTransition();

  useEffect(() => { loadPages(); }, []);

  async function loadPages() {
    const { data } = await client.models.Page.list();
    setPages(data);
  }

  
 
  // ── Filtered pages ──
  const filteredPages = pages.filter(p => {
    if (filter === 'all') return true;
    return detectLevel(p.slug) === filter;
  });

  const counts: Record<Filter, number> = {
    all:     pages.length,
    main:    pages.filter(p => detectLevel(p.slug) === 'main').length,
    subcat1: pages.filter(p => detectLevel(p.slug) === 'subcat1').length,
    subcat2: pages.filter(p => detectLevel(p.slug) === 'subcat2').length,
  };

  // ── Create ──
  async function handleCreate() {
  if (!form.topic || !form.title.trim()) {
    showMessage('❌ Topic and Title are required');
    return;
  }

  const trimmed = form.seo.trim();
  let seoValue: string | undefined;

  if (trimmed && trimmed !== '{}') {
    try {
      JSON.parse(trimmed); // just validate it's valid JSON, don't use the result
      seoValue = trimmed;  // pass the raw string
    } catch {
      showMessage('❌ Invalid JSON in SEO');
      return;
    }
  }

  const slug = buildPageSlug(
    form.topic,
    form.subcat1 || undefined,
    form.subcat2 || undefined
  );
 // ── Check for duplicate slug ──
  const { data: existing } = await client.models.Page.get({ slug });
  if (existing) {
    showMessage(`❌ A page with slug "${slug}" already exists.`);
    return;
  }
  
  startTransition(async () => {
    try {
       const result = await client.models.Page.create({
        slug,
        title:    form.title,
        intro:    form.intro || undefined,
        status:   form.status,
        featured: form.featured,
        seo:      seoValue,   // raw string or undefined
      });


      if (result.errors?.length) {
        console.log(result.errors);
        showMessage(`❌ ${result.errors[0].message}`);
        return;
      }

      showMessage('✅ Page created!');
      setForm(emptyForm);
      setView('list');
      loadPages();
    } catch (e) {
      showMessage('❌ ' + (e as Error).message);
    }
  });
}


  // ── Update ──
  async function handleUpdate() {
  if (!editingId || !form.title.trim()) {
    showMessage('❌ Title is required');
    return;
  }

  const trimmed = form.seo.trim();
  let seoValue: string | undefined;
  if (trimmed && trimmed !== '{}') {
    try {
      JSON.parse(trimmed);
      seoValue = trimmed;
    } catch {
      showMessage('❌ Invalid JSON in SEO');
      return;
    }
  }

  startTransition(async () => {
    try {
      await client.models.Page.update({
        slug:     editingId,
        title:    form.title,
        intro:    form.intro || undefined,
        status:   form.status,
        featured: form.featured,
        seo:      seoValue,   // raw string or undefined, same as create
      });
      showMessage('✅ Page updated!');
      setEditingId(null);
      setForm(emptyForm);
      setView('list');
      loadPages();
    } catch (e) {
      showMessage('❌ ' + (e as Error).message);
    }
  });
}

  // ── Delete ──
  async function handleDelete() {
  startTransition(async () => {
    try {
      if (!deleteId) return;  // ensures it's a string

      await client.models.Page.delete({ slug: deleteId });

      showMessage('✅ Page deleted!');
      setDeleteId(null);
      loadPages();
    } catch (e) {
      showMessage('❌ ' + (e as Error).message);
    }
  });
}
  

  function startEdit(page: PageRecord) {
    // Reverse-engineer topic/subcat1/subcat2 from slug
    const parts   = page.slug.split('-');
    const topic   = parts[0];
    const sc1List = getSubcat1(topic).map(i => i.slug);
    const subcat1 = parts.length > 1 && sc1List.includes(parts[1]) ? parts[1] : '';
    const subcat2 = subcat1 && parts.length > 2 ? parts.slice(2).join('-') : '';

    setForm({
      topic,
      subcat1,
      subcat2,
      title:    page.title,
      intro:    page.intro ?? '',
      status:   (page.status as PageStatus) ?? 'draft',
      seo: typeof page.seo === 'string' ? page.seo : JSON.stringify(page.seo ?? {}, null, 2),
      featured: page.featured ?? false,
    });
    setEditingId(page.slug);
    setView('edit');
  }

  // ─── List view ────────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Page Manager</h1>
          <button
            onClick={() => { setForm(emptyForm); setView('create'); }}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700"
          >
            + New Page
          </button>
        </div>

        {message && (
          <div className="px-4 py-2 rounded-lg bg-slate-100 text-sm text-center">{message}</div>
        )}

        <FilterBar active={filter} onChange={setFilter} counts={counts} />

        <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Featured</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPages.map(page => (
                <tr key={page.slug} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{page.slug}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{page.title}</td>
                  <td className="px-4 py-3"><StatusBadge status={page.status} /></td>
                  <td className="px-4 py-3 text-slate-400">{page.featured ? '⭐' : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(page)}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium hover:bg-blue-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(page.slug)}
                        className="px-3 py-1 bg-red-50 text-red-700 rounded text-xs font-medium hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPages.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                    No pages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Delete confirm modal */}
        {deleteId && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 shadow-xl space-y-4 w-80">
              <p className="font-semibold text-slate-800">Delete this page?</p>
              <p className="text-sm text-slate-500">This cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete()}
                  disabled={isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                  {isPending ? 'Deleting…' : 'Delete'}
                </button>
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 bg-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Create / Edit view ───────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setView('list'); setEditingId(null); setForm(emptyForm); }}
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold text-slate-800">
          {view === 'create' ? 'Create Page' : 'Edit Page'}
        </h1>
      </div>

      {message && (
        <div className="px-4 py-2 rounded-lg bg-slate-100 text-sm">{message}</div>
      )}

      <PageForm
        form={form}
        setForm={setForm}
        onSave={view === 'create' ? handleCreate : handleUpdate}
        onCancel={() => { setView('list'); setEditingId(null); setForm(emptyForm); }}
        loading={isPending}
        isEdit={view === 'edit'}
      />
    </div>
  );
}