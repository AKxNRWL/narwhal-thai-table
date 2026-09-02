import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_URL, ORDER_ONLINE_URL, DIRECTIONS_URL, RESTAURANT } from '@/lib/site';

/**
 * /thai-food-fountain-valley — for neighbors one city east.
 *
 * WHY THIS PAGE EXISTS: Fountain Valley (92708) is our best-converting ad
 * zone after our own zip, and "thai food fountain valley" / "thai restaurant
 * fountain valley" are real searches with no honest answer from us. This is
 * not a doorway page: it answers the questions a Fountain Valley guest
 * actually has — how far, which way, where to park, what travels well for
 * pickup, when lunch runs — and says plainly that we are in Huntington
 * Beach, eight minutes away.
 *
 * Distances/times verified on Google Maps (1 Sep 2026): Fountain Valley city
 * center → 19072 Beach Blvd = 3.6 miles, ~8 min via Slater Ave & Newland St
 * or Brookhurst St & Garfield Ave.
 */

const TITLE = 'Thai Food near Fountain Valley — 8 Minutes to Narwhal Thai Table';
const DESCRIPTION =
  'Looking for Thai food in Fountain Valley? Narwhal Thai Table is 3.6 miles from the center of Fountain Valley — about 8 minutes via Brookhurst & Garfield or Slater & Newland to Beach Blvd. Curry pastes pounded by hand, weekday lunch specials from $11.99, pickup ready when you arrive, and delivery where available.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/thai-food-fountain-valley' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/thai-food-fountain-valley`,
    type: 'article',
  },
};

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Thai Food near Fountain Valley', item: `${SITE_URL}/thai-food-fountain-valley` },
  ],
};

function Dish({ slug, children }: { slug: string; children: React.ReactNode }) {
  return <Link href={`/menu/${slug}`}>{children}</Link>;
}

export default function ThaiFoodFountainValleyPage() {
  return (
    <section className="menu-section" style={{ paddingTop: 140, paddingBottom: 100 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div className="container">
        <div className="section-head">
          <span className="label">Fountain Valley neighbors</span>
          <h1>Thai food near Fountain Valley — <em>eight minutes west</em>.</h1>
          <p>
            We&apos;ll be honest before you drive: Narwhal Thai Table is in Huntington Beach, not Fountain
            Valley. But we sit at Beach Boulevard and Garfield Avenue — 3.6 miles from the center of
            Fountain Valley, about eight minutes door to door — close enough that Fountain Valley
            counts as the neighborhood to us.
          </p>
        </div>

        <div className="guide-prose">
          <h2>Getting here from <em>Fountain Valley</em></h2>
          <p>
            Two easy ways, both about eight minutes: take <strong style={{ color: 'var(--off-white)' }}>Brookhurst
            St to Garfield Ave</strong> and head west until you reach Beach Blvd — we&apos;re on the corner,
            at <a href={DIRECTIONS_URL} target="_blank" rel="noopener">{RESTAURANT.address.street}</a>. Or
            take <strong style={{ color: 'var(--off-white)' }}>Slater Ave to Newland St</strong>, then south to
            Garfield and one block west. Either way you&apos;ll find free parking in the plaza lot right in front of the door,
            with free street parking nearby if the lot is busy.
          </p>

          <h2>Lunch from Fountain Valley — <em>back at your desk in an hour</em></h2>
          <p>
            Monday through Friday, 11:30 AM to 3:00 PM, our <Link href="/lunch">lunch specials</Link>{' '}
            start at $11.99: <Dish slug="og-pad-thai">Pad Thai</Dish>, <Dish slug="pad-see-ew">Pad See
            Ew</Dish>, <Dish slug="pad-kee-mao">Pad Kee Mao</Dish>, <Dish slug="krapow-over-rice">Krapow</Dish>,{' '}
            <Dish slug="garlic-pepper-over-rice">Garlic &amp; Pepper</Dish>, <Dish slug="cashew-nut">Cashew</Dish>,{' '}
            <Dish slug="mixed-vegetables">Mixed Vegetables</Dish>, or a <Dish slug="yellow-curry">Yellow</Dish> or{' '}
            <Dish slug="panang-curry">Panang</Dish> curry — each
            with a fresh salad and a crispy spring roll, plus a cup of soup when you dine in. Call{' '}
            <a href="tel:+17143786003">(714) 378-6003</a> on your way and it&apos;s ready when you pull up.
          </p>

          <h2>What <em>travels well</em> for pickup</h2>
          <p>
            Eight minutes is nothing for a curry. <Dish slug="panang-curry">Panang</Dish> and{' '}
            <Dish slug="yellow-curry">yellow curry</Dish> ride home beautifully, and fried rice —{' '}
            <Dish slug="crab-fried-rice">Super Crab Fried Rice</Dish>,{' '}
            <Dish slug="pineapple-fried-rice">pineapple fried rice</Dish>,{' '}
            <Dish slug="spicy-basil-fried-rice">spicy basil fried rice</Dish> — is built for a lidded
            box. <Dish slug="narwhal-chicken-wings">Narwhal Chicken Wings</Dish> stay crisp for the
            drive. Noodles are best eaten soonest, so if you&apos;re bringing{' '}
            <Dish slug="og-pad-thai">pad thai</Dish> home, make it the first thing on the table.
            Everything on the menu can be{' '}
            {ORDER_ONLINE_URL ? <a href={ORDER_ONLINE_URL} target="_blank" rel="noopener">ordered online for pickup</a> : 'ordered for pickup'}
            , and delivery runs through DoorDash where it&apos;s available at your address — see the{' '}
            <Link href="/order">order page</Link>.
          </p>

          <h2>Worth the drive for <em>dinner</em></h2>
          <p>
            Some things don&apos;t go in a box: a <Dish slug="fried-whole-pompano">whole fried pompano</Dish>{' '}
            for the table, <Dish slug="crying-tiger">crying tiger</Dish> off the grill with jaew for
            dipping, a bowl of <Dish slug="thai-boat-noodles">boat noodles</Dish>. Bring the dog — the patio
            is dog-friendly — and stay for the last course: the mango sticky rice.{' '}
            <Link href="/contact/reservation">Save a seat</Link> for a weekend
            night, or just walk in.
          </p>

          <h2>Fountain Valley <em>gatherings</em></h2>
          <p>
            Office lunches, birthdays, a family-style table for a crowd — we cater across Fountain
            Valley and the rest of the neighborhood, and we can do a private buyout of our room.{' '}
            <Link href="/contact/catering">Tell us about the event</Link> and one of the three of us will
            write back.
          </p>

          <div className="guide-cta">
            <Link href="/lunch" className="btn-primary">See lunch specials</Link>
            <a href={DIRECTIONS_URL} target="_blank" rel="noopener" className="btn-secondary">Directions from Fountain Valley</a>
            <Link href="/menu" className="btn-secondary">Browse all 67 dishes</Link>
          </div>

          <p style={{ marginTop: 28, fontSize: 15 }}>
            Also nearby: <Link href="/thai-food-westminster">Thai food near Westminster</Link> · our{' '}
            <Link href="/thai-food-orange-county">field guide to Thai food in Orange County</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
