import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_URL, RESTAURANT, DIRECTIONS_URL, GBP_MAP_URL } from '@/lib/site';

/**
 * /press — the press kit.
 *
 * WHY THIS PAGE EXISTS: local food writers, Patch editors and neighborhood
 * newsletters decide in about ninety seconds whether a restaurant is easy to
 * cover. This page removes every reason to move on: verified facts, a
 * copy-ready boilerplate, real story angles, photos cleared for editorial
 * use, and a human to email. It is also the page we point to in outreach and
 * the page AI assistants can cite for "who owns / when opened / what's new".
 *
 * Copy rules: every fact here is owner-confirmed and matches /about and the
 * JSON-LD. No invented quotes — quotes come from the owners by email.
 */

const TITLE = 'Press & Media Kit — Narwhal Thai Table, Huntington Beach';
const DESCRIPTION =
  'Press kit for Narwhal Thai Table in Huntington Beach, CA: fact sheet, boilerplate, story angles, photos cleared for editorial use, and how to reach the three sibling owners.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/press' },
  openGraph: {
    title: 'Press Kit · Narwhal Thai Table',
    description: DESCRIPTION,
    url: `${SITE_URL}/press`,
    type: 'website',
  },
};

const PHOTOS = [
  { src: '/images/room/storefront.jpg', alt: 'Narwhal Thai Table storefront on Beach Blvd, Huntington Beach, at dusk with string lights over the patio', caption: 'Storefront & patio, Beach Blvd' },
  { src: '/images/room/dining-room.jpg', alt: 'The dining room at Narwhal Thai Table, Huntington Beach', caption: 'The dining room' },
  { src: '/images/room/family-spread.jpg', alt: 'A family-style Thai spread at Narwhal Thai Table — wonton soup, crying tiger, orange chicken and morning glory', caption: 'Family-style spread' },
  { src: '/images/dishes/crab-fried-rice.jpg', alt: 'Super Crab Fried Rice at Narwhal Thai Table, Huntington Beach', caption: 'Super Crab Fried Rice' },
  { src: '/images/dishes/og-pad-thai.jpg', alt: 'OG Pad Thai wrapped in an egg net at Narwhal Thai Table, Huntington Beach', caption: 'OG Pad Thai' },
  { src: '/images/dishes/panang-curry.jpg', alt: 'Panang Curry at Narwhal Thai Table, Huntington Beach', caption: 'Panang Curry' },
  { src: '/images/dishes/fried-whole-pompano.jpg', alt: 'Fried Whole Pompano with chili sauce at Narwhal Thai Table, Huntington Beach', caption: 'Fried Whole Pompano' },
  { src: '/images/dishes/narwhal-chicken-wings.jpg', alt: 'Narwhal Chicken Wings at Narwhal Thai Table, Huntington Beach', caption: 'Narwhal Chicken Wings' },
];

const pressJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/press#page`,
      url: `${SITE_URL}/press`,
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: 'en-US',
      about: { '@id': `${SITE_URL}/#restaurant` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Press', item: `${SITE_URL}/press` },
      ],
    },
  ],
};

const FACTS: { k: string; v: React.ReactNode }[] = [
  { k: 'Restaurant', v: 'Narwhal Thai Table' },
  { k: 'Formerly', v: 'Thai Gulf Restaurant (same address; business purchased and renamed July 2026)' },
  { k: 'Owners', v: 'Aileen, Annie and AK — three siblings · Narwhal Hospitality LLC' },
  { k: 'Opened', v: 'Soft opening Sunday, August 9, 2026 · open every day since · grand opening date to be announced' },
  { k: 'Address', v: <><a href={DIRECTIONS_URL} target="_blank" rel="noopener">{RESTAURANT.address.street}, Huntington Beach, CA 92648</a> (Beach Blvd at Garfield Ave)</> },
  { k: 'Phone', v: <a href="tel:+17143786003">(714) 378-6003</a> },
  { k: 'Hours', v: 'Open every day · Mon–Fri 11:30 AM–10 PM · Sat–Sun 12–10 PM · Lunch specials Mon–Fri 11:30 AM–3 PM' },
  { k: 'Cuisine', v: 'Thai — curry pastes pounded by hand, wok noodles and fried rice cooked to order, whole fried fish, Isaan salads and grills; vegetarian options' },
  { k: 'Menu', v: <><Link href="/menu">67 dishes across 13 categories</Link> · most plates $12–20 · <Link href="/lunch">weekday lunch specials</Link> from $11.99</> },
  { k: 'Service', v: 'Dine-in, reservations, pickup, delivery, catering and private events · dog-friendly patio' },
  { k: 'Web & social', v: <><a href={SITE_URL}>narwhalthaihb.com</a> · <a href="https://www.instagram.com/narwhalthaitablehb/" target="_blank" rel="noopener noreferrer">Instagram @narwhalthaitablehb</a> · <a href="https://www.facebook.com/Narwhalthaitablehb" target="_blank" rel="noopener noreferrer">Facebook</a> · <a href={GBP_MAP_URL} target="_blank" rel="noopener noreferrer">Google Maps</a></> },
  { k: 'Press contact', v: <><a href={`mailto:${RESTAURANT.email}`}>{RESTAURANT.email}</a> — ask for Aileen, Annie or AK</> },
];

export default function PressPage() {
  return (
    <section className="menu-section press-page" style={{ paddingTop: 140, paddingBottom: 100 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pressJsonLd) }} />
      <div className="container">
        <div className="section-head">
          <span className="label">Press &amp; Media</span>
          <h1>For writers, editors, and <em>anyone on a deadline</em>.</h1>
          <p>
            Everything you need to cover Narwhal Thai Table, checked by the owners: the facts, a
            boilerplate you can paste, story angles that are actually true, and photos cleared for
            editorial use. For quotes, interviews or a tasting, email{' '}
            <a href={`mailto:${RESTAURANT.email}`}>{RESTAURANT.email}</a> — one of the three of us reads it.
          </p>
        </div>

        <div className="fact-list" aria-labelledby="press-facts-title" style={{ marginTop: 0 }}>
          <h2 id="press-facts-title">Fact <em>sheet</em></h2>
          <dl>
            {FACTS.map((f) => (
              <div className="fact-row" key={f.k}>
                <dt>{f.k}</dt>
                <dd>{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="guide-prose" style={{ marginTop: 56 }}>
          <h2>Boilerplate <em>(copy-ready)</em></h2>
          <p>
            <strong style={{ color: 'var(--off-white)' }}>Short.</strong> Narwhal Thai Table is a
            family-run Thai restaurant at 19072 Beach Blvd in Huntington Beach, California. Three
            siblings — Aileen, Annie and AK — bought the former Thai Gulf Restaurant in July 2026,
            renamed it, and opened on August 9, 2026, cooking Thai food the way they grew up eating
            it: curry pastes pounded by hand, wok dishes made to order, and weekday lunch specials from
            $11.99.
          </p>
          <p>
            <strong style={{ color: 'var(--off-white)' }}>Long.</strong> Narwhal Thai Table is a
            family-run Thai restaurant on Beach Boulevard in Huntington Beach, California, opened in
            August 2026 by three siblings, Aileen, Annie and AK, with thirty years of restaurant life
            between them. The family bought the neighborhood&apos;s longtime Thai Gulf Restaurant in
            July 2026 and rebuilt it as their own: curry pastes pounded from whole chilies, garlic,
            lemongrass and galangal in a granite mortar; dry spices toasted and ground in small
            batches; wok noodles, fried rice and curries cooked only when ordered. The 67-dish menu
            runs from Bangkok street plates and an Isaan corner of som tum, larb and crying tiger to
            whole fried pompano and Super Crab Fried Rice, with vegetarian options and weekday lunch
            specials from $11.99. The small dining room is joined by a dog-friendly patio under string
            lights, a short wine list, and a dessert list that starts with mango sticky rice. Open every
            day. narwhalthaihb.com · (714) 378-6003.
          </p>

          <h2>Story <em>angles</em></h2>
          <ul>
            <li>
              <strong>The succession story.</strong> A longtime neighborhood Thai restaurant changes
              hands to a Thai family who kept the address and the welcome, and changed everything in
              the kitchen. What it takes to inherit a room full of regulars and win them over again.
            </li>
            <li>
              <strong>Three siblings, one table.</strong> A family business in the most literal sense —
              who does what, what they argue about, and why they opened in Huntington Beach.
            </li>
            <li>
              <strong>The mortar, not the tub.</strong> Curry pastes pounded by hand in a granite mortar
              in 2026 — why it still matters, how you taste the difference, and what it costs a small
              kitchen to keep doing it.
            </li>
            <li>
              <strong>Mango sticky rice, done properly.</strong> Why the rice matters more than the
              mango — warm coconut sticky rice, a whisper of salt, ripe fruit — and how a small kitchen
              keeps it right every day.
            </li>
            <li>
              <strong>Lunch on Beach Boulevard.</strong> Weekday lunch specials from $11.99 with a
              salad, a spring roll and a cup of soup — a made-to-order alternative to the lunch line.
            </li>
            <li>
              <strong>Dogs on the patio.</strong> A dog-friendly patio under string lights, a short
              drive from Dog Beach and Central Park — the Huntington Beach version of a Thai family dinner.
            </li>
          </ul>

          <h2>Visiting for a <em>story or a tasting</em></h2>
          <p>
            Email <a href={`mailto:${RESTAURANT.email}`}>{RESTAURANT.email}</a> with your outlet and
            what you&apos;re working on. We&apos;re glad to host a tasting, walk you through the mortar
            and the wok, and put you on the phone with any of the three of us. Weekday afternoons
            between lunch and dinner are usually the quietest time to shoot the room.
          </p>
        </div>

        <div className="section-head" style={{ marginTop: 80 }}>
          <h2>Photos cleared <em>for editorial use</em></h2>
          <p>
            These images may be used in coverage of Narwhal Thai Table with the credit
            &ldquo;Courtesy Narwhal Thai Table&rdquo;. They&apos;re web-sized — email us for full-resolution
            files, video clips, or the logo.
          </p>
        </div>

        <ul className="press-grid" aria-label="Press photos">
          {PHOTOS.map((p) => (
            <li key={p.src} className="press-photo">
              <a href={p.src} target="_blank" rel="noopener">
                <img src={p.src} alt={p.alt} loading="lazy" />
              </a>
              <div className="press-photo-meta">
                <span>{p.caption}</span>
                <a href={p.src} download>Download</a>
              </div>
            </li>
          ))}
        </ul>

        <div className="guide-prose" style={{ marginTop: 48 }}>
          <div className="guide-cta">
            <a href={`mailto:${RESTAURANT.email}?subject=Press%20inquiry%20%E2%80%94%20Narwhal%20Thai%20Table`} className="btn-primary">Email the owners</a>
            <Link href="/about" className="btn-secondary">Read the full story</Link>
            <Link href="/menu" className="btn-secondary">Browse the menu</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
