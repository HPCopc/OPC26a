// app/components/Header.tsx
import Link from 'next/link';
// import Image from 'next/image';
// import HeaderClient from './HeaderClient';
import styles from './header.module.css';

export type NavItem = {
  label: string;
  href?: string;
  external?: boolean;
  children?: NavItem[];  // Add this line for nested navigation items
};

const utilityLeft: NavItem[] = [
  { label: 'HPC', href: 'https://www.hydrocarbonpublishing.com/', external: true },
  { label: 'OPC', href: '/conf' },
];

const utilityRight: NavItem[] = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const primaryNav: NavItem[] = [
  { label: 'News', href: '/news' },
  { label: 'Videos', href: '/videos' },
  { label: 'White Papers', href: '/white-papers' },
  { label: 'Resources', href: '/resources' },
  { label: 'Events', href: '/events' },
];

export default function Header() {
  return (
    <header className={styles.header}>
      {/* Top utility bar */}
      <div className={styles.topbar} role="navigation" aria-label="Utility">
         <ul className={styles.topbarList}>
          {utilityLeft.map((item) => (
            <li key={item.label}>
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.topLink}
                >
                  {item.label}
                </a>
              ) : (
                <Link href={item.href!} className={styles.topLink}>
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <ul className={`${styles.topbarList} ${styles.topbarRight}`}>
          {utilityRight.map((item) => (
            <li key={item.label}>
              <Link href={item.href!} className={styles.topLink}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
       
      </div>

      {/* Main bar */}
      <div className={styles.mainbar}>
       <div className={styles.mainbarList}> 
        <div>
        <Link href="/">
          <img src="/opcdrop.png"></img>
        </Link>
        </div>

        <div>
          <h1 className={styles.siteTitle}>Opportunity Crudes</h1>
          <p className={styles.tagline}>in Changing Times<br />
  Knowledge to Meet Crude Trilemma: Supply, Affordability & Low Carbon Intensity</p>
        </div>

        <div>
          <ul className={styles.mainbarList}>
            {primaryNav
              .filter(item => !item.children)  
              .map((item) => (
               <li key={item.label}    >
               <Link href={item.href || '#'}  >
                {item.label}
               </Link>
               </li>
              ))}
          </ul>
        </div>
       </div>

        <div>
          <p>login</p>
        </div>
       
      </div>


    </header>

  );
}