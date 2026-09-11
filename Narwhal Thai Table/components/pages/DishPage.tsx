import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import MediaFrame from '@/components/MediaFrame';
import Lens from '@/components/fx/Lens';
import ArtBand from '@/components/fx/ArtBand';
import GoldCorners from '@/components/fx/GoldCorners';
import Button from '@/components/ui/Button';
import { Section, Container, Eyebrow, Heading, Tag } from '@/components/ui/Section';
import { cn } from '@/lib/cn';
import { DISHES, type Dish } from '@/lib/dishes';
import { getDishImage } from '@/lib/media';
import { ORDER_ONLINE_URL, SITE_URL, RESTAURANT_ID } from '@/lib/site';
import { ui } from '@/lib/i18n';
import { categoryLabel } from '@/lib/i18n/chrome';
import { localizeDish } from '@/lib/i18n/dish';
import { LOCALE_TAG, OG_LOCALE, alternatesFor, localePath, type Locale } from '@/lib/i18n/locales';
import Rich, { fmt } from '@/lib/i18n/rich';

/**
 * /menu/[slug] and /vi/menu/[slug] — one dish, its story, and its neighbours.
 * The route files (app/menu/[slug]/page.tsx, app/vi/menu/[slug]/page.tsx)
 * only resolve the slug and hand over the locale.
 */

/** Metadata for a dish page in either language (undefined dish → 404 title). */
export function dishMetadata(raw: Dish | undefined, locale: Locale): Metadata {
  const t = ui(locale).meta.dish;
  if (!raw) return { title: t.notFound };
  const dish = localizeDish(raw, locale);
  const photo = dish.image?.src ?? getDishImage(dish.slug);
  const description = dish.story?.lede ?? dish.description;
  return {
    // Geo + cuisine in the title: these pages target exactly the long-tail
    // "<dish> huntington beach" / "<dish> near me" queries. The layout template
    // appends "· Narwhal Thai Table", so we only add the locality here.
    title: fmt(t.title, { name: dish.name }),
    description,
    alternates: alternatesFor(locale, `/menu/${dish.slug}`),
    openGraph: {
      title: fmt(t.ogTitle, { name: dish.name }),
      description,
      type: 'article',
      locale: OG_LOCALE[locale],
      ...(photo
        ? { images: [{ url: photo, alt: fmt(t.ogImageAlt, { name: dish.name }) }] }
        : {}),
    },
  };
}

/** Parse "$12" / "$12.50" → 12 / 12.5; undefined for "MKT"/blank. */
function priceNumber(p?: string): number | undefined {
  if (!p) return undefined;
  const m = p.replace(/,/g, '').match(/\d+(\.\d+)?/);
  return m ? Number(m[0]) : undefined;
}

/** Home › Menu › <Course> › <Dish> — one per dish page. */
function breadcrumbJsonLd(dish: Dish, locale: Locale) {
  const t = ui(locale).dish;
  const menuUrl = `${SITE_URL}${localePath(locale, '/menu')}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t.breadcrumbHome, item: `${SITE_URL}${localePath(locale, '/')}` },
      { '@type': 'ListItem', position: 2, name: t.breadcrumbMenu, item: menuUrl },
      { '@type': 'ListItem', position: 3, name: categoryLabel(locale, dish.category), item: menuUrl },
      { '@type': 'ListItem', position: 4, name: dish.name },
    ],
  };
}

/** Per-dish MenuItem markup, tied back to the one Restaurant entity by @id. */
function dishJsonLd(dish: Dish, locale: Locale, photo?: string | null) {
  const t = ui(locale).dish;
  const price = priceNumber(dish.price);
  const url = `${SITE_URL}${localePath(locale, `/menu/${dish.slug}`)}`;
  const menuUrl = `${SITE_URL}${localePath(locale, '/menu')}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'MenuItem',
    '@id': `${url}#menuitem`,
    name: dish.name,
    alternateName: dish.thai || undefined,
    description: dish.story?.lede ?? dish.description,
    url,
    inLanguage: LOCALE_TAG[locale],
    ...(photo ? { image: `${SITE_URL}${photo}` } : {}),
    ...(price !== undefined
      ? { offers: { '@type': 'Offer', price, priceCurrency: 'USD', availability: 'https://schema.org/InStock' } }
      : {}),
    ...(dish.ingredients?.length ? { recipeIngredient: dish.ingredients } : {}),
    menuAddOn: { '@type': 'MenuSection', name: t.sidesSection, url: menuUrl },
    isPartOf: { '@type': 'Menu', name: t.menuName, url: menuUrl },
    offeredBy: { '@id': RESTAURANT_ID },
  };
}

/* Shared type ramp for the long-form copy on this page. */
const bodyText = 'text-[16.5px] leading-[1.75] text-cream/75';
/* Inline text link inside body copy (brass, hairline underline). */
const inlineLink =
  'text-brass-light underline decoration-brass/40 underline-offset-4 transition-colors duration-300 hover:text-cream hover:decoration-brass-light';
/* Small brass label used inside cards and the chef note. */
const miniLabel = 'font-sans text-[10.5px] font-medium uppercase tracking-[0.3em] text-brass-light';
/* Static glass surface (no hover lift) for the pairing / sibling cards. */
const glass = 'rounded-[var(--radius-card)] border border-cream/10 bg-white/[0.035] shadow-card';

/** One titled block of the story column — renders only when its data exists. */
function DishSection({ title, className, children }: { title: ReactNode; className?: string; children: ReactNode }) {
  return (
    <div className={cn('mt-12 first:mt-0', className)}>
      <Heading as="h2" size="sm">{title}</Heading>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function DishPage({ dish: raw, locale = 'en' }: { dish: Dish; locale?: Locale }) {
  const t = ui(locale).dish;
  const dish = localizeDish(raw, locale);
  const href = (p: string) => localePath(locale, p);
  const photo = dish.image?.src ?? getDishImage(dish.slug);
  const course = categoryLabel(locale, dish.category);
  // Sibling dishes in the same category — turns 75 orphan pages into 13
  // interlinked topical clusters and gives guests somewhere to go next.
  const siblings = DISHES.filter(d => d.category === dish.category && d.slug !== dish.slug).slice(0, 5);
  const hasMeta = Boolean(dish.signature || dish.spicy || dish.variants?.length);
  const placeholder = (
    <div className="text-center">
      <div className="font-display text-[64px] italic leading-none text-brass">★</div>
      <div className="mt-4 font-sans text-[10px] uppercase tracking-[0.32em] text-brass-light">{t.photoSoon}</div>
      <div className="mt-2 font-serif text-[20px] italic text-cream">{dish.name}</div>
    </div>
  );

  return (
    <Section as="article" first>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dishJsonLd(dish, locale, photo)) }}
      />
      {/* Breadcrumb trail — tells Google this page sits under /menu rather
          than floating on its own, and renders as "narwhalthaihb.com › Menu ›
          Curry" under the result instead of a bare URL. Mirrors the visible
          "Back to menu" link and the category label below it. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(dish, locale)) }}
      />
      <Container>
        <Button href={href('/menu')} variant="ghost" className="text-[10.5px]">
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-0.5">←</span> {t.back}
        </Button>

        <div className="mt-8 grid gap-10 lg:mt-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 xl:gap-20">
          {/*
            Image column — pinned while the story scrolls on desktop.
            When a real photo is shot, pass `src` to MediaFrame and the
            placeholder will fade out automatically:
              <MediaFrame ratio="4/5" ornament="inset"
                src={`/images/dishes/${dish.slug}.jpg`} alt={dish.name} priority />
          */}
          <div className="relative lg:sticky lg:top-[calc(var(--cs-ticker-h)+96px)] lg:self-start">
            {/* brass kanok corners — the plate hangs like a framed painting (art pass) */}
            <GoldCorners size={38} inset={10} opacity={0.9} />
            {/* Lens = hover magnifier on desktop (Magic UI-style); it only wraps real photos. */}
            <LensIf enabled={Boolean(photo)}>
              <MediaFrame
                ratio="4/5"
                ornament="inset"
                src={photo ?? undefined}
                alt={dish.image?.alt ?? fmt(t.alt, { name: `${dish.name}${dish.thai ? ` (${dish.thai})` : ''}`, description: dish.description })}
                /* Only render the "Photo coming soon" card when there really is no
                   photo — otherwise that text sits in the DOM beside the H1 and gets
                   read by crawlers and AI extractors on pages that DO have a photo. */
                placeholder={photo ? undefined : placeholder}
                priority
                className="border border-brass/20 shadow-card"
              />
            </LensIf>
          </div>

          <div className="min-w-0">
            <Eyebrow>{course}</Eyebrow>
            <Heading as="h1" size="lg" className="mt-5">
              {dish.name}
              {dish.signature && <em> — {t.signature}</em>}
            </Heading>
            {dish.thai && <div lang="th" className="mt-3 font-serif text-[clamp(18px,1.8vw,22px)] italic text-cream/60">{dish.thai}</div>}

            {dish.story?.lede && (
              <p className="mt-6 max-w-2xl font-serif text-[clamp(18px,1.7vw,21px)] italic leading-[1.6] text-cream/80">{dish.story.lede}</p>
            )}

            {hasMeta && (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {dish.signature && <Tag>{t.signatureTag}</Tag>}
                {dish.spicy && <Tag tone="spicy">{t.spicy}</Tag>}
                {dish.variants?.map(v => <Tag key={v} tone="muted">{v}</Tag>)}
              </div>
            )}

            {dish.price && (
              <div className="mt-6 font-display text-[clamp(36px,4vw,52px)] font-medium leading-none tracking-[-0.01em] text-brass-light">{dish.price}</div>
            )}

            <div className="mt-12 border-t border-cream/10 pt-12">
              {/* Long-form sections — each renders only if data exists */}
              {dish.story?.history && (
                <DishSection title={<Rich text={t.from} locale={locale} />}>
                  <div className={cn('flex flex-col gap-4', bodyText)}>
                    <ParagraphsFrom text={dish.story.history} />
                  </div>
                </DishSection>
              )}

              {dish.story?.howToEat && (
                <DishSection title={<Rich text={t.howToEat} locale={locale} />}>
                  <div className={cn('flex flex-col gap-4', bodyText)}>
                    <ParagraphsFrom text={dish.story.howToEat} />
                  </div>
                </DishSection>
              )}

              {dish.ingredients && dish.ingredients.length > 0 && (
                <DishSection title={<Rich text={t.inTheBowl} locale={locale} />}>
                  <ul className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
                    {dish.ingredients.map(i => (
                      <li key={i} className="flex items-start gap-3 text-[15.5px] leading-[1.6] text-cream/80">
                        <span aria-hidden="true" className="mt-[9px] size-1.5 shrink-0 rounded-full bg-brass" />
                        <span>{i}</span>
                      </li>
                    ))}
                  </ul>
                </DishSection>
              )}

              {dish.pairing && (dish.pairing.drink || dish.pairing.sides) && (
                <DishSection title={<Rich text={t.goesWith} locale={locale} />}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {dish.pairing.drink && (
                      <div className={cn(glass, 'p-5 sm:p-6')}>
                        <h4 className={miniLabel}>{t.toDrink}</h4>
                        <p className="mt-3 text-[15.5px] leading-relaxed text-cream/80">{dish.pairing.drink}</p>
                      </div>
                    )}
                    {dish.pairing.sides && dish.pairing.sides.length > 0 && (
                      <div className={cn(glass, 'p-5 sm:p-6')}>
                        <h4 className={miniLabel}>{t.onTheSide}</h4>
                        <p className="mt-3 text-[15.5px] leading-relaxed text-cream/80">{dish.pairing.sides.join(' · ')}</p>
                      </div>
                    )}
                  </div>
                </DishSection>
              )}

              {dish.allergens && dish.allergens.length > 0 && (
                <DishSection title={<Rich text={t.goodToKnow} locale={locale} />}>
                  <p className={bodyText}>{t.allergensIntro}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {dish.allergens.map(a => <Tag key={a} tone="muted">{t.allergen[a] ?? a.replace('-', ' ')}</Tag>)}
                  </div>
                </DishSection>
              )}

              {dish.story?.chefNote && (
                <blockquote className="relative mt-12 overflow-hidden rounded-[var(--radius-card)] border border-brass/30 bg-brass/[0.06] px-7 py-7 shadow-card first:mt-0 sm:px-9 sm:py-8">
                  <span aria-hidden="true" className="pointer-events-none absolute -right-3 -top-6 select-none font-serif text-[140px] italic leading-none text-brass/10">&ldquo;</span>
                  <div className={cn('relative', miniLabel)}>{t.chefNote}</div>
                  <p className="relative mt-4 font-serif text-[clamp(18px,1.8vw,22px)] italic leading-[1.55] text-cream">&ldquo;{dish.story.chefNote}&rdquo;</p>
                </blockquote>
              )}

              {!dish.story && (
                <p className="mt-12 font-serif text-[17px] italic leading-relaxed text-cream/60 first:mt-0">{t.noStory}</p>
              )}

              {siblings.length > 0 && (
                <DishSection title={<Rich text={t.more} vars={{ category: course }} locale={locale} />}>
                  <ul className={cn(glass, 'overflow-hidden')}>
                    {siblings.map(s => (
                      <li key={s.slug} className="border-t border-cream/[0.06] first:border-t-0">
                        <Link
                          href={href(`/menu/${s.slug}`)}
                          className="group flex items-baseline justify-between gap-4 px-5 py-3.5 transition-colors duration-300 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:bg-white/[0.06]"
                        >
                          <span className="min-w-0">
                            <span className="block font-display text-[16px] font-medium leading-tight text-cream transition-colors duration-300 group-hover:text-brass-light">{s.name}</span>
                            {s.thai && <span lang="th" className="mt-0.5 block font-serif text-[12.5px] italic text-cream/50">{s.thai}</span>}
                          </span>
                          {s.price && <span className="shrink-0 font-display text-[15px] font-medium text-brass-light">{s.price}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </DishSection>
              )}

              {/* SEO batch 8: an in-body, descriptive-anchor link from every dish
                  page to the Orange County field guide (the footer link exists
                  site-wide, but contextual links carry more weight). */}
              <p className="mt-10 border-t border-cream/10 pt-6 text-[14px] leading-relaxed text-cream/55">
                <Rich text={t.guide} locale={locale} linkClassName={inlineLink} />
              </p>

              <div className="mt-12">
                {ORDER_ONLINE_URL ? (
                  <Button href={ORDER_ONLINE_URL} target="_blank" rel="noopener" variant="primary" size="lg" arrow>
                    {t.order}
                  </Button>
                ) : (
                  <Button href={href('/contact/reservation')} variant="primary" size="lg" arrow>
                    {t.reserve}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
      {/* Poseidon plates close on the painted pompano (art pass, 9 Sep 2026). */}
      {dish.category === 'seafood' && (
        <ArtBand
          base="/images/art/pompano"
          widths={[900, 1600]}
          position="50% 50%"
          speed={0.12}
          fade="both"
          height="mt-16 h-[46vh] min-h-[300px] max-h-[560px] lg:mt-24"
        />
      )}
    </Section>
  );
}

function ParagraphsFrom({ text }: { text: string }) {
  // Render newline-separated paragraphs cleanly
  return (
    <>{text.split(/\n\s*\n/).map((para, i) => <p key={i}>{para}</p>)}</>
  );
}

function LensIf({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  return enabled ? <Lens zoom={1.7} size={190}>{children}</Lens> : <>{children}</>;
}
