import Link from 'next/link';
import type { Metadata } from 'next';
import MediaFrame from '@/components/MediaFrame';
import { SITE_URL, RESTAURANT_ID, DIRECTIONS_URL, RESTAURANT } from '@/lib/site';

/**
 * /about — the entity page.
 *
 * WHY THIS PAGE EXISTS: search engines and AI assistants build their picture
 * of a restaurant from a few plain, repeated facts — who owns it, since when,
 * what it was before, where it is, what it cooks. Ours were scattered across
 * the homepage story, the contact FAQ and the JSON-LD. This page puts the
 * whole story and every fact in one crawlable place, in the words the family
 * would use at the door, and links out to the pages that prove each claim.
 *
 * Copy rules: owner-confirmed facts only (acquisition + rename July 2026, soft
 * opening 9 Aug 2026, three siblings, payments, patio). No free-ice-cream claims
 * anywhere (the soft-opening treat ended 2 Sep 2026 — owner's instruction). No sourcing
 * claims, no chef details before the grand-opening reveal (SHOW_CHEF).
 */

const TITLE = 'About Narwhal Thai Table — Three Siblings, One Table in Huntington Beach';
const DESCRIPTION =
  'The story of Narwhal Thai Table: three siblings — Aileen, Annie and AK — who bought Huntington Beach’s Thai Gulf Restaurant in July 2026, renamed it, and cook Thai the way they grew up eating it. The facts, the timeline, and what to expect at the table.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'Our Story · Narwhal Thai Table',
    description: DESCRIPTION,
    url: `${SITE_URL}/about`,
    type: 'article',
    images: [{ url: '/images/room/family-spread.jpg', width: 1600, height: 1000, alt: 'A family-style spread at Narwhal Thai Table' }],
  },
};

const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'AboutPage',
      '@id': `${SITE_URL}/about#page`,
      url: `${SITE_URL}/about`,
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: 'en-US',
      about: { '@id': RESTAURANT_ID },
      mainEntity: { '@id': RESTAURANT_ID },
    },
    {
      // Same @id as the Restaurant node in app/layout.tsx — JSON-LD merges the
      // two, so these founder facts attach to the ONE restaurant entity.
      '@type': 'Restaurant',
      '@id': RESTAURANT_ID,
      name: 'Narwhal Thai Table',
      founder: [
        { '@type': 'Person', name: 'Aileen', jobTitle: 'Co-owner' },
        { '@type': 'Person', name: 'Annie', jobTitle: 'Co-owner' },
        { '@type': 'Person', name: 'AK', jobTitle: 'Co-owner' },
      ],
      foundingDate: '2026-07',
      foundingLocation: { '@type': 'Place', name: 'Huntington Beach, California' },
      slogan: 'Come as a neighbor, leave as family.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'About', item: `${SITE_URL}/about` },
      ],
    },
  ],
};

const FACTS: { k: string; v: React.ReactNode }[] = [
  { k: 'Name', v: <>Narwhal Thai Table (people also say “Narwhal Thai” or “Narwhal HB”)</> },
  { k: 'Formerly', v: <>Thai Gulf Restaurant — same address; our family bought the business and renamed it in July 2026</> },
  { k: 'Owned by', v: <>Three siblings — Aileen, Annie and AK — under Narwhal Hospitality LLC</> },
  { k: 'Opened', v: <>Soft opening Sunday, August 9, 2026 · open every day since · grand opening to come</> },
  { k: 'Where', v: <><a href={DIRECTIONS_URL} target="_blank" rel="noopener">{RESTAURANT.address.street}, Huntington Beach, CA 92648</a> — Beach Blvd at Garfield Ave, free parking in the plaza lot</> },
  { k: 'Hours', v: <>Open every day · Mon–Fri 11:30 AM–10 PM · Sat–Sun 12–10 PM · <Link href="/lunch">lunch specials</Link> Mon–Fri 11:30–3</> },
  { k: 'What we cook', v: <>Thai food the way we grew up eating it — curry pastes pounded in a granite mortar, wok noodles and fried rice made to order, whole fried fish, an Isaan corner of som tum, larb and crying tiger. <Link href="/menu">67 dishes across 13 categories</Link>.</> },
  { k: 'Price', v: <>Most plates $12–20, seafood plates up to $35 · <Link href="/lunch">lunch specials</Link> from $11.99</> },
  { k: 'The room', v: <>A small dining room and a dog-friendly patio under string lights · a short wine list by the glass · mango sticky rice for the table</> },
  { k: 'Ways to eat', v: <>Dine in · <Link href="/contact/reservation">reservations</Link> · <Link href="/order">pickup and delivery</Link> · <Link href="/contact/catering">catering and private events</Link></> },
  { k: 'Payment', v: <>Credit and debit cards, Apple Pay and Google Pay (and cash)</> },
  { k: 'Languages', v: <>English and Thai</> },
  { k: 'Reach us', v: <><a href="tel:+17143786003">(714) 378-6003</a> · <a href={`mailto:${RESTAURANT.email}`}>{RESTAURANT.email}</a> · <Link href="/press">press kit</Link></> },
];

export default function AboutPage() {
  return (
    <section className="menu-section about-page" style={{ paddingTop: 140, paddingBottom: 100 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }} />
      <div className="container">
        <div className="section-head">
          <span className="label">Our Story</span>
          <h1>Three siblings. <em>One table.</em></h1>
          <p>
            We are Aileen, Annie and AK — a Thai family with thirty years of restaurant life between
            us, and one small dining room on Beach Boulevard where we cook the food we grew up eating.
          </p>
        </div>

        <div className="about-page-media">
          <MediaFrame
            ratio="16/10"
            src="/images/room/family-spread.jpg"
            alt="A family-style spread at Narwhal Thai Table in Huntington Beach — wonton soup, crying tiger, orange chicken and morning glory"
            sizes="(max-width: 900px) 100vw, 60vw"
          />
          {/* 16/15 next to a 16/10 frame at 1.5fr:1fr — same rendered height. */}
          <MediaFrame
            ratio="16/15"
            src="/images/room/storefront.jpg"
            alt="The Narwhal Thai Table storefront on Beach Blvd at dusk, string lights over the patio"
            sizes="(max-width: 900px) 100vw, 40vw"
          />
        </div>

        <div className="guide-prose">
          <h2>How this table <em>came to be</em></h2>
          <p>
            For years, the corner of Beach Boulevard and Garfield had a neighborhood Thai restaurant
            called Thai Gulf. In July 2026 our family bought the business, hung a new name on the
            door, and started cooking the way our own family does: curry pastes pounded from whole
            chilies, garlic, lemongrass and galangal in a granite mortar; dry spices toasted and ground
            here in small batches; every plate started only when someone has ordered it.
          </p>
          <p>
            We opened the doors softly on Sunday, August 9, 2026, and have been open every day since.
            If you came here looking for Thai Gulf — welcome back. Same address, same warm little room,
            new name, new habits. The table is still here.
          </p>

          <h2>What we <em>stand on</em></h2>
          <ul>
            <li>
              <strong>Fresh, every plate.</strong> The wok isn&apos;t lit until your order reaches the
              kitchen. Nothing waits under a heat lamp.
            </li>
            <li>
              <strong>Made by hand.</strong> Lemongrass, galangal, makrut lime, coriander root and
              bird&apos;s-eye chilies, cut fresh; curry pastes that start whole in a mortar.
            </li>
            <li>
              <strong>Cooked for you.</strong> You set the heat, from mild to Thai hot. Many dishes can
              be made vegetarian. Tell us about allergies and we&apos;ll steer you honestly.
            </li>
            <li>
              <strong>From our family.</strong> Every message to{' '}
              <a href={`mailto:${RESTAURANT.email}`}>{RESTAURANT.email}</a> reaches one of us three,
              and when you leave a review, a sibling answers it — not a service.
            </li>
          </ul>

          <h2>What to <em>order</em></h2>
          <p>
            Start with the <Link href="/menu/narwhal-chicken-wings">Narwhal Chicken Wings</Link>, then
            share a curry and a wok plate: <Link href="/menu/panang-curry">Panang Curry</Link> and{' '}
            <Link href="/menu/og-pad-thai">OG Pad Thai</Link> are the ones people ask about most.
            Seafood lovers order the <Link href="/menu/crab-fried-rice">Super Crab Fried Rice</Link>{' '}
            or a <Link href="/menu/fried-whole-pompano">whole fried pompano</Link> for the table. If
            you miss home, head for the Isaan corner —{' '}
            <Link href="/menu/som-tum-thai">som tum</Link>, <Link href="/menu/larb">larb</Link>,{' '}
            <Link href="/menu/crying-tiger">crying tiger</Link> — or a bowl of{' '}
            <Link href="/menu/thai-boat-noodles">boat noodles</Link>. Weekdays until 3, the{' '}
            <Link href="/lunch">lunch specials</Link> start at $11.99.
          </p>
        </div>

        <div className="fact-list" aria-labelledby="fact-list-title">
          <h2 id="fact-list-title">The short version, <em>for the record</em></h2>
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
          <h2>Timeline</h2>
          <ul>
            <li><strong>Before 2026 —</strong> Thai Gulf Restaurant serves the neighborhood at 19072 Beach Blvd.</li>
            <li><strong>July 2026 —</strong> Our family buys the business and renames it Narwhal Thai Table. New recipes, new kitchen habits, same address.</li>
            <li><strong>Sunday, August 9, 2026 —</strong> Soft opening. Open every day since.</li>
            <li><strong>Late August 2026 —</strong> Weekday <Link href="/lunch">lunch specials</Link> begin, Monday–Friday from $11.99.</li>
            <li><strong>Coming up —</strong> The grand opening, with the chef&apos;s introduction. Follow{' '}
              <a href="https://www.instagram.com/narwhalthaitablehb/" target="_blank" rel="noopener noreferrer">@narwhalthaitablehb</a> so you don&apos;t miss it.</li>
          </ul>

          <div className="guide-cta">
            <Link href="/menu" className="btn-primary">See the menu</Link>
            <Link href="/contact/reservation" className="btn-secondary">Save a seat</Link>
            <a href={DIRECTIONS_URL} target="_blank" rel="noopener" className="btn-secondary">Get directions</a>
          </div>
        </div>
      </div>
    </section>
  );
}
