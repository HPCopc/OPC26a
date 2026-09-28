'use client';
import RichEditor from '@/components/RichEditor';
import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { TOPICS, getSubcat1, getSubcat2 } from '@/lib/taxonomy';
import { useMessage } from '@/lib/utils';
import { safeHref } from '@/lib/sanitizeHtml';

const client = generateClient<Schema>({ authMode: 'userPool' });

// ─── Types ────────────────────────────────────────────────────────────────────

type BoxRecord = Schema['HomeBox']['type'];
type Column = 'left' | 'right';
type View = 'list' | 'create' | 'edit';

type ButtonForm = {
  label:  string;
  href:   string;
  style:  'primary' | 'secondary';
  newTab: boolean;
};

const emptyForm = {
  title:           '',
  titleLink:       '',
  column:          'left' as Column,
  sortOrder:       10,
  isPublished:     true,
  description:     '',
  buttons:         [] as ButtonForm[],
  buttonsPosition: 'below' as 'above' | 'below',
  newsTopic:       '',
  newsSubcat1:     '',
  newsSubcat2:     '',
  newsLimit:       5,
  newsNumbered:    false,
  showMore:        true,
  moreLabel:       '',
  moreLink:        '',
};
type BoxForm = typeof emptyForm;

// The boxes of the original opportunitycrudes.com home page, offered when
// the table is empty. Admins edit them from there.
const STARTER_BOXES: Partial<BoxForm>[] = [
  {
    title: 'Global Oil Market Weekly Insights', column: 'left', sortOrder: 10,
    description: '<p>Our weekly insights bring you the ten stories that moved the crude market this week: forecasts, crude trades, OSP differentials and more.</p>',
    buttons: [{ label: 'FREE Access, Register Today', href: '/register', style: 'primary', newTab: false }],
    buttonsPosition: 'above',
    newsTopic: 'top10', newsLimit: 10, newsNumbered: true, showMore: true,
  },
  {
    title: 'Leveraging AI and ML to Navigate Crude Market Uncertainty:', column: 'right', sortOrder: 10,
    description: '<p>Optimizing Crude Procurement, Quality Management, and Front-End Refinery Operations</p>',
  },
  { title: 'Markets', titleLink: '/news/markets', column: 'left', sortOrder: 20,
    newsTopic: 'news', newsSubcat1: 'markets', newsLimit: 5, showMore: true },
  { title: 'Opportunity Crudes Conference since 2008', titleLink: '/events', column: 'right', sortOrder: 20,
    description: '<p>Conference details, keynotes and proceedings.</p>' },
  { title: 'Opportunity Crudes', titleLink: '/news/opc', column: 'left', sortOrder: 30,
    newsTopic: 'news', newsSubcat1: 'opc', newsLimit: 3, showMore: true },
  { title: 'Crude Oil & Biofeed Management', column: 'right', sortOrder: 30 },
  { title: 'Shale Oil', titleLink: '/news/shaleoil', column: 'left', sortOrder: 40,
    newsTopic: 'news', newsSubcat1: 'shaleoil', newsLimit: 3, showMore: true },
  { title: 'Videos', titleLink: '/videos', column: 'right', sortOrder: 40,
    newsTopic: 'videos', newsLimit: 3, showMore: true },
  { title: 'Crude Quality & Mgmt.', titleLink: '/news/crudeqm', column: 'left', sortOrder: 50,
    newsTopic: 'news', newsSubcat1: 'crudeqm', newsLimit: 3, showMore: true },
  { title: 'Crude Processing', titleLink: '/news/crudep', column: 'left', sortOrder: 60,
    newsTopic: 'news', newsSubcat1: 'crudep', newsLimit: 3, showMore: true },
  { title: 'Technology', titleLink: '/news/technology', column: 'left', sortOrder: 70,
    newsTopic: 'news', newsSubcat1: 'technology', newsLimit: 3, showMore: true },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toRecordInput(f: BoxForm) {
  const hasNews = !!f.newsTopic;
  return {
    title:           f.title.trim(),
    titleLink:       f.titleLink.trim() || null,
    column:          f.column,
    sortOrder:       Number(f.sortOrder) || 0,
    isPublished:     f.isPublished,
    description:     f.description && f.description !== '<p></p>' ? f.description : null,
    buttons:         f.buttons
      .filter(b => b.label.trim() && b.href.trim())
      .map(b => ({ label: b.label.trim(), href: b.href.trim(), style: b.style, newTab: b.newTab })),
    buttonsPosition: f.buttonsPosition,
    newsTopic:       hasNews ? f.newsTopic : null,
    newsSubcat1:     hasNews && f.newsSubcat1 ? f.newsSubcat1 : null,
    newsSubcat2:     hasNews && f.newsSubcat1 && f.newsSubcat2 ? f.newsSubcat2 : null,
    newsLimit:       hasNews ? Math.min(Math.max(Number(f.newsLimit) || 5, 1), 50) : null,
    newsNumbered:    hasNews && f.newsNumbered,
    showMore:        hasNews && f.showMore,
    moreLabel:       hasNews && f.moreLabel.trim() ? f.moreLabel.trim() : null,
    moreLink:        hasNews && f.moreLink.trim() ? f.moreLink.trim() : null,
  };
}

function toForm(r: BoxRecord): BoxForm {
  return {
    title:           r.title,
    titleLink:       r.titleLink ?? '',
    column:          r.column === 'right' ? 'right' : 'left',
    sortOrder:       r.sortOrder,
    isPublished:     r.isPublished ?? true,
    description:     r.description ?? '',
    buttons:         (r.buttons ?? []).filter(b => b != null).map(b => ({
      label:  b!.label,
      href:   b!.href,
      style:  b!.style === 'secondary' ? 'secondary' : 'primary',
      newTab: !!b!.newTab,
    })),
    buttonsPosition: r.buttonsPosition === 'above' ? 'above' : 'below',
    newsTopic:       r.newsTopic ?? '',
    newsSubcat1:     r.newsSubcat1 ?? '',
    newsSubcat2:     r.newsSubcat2 ?? '',
    newsLimit:       r.newsLimit ?? 5,
    newsNumbered:    !!r.newsNumbered,
    showMore:        r.showMore ?? true,
    moreLabel:       r.moreLabel ?? '',
    moreLink:        r.moreLink ?? '',
  };
}

/** Error text for a link field, or null when it's empty or valid. */
function linkError(href: string): string | null {
  if (!href.trim()) return null;
  return safeHref(href) ? null : 'Use a site path like /contact or a full URL starting with https://';
}

function defaultMoreLink(f: BoxForm): string {
  if (!f.newsTopic) return '';
  if (f.newsSubcat1 && f.newsSubcat2) return `/${f.newsTopic}/${f.newsSubcat1}/${f.newsSubcat2}`;
  if (f.newsSubcat1) return `/${f.newsTopic}/${f.newsSubcat1}`;
  return `/${f.newsTopic}`;
}

const inputClass = 'w-full border rounded-lg px-3 py-2 text-sm';

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

function Field({ label, children, hint, error }: {
  label: string; children: React.ReactNode; hint?: string; error?: string | null;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
      {error
        ? <p className="text-xs text-red-600 mt-1">{error}</p>
        : hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border rounded-xl bg-white p-5 space-y-4">
      <legend className="px-2 text-sm font-semibold text-slate-700">{title}</legend>
      {children}
    </fieldset>
  );
}

// ─── Box form ─────────────────────────────────────────────────────────────────

function BoxFormView({ form, setForm, onSave, onCancel, loading, isEdit }: {
  form: BoxForm;
  setForm: (f: BoxForm) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
  isEdit: boolean;
}) {
  const subcat1Items = form.newsTopic ? getSubcat1(form.newsTopic) : [];
  const subcat2Items = form.newsTopic && form.newsSubcat1 ? getSubcat2(form.newsTopic, form.newsSubcat1) : [];

  function setButton(i: number, patch: Partial<ButtonForm>) {
    setForm({ ...form, buttons: form.buttons.map((b, j) => (j === i ? { ...b, ...patch } : b)) });
  }

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      <h1 className="text-xl font-bold text-slate-800">{isEdit ? 'Edit Box' : 'New Box'}</h1>

      <Section title="Gray header">
        <Field label="Header text *">
          <input className={inputClass} value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field label="Header link" error={linkError(form.titleLink)}
          hint="Optional. Leave empty for plain text; otherwise /news/markets or https://…">
          <input className={inputClass} value={form.titleLink} placeholder="(no link)"
            onChange={e => setForm({ ...form, titleLink: e.target.value })} />
        </Field>
      </Section>

      <Section title="Position">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Column">
            <select className={inputClass} value={form.column}
              onChange={e => setForm({ ...form, column: e.target.value as Column })}>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </Field>
          <Field label="Order" hint="Lower numbers show first (10, 20, 30…)">
            <input type="number" className={inputClass} value={form.sortOrder}
              onChange={e => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          </Field>
        </div>
        <Toggle label="Published" checked={form.isPublished}
          onChange={v => setForm({ ...form, isPublished: v })} />
      </Section>

      <Section title="Description">
        <p className="text-xs text-slate-400">
          Optional. Use 🔗 to link to a page on this site (/contact) or another site (https://…).
        </p>
        <RichEditor value={form.description} onChange={html => setForm({ ...form, description: html })} />
      </Section>

      <Section title="Buttons">
        {form.buttons.length === 0 && <p className="text-xs text-slate-400">No buttons.</p>}
        {form.buttons.map((b, i) => (
          <div key={i} className="border rounded-lg p-3 space-y-3 bg-slate-50">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Label">
                <input className={inputClass} value={b.label} placeholder="Register"
                  onChange={e => setButton(i, { label: e.target.value })} />
              </Field>
              <Field label="Link" error={linkError(b.href)}>
                <input className={inputClass} value={b.href} placeholder="/events or https://…"
                  onChange={e => setButton(i, { href: e.target.value })} />
              </Field>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <select className="border rounded-lg px-2 py-1 text-sm" value={b.style}
                onChange={e => setButton(i, { style: e.target.value as ButtonForm['style'] })}>
                <option value="primary">Primary (solid)</option>
                <option value="secondary">Secondary (outline)</option>
              </select>
              <Toggle label="Open in new tab" checked={b.newTab} onChange={v => setButton(i, { newTab: v })} />
              <div className="ml-auto flex gap-1">
                <button type="button" disabled={i === 0} className="px-2 py-1 text-xs border rounded disabled:opacity-30"
                  onClick={() => {
                    const next = [...form.buttons];
                    [next[i - 1], next[i]] = [next[i], next[i - 1]];
                    setForm({ ...form, buttons: next });
                  }}>↑</button>
                <button type="button" disabled={i === form.buttons.length - 1} className="px-2 py-1 text-xs border rounded disabled:opacity-30"
                  onClick={() => {
                    const next = [...form.buttons];
                    [next[i + 1], next[i]] = [next[i], next[i + 1]];
                    setForm({ ...form, buttons: next });
                  }}>↓</button>
                <button type="button" className="px-2 py-1 text-xs border rounded text-red-600"
                  onClick={() => setForm({ ...form, buttons: form.buttons.filter((_, j) => j !== i) })}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
        <button type="button"
          className="px-3 py-1.5 border rounded-lg text-sm font-medium hover:bg-slate-50"
          onClick={() => setForm({
            ...form,
            buttons: [...form.buttons, { label: '', href: '', style: 'primary', newTab: false }],
          })}>
          + Add button
        </button>
        {form.newsTopic && form.buttons.length > 0 && (
          <Field label="Buttons position">
            <select className={inputClass} value={form.buttonsPosition}
              onChange={e => setForm({ ...form, buttonsPosition: e.target.value as 'above' | 'below' })}>
              <option value="above">Above the news list</option>
              <option value="below">At the bottom of the box</option>
            </select>
          </Field>
        )}
      </Section>

      <Section title="News feed">
        <Field label="Topic" hint="Shows the newest published articles. Choose (none) for no feed.">
          <select className={inputClass} value={form.newsTopic}
            onChange={e => setForm({ ...form, newsTopic: e.target.value, newsSubcat1: '', newsSubcat2: '' })}>
            <option value="">(none)</option>
            {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>

        {form.newsTopic && (
          <>
            {subcat1Items.length > 0 && (
              <Field label="Subtopic">
                <select className={inputClass} value={form.newsSubcat1}
                  onChange={e => setForm({ ...form, newsSubcat1: e.target.value, newsSubcat2: '' })}>
                  <option value="">(all)</option>
                  {subcat1Items.map(s => <option key={s.slug} value={s.slug}>{s.label}</option>)}
                </select>
              </Field>
            )}
            {subcat2Items.length > 0 && (
              <Field label="Sub-subtopic">
                <select className={inputClass} value={form.newsSubcat2}
                  onChange={e => setForm({ ...form, newsSubcat2: e.target.value })}>
                  <option value="">(all)</option>
                  {subcat2Items.map(s => <option key={s.slug} value={s.slug}>{s.label}</option>)}
                </select>
              </Field>
            )}
            <div className="grid grid-cols-2 gap-4 items-end">
              <Field label="How many">
                <input type="number" min={1} max={50} className={inputClass} value={form.newsLimit}
                  onChange={e => setForm({ ...form, newsLimit: Number(e.target.value) })} />
              </Field>
              <Toggle label="Numbered list (1, 2, 3…)" checked={form.newsNumbered}
                onChange={v => setForm({ ...form, newsNumbered: v })} />
            </div>

            <Toggle label='Show "more" link' checked={form.showMore}
              onChange={v => setForm({ ...form, showMore: v })} />
            {form.showMore && (
              <div className="grid grid-cols-2 gap-4">
                <Field label="More label">
                  <input className={inputClass} value={form.moreLabel} placeholder="more ›"
                    onChange={e => setForm({ ...form, moreLabel: e.target.value })} />
                </Field>
                <Field label="More link" error={linkError(form.moreLink)} hint="Empty = the topic's listing page">
                  <input className={inputClass} value={form.moreLink} placeholder={defaultMoreLink(form)}
                    onChange={e => setForm({ ...form, moreLink: e.target.value })} />
                </Field>
              </div>
            )}
          </>
        )}
      </Section>

      <div className="flex gap-3">
        <button onClick={onSave} disabled={loading}
          className="px-5 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 disabled:opacity-50">
          {loading ? 'Saving…' : 'Save'}
        </button>
        <button onClick={onCancel} className="px-5 py-2 border rounded-lg text-sm hover:bg-slate-50">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminHomeBoxesPage() {
  const [boxes, setBoxes]     = useState<BoxRecord[]>([]);
  const [view, setView]       = useState<View>('list');
  const [form, setForm]       = useState<BoxForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded]   = useState(false);
  const { message, showMessage } = useMessage();

  async function load() {
    try {
      const all: BoxRecord[] = [];
      let nextToken: string | null | undefined = undefined;
      do {
        const res: Awaited<ReturnType<typeof client.models.HomeBox.list>> =
          await client.models.HomeBox.list({ limit: 1000, nextToken });
        if (res.errors?.length) throw new Error(res.errors[0].message);
        all.push(...res.data);
        nextToken = res.nextToken;
      } while (nextToken);
      setBoxes(all);
    } catch (err) {
      showMessage(`❌ Failed to load boxes: ${(err as Error).message}`);
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => { load(); }, []);

  const byColumn = (c: Column) =>
    boxes.filter(b => (b.column ?? 'left') === c).sort((a, b) => a.sortOrder - b.sortOrder);

  function validate(f: BoxForm): string | null {
    if (!f.title.trim()) return 'Header text is required.';
    const links = [f.titleLink, f.moreLink, ...f.buttons.map(b => b.href)];
    if (links.some(l => linkError(l))) return 'Fix the highlighted links first.';
    if (f.buttons.some(b => !!b.label.trim() !== !!b.href.trim())) return 'Each button needs both a label and a link.';
    return null;
  }

  async function save() {
    const problem = validate(form);
    if (problem) { showMessage(`❌ ${problem}`); return; }
    setLoading(true);
    try {
      const input = toRecordInput(form);
      const { errors } = editingId
        ? await client.models.HomeBox.update({ id: editingId, ...input })
        : await client.models.HomeBox.create(input);
      if (errors?.length) throw new Error(errors[0].message);
      showMessage('✅ Saved');
      setView('list');
      setEditingId(null);
      await load();
    } catch (err) {
      showMessage(`❌ Save failed: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  async function remove(box: BoxRecord) {
    if (!confirm(`Delete "${box.title}"? This can't be undone.`)) return;
    const { errors } = await client.models.HomeBox.delete({ id: box.id });
    if (errors?.length) { showMessage(`❌ Delete failed: ${errors[0].message}`); return; }
    showMessage('✅ Deleted');
    await load();
  }

  async function togglePublished(box: BoxRecord) {
    const { errors } = await client.models.HomeBox.update({ id: box.id, isPublished: !(box.isPublished ?? true) });
    if (errors?.length) { showMessage(`❌ ${errors[0].message}`); return; }
    await load();
  }

  // Swap a box with its neighbour, renumbering the column 10, 20, 30… so
  // both columns keep lining up row by row.
  async function move(box: BoxRecord, dir: -1 | 1) {
    const col = byColumn(box.column === 'right' ? 'right' : 'left');
    const i = col.findIndex(b => b.id === box.id);
    const j = i + dir;
    if (j < 0 || j >= col.length) return;
    [col[i], col[j]] = [col[j], col[i]];
    setLoading(true);
    try {
      await Promise.all(col.map((b, k) =>
        b.sortOrder === (k + 1) * 10
          ? null
          : client.models.HomeBox.update({ id: b.id, sortOrder: (k + 1) * 10 })
      ));
      await load();
    } catch (err) {
      showMessage(`❌ Reorder failed: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  async function addStarterBoxes() {
    setLoading(true);
    try {
      for (const starter of STARTER_BOXES) {
        const { errors } = await client.models.HomeBox.create(toRecordInput({ ...emptyForm, ...starter }));
        if (errors?.length) throw new Error(errors[0].message);
      }
      showMessage('✅ Starter boxes added');
      await load();
    } catch (err) {
      showMessage(`❌ ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  function openCreate(column: Column) {
    const col = byColumn(column);
    const nextOrder = col.length ? col[col.length - 1].sortOrder + 10 : 10;
    setForm({ ...emptyForm, column, sortOrder: nextOrder });
    setEditingId(null);
    setView('create');
  }

  function openEdit(box: BoxRecord) {
    setForm(toForm(box));
    setEditingId(box.id);
    setView('edit');
  }

  if (view !== 'list') {
    return (
      <>
        {message && (
          <div className="mx-6 mt-6 px-4 py-2 rounded-lg bg-slate-100 text-sm text-center">{message}</div>
        )}
        <BoxFormView
          form={form}
          setForm={setForm}
          onSave={save}
          onCancel={() => { setView('list'); setEditingId(null); }}
          loading={loading}
          isEdit={view === 'edit'}
        />
      </>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Home Page Boxes</h1>
        <a href="/" target="_blank" rel="noopener noreferrer" className="text-sm text-amber-700">
          View home page ↗
        </a>
      </div>

      {message && (
        <div className="px-4 py-2 rounded-lg bg-slate-100 text-sm text-center">{message}</div>
      )}

      {loaded && boxes.length === 0 && (
        <div className="border border-dashed rounded-xl p-6 text-center space-y-3 bg-white">
          <p className="text-sm text-slate-600">
            No boxes yet. Start from the original site's layout (Weekly Insights, AI &amp; ML, Markets, …)
            and edit from there, or add boxes one by one.
          </p>
          <button onClick={addStarterBoxes} disabled={loading}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 disabled:opacity-50">
            {loading ? 'Adding…' : 'Add starter boxes'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {(['left', 'right'] as Column[]).map(column => {
          const col = byColumn(column);
          return (
            <div key={column} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">{column} column</h2>
                <button onClick={() => openCreate(column)}
                  className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700">
                  + New box
                </button>
              </div>
              {col.map((box, i) => (
                <div key={box.id}
                  className={`border rounded-xl bg-white shadow-sm overflow-hidden ${box.isPublished === false ? 'opacity-60' : ''}`}>
                  <div className="bg-gray-200 px-4 py-2 flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-800 flex-1 truncate">{box.title}</span>
                    {box.isPublished === false && (
                      <span className="text-[10px] font-bold uppercase bg-slate-500 text-white px-1.5 py-0.5 rounded">Draft</span>
                    )}
                  </div>
                  <div className="px-4 py-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>#{box.sortOrder}</span>
                    {box.titleLink && <span>🔗 {box.titleLink}</span>}
                    {box.description && <span>📝 description</span>}
                    {!!box.buttons?.length && <span>🔘 {box.buttons.length} button{box.buttons.length > 1 ? 's' : ''}</span>}
                    {box.newsTopic && (
                      <span>
                        📰 {box.newsLimit} × {[box.newsTopic, box.newsSubcat1, box.newsSubcat2].filter(Boolean).join(' / ')}
                      </span>
                    )}
                    <div className="ml-auto flex gap-1">
                      <button disabled={i === 0 || loading} onClick={() => move(box, -1)}
                        className="px-2 py-1 border rounded disabled:opacity-30" title="Move up">↑</button>
                      <button disabled={i === col.length - 1 || loading} onClick={() => move(box, 1)}
                        className="px-2 py-1 border rounded disabled:opacity-30" title="Move down">↓</button>
                      <button onClick={() => togglePublished(box)} className="px-2 py-1 border rounded">
                        {box.isPublished === false ? 'Publish' : 'Unpublish'}
                      </button>
                      <button onClick={() => openEdit(box)} className="px-2 py-1 border rounded text-amber-700">Edit</button>
                      <button onClick={() => remove(box)} className="px-2 py-1 border rounded text-red-600">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
              {loaded && col.length === 0 && <p className="text-xs text-slate-400">No boxes in this column.</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
