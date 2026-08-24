import type { Metadata } from 'next';
import MenuTabs from '@/components/MenuTabs';
import { DISHES } from '@/lib/dishes';
import { getDishImage } from '@/lib/media';
import { CATEGORIES, getCategoryLabel } from '@/lib/categories';
import { SITE_URL, RESTAURANT_ID } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Menu',
  description: 'The full Narwhal Thai Table menu — thirteen categories of royal-court Thai dishes. Tap any plate for its story, ingredients, and how to eat it.',
  alternates: { canonical: '/menu' },
  openGraph: {
    title: 'Menu · Narwhal Thai Table',
    description: 'Thirteen categories of royal-court Thai dishes, made by hand.',
  },
};

/** Parse "$12" / "$12.50" → 12 / 12.50; undefined for "MKT"/blank so we omit Offer. */
function priceNumber(p?: string): number | undefined {
  if (!p) return undefined;
  const m = p.replace(/,/g, '').match(/\d+(\.\d+)?/);
  return m ? Number(m[0]) : undefined;
}

/** schema.org Menu graph built from the real dish data — enables menu rich results. */
function menuJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    '@id': `${SITE_URL}/menu#menu`,
    name: 'Narwhal Thai Table Menu',
    url: `${SITE_URL}/menu`,
    inLanguage: 'en-US',
    // Ties the menu to the single Restaurant entity declared in app/layout.tsx.
    provider: { '@id': RESTAURANT_ID },
    hasMenuSection: CATEGORIES.map((cat) => {
      const items = DISHES.filter((d) => d.category === cat.id);
      // "Sides & Protein" is a rendered panel, not dish records — describe it
      // explicitly so the markup matches all 13 visible categories.
      if (!items.length) {
        return cat.id === 'sides'
          ? {
              '@type': 'MenuSection',
              name: getCategoryLabel(cat.id),
              description:
                'Choose your protein (chicken, pork, tofu, beef, shrimp, seafood) and sides — jasmine rice, brown rice, sticky rice, fried egg, omelet.',
              url: `${SITE_URL}/menu`,
            }
          : null;
      }
      return {
        '@type': 'MenuSection',
        name: getCategoryLabel(cat.id),
        hasMenuItem: items.map((d) => {
          const price = priceNumber(d.price);
          return {
            '@type': 'MenuItem',
            name: d.name,
            ...(d.description ? { description: d.description } : {}),
            url: `${SITE_URL}/menu/${d.slug}`,
            ...(price !== undefined
              ? { offers: { '@type': 'Offer', price, priceCurrency: 'USD' } }
              : {}),
          };
        }),
      };
    }).filter(Boolean),
  };
}

export default function MenuPage() {
  // Photo lookup built server-side at build time (getDishImage checks the
  // filesystem, so the client-side MenuTabs can't call it directly).
  const photos: Record<string, string> = {};
  for (const d of DISHES) {
    const src = d.image?.src ?? getDishImage(d.slug);
    if (src) photos[d.slug] = src;
  }
  return (
    <section className="menu-section" style={{ paddingTop: 140 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(menuJsonLd()) }}
      />
      <div className="container">
        <div className="section-head">
          <span className="label">The Menu</span>
          <h1>The full menu — <em>tap a plate to hear its story</em>.</h1>
          <p>
            Thirteen categories, cooked to order from the first bite to the last sweet one. ★ marks the house signatures. Every plate carries its own story — the recipe&apos;s history, how to eat it well, and what belongs beside it.
          </p>
        </div>
        <MenuTabs photos={photos} />
      </div>
    </section>
  );
}
