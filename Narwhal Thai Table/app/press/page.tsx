import Link from 'next/link';
import type { Metadata } from 'next';
import Button from '@/components/ui/Button';
import { Section, Container, SectionHead, Eyebrow, cardSurface } from '@/components/ui/Section';
import { cn } from '@/lib/cn';
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
  { k: 'Menu', v: <><Link href="/menu">75 dishes across 13 categories</Link> · most plates $12–20 · <Link href="/lunch">weekday lunch specials</Link> from $11.99</> },
  { k: 'Service', v: 'Dine-in, reservations, pickup, delivery, catering and private events · dog-friendly patio' },
  { k: 'Web & social', v: <><a href={SITE_URL}>narwhalthaihb.com</a> · <a href="https://www.instagram.com/narwhalthaitablehb/" target="_blank" rel="noopener noreferrer">Instagram @narwhalthaitablehb</a> · <a href="https://www.facebook.com/Narwhalthaitablehb" target="_blank" rel="noopener noreferrer">Facebook</a> · <a href={GBP_MAP_URL} target="_blank" rel="noopener noreferrer">Google Maps</a></> },
  { k: 'Press contact', v: <><a href={`mailto:${RESTAURANT.email}`}>{RESTAURANT.email}</a> — ask for Aileen, Annie or AK</> },
];

/* ---- presentation ----------------------------------------------------- */
/* Inline links inside blocks that sit outside `.prose-nt` (the fact table). */
const inlineLinks =
  '[&_a]:text-brass-light [&_a]:underline [&_a]:decoration-brass/40 [&_a]:underline-offset-4 [&_a]:transition-colors [&_a]:duration-300 [&_a:hover]:text-cream [&_a:hover]:decoration-brass-light';
const ledeLink =
  'text-brass-light underline decoration-brass/40 underline-offset-4 transition-colors duration-300 hover:text-cream hover:decoration-brass-light';
/* An h2 that lives outside `.prose-nt` but should sit on the same scale as the prose h2s. */
const blockTitle =
  'font-display text-[clamp(26px,3vw,34px)] font-medium leading-[1.15] tracking-[-0.01em] text-cream text-balance [&_em]:font-serif [&_em]:font-normal [&_em]:italic [&_em]:text-brass-light';
const glassCard = 'rounded-[var(--radius-card)] border border-cream/10 bg-white/[0.035] px-5 py-7 shadow-card sm:px-8 sm:py-9 lg:px-10 lg:py-10';
/* Copy-ready boilerplate: one glass card per version so a writer can select the paragraph cleanly. */
const boilerplateCard = 'rounded-[var(--radius-card)] border border-cream/10 bg-white/[0.035] px-6 py-6 shadow-card sm:px-8 sm:py-7';
const downloadLink =
  'inline-flex shrink-0 items-center gap-1.5 border-b border-transparent font-sans text-[10.5px] font-medium uppercase tracking-[0.18em] text-brass-light transition-colors duration-300 hover:border-brass-light/60 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-light focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep';

export default function PressPage() {
  return (
    <Section first tone="glow">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pressJsonLd) }} />

      <Container narrow>
        <SectionHead
          align="left"
          as="h1"
          size="lg"
          eyebrow={<>Press &amp; Media</>}
          title={<>For writers, editors, and <em>anyone on a deadline</em>.</>}
          lede={
            <>
              Everything you need to cover Narwhal Thai Table, checked by the owners: the facts, a
              boilerplate you can paste, story angles that are actually true, and photos cleared for
              editorial use. For quotes, interviews or a tasting, email{' '}
              <a href={`mailto:${RESTAURANT.email}`} className={ledeLink}>{RESTAURANT.email}</a> — one of the three of us reads it.
            </>
          }
        />
      </Container>

      {/* Fact sheet — the twelve lines a writer needs, in one crawlable table. */}
      <Container narrow className="mt-12 lg:mt-16">
        <div aria-labelledby="press-facts-title" className={glassCard}>
          <h2 id="press-facts-title" className={blockTitle}>Fact <em>sheet</em></h2>
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
          <h2>Boilerplate <em>(copy-ready)</em></h2>
          <div className={boilerplateCard}>
            <Eyebrow>Short</Eyebrow>
            <p className="mt-4">
              Narwhal Thai Table is a family-run Thai restaurant at 19072 Beach Blvd in Huntington Beach, California. Three
              siblings — Aileen, Annie and AK — bought the former Thai Gulf Restaurant in July 2026,
              renamed it, and opened on August 9, 2026, cooking Thai food the way they grew up eating
              it: curry pastes pounded by hand, wok dishes made to order, and weekday lunch specials from
              $11.99.
            </p>
          </div>
          <div className={boilerplateCard}>
            <Eyebrow>Long</Eyebrow>
            <p className="mt-4">
              Narwhal Thai Table is a family-run Thai restaurant on Beach Boulevard in Huntington Beach, California, opened in
              August 2026 by three siblings, Aileen, Annie and AK, with thirty years of restaurant life
              between them. The family bought the neighborhood&apos;s longtime Thai Gulf Restaurant in
              July 2026 and rebuilt it as their own: curry pastes pounded from whole chilies, garlic,
              lemongrass and galangal in a granite mortar; dry spices toasted and ground in small
              batches; wok noodles, fried rice and curries cooked only when ordered. The 75-dish menu
              runs from Bangkok street plates and an Isaan corner of som tum, larb and crying tiger to
              whole fried pompano and Super Crab Fried Rice, with vegetarian options and weekday lunch
              specials from $11.99. The small dining room is joined by a dog-friendly patio under string
              lights, a short wine list, and a dessert list that starts with mango sticky rice. Open every
              day. narwhalthaihb.com · (714) 378-6003.
            </p>
          </div>

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
      </Container>

      {/* Editorial photo library. Plain <img> + download links on purpose — these
          are the originals writers save, not next/image renditions. */}
      <Container className="mt-20 border-t border-cream/[0.06] pt-16 lg:mt-28 lg:pt-20">
        <SectionHead
          as="h2"
          size="md"
          title={<>Photos cleared <em>for editorial use</em></>}
          lede={
            <>
              These images may be used in coverage of Narwhal Thai Table with the credit
              &ldquo;Courtesy Narwhal Thai Table&rdquo;. They&apos;re web-sized — email us for full-resolution
              files, video clips, or the logo.
            </>
          }
        />

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4" aria-label="Press photos">
          {PHOTOS.map((p) => (
            <li key={p.src} className={cardSurface()}>
              <a
                href={p.src}
                target="_blank"
                rel="noopener"
                className="relative block aspect-[4/3] w-full overflow-hidden bg-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brass-light"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.src}
                  alt={p.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]"
                />
              </a>
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 border-t border-cream/10 px-4 py-3.5">
                <span className="font-display text-[14px] font-medium leading-snug text-cream">{p.caption}</span>
                <a href={p.src} download className={downloadLink}>
                  Download
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                    <path d="M12 4v12m0 0l-5-5m5 5l5-5M4 20h16" />
                  </svg>
                </a>
              </div>
            </li>
          ))}
        </ul>
      </Container>

      <Container narrow className="mt-16 lg:mt-20">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button href={`mailto:${RESTAURANT.email}?subject=Press%20inquiry%20%E2%80%94%20Narwhal%20Thai%20Table`} variant="primary" arrow>Email the owners</Button>
          <Button href="/about" variant="secondary">Read the full story</Button>
          <Button href="/menu" variant="secondary">Browse the menu</Button>
        </div>
      </Container>
    </Section>
  );
}
