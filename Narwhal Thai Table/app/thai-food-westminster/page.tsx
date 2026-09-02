import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_URL, ORDER_ONLINE_URL, DIRECTIONS_URL, RESTAURANT } from '@/lib/site';

/**
 * /thai-food-westminster — for neighbors up Beach Boulevard.
 *
 * WHY THIS PAGE EXISTS: "thai food westminster" / "thai restaurant
 * westminster ca" are live searches (and live keywords in our ads) from a
 * city five miles up the same road we sit on. Westminster already eats
 * extremely well — Little Saigon is right there — so this page doesn't
 * pretend otherwise: it tells a Westminster guest exactly how to get here,
 * what's different about a Thai table, and what to order first.
 *
 * Distances/times verified on Google Maps (1 Sep 2026): Westminster city
 * center → 19072 Beach Blvd = 5.2 miles, ~12 min straight down Beach Blvd
 * (State Route 39); OCTA Route 29 runs Beach Blvd (~19 min).
 */

const TITLE = 'Thai Food near Westminster, CA — Straight Down Beach Blvd to Narwhal Thai Table';
const DESCRIPTION =
  'Thai food near Westminster, CA: Narwhal Thai Table is 5.2 miles straight down Beach Blvd — about 12 minutes by car, or OCTA Route 29. Hand-pounded curries, Isaan salads and grills, boat noodles, weekday lunch specials from $11.99, pickup and delivery where available.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/thai-food-westminster' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/thai-food-westminster`,
    type: 'article',
  },
};

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Thai Food near Westminster', item: `${SITE_URL}/thai-food-westminster` },
  ],
};

function Dish({ slug, children }: { slug: string; children: React.ReactNode }) {
  return <Link href={`/menu/${slug}`}>{children}</Link>;
}

export default function ThaiFoodWestminsterPage() {
  return (
    <section className="menu-section" style={{ paddingTop: 140, paddingBottom: 100 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div className="container">
        <div className="section-head">
          <span className="label">Westminster neighbors</span>
          <h1>Thai food near Westminster — <em>one road, twelve minutes</em>.</h1>
          <p>
            You already know the road. Beach Boulevard runs straight from Westminster into Huntington
            Beach, and we&apos;re on it — at the corner of Garfield, 5.2 miles south of the Westminster
            city center. About twelve minutes by car, no freeway, one turn at the end.
          </p>
        </div>

        <div className="guide-prose">
          <h2>Getting here from <em>Westminster</em></h2>
          <p>
            Head south on <strong style={{ color: 'var(--off-white)' }}>Beach Blvd (State Route 39)</strong>{' '}
            past Bolsa, Warner and Slater to Garfield Ave — we&apos;re right at the corner, at{' '}
            <a href={DIRECTIONS_URL} target="_blank" rel="noopener">{RESTAURANT.address.street}</a>,{' '}
            with free parking in the plaza lot out front. No car tonight? OCTA Route 29 runs the length
            of Beach Blvd and stops near Garfield — about nineteen minutes from central Westminster.
          </p>

          <h2>Westminster eats well. <em>Here&apos;s what a Thai table adds.</em></h2>
          <p>
            Little Saigon is a few minutes from your door, so you already know fresh herbs, deep broths
            and food that isn&apos;t shy. Thai cooking shares the herbs and swaps the accent: galangal
            where you&apos;d expect ginger, makrut lime leaf, holy basil, and curry pastes pounded from
            dried chilies, garlic and lemongrass in a granite mortar instead of poured from a tub.
            Come for the things that are hardest to find done right —{' '}
            <Dish slug="thai-boat-noodles">Thai boat noodles</Dish> with a dark, hours-deep broth, an
            Isaan corner of <Dish slug="som-tum-thai">som tum</Dish>, <Dish slug="larb">larb</Dish> and{' '}
            <Dish slug="crying-tiger">crying tiger</Dish>, and a <Dish slug="green-curry">green curry</Dish>{' '}
            that smells like herbs before it tastes like heat.
          </p>

          <h2>Lunch on the way — <em>Monday to Friday until 3</em></h2>
          <p>
            Our <Link href="/lunch">lunch specials</Link> start at $11.99 and come with a fresh salad and a
            crispy spring roll, plus a cup of soup when you dine in: <Dish slug="og-pad-thai">Pad
            Thai</Dish>, <Dish slug="pad-see-ew">Pad See Ew</Dish>, <Dish slug="pad-kee-mao">Pad Kee
            Mao</Dish>, <Dish slug="krapow-over-rice">Krapow</Dish>,{' '}
            <Dish slug="garlic-pepper-over-rice">Garlic &amp; Pepper</Dish>,{' '}
            <Dish slug="cashew-nut">Cashew</Dish>, <Dish slug="mixed-vegetables">Mixed Vegetables</Dish>, or a{' '}
            <Dish slug="yellow-curry">Yellow</Dish> or <Dish slug="panang-curry">Panang</Dish> curry. Call <a href="tel:+17143786003">(714) 378-6003</a>{' '}
            as you leave Westminster and it&apos;ll be waiting when you park.
          </p>

          <h2>Pickup, delivery, and <em>feeding a crowd</em></h2>
          <p>
            Twelve minutes up Beach is an easy pickup run — curries, fried rice and the{' '}
            <Dish slug="narwhal-chicken-wings">Narwhal Chicken Wings</Dish> all travel well, and
            everything on the menu can be{' '}
            {ORDER_ONLINE_URL ? <a href={ORDER_ONLINE_URL} target="_blank" rel="noopener">ordered online for pickup</a> : 'ordered for pickup'}.
            Delivery runs through DoorDash where it&apos;s available at your address; details are on the{' '}
            <Link href="/order">order page</Link>. For office lunches, parties and family-style tables
            in Westminster, we <Link href="/contact/catering">cater</Link> — and our room can be booked
            for a private buyout.
          </p>

          <h2>Stay for <em>dinner</em></h2>
          <p>
            The room is small and warm, the patio is dog-friendly and strung with lights, there&apos;s a
            short wine list, and every dine-in meal ends with ice cream on the house — the way Thai
            family dinners end. Order a <Dish slug="fried-whole-pompano">whole fried pompano</Dish> for
            the table and you&apos;ll understand the drive. <Link href="/contact/reservation">Save a
            seat</Link>, or walk in any day.
          </p>

          <div className="guide-cta">
            <Link href="/lunch" className="btn-primary">See lunch specials</Link>
            <a href={DIRECTIONS_URL} target="_blank" rel="noopener" className="btn-secondary">Directions from Westminster</a>
            <Link href="/menu" className="btn-secondary">Browse all 67 dishes</Link>
          </div>

          <p style={{ marginTop: 28, fontSize: 15 }}>
            Also nearby: <Link href="/thai-food-fountain-valley">Thai food near Fountain Valley</Link> · our{' '}
            <Link href="/thai-food-orange-county">field guide to Thai food in Orange County</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
