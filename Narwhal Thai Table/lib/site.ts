/**
 * Central public identity for the restaurant — NAP (Name / Address / Phone)
 * + social account URLs, used by the footer and the JSON-LD structured data
 * in app/layout.tsx.
 *
 * WHY: local SEO lives or dies on NAP consistency. Fill each value ONCE here
 * and every surface (footer, schema.org, future pages) stays in sync.
 * An empty string means "not live yet" — that item is simply hidden, so we
 * never ship dead `#` links (bad UX + wasted link equity).
 */

export const SITE_URL = 'https://narwhalthaihb.com';

/**
 * Chef visibility switch. false = "hidden mode": the chef section, nav link,
 * name mentions and metadata credits are hidden across the site (kept in code,
 * nothing deleted). Flip to true for the grand-opening chef reveal.
 */
export const SHOW_CHEF = false;

export type RestaurantInfo = {
  name: string;
  /** Display form, e.g. '+1 (657) 464-1214'. Empty = hidden everywhere. */
  phone: string;
  email: string;
  address: { street: string; city: string; region: string; zip: string };
};

export const RESTAURANT: RestaurantInfo = {
  name: 'Narwhal Thai Table',
  phone: '+1 (714) 378-6003',
  email: 'welcome@narwhalthaihb.com',
  address: {
    street: '19072 Beach Blvd',
    city: 'Huntington Beach',
    region: 'CA',
    zip: '92648',
  },
};

export type SocialLink = { label: string; url: string };

/**
 * Real account URLs — paste each one as the account goes live.
 * Empty url = link hidden everywhere (footer + JSON-LD sameAs).
 *   Instagram : e.g. 'https://www.instagram.com/narwhalthaitable/'
 *   Facebook  : e.g. 'https://www.facebook.com/narwhalthaitable'
 *   Yelp      : the claimed Narwhal listing (inherits Thai Gulf reviews)
 *   Google    : Google Business Profile share link (g.page/…)
 */
export const SOCIAL: SocialLink[] = [
  { label: 'Instagram', url: 'https://www.instagram.com/narwhalthaitablehb/' },
  { label: 'Facebook', url: 'https://www.facebook.com/Narwhalthaitablehb' },
  { label: 'Yelp', url: '' },
  { label: 'Google', url: '' },
];

/** Non-empty social URLs — feeds JSON-LD `sameAs`. */
export function socialUrls(): string[] {
  return SOCIAL.map((s) => s.url).filter(Boolean);
}
