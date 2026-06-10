// lib/taxonomy.ts
// Single source of truth for site taxonomy.
// Used by: admin forms (dropdowns) and frontend SubNav components.

export interface TaxonomyItem {
  label: string;
  slug:  string;
}

export interface TopicTaxonomy {
  subcat1: TaxonomyItem[];
  subcat2: Record<string, TaxonomyItem[]>;
}

export const TAXONOMY: Record<string, TopicTaxonomy> = {

  news: {
    subcat1: [
      { label: 'Markets',               slug: 'markets'    },
      { label: 'Opportunity Crudes',    slug: 'opc'        },
      { label: 'Shale Oil',             slug: 'shaleoil'   },
      { label: 'Crude Quality & Mgmt',  slug: 'crudeqm'    },
      { label: 'Crude Processing',      slug: 'crudep'     },
      { label: 'Technology',            slug: 'technology' },
    ],
    subcat2: {
      markets: [
        { label: 'Feature of the Week',        slug: 'feature-of-the-week'      },
        { label: 'Futures Weekly Recaps',       slug: 'futures-weekly-recaps'    },
        { label: 'Forecasts',                   slug: 'forecasts'                },
        { label: 'Crude Trades',                slug: 'crude-trades'             },
        { label: 'Oil Production Newsflash',    slug: 'oil-production-newsflash' },
        { label: 'OSP Differentials',           slug: 'osp-differentials'        },
        { label: 'Climate Scrutiny',            slug: 'climate-scrutiny'         },
      ],
      opc:      [],
      shaleoil: [],
      crudeqm: [
        { label: 'Crude Contaminants',          slug: 'crude-contaminants'       },
        { label: 'Assays of Major Crudes',      slug: 'assays-of-major-crudes'   },
        { label: 'Low Carbon-Intensity Crudes', slug: 'low-carbon-intensity'     },
      ],
      crudep: [
        { label: 'Refinery Throughputs',        slug: 'refinery-throughputs'     },
        { label: 'Crude Procurements',          slug: 'crude-procurements'       },
        { label: 'Biocrudes, Pyrolysis Oil',    slug: 'biocrudes-pyrolysis'      },
      ],
      technology: [
        { label: 'Licenses',                    slug: 'licenses'                 },
      ],
    },
  },

  videos: {
    subcat1: [
      { label: 'Presentations', slug: 'presentations' },
      { label: 'Seminars',      slug: 'seminars'      },
    ],
    subcat2: {},
  },

  whitepapers: { subcat1: [], subcat2: {} },
  resources:   { subcat1: [], subcat2: {} },
  events:      { subcat1: [], subcat2: {} },

};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** All top-level topics */
export const TOPICS = Object.keys(TAXONOMY) as string[];

/** Get subcat1 items for a topic */
export function getSubcat1(topic: string): TaxonomyItem[] {
  return TAXONOMY[topic]?.subcat1 ?? [];
}

/** Get subcat2 items for a topic + subcat1 */
export function getSubcat2(topic: string, subcat1: string): TaxonomyItem[] {
  return TAXONOMY[topic]?.subcat2[subcat1] ?? [];
}

/** Check if a topic+subcat1 has subcat2 */
export function hasSubcat2(topic: string, subcat1: string): boolean {
  return (TAXONOMY[topic]?.subcat2[subcat1]?.length ?? 0) > 0;
}

/** Build a Page slug from parts */
export function buildPageSlug(
  topic: string,
  subcat1?: string,
  subcat2?: string
): string {
  if (subcat2) return `${topic}-${subcat1}-${subcat2}`;
  if (subcat1) return `${topic}-${subcat1}`;
  return topic;
}
