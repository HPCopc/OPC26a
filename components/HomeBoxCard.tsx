// One home page box: gray header (optionally linked), then description,
// buttons and news feed in the order the admin chose.
import Link from 'next/link';
import type { HomeBoxButton, HomeBoxData } from '@/lib/getHomeBoxes';
import { contentPath } from '@/lib/contentPath';
import { sanitizeHtml, safeHref, isExternalHref } from '@/lib/sanitizeHtml';

function SmartLink({ href, newTab, className, children }: {
  href: string;
  newTab?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const openNew = newTab ?? isExternalHref(href);
  if (href.startsWith('/') && !openNew) {
    return <Link href={href} className={className}>{children}</Link>;
  }
  return (
    <a
      href={href}
      className={className}
      {...(openNew ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  );
}

function Buttons({ buttons }: { buttons: HomeBoxButton[] }) {
  const safe = buttons
    .map((b) => ({ ...b, href: safeHref(b.href) }))
    .filter((b): b is HomeBoxButton => b.href !== null);
  if (safe.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {safe.map((b, i) => (
        <SmartLink
          key={i}
          href={b.href}
          newTab={b.newTab}
          className={
            b.style === 'secondary'
              ? 'inline-block px-4 py-2 rounded border border-amber-600 text-amber-700 text-sm font-semibold hover:bg-amber-50 transition-colors'
              : 'inline-block px-4 py-2 rounded bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-colors'
          }
        >
          {b.label}
        </SmartLink>
      ))}
    </div>
  );
}

// Register buttons are for visitors only; members already have access.
function isRegisterHref(href: string) {
  return href === '/register' || href.startsWith('/register?') || href.startsWith('/register/');
}

export default function HomeBoxCard({ box, signedIn }: { box: HomeBoxData; signedIn: boolean }) {
  const titleHref = safeHref(box.titleLink);
  const moreHref  = safeHref(box.moreLink);
  const ListTag   = box.newsNumbered ? 'ol' : 'ul';

  const visibleButtons = signedIn ? box.buttons.filter((b) => !isRegisterHref(b.href)) : box.buttons;
  const buttons = visibleButtons.length > 0 ? <Buttons buttons={visibleButtons} /> : null;

  return (
    // data-anchor, not id: the page renders every box twice (phone and
    // wide layouts). ScrollToBoxAnchor picks the visible one.
    <section
      data-anchor={box.anchor ?? undefined}
      className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col scroll-mt-4"
    >
      {/* Gray header */}
      <div className="bg-gray-200 px-6 py-4 border-b border-gray-300">
        <h2 className="text-xl font-bold text-gray-800">
          {titleHref ? (
            <SmartLink href={titleHref} className="hover:text-amber-700 transition-colors">
              {box.title} <span aria-hidden="true">›</span>
            </SmartLink>
          ) : (
            box.title
          )}
        </h2>
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col gap-4">
        {box.description && (
          <div
            className="rich-text text-gray-700 [&_a]:text-amber-700 [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(box.description) }}
          />
        )}

        {box.buttonsPosition === 'above' && buttons}

        {box.news && (
          box.news.length > 0 ? (
            <ListTag
              className={`${box.newsNumbered ? 'list-decimal' : 'list-disc'} pl-5 flex flex-col gap-1.5 text-sm`}
            >
              {box.news.map((item) => (
                <li key={item.id}>
                  <Link href={contentPath(item)} className="font-normal text-gray-800 hover:text-amber-700">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ListTag>
          ) : (
            <p className="text-sm text-gray-400">No articles yet.</p>
          )
        )}

        {moreHref && (
          <div className="text-right">
            <SmartLink href={moreHref} className="text-sm font-semibold text-amber-700 hover:underline">
              {box.moreLabel}
            </SmartLink>
          </div>
        )}

        {box.buttonsPosition === 'below' && buttons}
      </div>
    </section>
  );
}
