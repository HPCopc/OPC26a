// app/components/HeaderClient.tsx  -new
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from './Header';
import styles from './header.module.css';

export default function HeaderClient({ primaryNav }: { primaryNav: NavItem[] }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const isActive = (href?: string) =>
    !!href && (pathname === href || pathname.startsWith(href + '/'));

  React.useEffect(() => {
    // Close mobile panel on route change
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className={styles.right}>
      {/* Desktop nav */}
      <nav className={styles.nav} aria-label="Primary">
        <ul className={styles.navList}>
          {primaryNav.map((item) => (
            <li key={item.label} className={isActive(item.href) ? styles.active : undefined}>
              <Link href={item.href!} className={styles.navLink}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Auth actions */}
      <div className={styles.auth}>
        <Link href="/login" className={styles.loginLinkr" className={iv>

      {/* Burger (mobile) */}
      <button
        className={styles.burger}
        aria-label="Toggle navigation"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((s) => !s)}
      >
        <span />
        <span />
        <span />
      </button>

      {/* Mobile panel */}
      <div className={styles.mobilePanel} hidden={!mobileOpen}>
        <nav aria-label="Mobile">
          <ul className={styles.mobileList}>
            {primaryNav.map((item) => (
              <li key={item.label} className={isActive(item.href) ? styles.active : undefined}>
                <Link href={item.href!} className={styles.mobileLink}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li className={styles.mobileDivider} aria-hidden="true" />
            <li className={styles.mobileAuth}>
              <Link href="/login" className={stylesk href="/register" className={styles.mobile      </ul>
        </nav>
      </div>
    </div>
  );
}
``