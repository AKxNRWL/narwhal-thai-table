/**
 * Promo pop-up — types + visibility rules shared by the server (lib/promo.ts)
 * and the browser (components/PromoCard.tsx, components/PromoEditor.tsx).
 * Keep this file free of Node-only imports: it ships in the client bundle.
 */

/** One carousel photo. `alt` doubles as the caption chip on the photo ('' = none). */
export type PromoImage = { src: string; alt: string };

export type Promo = {
  /** Content hash. Changes whenever the offer changes, so a NEW offer shows
   *  again to visitors who closed the previous one (see DISMISS logic). */
  id: string;
  enabled: boolean;
  /** Small caps line above the title, e.g. "New · Lunch Special" */
  eyebrow: string;
  title: string;
  body: string;
  /** Free text — "$14.95", "from $12", or empty */
  price: string;
  /** 0–LIMITS.images photos; 2+ become a swipeable carousel with dots.
   *  src = site path (/images/…, /api/promo/image/<id>) or https URL. */
  images: PromoImage[];
  ctaLabel: string;
  /** '' hides the button. http(s), tel:, or a site path. */
  ctaUrl: string;
  /** Inclusive day window in restaurant time (YYYY-MM-DD), '' = open-ended */
  startsAt: string;
  endsAt: string;
  updatedAt: string;
};

/** What the public endpoint hands to browsers. */
export type PublicPromo = Omit<Promo, 'enabled' | 'startsAt' | 'endsAt' | 'updatedAt'>;

/** A photo the owner can pick from the site's own library (/stats editor). */
export type PromoImageOption = { label: string; src: string; group: 'lunch' | 'dish' };

export const LIMITS = {
  eyebrow: 40,
  title: 80,
  body: 280,
  price: 24,
  ctaLabel: 30,
  ctaUrl: 500,
  /** max photos in the carousel */
  images: 8,
  /** per-photo src length / caption length */
  imageSrc: 500,
  alt: 60,
  /** decoded upload size — phone photos are downsized client-side first */
  imageBytes: 2_000_000,
} as const;

/** Today's date (YYYY-MM-DD) in the restaurant's time zone. */
export function todayLA(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(now);
}

export type PromoStatus = 'live' | 'off' | 'scheduled' | 'ended' | 'empty';

export function promoStatus(p: Promo | null, now: Date = new Date()): PromoStatus {
  if (!p || !p.title) return 'empty';
  if (!p.enabled) return 'off';
  const today = todayLA(now);
  if (p.startsAt && today < p.startsAt) return 'scheduled';
  if (p.endsAt && today > p.endsAt) return 'ended';
  return 'live';
}

export const isLive = (p: Promo | null, now: Date = new Date()): boolean => promoStatus(p, now) === 'live';

export function publicPromo(p: Promo): PublicPromo {
  return { id: p.id, eyebrow: p.eyebrow, title: p.title, body: p.body, price: p.price, images: p.images, ctaLabel: p.ctaLabel, ctaUrl: p.ctaUrl };
}
