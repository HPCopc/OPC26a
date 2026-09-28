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
  { label: 'Register with OpportunityCrudes.com',  href: '/register' },
];

const BottomLinks: FooterLink[] = [
  { label: 'Home',      href: '/'        },
  { label: 'About',     href: '/about'   },
  { label: 'Contact',   href: '/contact' },
  { label: 'Advertise', href: '/contact' },
];

// Matches the original site's footer: a #EFEFEF band of link columns, then
// a black bar with the site links and copyright.
function LinkColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h2 className="font-bold uppercase text-base mb-2.5">{title}</h2>
      <ul className="text-sm leading-[30px]">
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link href={href} className="font-normal text-black hover:underline">
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
    <footer className="flex flex-col mt-20">

      {/* Link columns */}
      <div className="bg-[#EFEFEF] px-6 sm:px-10 py-6 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10">
        <LinkColumn title="Topic"    links={Topics}   />
        <LinkColumn title="More"     links={More}     />
        <LinkColumn title="Services" links={Services} />
      </div>

      {/* Bottom bar */}
      <div className="bg-black text-white px-6 sm:px-10 py-3 flex flex-col sm:flex-row gap-2 sm:gap-8 items-center text-sm">
        <ul className="flex flex-wrap justify-center gap-6 sm:gap-10">
          {BottomLinks.map(({ label, href }) => (
            <li key={label}>
              <Link href={href} className="font-normal text-white hover:underline">
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="sm:ml-auto">Copyright © {currentYear} OpportunityCrudes.com</p>
      </div>

    </footer>
  );
}
