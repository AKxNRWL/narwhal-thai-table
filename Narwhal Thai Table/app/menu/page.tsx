import type { Metadata } from 'next';
import Link from 'next/link';
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

/**
 * Plain, always-visible index of every dish.
 *
 * WHY THIS EXISTS — the tab panels above are the nice way to browse, but the
 * twelve non-active panels carry the `hidden` attribute. Crawlers reach links
 * inside hidden containers with far less weight, and as of 24 Aug 2026 a
 * `site:` check showed Google had indexed only ~8 of the 67 dish pages: all
 * the per-dish titles, MenuItem schema and stories were sitting on pages
 * Google had never fetched. This block is ordinary, always-rendered HTML —
 * one link per dish under a real heading per course — so every dish page has
 * a crawlable path from a page that IS indexed.
 *
 * It earns its place for people too: a returning guest who already knows
 * what they want gets the whole menu in one scan instead of hunting tabs.
 */
function DishIndex() {
  return (
    <nav className="dish-index" aria-labelledby="dish-index-title">
      <h2 id="dish-index-title">Every dish, <em>by course</em></h2>
      <p className="dish-index-note">
        Tap any name to read where the recipe comes from, what goes in it, and how to eat it well.
      </p>
      {CATEGORIES.map((cat) => {
        const items = DISHES.filter((d) => d.category === cat.id);
        if (!items.length) return null;
        return (
          <div className="dish-index-group" key={cat.id}>
            <h3>{getCategoryLabel(cat.id)}</h3>
            <ul>
              {items.map((d) => (
                <li key={d.slug}>
                  <Link href={`/menu/${d.slug}`}>
                    {d.name}
                    {d.thai && <span className="dix-thai">{d.thai}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
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
        {/* Weekday lunch specials (launched late Aug 2026) live on their own page —
            this strip is the pointer for the 11:45-on-a-Tuesday visitor. */}
        <Link href="/lunch" className="lunch-strip">
          <span className="lunch-strip-tag">Mon–Fri · 11:30–3</span>
          <span>Lunch specials from $11.99 — Pad Thai, curries, krapow &amp; more, with salad and a spring roll</span>
          <span className="lunch-strip-go">See lunch →</span>
        </Link>
        <MenuTabs photos={photos} />
        <DishIndex />
      </div>
    </section>
  );
}
