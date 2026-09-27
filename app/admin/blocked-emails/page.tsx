'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useMessage } from '@/lib/utils';
import {
  DEFAULT_BLOCKED_DOMAINS, normalizeDomain, isValidDomain, type BlockedDomainCategory,
} from '@/amplify/shared/blockedEmailDomains';

const client = generateClient<Schema>({ authMode: 'userPool' });

type BlockedDomain = Schema['BlockedEmailDomain']['type'];

const CATEGORY_LABELS: Record<BlockedDomainCategory, string> = {
  personal:   'Personal email',
  isp:        'Internet provider',
  disposable: 'Disposable',
  other:      'Other',
};

const emptyForm = { domain: '', category: 'personal' as BlockedDomainCategory, note: '' };

export default function BlockedEmailsPage() {
  const [items, setItems]   = useState<BlockedDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm]     = useState(emptyForm);
  const [deleteDomain, setDeleteDomain] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { message, showMessage } = useMessage();

  async function loadItems() {
    setLoading(true);
    try {
      // list() returns one page at a time; follow nextToken to get them all.
      const all: BlockedDomain[] = [];
      let nextToken: string | null | undefined;
      do {
        const { data, errors, nextToken: next } = await client.models.BlockedEmailDomain.list({ limit: 1000, nextToken });
        if (errors?.length) { showMessage(`❌ ${errors[0].message}`); break; }
        all.push(...data);
        nextToken = next;
      } while (nextToken);
      all.sort((a, b) => a.domain.localeCompare(b.domain));
      setItems(all);
    } catch (e) {
      showMessage('❌ ' + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadItems(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? items.filter(i => i.domain.includes(q) || i.note?.toLowerCase().includes(q)) : items;
  }, [items, search]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const domain = normalizeDomain(form.domain);
    if (!isValidDomain(domain)) {
      showMessage('❌ Enter a domain like gmail.com');
      return;
    }
    if (items.some(i => i.domain === domain)) {
      showMessage(`❌ ${domain} is already blocked`);
      return;
    }
    startTransition(async () => {
      try {
        const { errors } = await client.models.BlockedEmailDomain.create({
          domain,
          category: form.category,
          note: form.note.trim() || undefined,
        });
        if (errors?.length) { showMessage(`❌ ${errors[0].message}`); return; }
        showMessage(`✅ Blocked ${domain}`);
        setForm(emptyForm);
        loadItems();
      } catch (e) {
        showMessage('❌ ' + (e as Error).message);
      }
    });
  }

  function handleDelete() {
    if (!deleteDomain) return;
    const domain = deleteDomain;
    startTransition(async () => {
      try {
        const { errors } = await client.models.BlockedEmailDomain.delete({ domain });
        if (errors?.length) { showMessage(`❌ ${errors[0].message}`); return; }
        showMessage(`✅ Unblocked ${domain}`);
        setDeleteDomain(null);
        loadItems();
      } catch (e) {
        showMessage('❌ ' + (e as Error).message);
      }
    });
  }

  // Adds only the defaults that aren't in the table yet, so it is safe to
  // click again (and it won't re-add a default someone deliberately removed
  // unless they click it again).
  function handleAddDefaults() {
    const existing = new Set(items.map(i => i.domain));
    const missing = DEFAULT_BLOCKED_DOMAINS.filter(d => !existing.has(d.domain));
    if (missing.length === 0) {
      showMessage('✅ All default domains are already blocked');
      return;
    }
    startTransition(async () => {
      const results = await Promise.all(missing.map(d =>
        client.models.BlockedEmailDomain.create({ domain: d.domain, category: d.category, note: 'Default list' })
          .then(r => !r.errors?.length)
          .catch(() => false)
      ));
      const failed = results.filter(ok => !ok).length;
      showMessage(failed
        ? `❌ Added ${missing.length - failed} of ${missing.length} default domains; ${failed} failed. Try again.`
        : `✅ Added ${missing.length} default domains`);
      loadItems();
    });
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blocked Email Domains</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            People can&apos;t sign up with an email address at these domains (subdomains included).
            Throwaway services like mailinator.com are blocked automatically and don&apos;t need to be listed.
            Existing accounts are not affected.
          </p>
        </div>
        <button
          onClick={handleAddDefaults}
          disabled={isPending || loading}
          className="flex-shrink-0 px-4 py-2 rounded border border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 disabled:opacity-50"
        >
          Add default list
        </button>
      </div>

      {message && (
        <div className="mb-4 px-4 py-3 rounded bg-white border border-slate-200 text-sm text-slate-700">{message}</div>
      )}

      {/* Add form */}
      <form onSubmit={handleAdd} className="mb-6 p-4 bg-white border border-slate-200 rounded-md grid grid-cols-1 md:grid-cols-[2fr_1fr_2fr_auto] gap-3 items-end">
        <label className="text-sm">
          <span className="block font-medium text-slate-700 mb-1">Domain</span>
          <input
            value={form.domain}
            onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}
            placeholder="gmail.com"
            className="w-full px-3 py-2 border border-slate-300 rounded"
          />
        </label>
        <label className="text-sm">
          <span className="block font-medium text-slate-700 mb-1">Category</span>
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value as BlockedDomainCategory }))}
            className="w-full px-3 py-2 border border-slate-300 rounded bg-white"
          >
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="block font-medium text-slate-700 mb-1">Note (optional)</span>
          <input
            value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            placeholder="Why it's blocked"
            className="w-full px-3 py-2 border border-slate-300 rounded"
          />
        </label>
        <button
          type="submit"
          disabled={isPending || !form.domain.trim()}
          className="px-4 py-2 rounded bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold disabled:opacity-50"
        >
          Block
        </button>
      </form>

      {/* List */}
      <div className="flex items-center justify-between mb-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search domains or notes"
          className="w-64 px-3 py-2 border border-slate-300 rounded text-sm"
        />
        <p className="text-sm text-slate-500">
          {filtered.length === items.length ? `${items.length} blocked` : `${filtered.length} of ${items.length}`}
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-slate-400">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">
            {items.length === 0 ? 'No domains blocked yet. Click "Add default list" to start with the common personal and ISP domains.' : 'No matches.'}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Domain</th>
                <th className="px-4 py-2 font-medium">Category</th>
                <th className="px-4 py-2 font-medium">Note</th>
                <th className="px-4 py-2 font-medium">Added</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(item => (
                <tr key={item.domain}>
                  <td className="px-4 py-2 font-mono text-slate-900">{item.domain}</td>
                  <td className="px-4 py-2 text-slate-600">{item.category ? CATEGORY_LABELS[item.category] : '—'}</td>
                  <td className="px-4 py-2 text-slate-600">{item.note || '—'}</td>
                  <td className="px-4 py-2 text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => setDeleteDomain(item.domain)} className="text-red-600 hover:underline">
                      Unblock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete confirm */}
      {deleteDomain && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-md p-6 max-w-sm w-full">
            <p className="text-sm text-slate-700 mb-4">
              Unblock <span className="font-mono font-semibold">{deleteDomain}</span>? People will be able to sign up with it again.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteDomain(null)} className="px-4 py-2 rounded bg-slate-100 text-sm">Cancel</button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-50"
              >
                Unblock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
