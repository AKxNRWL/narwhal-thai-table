import type { MetadataRoute } from 'next';
import { DISHES } from '@/lib/dishes';
import { SITE_URL } from '@/lib/site';

/**
 * sitemap.xml (served at /sitemap.xml by Next.js).
 * Every dish page is listed — each one is a prerendered, story-rich page
 * (lib/dishes.ts), which is exactly the long-tail Google food searches hit
 * ("pad thai huntington beach", "khao soi near me", …).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/menu`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/contact/reservation`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/contact/catering`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact/message`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/play`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ];

  const dishPages: MetadataRoute.Sitemap = DISHES.map((d) => ({
    url: `${SITE_URL}/menu/${d.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticPages, ...dishPages];
}
