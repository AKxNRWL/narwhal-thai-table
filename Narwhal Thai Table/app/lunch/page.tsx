import Link from 'next/link';
import type { Metadata } from 'next';
import MediaFrame from '@/components/MediaFrame';
import { DISHES } from '@/lib/dishes';
import { getDishImage } from '@/lib/media';
import { LUNCH_PHOTO_DIR } from '@/lib/lunchPhotos';
import { SITE_URL, RESTAURANT_ID, DIRECTIONS_URL, ORDER_ONLINE_URL, RESTAURANT } from '@/lib/site';

/**
 * /lunch — weekday Lunch Specials.
 *
 * WHY THIS PAGE EXISTS: the team launched Lunch Specials (Mon–Fri 11:30–3,
 * from $11.99) on the Google Business Profile on 28 Aug 2026, but nothing on
 * the website or in the ads mentioned lunch at all — and "thai lunch special
 * near me" / "thai lunch huntington beach" are exactly the searches a
 * weekday office crowd types at 11:45. This page is the landing spot for
 * those searches and for the lunch keywords in Google Ads.
 *
 * FACTS ONLY from the owner's own GBP post (verified 1 Sep 2026) + owner
 * confirmation 2 Sep 2026 that Mixed Vegetables is a lunch plate too (nine
 * plates total; lib/lunchPhotos.ts LUNCH.plates is the shared list), the
 * hours, "from $11.99", salad + spring roll with every lunch, cup of soup
 * when dining in. Per-plate prices are not published here until the owner
 * sends them — never guess a price.
 */

const LUNCH_SLUGS = [
  'og-pad-thai',
  'pad-see-ew',
  'pad-kee-mao',
  'krapow-over-rice',
  'garlic-pepper-over-rice',
  'cashew-nut',
  'mixed-vegetables',
  'yellow-curry',
  'panang-curry',
] as const;

/* Real lunch-set plates (salad + spring roll on the plate), shot 22 Aug 2026 —
   lib/lunchPhotos.ts. Pad See Ew has no lunch shot yet → falls back to the
   regular dish photo. */
const LUNCH_PLATE_PHOTO: Record<string, string> = {
  'og-pad-thai': 'pad-thai.jpg',
  'pad-kee-mao': 'pad-kee-mao.jpg',
  'krapow-over-rice': 'krapow.jpg',
  'garlic-pepper-over-rice': 'garlic-pepper.jpg',
  'cashew-nut': 'cashew-nut.jpg',
  'mixed-vegetables': 'mixed-veg.jpg',
  'yellow-curry': 'yellow-curry.jpg',
  'panang-curry': 'panang-curry.jpg',
};
const lunchPhoto = (slug: string): string | undefined =>
  LUNCH_PLATE_PHOTO[slug] ? `${LUNCH_PHOTO_DIR}/${LUNCH_PLATE_PHOTO[slug]}` : undefined;

const TITLE = 'Thai Lunch Specials in Huntington Beach — Mon–Fri from $11.99 · Narwhal Thai Table';
const DESCRIPTION =
  'Weekday Thai lunch specials on Beach Blvd: Pad Thai, Pad See Ew, Pad Kee Mao, Krapow, Garlic & Pepper, Cashew, Mixed Vegetables, or a Yellow or Panang curry from $11.99 — with a fresh salad and a crispy spring roll, plus a cup of soup when you dine in. Monday–Friday, 11:30 AM–3:00 PM.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/lunch' },
  openGraph: {
    title: 'Lunch Specials · Narwhal Thai Table',
    description: 'Mon–Fri 11:30–3 · from $11.99 · salad + spring roll with every lunch, soup when you dine in.',
    url: `${SITE_URL}/lunch`,
    type: 'website',
  },
};

function lunchJsonLd() {
  const items = LUNCH_SLUGS.map((slug) => DISHES.find((d) => d.slug === slug)).filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Menu',
        '@id': `${SITE_URL}/lunch#menu`,
        name: 'Narwhal Thai Table Lunch Specials',
        url: `${SITE_URL}/lunch`,
        inLanguage: 'en-US',
        description:
          'Weekday lunch specials, Monday–Friday 11:30 AM–3:00 PM, from $11.99. Every lunch comes with a fresh salad and a crispy spring roll, plus a cup of soup when you dine in.',
        provider: { '@id': RESTAURANT_ID },
        hasMenuSection: {
          '@type': 'MenuSection',
          name: 'Lunch Specials (Monday–Friday, 11:30 AM–3:00 PM)',
          description:
            'Pick one plate. Served with a fresh salad and a crispy spring roll; a cup of soup is included when you dine in.',
          offers: {
            '@type': 'AggregateOffer',
            lowPrice: '11.99',
            priceCurrency: 'USD',
            offerCount: items.length,
            availabilityStarts: '11:30:00',
            availabilityEnds: '15:00:00',
          },
          hasMenuItem: items.map((d) => ({
            '@type': 'MenuItem',
            name: `Lunch Special — ${d!.name}`,
            ...(d!.description ? { description: d!.description } : {}),
            url: `${SITE_URL}/menu/${d!.slug}`,
            ...(lunchPhoto(d!.slug) ? { image: `${SITE_URL}${lunchPhoto(d!.slug)}` } : {}),
            offers: {
              '@type': 'Offer',
              priceCurrency: 'USD',
              priceSpecification: { '@type': 'PriceSpecification', minPrice: 11.99, priceCurrency: 'USD' },
              availabilityStarts: '11:30:00',
              availabilityEnds: '15:00:00',
            },
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Lunch Specials', item: `${SITE_URL}/lunch` },
        ],
      },
    ],
  };
}

export default function LunchPage() {
  const plates = LUNCH_SLUGS.map((slug) => DISHES.find((d) => d.slug === slug)).filter(Boolean);

  return (
    <section className="menu-section lunch-page" style={{ paddingTop: 140 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(lunchJsonLd()) }} />
      <div className="container">
        <div className="section-head">
          <span className="label">Lunch Specials · Mon–Fri</span>
          <h1>Weekday lunch, <em>cooked to order</em> — from $11.99.</h1>
          <p>
            Monday through Friday, 11:30 AM to 3:00 PM. Pick a plate below and it comes with a fresh
            salad and a crispy spring roll — plus a cup of soup when you dine in. Quick, cozy, and
            right on Beach Boulevard: the lunch break you actually look forward to.
          </p>
        </div>

        <p className="order-hours">
          Mon–Fri 11:30 AM – 3:00 PM · dine in or take it to go ·{' '}
          <a href={DIRECTIONS_URL} target="_blank" rel="noopener">
            {RESTAURANT.address.street}, {RESTAURANT.address.city} →
          </a>
        </p>

        <div className="lunch-tray" aria-label="What comes with every lunch special">
          <div className="lunch-tray-item">
            <span className="lunch-tray-num">1</span>
            <p><strong>Your plate.</strong> Nine choices — wok noodles, a rice plate, stir-fried vegetables, or a curry — each one cooked when you order it, at the spice level you ask for.</p>
          </div>
          <div className="lunch-tray-item">
            <span className="lunch-tray-num">2</span>
            <p><strong>Salad and a spring roll.</strong> A fresh salad and a crispy spring roll come with every lunch, dine-in or to-go.</p>
          </div>
          <div className="lunch-tray-item">
            <span className="lunch-tray-num">3</span>
            <p><strong>Soup, when you stay.</strong> Dine in and a cup of soup is included — and, like every dine-in meal here, lunch ends with ice cream on the house.</p>
          </div>
        </div>

        <div className="section-head" style={{ marginTop: 72 }}>
          <h2>Pick your <em>plate</em>.</h2>
          <p>Tap a plate to read its story. Weekday lunch specials start at $11.99 — ask us for the price of the plate you&apos;re eyeing.</p>
        </div>

        <div className="sig-grid">
          {plates.map((d) => {
            const lunchShot = lunchPhoto(d!.slug);
            const photo = lunchShot ?? d!.image?.src ?? getDishImage(d!.slug) ?? undefined;
            return (
              <Link key={d!.slug} href={`/menu/${d!.slug}`} className="sig-card">
                <MediaFrame
                  ratio="4/3"
                  src={photo}
                  alt={`${d!.name}${d!.thai ? ` (${d!.thai})` : ''} — weekday lunch special${lunchShot ? ' with salad and a spring roll' : ''} at Narwhal Thai Table, Huntington Beach`}
                  sizes="(max-width: 600px) 100vw, (max-width: 980px) 50vw, 33vw"
                  placeholder={
                    <>
                      <svg className="sig-media-mark" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true" focusable="false">
                        <path d="M17 7v12a4 4 0 01-8 0V7M13 7v34" strokeLinecap="round" />
                        <path d="M34 7c-3 0-5 4-5 11s2 7 5 7 5 0 5-7-2-11-5-11zM34 25v16" strokeLinecap="round" />
                      </svg>
                      <span className="sig-media-th">{d!.thai}</span>
                    </>
                  }
                />
                <div className="sig-body">
                  <div className="sig-head">
                    <div className="sig-name">{d!.name}<span className="thai">{d!.thai}</span></div>
                    <div className="sig-price">from $11.99</div>
                  </div>
                  <p className="sig-desc">{d!.description}</p>
                  <div className="sig-foot">
                    <span className="sig-tag">Lunch special</span>
                    {d!.spicy && <span className="sig-tag spicy">Spicy</span>}
                    <span className="sig-read">Read the story</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="guide-prose" style={{ marginTop: 64 }}>
          <h2>Good to know at <em>lunch</em></h2>
          <p>
            <strong style={{ color: 'var(--off-white)' }}>Weekdays only.</strong> Lunch specials run
            Monday–Friday until 3 PM. On weekends, and after 3 on weekdays, the{' '}
            <Link href="/menu">full menu</Link> is served all day.
          </p>
          <p>
            <strong style={{ color: 'var(--off-white)' }}>Taking it back to the office?</strong> Call{' '}
            <a href="tel:+17143786003">(714) 378-6003</a> and it&apos;ll be ready when you pull up —
            there&apos;s free parking in the plaza lot right outside. Everything on the regular menu
            can also be ordered online for{' '}
            {ORDER_ONLINE_URL ? <a href={ORDER_ONLINE_URL} target="_blank" rel="noopener">pickup</a> : 'pickup'}.
          </p>
          <p>
            <strong style={{ color: 'var(--off-white)' }}>Spice and swaps.</strong> Every plate is cooked
            when you order it, so you set the heat — mild to Thai hot — and most of these plates can be
            made with tofu or vegetables instead of meat. Just tell us when you order, and always mention
            an allergy.
          </p>
          <p>
            <strong style={{ color: 'var(--off-white)' }}>Coming from Fountain Valley or Westminster?</strong>{' '}
            We&apos;re at Beach Blvd &amp; Garfield — about 8 minutes from central{' '}
            <Link href="/thai-food-fountain-valley">Fountain Valley</Link> and 12 minutes straight down
            Beach from <Link href="/thai-food-westminster">Westminster</Link>.
          </p>

          <div className="guide-cta">
            <a href="tel:+17143786003" className="btn-primary">Call in a lunch order</a>
            <a href={DIRECTIONS_URL} target="_blank" rel="noopener" className="btn-secondary">Get directions</a>
            <Link href="/menu" className="btn-secondary">See the full menu</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
