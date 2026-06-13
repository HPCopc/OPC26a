'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';
import Link from 'next/link';

const navItems = [
  { href: '/admin/pages',   label: 'Page Manager',    icon: '📄' },
  { href: '/admin/contents', label: 'Content Manager', icon: '📝' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await fetchAuthSession();
        const groups  = session.tokens?.accessToken?.payload['cognito:groups'] as string[] ?? [];
        if (!groups.includes('ADMINS')) {
          router.replace('/');
          return;
        }
      } catch {
        router.replace('/');
        return;
      }
      setChecking(false);
    };
    checkAuth();
  }, []);

  async function handleSignOut() {
    await signOut();
    router.replace('/');
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-400">Checking access…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Sidebar ── */}
      <aside className="w-56 flex-shrink-0 bg-slate-900 text-white flex flex-col">

        {/* Logo / title */}
        <div className="px-5 py-5 border-b border-slate-700">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Admin</p>
          <p className="text-sm font-semibold text-white mt-0.5">OPC Dashboard</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150
                  ${active
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom links */}
        <div className="px-3 py-4 border-t border-slate-700 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors duration-150"
          >
            <span>🌐</span>
            Back to Site
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors duration-150"
          >
            <span>🚪</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 bg-slate-50 min-h-screen overflow-auto">
        {children}
      </main>

    </div>
  );
}
