import type { MetadataRoute } from 'next';
import { DISHES } from '@/lib/dishes';
import { SITE_URL } from '@/lib/site';
import { hasViTwin, localePath } from '@/lib/i18n/locales';

/**
 * sitemap.xml (served at /sitemap.xml by Next.js).
 * Every dish page is listed — each one is a prerendered, story-rich page
 * (lib/dishes.ts), which is exactly the long-tail Google food searches hit
 * ("pad thai huntington beach", "khao soi near me", …).
 *
 * Vietnamese edition (Sep 2026): every page that has a /vi twin is listed
 * twice, each entry carrying both language alternates (hreflang in the
 * sitemap) plus the Vietnamese-only Little Saigon page.
 */
// Stable content-update date — bump this when pages/menu meaningfully change.
// Using a fixed date (not `new Date()`) keeps <lastmod> meaningful to Google
// instead of resetting to "now" on every deploy.
const LAST_CONTENT_UPDATE = new Date('2026-09-11T00:00:00Z');

type Entry = MetadataRoute.Sitemap[number];

/** One English page → its sitemap entries (itself, and its /vi twin when one exists). */
function pages(path: string, base: Omit<Entry, 'url' | 'alternates'>): Entry[] {
  const en = `${SITE_URL}${path}`;
  if (!hasViTwin(path)) return [{ url: en, ...base }];
  const vi = `${SITE_URL}${localePath('vi', path)}`;
  const alternates = { languages: { 'en-US': en, 'vi-VN': vi, 'x-default': en } };
  return [
    { url: en, ...base, alternates },
    { url: vi, ...base, alternates },
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = LAST_CONTENT_UPDATE;

  const staticPages: MetadataRoute.Sitemap = [
    ...pages('/', { lastModified: now, changeFrequency: 'weekly', priority: 1 }),
    ...pages('/menu', { lastModified: now, changeFrequency: 'weekly', priority: 0.9 }),
    ...pages('/lunch', { lastModified: now, changeFrequency: 'weekly', priority: 0.9 }),
    ...pages('/about', { lastModified: now, changeFrequency: 'monthly', priority: 0.8 }),
    ...pages('/press', { lastModified: now, changeFrequency: 'monthly', priority: 0.5 }),
    ...pages('/thai-food-orange-county', { lastModified: now, changeFrequency: 'monthly', priority: 0.8 }),
    ...pages('/thai-food-fountain-valley', { lastModified: now, changeFrequency: 'monthly', priority: 0.7 }),
    ...pages('/thai-food-westminster', { lastModified: now, changeFrequency: 'monthly', priority: 0.7 }),
    { url: `${SITE_URL}/vi/nha-hang-thai-little-saigon`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    ...pages('/order', { lastModified: now, changeFrequency: 'monthly', priority: 0.9 }),
    ...pages('/contact', { lastModified: now, changeFrequency: 'monthly', priority: 0.8 }),
    ...pages('/contact/reservation', { lastModified: now, changeFrequency: 'monthly', priority: 0.8 }),
    ...pages('/contact/catering', { lastModified: now, changeFrequency: 'monthly', priority: 0.6 }),
    ...pages('/contact/message', { lastModified: now, changeFrequency: 'monthly', priority: 0.5 }),
    ...pages('/play', { lastModified: now, changeFrequency: 'monthly', priority: 0.3 }),
  ];

  const dishPages: MetadataRoute.Sitemap = DISHES.flatMap((d) =>
    pages(`/menu/${d.slug}`, { lastModified: now, changeFrequency: 'monthly', priority: 0.6 }),
  );

  return [...staticPages, ...dishPages];
}
