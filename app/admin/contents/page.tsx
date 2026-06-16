'use client';
import RichEditor from '@/components/RichEditor';
import { useState, useEffect, useTransition } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { TOPICS, getSubcat1, getSubcat2, type TaxonomyItem } from '@/lib/taxonomy';

const client = generateClient<Schema>({ authMode: 'userPool' });

// ─── Types ────────────────────────────────────────────────────────────────────

type MetaRecord = Schema['ContentMeta']['type'];
type View = 'list' | 'create' | 'edit';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const emptyForm = {
  // ── ContentMeta fields ──
  title:           '',
  slug:            '',
  intro:           '',
  topic:           '',
  subcat1:         '',
  subcat2:         '',
  date:            new Date().toISOString().split('T')[0],
  isPublished:     true,
  isPublic:        false,
  imageUrl:        '',
  seo:             '{}',
  location:        '',
  eventDate:       '',
  // ── ContentBody fields ──
  body:            '',
  s3Key:           '',
  fileKey:         '',
  maxAttendees:    '',
  registrationUrl: '',
};

// ─── Small components ─────────────────────────────────────────────────────────

function Toggle({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full transition-colors duration-200 flex items-center px-0.5 cursor-pointer ${
          checked ? 'bg-amber-500' : 'bg-slate-200'
        }`}
      >
        <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </div>
      {label}
    </label>
  );
}

function Field({ label, children, hint }: {
  label: string; children: React.ReactNode; hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

// ─── Content form ─────────────────────────────────────────────────────────────

function ContentForm({ form, setForm, onSave, onCancel, loading, isEdit }: {
  form: typeof emptyForm;
  setForm: (f: typeof emptyForm) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
  isEdit: boolean;
}) {
  const subcat1Items = form.topic ? getSubcat1(form.topic) : [];
  const subcat2Items = form.topic && form.subcat1 ? getSubcat2(form.topic, form.subcat1) : [];

  function handleTitleChange(title: string) {
    setForm({ ...form, title, slug: isEdit ? form.slug : slugify(title) });
  }

  return (
    <div className="space-y-5">

      {/* ── Classification ── */}
      <section className="border rounded-xl p-5 bg-white shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Classification</h2>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Topic *">
            <select
              disabled={isEdit}
              className="w-full border rounded px-3 py-2 text-sm disabled:bg-slate-50"
              value={form.topic}
              onChange={e => setForm({ ...form, topic: e.target.value, subcat1: '', subcat2: '' })}
            >
              <option value="">— select —</option>
              {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Subcat1">
            <select
              disabled={isEdit || subcat1Items.length === 0}
              className="w-full border rounded px-3 py-2 text-sm disabled:bg-slate-50"
              value={form.subcat1}
              onChange={e => setForm({ ...form, subcat1: e.target.value, subcat2: '' })}
            >
              <option value="">— none —</option>
              {subcat1Items.map((i: TaxonomyItem) => (
                <option key={i.slug} value={i.slug}>{i.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Subcat2">
            <select
              disabled={isEdit || subcat2Items.length === 0}
              className="w-full border rounded px-3 py-2 text-sm disabled:bg-slate-50"
              value={form.subcat2}
              onChange={e => setForm({ ...form, subcat2: e.target.value })}
            >
              <option value="">— none —</option>
              {subcat2Items.map((i: TaxonomyItem) => (
                <option key={i.slug} value={i.slug}>{i.label}</option>
              ))}
            </select>
          </Field>
        </div>
        {isEdit && (
          <p className="text-xs text-slate-400">Topic and subcategories cannot be changed after creation.</p>
        )}
      </section>

      {/* ── Core meta fields ── */}
      <section className="border rounded-xl p-5 bg-white shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Details</h2>

        <Field label="Title *">
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="e.g. Crude Markets June 2026"
            value={form.title}
            onChange={e => handleTitleChange(e.target.value)}
          />
        </Field>

        <Field label="Slug" hint={isEdit ? 'Slug cannot be changed after creation.' : 'Auto-generated from title — edit if needed.'}>
          <input
            className="w-full border rounded px-3 py-2 text-sm font-mono disabled:bg-slate-50"
            disabled={isEdit}
            value={form.slug}
            onChange={e => setForm({ ...form, slug: slugify(e.target.value) })}
          />
        </Field>

        <Field label="Intro" hint="First paragraph — visible to all visitors without login.">
          <RichEditor
            value={form.intro}
            onChange={html => setForm({ ...form, intro: html })}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Date *">
            <input
              type="date"
              className="w-full border rounded px-3 py-2 text-sm"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
            />
          </Field>
          <Field label="Image URL">
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="https://..."
              value={form.imageUrl}
              onChange={e => setForm({ ...form, imageUrl: e.target.value })}
            />
          </Field>
        </div>

        <div className="flex gap-6">
          <Toggle label="Published" checked={form.isPublished} onChange={v => setForm({ ...form, isPublished: v })} />
          <Toggle label="Public (no login required)" checked={form.isPublic} onChange={v => setForm({ ...form, isPublic: v })} />
        </div>
      </section>

      {/* ── Full body (protected) ── */}
      <section className="border rounded-xl p-5 bg-white shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Full Content <span className="normal-case font-normal text-slate-400 ml-1">(login required to view)</span>
        </h2>
        <Field label="Body" hint="Full article — only visible to logged-in users.">
          <RichEditor
            value={form.body}
            onChange={html => setForm({ ...form, body: html })}
          />
        </Field>
      </section>

      {/* ── Video fields ── */}
      {form.topic === 'videos' && (
        <section className="border rounded-xl p-5 bg-white shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Video</h2>
          <Field label="S3 Key" hint='e.g. "videos/modcon-cdu.mp4"'>
            <input
              className="w-full border rounded px-3 py-2 text-sm font-mono"
              placeholder="videos/filename.mp4"
              value={form.s3Key}
              onChange={e => setForm({ ...form, s3Key: e.target.value })}
            />
          </Field>
        </section>
      )}

      {/* ── Whitepaper / Resource fields ── */}
      {(form.topic === 'whitepapers' || form.topic === 'resources') && (
        <section className="border rounded-xl p-5 bg-white shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">File</h2>
          <Field label="File Key (S3)" hint='e.g. "whitepapers/report-2026.pdf"'>
            <input
              className="w-full border rounded px-3 py-2 text-sm font-mono"
              placeholder="whitepapers/filename.pdf"
              value={form.fileKey}
              onChange={e => setForm({ ...form, fileKey: e.target.value })}
            />
          </Field>
        </section>
      )}

      {/* ── Event fields ── */}
      {form.topic === 'events' && (
        <section className="border rounded-xl p-5 bg-white shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Event details</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Event Date & Time">
              <input
                type="datetime-local"
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.eventDate}
                onChange={e => setForm({ ...form, eventDate: e.target.value })}
              />
            </Field>
            <Field label="Location">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Houston, TX or Virtual"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
              />
            </Field>
            <Field label="Max Attendees">
              <input
                type="number"
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="e.g. 200"
                value={form.maxAttendees}
                onChange={e => setForm({ ...form, maxAttendees: e.target.value })}
              />
            </Field>
            <Field label="Registration URL">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="https://..."
                value={form.registrationUrl}
                onChange={e => setForm({ ...form, registrationUrl: e.target.value })}
              />
            </Field>
          </div>
        </section>
      )}

      {/* ── SEO ── */}
      <section className="border rounded-xl p-5 bg-white shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">SEO</h2>
        <Field label="SEO (JSON)">
          <textarea
            className="w-full border rounded px-3 py-2 text-sm font-mono"
            rows={3}
            placeholder='{"metaTitle": "...", "metaDescription": "...", "keywords": "..."}'
            value={form.seo}
            onChange={e => setForm({ ...form, seo: e.target.value })}
          />
        </Field>
      </section>

      {/* ── Actions ── */}
      <div className="flex gap-3">
        <button
          onClick={onSave}
          disabled={loading}
          className="px-5 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 disabled:opacity-50"
        >
          {loading ? 'Saving…' : isEdit ? 'Update' : 'Create'}
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

export default function AdminContentPage() {
  const [view, setView]               = useState<View>('list');
  const [items, setItems]             = useState<MetaRecord[]>([]);
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [form, setForm]               = useState(emptyForm);
  const [editingMetaId, setEditingMetaId]   = useState<string | null>(null);
  const [editingBodyId, setEditingBodyId]   = useState<string | null>(null);
  const [deleteId, setDeleteId]       = useState<string | null>(null);
  const [message, setMessage]         = useState('');
  const [isPending, startTransition]  = useTransition();

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    const { data } = await client.models.ContentMeta.list();
    setItems([...data].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')));
  }

  function showMessage(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  }

  const filteredItems = topicFilter === 'all'
    ? items
    : items.filter(i => i.topic === topicFilter);

  // ── SEO helper (same pattern as admin/page/page.tsx) ──
  function parseSeo(raw: string): { value: string | undefined; error: boolean } {
    const trimmed = raw.trim();
    if (!trimmed || trimmed === '{}') return { value: undefined, error: false };
    try {
      JSON.parse(trimmed); // validate only
      return { value: trimmed, error: false };
    } catch {
      return { value: undefined, error: true };
    }
  }

  // ── Create: two sequential writes ──
  async function handleCreate() {
    if (!form.topic || !form.title.trim() || !form.slug.trim() || !form.date) {
      showMessage('❌ Topic, Title, Slug and Date are required');
      return;
    }
    const seo = parseSeo(form.seo);
    if (seo.error) { showMessage('❌ Invalid JSON in SEO'); return; }

    startTransition(async () => {
      try {
        // 1️⃣ Create ContentMeta
        const metaResult = await client.models.ContentMeta.create({
          title:           form.title,
          slug:            form.slug,
          intro:           form.intro || undefined,
          topic:           form.topic,
          subcat1:         form.subcat1 || undefined,
          subcat2:         form.subcat2 || undefined,
          date:            form.date,
          isPublished:     form.isPublished,
          isPublic:        form.isPublic,
          imageUrl:        form.imageUrl || undefined,
          seo:             seo.value,
          location:        form.location || undefined,
          eventDate:       form.eventDate ? new Date(form.eventDate).toISOString() : undefined,
        });

        if (metaResult.errors?.length) {
          showMessage(`❌ ${metaResult.errors[0].message}`);
          return;
        }

        const metaId = metaResult.data?.id;
        if (!metaId) { showMessage('❌ Failed to get meta ID'); return; }

        // 2️⃣ Create ContentBody (always create even if empty, so update works cleanly)
        const bodyResult = await client.models.ContentBody.create({
          metaId,
          body:            form.body || undefined,
          s3Key:           form.s3Key || undefined,
          fileKey:         form.fileKey || undefined,
          maxAttendees:    form.maxAttendees ? parseInt(form.maxAttendees) : undefined,
          registrationUrl: form.registrationUrl || undefined,
        });

        if (bodyResult.errors?.length) {
          showMessage(`❌ ${bodyResult.errors[0].message}`);
          return;
        }

        showMessage('✅ Content created!');
        setForm(emptyForm);
        setView('list');
        loadItems();
      } catch (e) {
        showMessage('❌ ' + (e as Error).message);
      }
    });
  }

  // ── Update: two parallel updates ──
  async function handleUpdate() {
    if (!editingMetaId || !form.title.trim() || !form.date) {
      showMessage('❌ Title and Date are required');
      return;
    }
    const seo = parseSeo(form.seo);
    if (seo.error) { showMessage('❌ Invalid JSON in SEO'); return; }

    startTransition(async () => {
      try {
        // 1️⃣ Update ContentMeta
        await client.models.ContentMeta.update({
          id:              editingMetaId,
          title:           form.title,
          intro:           form.intro || undefined,
          date:            form.date,
          isPublished:     form.isPublished,
          isPublic:        form.isPublic,
          imageUrl:        form.imageUrl || undefined,
          seo:             seo.value,
          location:        form.location || undefined,
          eventDate:       form.eventDate ? new Date(form.eventDate).toISOString() : undefined,
        });

        // 2️⃣ Update ContentBody if we have its id
        if (editingBodyId) {
          await client.models.ContentBody.update({
            id:              editingBodyId,
            body:            form.body || undefined,
            s3Key:           form.s3Key || undefined,
            fileKey:         form.fileKey || undefined,
            maxAttendees:    form.maxAttendees ? parseInt(form.maxAttendees) : undefined,
            registrationUrl: form.registrationUrl || undefined,
          });
        }

        showMessage('✅ Content updated!');
        setEditingMetaId(null);
        setEditingBodyId(null);
        setForm(emptyForm);
        setView('list');
        loadItems();
      } catch (e) {
        showMessage('❌ ' + (e as Error).message);
      }
    });
  }

  // ── Delete: remove body first, then meta ──
  async function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      try {
        // Find and delete the ContentBody record linked to this meta
        const { data: bodyRecords } = await client.models.ContentBody.list({
          filter: { metaId: { eq: deleteId } },
        });
        for (const body of bodyRecords) {
          await client.models.ContentBody.delete({ id: body.id });
        }
        // Then delete ContentMeta
        await client.models.ContentMeta.delete({ id: deleteId });

        showMessage('✅ Deleted!');
        setDeleteId(null);
        loadItems();
      } catch (e) {
        showMessage('❌ ' + (e as Error).message);
      }
    });
  }

  // ── Start edit: load meta + fetch body ──
  async function startEdit(item: MetaRecord) {
    // Load the linked ContentBody
    const { data: bodyRecords } = await client.models.ContentBody.list({
      filter: { metaId: { eq: item.id } },
    });
    const body = bodyRecords[0] ?? null;

    setForm({
      title:           item.title,
      slug:            item.slug,
      intro:           item.intro ?? '',
      topic:           item.topic,
      subcat1:         item.subcat1 ?? '',
      subcat2:         item.subcat2 ?? '',
      date:            item.date,
      isPublished:     item.isPublished ?? true,
      isPublic:        item.isPublic ?? false,
      imageUrl:        item.imageUrl ?? '',
      seo:             item.seo ? item.seo : '{}',
      location:        item.location ?? '',
      eventDate:       item.eventDate
                         ? new Date(item.eventDate).toISOString().slice(0, 16)
                         : '',
      body:            body?.body ?? '',
      s3Key:           body?.s3Key ?? '',
      fileKey:         body?.fileKey ?? '',
      maxAttendees:    body?.maxAttendees?.toString() ?? '',
      registrationUrl: body?.registrationUrl ?? '',
    });

    setEditingMetaId(item.id);
    setEditingBodyId(body?.id ?? null);
    setView('edit');
  }

  // ─── List view ──────────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Content Manager</h1>
          <button
            onClick={() => { setForm(emptyForm); setView('create'); }}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700"
          >
            + New Content
          </button>
        </div>

        {message && (
          <div className="px-4 py-2 rounded-lg bg-slate-100 text-sm text-center">{message}</div>
        )}

        {/* Topic filter */}
        <div className="flex gap-2 flex-wrap">
          {['all', ...TOPICS].map(t => (
            <button
              key={t}
              onClick={() => setTopicFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 ${
                topicFilter === t
                  ? 'bg-amber-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t === 'all' ? 'All' : t}
              <span className="ml-1.5 text-[10px] opacity-70">
                ({t === 'all' ? items.length : items.filter(i => i.topic === t).length})
              </span>
            </button>
          ))}
        </div>

        <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Topic</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Subcat1</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Published</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Public</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-xs truncate">{item.title}</td>
                  <td className="px-4 py-3 text-slate-500">{item.topic}</td>
                  <td className="px-4 py-3 text-slate-500">{item.subcat1 ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{item.date}</td>
                  <td className="px-4 py-3">{item.isPublished ? '✅' : '⬜'}</td>
                  <td className="px-4 py-3">{item.isPublic ? '🌐' : '🔒'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(item)}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium hover:bg-blue-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(item.id)}
                        className="px-3 py-1 bg-red-50 text-red-700 rounded text-xs font-medium hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    No content found.
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
              <p className="font-semibold text-slate-800">Delete this content?</p>
              <p className="text-sm text-slate-500">This cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
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

  // ─── Create / Edit view ─────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setView('list'); setEditingMetaId(null); setEditingBodyId(null); setForm(emptyForm); }}
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold text-slate-800">
          {view === 'create' ? 'Create Content' : 'Edit Content'}
        </h1>
      </div>

      {message && (
        <div className="px-4 py-2 rounded-lg bg-slate-100 text-sm">{message}</div>
      )}

      <ContentForm
        form={form}
        setForm={setForm}
        onSave={view === 'create' ? handleCreate : handleUpdate}
        onCancel={() => { setView('list'); setEditingMetaId(null); setEditingBodyId(null); setForm(emptyForm); }}
        loading={isPending}
        isEdit={view === 'edit'}
      />
    </div>
  );
}
