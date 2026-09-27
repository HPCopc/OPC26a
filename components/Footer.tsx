import Link from 'next/link';

type FooterLink = { label: string; href: string };

const Topics: FooterLink[] = [
  { label: 'Markets',                  href: '/news/markets'    },
  { label: 'Technology',               href: '/news/technology' },
  { label: 'Crude Processing Studies', href: '/news/crudep'     },
  { label: 'Shale Oil',                href: '/news/shaleoil'   },
  { label: 'Opportunity Crudes',       href: '/news/opc'        },
];

// Terms & Conditions is left out until that page exists.
const More: FooterLink[] = [
  { label: 'Videos',       href: '/videos'      },
  { label: 'White Papers', href: '/whitepapers' },
  { label: 'Resources',    href: '/resources'   },
  { label: 'Events',       href: '/events'      },
];

// No advertise page yet: the contact form has an "Advertising Inquiry" option.
const Services: FooterLink[] = [
  { label: 'Advertise with OpportunityCrudes.com', href: '/contact' },
  { label: 'Register with OpportunityCrudes.com',  href: '/login'   },
];

const BottomLinks: FooterLink[] = [
  { label: 'Home',      href: '/'        },
  { label: 'About',     href: '/about'   },
  { label: 'Contact',   href: '/contact' },
  { label: 'Advertise', href: '/contact' },
];

function LinkColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h2 className="font-bold uppercase text-sm tracking-wide mb-4">{title}</h2>
      <ul className="space-y-2">
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link href={href} className="text-sm text-gray-700 hover:text-black hover:underline">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex flex-col">

      {/* Top section */}
      <div className="bg-gray-100 px-4 sm:px-10 py-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <LinkColumn title="Topic"    links={Topics}   />
        <LinkColumn title="More"     links={More}     />
        <LinkColumn title="Services" links={Services} />
      </div>

      {/* Bottom bar */}
      <div className="bg-black text-white px-4 sm:px-10 py-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <ul className="flex flex-wrap justify-center gap-6 sm:gap-10">
          {BottomLinks.map(({ label, href }) => (
            <li key={label}>
              <Link href={href} className="text-sm hover:text-gray-300">
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-sm">Copyright © {currentYear} OpportunityCrudes.com</p>
      </div>

    </footer>
  );
}
