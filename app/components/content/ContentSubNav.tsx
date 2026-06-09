"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SubNavItem {
  label: string;
  slug: string;
}

export interface ContentSubNavProps {
  /** First-level subcategory items */
  subcat1Items: SubNavItem[];
  /** Second-level subcategory items — only shown for news (which has two levels) */
  subcat2Items?: SubNavItem[];
  /** Active subcat1 slug */
  activeSubcat1?: string;
  /** Active subcat2 slug */
  activeSubcat2?: string;
  /** Base path prefix, e.g. "/news" or "/videos" */
  basePath: string;
  /** Whether a second nav row is expected (news only) */
  hasSubcat2?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build the href for a subcat1 item.
 * For news (hasSubcat2=true) we keep the existing subcat2 if there is one,
 * otherwise fall to the first subcat2 – callers can pass activeSubcat2 as a hint.
 */
function subcat1Href(
  basePath: string,
  slug: string,
  hasSubcat2: boolean,
  activeSubcat2?: string,
  subcat2Items?: SubNavItem[]
): string {
  if (!hasSubcat2) return `${basePath}/${slug}`;
  // Preserve active subcat2, or fall back to first available
  const sc2 = activeSubcat2 ?? subcat2Items?.[0]?.slug ?? "_";
  return `${basePath}/${slug}/${sc2}`;
}

function subcat2Href(
  basePath: string,
  activeSubcat1: string,
  slug: string
): string {
  return `${basePath}/${activeSubcat1}/${slug}`;
}

// ─── Pill ─────────────────────────────────────────────────────────────────────

function NavPill({
  href,
  label,
  isActive,
  size = "md",
}: {
  href: string;
  label: string;
  isActive: boolean;
  size?: "md" | "sm";
}) {
  const base =
    "inline-flex items-center whitespace-nowrap transition-colors duration-150 font-medium";

  const sizeClasses =
    size === "md"
      ? "px-3.5 py-1.5 text-[13px] rounded"
      : "px-3 py-1 text-[12px] rounded";

  const activeClasses = isActive
    ? "bg-amber-600 text-white shadow-sm"
    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800";

  return (
    <Link href={href} className={`${base} ${sizeClasses} ${activeClasses}`}>
      {label}
    </Link>
  );
}

// ─── Scrollable row ───────────────────────────────────────────────────────────

function NavRow({
  children,
  border = true,
}: {
  children: React.ReactNode;
  border?: boolean;
}) {
  return (
    <div
      className={`w-full overflow-x-auto scrollbar-hide ${
        border ? "border-b border-slate-200" : ""
      }`}
    >
      <div className="flex items-center gap-1 px-4 md:px-6 py-2 min-w-max">
        {children}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ContentSubNav({
  subcat1Items,
  subcat2Items = [],
  activeSubcat1,
  activeSubcat2,
  basePath,
  hasSubcat2 = false,
}: ContentSubNavProps) {
  const pathname = usePathname();

  // Derive active slugs from URL if not passed explicitly
  const resolvedSc1 = activeSubcat1;
  const resolvedSc2 = activeSubcat2;

  return (
    <nav
      aria-label="Content subcategory navigation"
      className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm"
    >
      {/* ── Row 1 – subcat1 ── */}
      <NavRow border={hasSubcat2 && subcat2Items.length > 0}>
        {/* "All" pill */}
        <NavPill
          href={
            hasSubcat2
              ? `${basePath}/_/${resolvedSc2 ?? subcat2Items[0]?.slug ?? "_"}`
              : basePath
          }
          label="All"
          isActive={!resolvedSc1 || resolvedSc1 === "_"}
        />

        {subcat1Items.map((item) => (
          <NavPill
            key={item.slug}
            href={subcat1Href(
              basePath,
              item.slug,
              hasSubcat2,
              resolvedSc2,
              subcat2Items
            )}
            label={item.label}
            isActive={resolvedSc1 === item.slug}
          />
        ))}
      </NavRow>

      {/* ── Row 2 – subcat2 (news only) ── */}
      {hasSubcat2 && subcat2Items.length > 0 && (
        <NavRow border={false}>
          {/* "All topics" pill */}
          <NavPill
            href={`${basePath}/${resolvedSc1 ?? "_"}/_`}
            label="All topics"
            isActive={!resolvedSc2 || resolvedSc2 === "_"}
            size="sm"
          />

          {subcat2Items.map((item) => (
            <NavPill
              key={item.slug}
              href={subcat2Href(
                basePath,
                resolvedSc1 ?? "_",
                item.slug
              )}
              label={item.label}
              isActive={resolvedSc2 === item.slug}
              size="sm"
            />
          ))}
        </NavRow>
      )}
    </nav>
  );
}

// ─── Usage examples (inline JSDoc) ────────────────────────────────────────────
//
// News (two rows):
// <ContentSubNav
//   basePath="/news"
//   hasSubcat2
//   subcat1Items={[{ label: "Market", slug: "market" }, { label: "Upstream", slug: "upstream" }]}
//   subcat2Items={[{ label: "Pricing", slug: "pricing" }, { label: "Supply", slug: "supply" }]}
//   activeSubcat1="market"
//   activeSubcat2="pricing"
// />
//
// Videos / Whitepapers (one row):
// <ContentSubNav
//   basePath="/videos"
//   subcat1Items={[{ label: "Market", slug: "market" }, { label: "Refining", slug: "refining" }]}
//   activeSubcat1="market"
// />
