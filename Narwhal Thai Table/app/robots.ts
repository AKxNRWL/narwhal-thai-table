import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * robots.txt (served at /robots.txt by Next.js).
 * Public pages are crawlable; owner/staff surfaces and APIs are not —
 * they're useless in search results and shouldn't leak into the index.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/stats', '/orders', '/cal', '/os', '/os.html'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
