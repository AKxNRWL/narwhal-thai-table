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
import { ui } from '@/lib/i18n';
import { localizeDish } from '@/lib/i18n/dish';
import { LOCALE_TAG, OG_LOCALE, alternatesFor, localePath, type Locale } from '@/lib/i18n/locales';
import Rich, { fmt } from '@/lib/i18n/rich';

/**
 * /lunch and /vi/lunch — weekday Lunch Specials.
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

export function lunchMetadata(locale: Locale): Metadata {
  const t = ui(locale).meta.lunch;
  return {
    title: { absolute: t.title },
    description: t.description,
    alternates: alternatesFor(locale, '/lunch'),
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: `${SITE_URL}${localePath(locale, '/lunch')}`,
      type: 'website',
      locale: OG_LOCALE[locale],
    },
  };
}

function lunchJsonLd(locale: Locale) {
  const t = ui(locale).lunch;
  const items = LUNCH_SLUGS.map((slug) => DISHES.find((d) => d.slug === slug)).filter(Boolean).map((d) => localizeDish(d!, locale));
  const url = `${SITE_URL}${localePath(locale, '/lunch')}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Menu',
        // One Menu node per language; the English one is the id referenced from
        // the Restaurant's hasMenu in app/layout.tsx.
        '@id': `${url}#menu`,
        name: t.jsonLdName,
        url,
        inLanguage: LOCALE_TAG[locale],
        description: t.jsonLdDescription,
        provider: { '@id': RESTAURANT_ID },
        hasMenuSection: {
          '@type': 'MenuSection',
          name: t.jsonLdSection,
          description: t.jsonLdSectionDescription,
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
            name: fmt(t.jsonLdItem, { name: d.name }),
            ...(d.description ? { description: d.description } : {}),
            url: `${SITE_URL}${localePath(locale, `/menu/${d.slug}`)}`,
            ...(lunchPhoto(d.slug) ? { image: `${SITE_URL}${lunchPhoto(d.slug)}` } : {}),
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
          { '@type': 'ListItem', position: 1, name: t.breadcrumbHome, item: `${SITE_URL}${localePath(locale, '/')}` },
          { '@type': 'ListItem', position: 2, name: t.breadcrumb, item: url },
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

export default function LunchPage({ locale = 'en' }: { locale?: Locale }) {
  const t = ui(locale).lunch;
  const href = (p: string) => localePath(locale, p);
  const plates = LUNCH_SLUGS.map((slug) => DISHES.find((d) => d.slug === slug)).filter(Boolean).map((d) => localizeDish(d!, locale));

  return (
    <>
      {/* No FadeUp on this page on purpose — a hungry 11:45 visitor (and the
          crawler) must see every plate the moment the page lands. */}
      <Section first tone="glow">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(lunchJsonLd(locale)) }} />
        <Container>
          <SectionHead
            as="h1"
            eyebrow={t.eyebrow}
            title={<Rich text={t.title} locale={locale} />}
            lede={t.lede}
          />

          {/* Hours pill — the one line a weekday office crowd is scanning for. */}
          <p className="mx-auto mt-8 w-fit max-w-full rounded-full border border-brass/25 bg-white/[0.035] px-5 py-3 text-center font-sans text-[13.5px] leading-relaxed text-cream/75 shadow-card backdrop-blur-md sm:px-6">
            <span aria-hidden="true" className="mr-2.5 inline-block size-1.5 rounded-full bg-brass-light align-middle animate-pulse-dot" />
            {t.hoursLine}
            <a href={DIRECTIONS_URL} target="_blank" rel="noopener" className={inlineLink}>
              {RESTAURANT.address.street}, {RESTAURANT.address.city} →
            </a>
          </p>

          {/* The lunch tray — what every special comes with, in three steps. */}
          <ol aria-label={t.trayLabel} className="mt-14 grid gap-6 md:grid-cols-3 lg:mt-20 lg:gap-8">
            {t.tray.map((step, i) => (
              <TrayStep key={i} num={String(i + 1)}>
                <Rich text={step} locale={locale} />
              </TrayStep>
            ))}
          </ol>
        </Container>
      </Section>

      <Section className="border-t border-cream/[0.06]">
        <Container>
          <SectionHead
            title={<Rich text={t.pickTitle} locale={locale} />}
            lede={t.pickLede}
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-8">
            {plates.map((d) => {
              const lunchShot = lunchPhoto(d.slug);
              const photo = lunchShot ?? d.image?.src ?? getDishImage(d.slug) ?? undefined;
              return (
                <Link key={d.slug} href={href(`/menu/${d.slug}`)} className={cardSurface('h-full')}>
                  <MediaFrame
                    ratio="4/3"
                    flush
                    hoverZoom
                    src={photo}
                    alt={fmt(t.alt, { name: `${d.name}${d.thai ? ` (${d.thai})` : ''}`, withSides: lunchShot ? t.altSides : '' })}
                    sizes="(max-width: 600px) 100vw, (max-width: 980px) 50vw, 33vw"
                    placeholder={
                      <>
                        <svg className="size-10 text-brass/70" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true" focusable="false">
                          <path d="M17 7v12a4 4 0 01-8 0V7M13 7v34" strokeLinecap="round" />
                          <path d="M34 7c-3 0-5 4-5 11s2 7 5 7 5 0 5-7-2-11-5-11zM34 25v16" strokeLinecap="round" />
                        </svg>
                        <span lang="th" className="font-serif text-[15px] italic text-cream/60">{d.thai}</span>
                      </>
                    }
                  />
                  <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-display text-[19px] font-medium leading-tight text-cream">{d.name}</h3>
                        <span lang="th" className="mt-1 block font-serif text-[13px] italic text-cream/55">{d.thai}</span>
                      </div>
                      <span className="shrink-0 whitespace-nowrap font-display text-[17px] font-medium leading-tight text-brass-light">
                        <span className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-cream/55">{t.from}</span> $11.99
                      </span>
                    </div>
                    <p className="line-clamp-3 text-[14.5px] leading-relaxed text-cream/70">{d.description}</p>
                    <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-cream/10 pt-4">
                      <Tag>{t.tag}</Tag>
                      {d.spicy && <Tag tone="spicy">{t.spicy}</Tag>}
                      <span className="ml-auto inline-flex items-center gap-1.5 font-sans text-[10.5px] font-medium uppercase tracking-[0.18em] text-brass-light">
                        {t.readStory} <Arrow />
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
              <Heading as="h2" size="md"><Rich text={t.goodTitle} locale={locale} /></Heading>
              {t.good.map((para, i) => (
                <p key={i}>
                  <Rich text={para} locale={locale} vars={{ order: ORDER_ONLINE_URL }} />
                </p>
              ))}
            </div>

            {/* Buttons live outside .prose-nt so its link styling never touches them.
                Directions is hidden on phones — the MobileActionBar carries it there. */}
            <div className="mt-10 flex flex-wrap gap-3">
              <Button href="tel:+17143786003" variant="primary" size="lg" arrow>
                {t.call}
              </Button>
              <Button href={DIRECTIONS_URL} target="_blank" rel="noopener" variant="secondary" size="lg" arrow className="max-[760px]:hidden">
                {t.directions}
              </Button>
              <Button href={href('/menu')} variant="secondary" size="lg" arrow>
                {t.seeMenu}
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
