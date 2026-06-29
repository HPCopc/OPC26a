'use client';

import { useEffect, useState } from 'react';

type CognitoUser = {
  Username: string;
  Enabled:  boolean;
  UserStatus: string;
  Attributes: { Name: string; Value: string }[];
};

function attr(user: CognitoUser, name: string) {
  return user.Attributes?.find(a => a.Name === name)?.Value ?? '—';
}

export default function UsersPage() {
  const [users, setUsers]         = useState<CognitoUser[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail]         = useState('');
  const [tempPw, setTempPw]       = useState('');
  const [busy, setBusy]           = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/users');
    setUsers(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function call(body: object) {
    setBusy(true);
    await fetch('/api/admin/users', { method: 'POST', body: JSON.stringify(body) });
    await load();
    setBusy(false);
  }

  async function handleInvite() {
    if (!email || !tempPw) return;
    await call({ action: 'create', email, tempPassword: tempPw });
    setEmail(''); setTempPw(''); setShowInvite(false);
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
        <button
          onClick={() => setShowInvite(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded transition-colors"
        >
          + Invite User
        </button>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Invite User</h2>
            <div className="flex flex-col gap-3">
              <input
                type="email" placeholder="Email address" value={email}
                onChange={e => setEmail(e.target.value)}
                className="border border-slate-200 rounded px-3 py-2 text-sm"
              />
              <input
                type="text" placeholder="Temporary password" value={tempPw}
                onChange={e => setTempPw(e.target.value)}
                className="border border-slate-200 rounded px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={handleInvite} disabled={busy}
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded disabled:opacity-50">
                Send Invite
              </button>
              <button onClick={() => setShowInvite(false)}
                className="flex-1 py-2 border border-slate-200 text-sm rounded text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p className="text-sm text-slate-400">Loading users…</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Enabled</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.Username} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-800">{attr(user, 'email')}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      {user.UserStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.Enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {user.Enabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right flex justify-end gap-2">
                    <button
                      disabled={busy}
                      onClick={() => call({ action: user.Enabled ? 'disable' : 'enable', username: user.Username })}
                      className="px-3 py-1 text-xs rounded border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-50"
                    >
                      {user.Enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => { if (confirm(`Delete ${attr(user, 'email')}?`)) call({ action: 'delete', username: user.Username }); }}
                      className="px-3 py-1 text-xs rounded border border-red-200 hover:bg-red-50 text-red-600 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}