import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import MediaFrame from '@/components/MediaFrame';
import Button, { Arrow } from '@/components/ui/Button';
import { Section, Container, SectionHead, Heading, Tag, cardSurface } from '@/components/ui/Section';
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

/* Inline text link inside body copy (brass, hairline underline). */
const inlineLink =
  'text-brass-light underline decoration-brass/40 underline-offset-4 transition-colors duration-300 hover:text-cream hover:decoration-brass-light';

/* One item of the "what comes with every lunch" tray: a glass card with a
   serif numeral. The <ol> already conveys the order to assistive tech, so the
   numeral is decorative. Non-interactive → the card's hover lift is neutralised
   (same trick as the Experience pillars on the home page). */
function TrayStep({ num, children }: { num: string; children: ReactNode }) {
  return (
    <li className={cardSurface('h-full p-7 hover:translate-y-0 sm:p-8')}>
      <div aria-hidden="true" className="flex items-center gap-4">
        <span className="font-serif text-[30px] italic leading-none text-brass">{num}</span>
        <span className="h-px flex-1 bg-brass/25 transition-colors duration-500 group-hover:bg-brass/45" />
      </div>
      <p className="mt-5 text-[15.5px] leading-relaxed text-cream/70 [&_strong]:font-semibold [&_strong]:text-cream">{children}</p>
    </li>
  );
}

export default function LunchPage() {
  const plates = LUNCH_SLUGS.map((slug) => DISHES.find((d) => d.slug === slug)).filter(Boolean);

  return (
    <>
      {/* No FadeUp on this page on purpose — a hungry 11:45 visitor (and the
          crawler) must see every plate the moment the page lands. */}
      <Section first tone="glow">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(lunchJsonLd()) }} />
        <Container>
          <SectionHead
            as="h1"
            eyebrow="Lunch Specials · Mon–Fri"
            title={<>Weekday lunch, <em>cooked to order</em> — from $11.99.</>}
            lede="Monday through Friday, 11:30 AM to 3:00 PM. Pick a plate below and it comes with a fresh salad and a crispy spring roll — plus a cup of soup when you dine in. Quick, cozy, and right on Beach Boulevard: the lunch break you actually look forward to."
          />

          {/* Hours pill — the one line a weekday office crowd is scanning for. */}
          <p className="mx-auto mt-8 w-fit max-w-full rounded-full border border-brass/25 bg-white/[0.035] px-5 py-3 text-center font-sans text-[13.5px] leading-relaxed text-cream/75 shadow-card backdrop-blur-md sm:px-6">
            <span aria-hidden="true" className="mr-2.5 inline-block size-1.5 rounded-full bg-brass-light align-middle animate-pulse-dot" />
            Mon–Fri 11:30 AM – 3:00 PM · dine in or take it to go ·{' '}
            <a href={DIRECTIONS_URL} target="_blank" rel="noopener" className={inlineLink}>
              {RESTAURANT.address.street}, {RESTAURANT.address.city} →
            </a>
          </p>

          {/* The lunch tray — what every special comes with, in three steps. */}
          <ol aria-label="What comes with every lunch special" className="mt-14 grid gap-6 md:grid-cols-3 lg:mt-20 lg:gap-8">
            <TrayStep num="1">
              <strong>Your plate.</strong> Nine choices — wok noodles, a rice plate, stir-fried vegetables, or a curry — each one cooked when you order it, at the spice level you ask for.
            </TrayStep>
            <TrayStep num="2">
              <strong>Salad and a spring roll.</strong> A fresh salad and a crispy spring roll come with every lunch, dine-in or to-go.
            </TrayStep>
            <TrayStep num="3">
              <strong>Soup, when you stay.</strong> Dine in and a cup of soup is included — and if you have ten more minutes, the mango sticky rice is right there.
            </TrayStep>
          </ol>
        </Container>
      </Section>

      <Section className="border-t border-cream/[0.06]">
        <Container>
          <SectionHead
            title={<>Pick your <em>plate</em>.</>}
            lede={<>Tap a plate to read its story. Weekday lunch specials start at $11.99 — ask us for the price of the plate you&apos;re eyeing.</>}
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-8">
            {plates.map((d) => {
              const lunchShot = lunchPhoto(d!.slug);
              const photo = lunchShot ?? d!.image?.src ?? getDishImage(d!.slug) ?? undefined;
              return (
                <Link key={d!.slug} href={`/menu/${d!.slug}`} className={cardSurface('h-full')}>
                  <MediaFrame
                    ratio="4/3"
                    flush
                    hoverZoom
                    src={photo}
                    alt={`${d!.name}${d!.thai ? ` (${d!.thai})` : ''} — weekday lunch special${lunchShot ? ' with salad and a spring roll' : ''} at Narwhal Thai Table, Huntington Beach`}
                    sizes="(max-width: 600px) 100vw, (max-width: 980px) 50vw, 33vw"
                    placeholder={
                      <>
                        <svg className="size-10 text-brass/70" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true" focusable="false">
                          <path d="M17 7v12a4 4 0 01-8 0V7M13 7v34" strokeLinecap="round" />
                          <path d="M34 7c-3 0-5 4-5 11s2 7 5 7 5 0 5-7-2-11-5-11zM34 25v16" strokeLinecap="round" />
                        </svg>
                        <span lang="th" className="font-serif text-[15px] italic text-cream/60">{d!.thai}</span>
                      </>
                    }
                  />
                  <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-display text-[19px] font-medium leading-tight text-cream">{d!.name}</h3>
                        <span lang="th" className="mt-1 block font-serif text-[13px] italic text-cream/55">{d!.thai}</span>
                      </div>
                      <span className="shrink-0 whitespace-nowrap font-display text-[17px] font-medium leading-tight text-brass-light">
                        <span className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-cream/55">from</span> $11.99
                      </span>
                    </div>
                    <p className="line-clamp-3 text-[14.5px] leading-relaxed text-cream/70">{d!.description}</p>
                    <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-cream/10 pt-4">
                      <Tag>Lunch special</Tag>
                      {d!.spicy && <Tag tone="spicy">Spicy</Tag>}
                      <span className="ml-auto inline-flex items-center gap-1.5 font-sans text-[10.5px] font-medium uppercase tracking-[0.18em] text-brass-light">
                        Read the story <Arrow />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section tone="navy">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="prose-nt">
              <Heading as="h2" size="md">Good to know at <em>lunch</em></Heading>
              <p>
                <strong>Weekdays only.</strong> Lunch specials run
                Monday–Friday until 3 PM. On weekends, and after 3 on weekdays, the{' '}
                <Link href="/menu">full menu</Link> is served all day.
              </p>
              <p>
                <strong>Taking it back to the office?</strong> Call{' '}
                <a href="tel:+17143786003">(714) 378-6003</a> and it&apos;ll be ready when you pull up —
                there&apos;s free parking in the plaza lot right outside. Everything on the regular menu
                can also be ordered online for{' '}
                {ORDER_ONLINE_URL ? <a href={ORDER_ONLINE_URL} target="_blank" rel="noopener">pickup</a> : 'pickup'}.
              </p>
              <p>
                <strong>Spice and swaps.</strong> Every plate is cooked
                when you order it, so you set the heat — mild to Thai hot — and most of these plates can be
                made with tofu or vegetables instead of meat. Just tell us when you order, and always mention
                an allergy.
              </p>
              <p>
                <strong>Coming from Fountain Valley or Westminster?</strong>{' '}
                We&apos;re at Beach Blvd &amp; Garfield — about 8 minutes from central{' '}
                <Link href="/thai-food-fountain-valley">Fountain Valley</Link> and 12 minutes straight down
                Beach from <Link href="/thai-food-westminster">Westminster</Link>.
              </p>
            </div>

            {/* Buttons live outside .prose-nt so its link styling never touches them.
                Directions is hidden on phones — the MobileActionBar carries it there. */}
            <div className="mt-10 flex flex-wrap gap-3">
              <Button href="tel:+17143786003" variant="primary" size="lg" arrow>
                Call in a lunch order
              </Button>
              <Button href={DIRECTIONS_URL} target="_blank" rel="noopener" variant="secondary" size="lg" arrow className="max-[760px]:hidden">
                Get directions
              </Button>
              <Button href="/menu" variant="secondary" size="lg" arrow>
                See the full menu
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
