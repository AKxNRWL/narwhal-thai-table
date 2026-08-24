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
 * Toast Online Ordering — the hosted pickup-ordering page for the restaurant.
 * Orders placed here go straight into Toast POS (no re-keying).
 * Empty string = not live yet: every "Order Online" button and the Aileen
 * knowledge line are hidden automatically, so we never ship a dead link.
 */
export const ORDER_ONLINE_URL = 'https://order.toasttab.com/online/narwhalthaitable';

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
    // EXACT match to the Google Business Profile address — NAP consistency is a
    // ranking signal, so this string must not drift ("Boulevard", missing suite…).
    street: '19072 Beach Blvd Ste A & B',
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
 *   Yelp      : our own listing, separated from Thai Gulf (Aug 2026) — slug -4
 *   Google    : Google Business Profile share link (g.page/…)
 */
export const SOCIAL: SocialLink[] = [
  { label: 'Instagram', url: 'https://www.instagram.com/narwhalthaitablehb/' },
  { label: 'Facebook', url: 'https://www.facebook.com/Narwhalthaitablehb' },
  { label: 'Yelp', url: 'https://www.yelp.com/biz/narwhal-thai-table-huntington-beach-4' },
  { label: 'Google', url: 'https://maps.google.com/?cid=6790489916821266867' },
];

/**
 * ENTITY IDENTITY — the stable id of this restaurant in Google's Knowledge Graph.
 * CID = the numeric id of our own Google Business Profile listing (decoded from
 * the official g.page review link). Used for `hasMap` and the Maps embed so the
 * site points at exactly ONE listing and can never be confused with the previous
 * tenant at this address ("Thai Gulf Restaurant"), whose listings are still live.
 */
export const GBP_CID = '6790489916821266867';
export const GBP_MAP_URL = `https://maps.google.com/?cid=${GBP_CID}`;

/* One canonical "navigate me there" link, used by the map caption and the
   mobile action bar. /maps/dir + destination opens Google Maps in DIRECTIONS
   mode (on phones it hands straight to the app) — not a search page. */
export const DIRECTIONS_URL =
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    'Narwhal Thai Table, 19072 Beach Blvd, Huntington Beach, CA 92648',
  )}`;

/** Stable @id so the Restaurant node on all 74 pages is ONE entity, not 74. */
export const RESTAURANT_ID = `${SITE_URL}/#restaurant`;

/**
 * Every profile that describes THIS business — feeds JSON-LD `sameAs`.
 * This is the cheapest, strongest way to tell search engines and AI assistants
 * "all of these are the same restaurant", which matters a great deal while the
 * previous tenant's listings still contest the same street address.
 * Only verified-ours URLs belong here — never the old Thai Gulf profiles.
 */
export const PROFILE_URLS: string[] = [
  'https://www.instagram.com/narwhalthaitablehb/',
  'https://www.facebook.com/Narwhalthaitablehb',
  'https://www.yelp.com/biz/narwhal-thai-table-huntington-beach-4',
  GBP_MAP_URL,
  'https://www.doordash.com/store/50580864',
  ORDER_ONLINE_URL,
].filter(Boolean);

/** Non-empty social URLs — footer links. */
export function socialUrls(): string[] {
  return SOCIAL.map((s) => s.url).filter(Boolean);
}

/** All profile URLs for JSON-LD `sameAs` (de-duplicated). */
export function sameAsUrls(): string[] {
  return [...new Set(PROFILE_URLS)];
}
