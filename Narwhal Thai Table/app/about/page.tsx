import Link from 'next/link';
import type { Metadata } from 'next';
import MediaFrame from '@/components/MediaFrame';
import ArtBand from '@/components/fx/ArtBand';
import Button from '@/components/ui/Button';
import { Section, Container, SectionHead } from '@/components/ui/Section';
import { cn } from '@/lib/cn';
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
    images: [{ url: '/images/room/family-spread.jpg', width: 1448, height: 1086, alt: 'A family-style spread at Narwhal Thai Table' }],
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

/* ---- presentation ----------------------------------------------------- */
/* Inline links inside blocks that sit outside `.prose-nt` (fact table, timeline). */
const inlineLinks =
  '[&_a]:text-brass-light [&_a]:underline [&_a]:decoration-brass/40 [&_a]:underline-offset-4 [&_a]:transition-colors [&_a]:duration-300 [&_a:hover]:text-cream [&_a:hover]:decoration-brass-light';
/* An h2 that lives outside `.prose-nt` but should sit on the same scale as the prose h2s. */
const blockTitle =
  'font-display text-[clamp(26px,3vw,34px)] font-medium leading-[1.15] tracking-[-0.01em] text-cream text-balance [&_em]:font-serif [&_em]:font-normal [&_em]:italic [&_em]:text-brass-light';
const glassCard = 'rounded-[var(--radius-card)] border border-cream/10 bg-white/[0.035] px-5 py-7 shadow-card sm:px-8 sm:py-9 lg:px-10 lg:py-10';
/* Timeline entry: a brass dot on the rail (the <ul>'s left border), haloed in the page colour. */
const timelineItem =
  "relative pb-7 last:pb-0 before:absolute before:top-[0.6em] before:-left-[33px] before:size-[9px] before:rounded-full before:bg-brass before:ring-4 before:ring-navy-deep before:content-[''] sm:before:-left-[41px]";

export default function AboutPage() {
  return (
    <>
    {/* Art pass (9 Sep 2026): the story opens on the Siam → Huntington Beach panorama. */}
    <ArtBand
      first
      eager
      base="/images/art/siam-to-hb"
      widths={[1400, 2400]}
      position="50% 60%"
      speed={0.12}
      fade="bottom"
      height="h-[48vh] min-h-[320px] max-h-[620px]"
    />
    <Section tone="glow" className="pt-6 sm:pt-8 lg:pt-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }} />

      <Container narrow>
        <SectionHead
          align="left"
          as="h1"
          size="lg"
          eyebrow="Our Story"
          title={<>Three siblings. <em>One table.</em></>}
          lede={
            <>
              We are Aileen, Annie and AK — a Thai family with thirty years of restaurant life between
              us, and one small dining room on Beach Boulevard where we cook the food we grew up eating.
            </>
          }
        />
      </Container>

      {/* The photo pair breaks out to the full column between the narrow intro and the narrow story. */}
      <Container className="mt-12 grid gap-4 lg:mt-16 lg:grid-cols-[1.5fr_1fr]">
        <MediaFrame
          ratio="16/10"
          src="/images/room/family-spread.jpg"
          alt="A family-style spread at Narwhal Thai Table in Huntington Beach — tom yum seafood hot pot, crying tiger, orange chicken, morning glory and Thai iced tea"
          sizes="(max-width: 900px) 100vw, 60vw"
          className="border border-brass/20 shadow-card"
        />
        {/* 16/15 next to a 16/10 frame at 1.5fr:1fr — same rendered height. */}
        <MediaFrame
          ratio="16/15"
          src="/images/room/storefront.jpg"
          alt="The Narwhal Thai Table storefront on Beach Blvd at dusk, string lights over the patio"
          sizes="(max-width: 900px) 100vw, 40vw"
          className="border border-brass/20 shadow-card"
        />
      </Container>

      <Container narrow className="mt-16 lg:mt-24">
        <div className="prose-nt">
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
            <Link href="/lunch">lunch specials</Link> start at $11.99. And if you want to know how
            we judge any Thai kitchen, ours included, we wrote a field guide to the{' '}
            <Link href="/thai-food-orange-county">best Thai food in Orange County</Link>.
          </p>
        </div>
      </Container>

      {/* The fact sheet — every owner-confirmed fact in one crawlable table. */}
      <Container narrow className="mt-16 lg:mt-20">
        <div aria-labelledby="fact-list-title" className={glassCard}>
          <h2 id="fact-list-title" className={blockTitle}>The short version, <em>for the record</em></h2>
          <dl className={cn('mt-7 border-t border-cream/10', inlineLinks)}>
            {FACTS.map((f) => (
              <div key={f.k} className="grid gap-x-6 gap-y-1 border-b border-cream/10 py-3 sm:grid-cols-[180px_1fr]">
                <dt className="font-sans text-[10.5px] font-medium uppercase tracking-[0.22em] text-brass-light sm:pt-1">{f.k}</dt>
                <dd className="text-[15.5px] leading-[1.65] text-cream/80">{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>

      <Container narrow className="mt-16 lg:mt-20">
        <div className="prose-nt">
          <h2>Timeline</h2>
        </div>
        {/* Vertical timeline: a brass rail with one dot per entry. Kept outside
            `.prose-nt` so the list is ours to style (prose lists are bulleted). */}
        <ul
          className={cn(
            'mt-8 border-l border-brass/30 pl-7 text-[17px] leading-[1.75] text-cream/80 sm:pl-9',
            '[&_strong]:font-semibold [&_strong]:text-cream',
            inlineLinks,
          )}
        >
          <li className={timelineItem}><strong>Before 2026 —</strong> Thai Gulf Restaurant serves the neighborhood at 19072 Beach Blvd.</li>
          <li className={timelineItem}><strong>July 2026 —</strong> Our family buys the business and renames it Narwhal Thai Table. New recipes, new kitchen habits, same address.</li>
          <li className={timelineItem}><strong>Sunday, August 9, 2026 —</strong> Soft opening. Open every day since.</li>
          <li className={timelineItem}><strong>Late August 2026 —</strong> Weekday <Link href="/lunch">lunch specials</Link> begin, Monday–Friday from $11.99.</li>
          <li className={timelineItem}><strong>Coming up —</strong> The grand opening, with the chef&apos;s introduction. Follow{' '}
            <a href="https://www.instagram.com/narwhalthaitablehb/" target="_blank" rel="noopener noreferrer">@narwhalthaitablehb</a> so you don&apos;t miss it.</li>
        </ul>

        {/* Reserve + directions already live in the phone action bar — hide those two there. */}
        <div className="mt-14 flex flex-wrap items-center gap-3 border-t border-cream/10 pt-10">
          <Button href="/menu" variant="primary" arrow>See the menu</Button>
          <Button href="/contact/reservation" variant="secondary" className="max-[760px]:hidden">Save a seat</Button>
          <Button href={DIRECTIONS_URL} variant="secondary" target="_blank" rel="noopener" className="max-[760px]:hidden">Get directions</Button>
        </div>
      </Container>
    </Section>
    </>
  );
}
