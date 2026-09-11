import type { Metadata } from 'next';
import Link from 'next/link';
import MenuSections from '@/components/MenuSections';
import { toMenuCard } from '@/lib/menuCard';
import ArtBand from '@/components/fx/ArtBand';
import { Section, Container, Eyebrow, Heading } from '@/components/ui/Section';
import { cn } from '@/lib/cn';
import { DISHES } from '@/lib/dishes';
import { getDishImage } from '@/lib/media';
import { CATEGORIES } from '@/lib/categories';
import { SITE_URL, RESTAURANT_ID } from '@/lib/site';
import { ui } from '@/lib/i18n';
import { categoryLabel } from '@/lib/i18n/chrome';
import { localizeDishes } from '@/lib/i18n/dish';
import { LOCALE_TAG, OG_LOCALE, alternatesFor, localePath, type Locale } from '@/lib/i18n/locales';
import Rich from '@/lib/i18n/rich';

export function menuMetadata(locale: Locale): Metadata {
  const t = ui(locale).meta.menu;
  return {
    title: t.title,
    description: t.description,
    alternates: alternatesFor(locale, '/menu'),
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      ...(locale === 'en' ? {} : { locale: OG_LOCALE[locale], url: `${SITE_URL}${localePath(locale, '/menu')}` }),
    },
  };
}

/** Parse "$12" / "$12.50" → 12 / 12.50; undefined for "MKT"/blank so we omit Offer. */
function priceNumber(p?: string): number | undefined {
  if (!p) return undefined;
  const m = p.replace(/,/g, '').match(/\d+(\.\d+)?/);
  return m ? Number(m[0]) : undefined;
}

/** schema.org Menu graph built from the real dish data — enables menu rich results. */
function menuJsonLd(locale: Locale) {
  const t = ui(locale).menuPage;
  const dishes = localizeDishes(DISHES, locale);
  const base = `${SITE_URL}${localePath(locale, '/menu')}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    '@id': `${base}#menu`,
    name: t.jsonLdName,
    url: base,
    inLanguage: LOCALE_TAG[locale],
    // Ties the menu to the single Restaurant entity declared in app/layout.tsx.
    provider: { '@id': RESTAURANT_ID },
    hasMenuSection: CATEGORIES.map((cat) => {
      const items = dishes.filter((d) => d.category === cat.id);
      // "Sides & Protein" is a rendered panel, not dish records — describe it
      // explicitly so the markup matches all 13 visible categories.
      if (!items.length) {
        return cat.id === 'sides'
          ? {
              '@type': 'MenuSection',
              name: categoryLabel(locale, cat.id),
              description: t.sidesDescription,
              url: base,
            }
          : null;
      }
      return {
        '@type': 'MenuSection',
        name: categoryLabel(locale, cat.id),
        hasMenuItem: items.map((d) => {
          const price = priceNumber(d.price);
          return {
            '@type': 'MenuItem',
            name: d.name,
            ...(d.description ? { description: d.description } : {}),
            url: `${SITE_URL}${localePath(locale, `/menu/${d.slug}`)}`,
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
 * /menu and /vi/menu — the whole menu on one scroll (components/MenuSections).
 * app/menu/page.tsx and app/vi/menu/page.tsx are thin wrappers.
 */
export default function MenuPage({ locale = 'en' }: { locale?: Locale }) {
  const t = ui(locale).menuPage;
  // Photo lookup built server-side at build time (getDishImage checks the
  // filesystem, so the client-side MenuSections can't call it directly).
  const photos: Record<string, string> = {};
  for (const d of DISHES) {
    const src = d.image?.src ?? getDishImage(d.slug);
    if (src) photos[d.slug] = src;
  }
  const cards = localizeDishes(DISHES, locale).map(toMenuCard);
  return (
    <>
      {/* Art pass (9 Sep 2026): the menu opens on the painted banquet table —
          the placemat style, seen from above — with the page title set on it. */}
      <ArtBand
        first
        eager
        base="/images/art/banquet"
        widths={[1400, 2400]}
        position="50% 50%"
        speed={0.12}
        fade="bottom"
        dim={0.18}
        height="h-[64vh] min-h-[440px] max-h-[760px]"
      >
        <div className="flex max-w-3xl flex-col items-center gap-5 px-6 text-center">
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <Heading as="h1" size="lg" className="[text-shadow:0_2px_28px_rgba(6,18,31,0.95)] [&_em]:[text-shadow:none]">
            <Rich text={t.title} locale={locale} />
          </Heading>
        </div>
      </ArtBand>
    {/* overflow-clip (not hidden): the aurora layer still clips, but the section no longer
        becomes a scroll container — which is what kept the sticky course bar from sticking. */}
    <Section tone="aurora" className="overflow-clip pt-10 sm:pt-12 lg:pt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(menuJsonLd(locale)) }}
      />
      <Container>
        <p className="mx-auto max-w-2xl text-center text-[16.5px] leading-[1.75] text-cream/75">{t.intro}</p>
        {/* Weekday lunch specials (launched late Aug 2026) live on their own page —
            this strip is the pointer for the 11:45-on-a-Tuesday visitor. */}
        <Link
          href={localePath(locale, '/lunch')}
          className={cn(
            'group mt-10 flex flex-col gap-3 rounded-[var(--radius-card)] border border-brass/25 bg-white/[0.035] px-5 py-4 shadow-card backdrop-blur-md lg:mt-12',
            'sm:flex-row sm:items-center sm:gap-5 sm:px-6',
            'transition-[transform,border-color,background-color] duration-300 ease-out-soft hover:-translate-y-0.5 hover:border-brass-light/60 hover:bg-brass/[0.07]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-light focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep',
          )}
        >
          <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-brass/40 bg-brass/10 px-3 py-1.5 font-sans text-[10.5px] font-medium uppercase tracking-[0.16em] text-brass-light sm:self-auto">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-brass-light animate-pulse-dot" />
            {t.lunchPill}
          </span>
          <span className="flex-1 text-[15px] leading-relaxed text-cream/80 transition-colors duration-300 group-hover:text-cream">
            {t.lunchLine}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 font-sans text-[10.5px] font-medium uppercase tracking-[0.18em] text-brass-light">
            {t.lunchGo} <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </span>
        </Link>
        <MenuSections dishes={cards} photos={photos} locale={locale} />
      </Container>
    </Section>
    </>
  );
}
