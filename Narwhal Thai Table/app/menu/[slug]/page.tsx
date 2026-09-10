import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MediaFrame from '@/components/MediaFrame';
import Lens from '@/components/fx/Lens';
import ArtBand from '@/components/fx/ArtBand';
import GoldCorners from '@/components/fx/GoldCorners';
import Button from '@/components/ui/Button';
import { Section, Container, Eyebrow, Heading, Tag } from '@/components/ui/Section';
import { cn } from '@/lib/cn';
import { DISHES, getDishBySlug, type Dish } from '@/lib/dishes';
import { getDishImage } from '@/lib/media';
import { getCategoryLabel } from '@/lib/categories';
import { ORDER_ONLINE_URL, SITE_URL, RESTAURANT_ID } from '@/lib/site';

type Params = { slug: string };

/* Statically generate every dish page at build time. */
export function generateStaticParams(): Params[] {
  return DISHES.map(d => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const dish = getDishBySlug(slug);
  if (!dish) return { title: 'Dish not found' };
  const photo = dish.image?.src ?? getDishImage(dish.slug);
  const description = dish.story?.lede ?? dish.description;
  return {
    // Geo + cuisine in the title: these 67 pages target exactly the long-tail
    // "<dish> huntington beach" / "<dish> near me" queries. The layout template
    // appends "· Narwhal Thai Table", so we only add the locality here.
    title: `${dish.name} — Thai in Huntington Beach`,
    description,
    alternates: { canonical: `/menu/${slug}` },
    openGraph: {
      title: `${dish.name} · Narwhal Thai Table`,
      description,
      type: 'article',
      ...(photo
        ? { images: [{ url: photo, alt: `${dish.name} at Narwhal Thai Table, Huntington Beach` }] }
        : {}),
    },
  };
}

export default async function DishPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const dish = getDishBySlug(slug);
  if (!dish) notFound();

  return <DishDetail dish={dish} />;
}

/** Parse "$12" / "$12.50" → 12 / 12.5; undefined for "MKT"/blank. */
function priceNumber(p?: string): number | undefined {
  if (!p) return undefined;
  const m = p.replace(/,/g, '').match(/\d+(\.\d+)?/);
  return m ? Number(m[0]) : undefined;
}

/** Home › Menu › <Course> › <Dish> — one per dish page. */
function breadcrumbJsonLd(dish: Dish) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Narwhal Thai Table', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Menu', item: `${SITE_URL}/menu` },
      { '@type': 'ListItem', position: 3, name: getCategoryLabel(dish.category), item: `${SITE_URL}/menu` },
      { '@type': 'ListItem', position: 4, name: dish.name },
    ],
  };
}

/** Per-dish MenuItem markup, tied back to the one Restaurant entity by @id. */
function dishJsonLd(dish: Dish, photo?: string | null) {
  const price = priceNumber(dish.price);
  return {
    '@context': 'https://schema.org',
    '@type': 'MenuItem',
    '@id': `${SITE_URL}/menu/${dish.slug}#menuitem`,
    name: dish.name,
    alternateName: dish.thai || undefined,
    description: dish.story?.lede ?? dish.description,
    url: `${SITE_URL}/menu/${dish.slug}`,
    ...(photo ? { image: `${SITE_URL}${photo}` } : {}),
    ...(price !== undefined
      ? { offers: { '@type': 'Offer', price, priceCurrency: 'USD', availability: 'https://schema.org/InStock' } }
      : {}),
    ...(dish.ingredients?.length ? { recipeIngredient: dish.ingredients } : {}),
    menuAddOn: { '@type': 'MenuSection', name: 'Sides & Protein', url: `${SITE_URL}/menu` },
    isPartOf: { '@type': 'Menu', name: 'Narwhal Thai Table Menu', url: `${SITE_URL}/menu` },
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

function DishDetail({ dish }: { dish: Dish }) {
  const photo = dish.image?.src ?? getDishImage(dish.slug);
  // Sibling dishes in the same category — turns 67 orphan pages into 13
  // interlinked topical clusters and gives guests somewhere to go next.
  const siblings = DISHES.filter(d => d.category === dish.category && d.slug !== dish.slug).slice(0, 5);
  const hasMeta = Boolean(dish.signature || dish.spicy || dish.variants?.length);
  const placeholder = (
    <div className="text-center">
      <div className="font-display text-[64px] italic leading-none text-brass">★</div>
      <div className="mt-4 font-sans text-[10px] uppercase tracking-[0.32em] text-brass-light">Photo coming soon</div>
      <div className="mt-2 font-serif text-[20px] italic text-cream">{dish.name}</div>
    </div>
  );

  return (
    <Section as="article" first>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dishJsonLd(dish, photo)) }}
      />
      {/* Breadcrumb trail — tells Google this page sits under /menu rather
          than floating on its own, and renders as "narwhalthaihb.com › Menu ›
          Curry" under the result instead of a bare URL. Mirrors the visible
          "Back to menu" link and the category label below it. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(dish)) }}
      />
      <Container>
        <Button href="/menu" variant="ghost" className="text-[10.5px]">
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-0.5">←</span> Back to menu
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
                alt={dish.image?.alt ?? `${dish.name}${dish.thai ? ` (${dish.thai})` : ''} — ${dish.description} Served at Narwhal Thai Table, Huntington Beach.`}
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
            <Eyebrow>{getCategoryLabel(dish.category)}</Eyebrow>
            <Heading as="h1" size="lg" className="mt-5">
              {dish.name}
              {dish.signature && <em> — Signature</em>}
            </Heading>
            {dish.thai && <div lang="th" className="mt-3 font-serif text-[clamp(18px,1.8vw,22px)] italic text-cream/60">{dish.thai}</div>}

            {dish.story?.lede && (
              <p className="mt-6 max-w-2xl font-serif text-[clamp(18px,1.7vw,21px)] italic leading-[1.6] text-cream/80">{dish.story.lede}</p>
            )}

            {hasMeta && (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {dish.signature && <Tag>★ Signature</Tag>}
                {dish.spicy && <Tag tone="spicy">Spicy</Tag>}
                {dish.variants?.map(v => <Tag key={v} tone="muted">{v}</Tag>)}
              </div>
            )}

            {dish.price && (
              <div className="mt-6 font-display text-[clamp(36px,4vw,52px)] font-medium leading-none tracking-[-0.01em] text-brass-light">{dish.price}</div>
            )}

            <div className="mt-12 border-t border-cream/10 pt-12">
              {/* Long-form sections — each renders only if data exists */}
              {dish.story?.history && (
                <DishSection title={<>Where it comes <em>from</em></>}>
                  <div className={cn('flex flex-col gap-4', bodyText)}>
                    <ParagraphsFrom text={dish.story.history} />
                  </div>
                </DishSection>
              )}

              {dish.story?.howToEat && (
                <DishSection title={<>How to <em>eat it</em></>}>
                  <div className={cn('flex flex-col gap-4', bodyText)}>
                    <ParagraphsFrom text={dish.story.howToEat} />
                  </div>
                </DishSection>
              )}

              {dish.ingredients && dish.ingredients.length > 0 && (
                <DishSection title={<>What&apos;s in <em>the bowl</em></>}>
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
                <DishSection title={<>What goes <em>with it</em></>}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {dish.pairing.drink && (
                      <div className={cn(glass, 'p-5 sm:p-6')}>
                        <h4 className={miniLabel}>To drink</h4>
                        <p className="mt-3 text-[15.5px] leading-relaxed text-cream/80">{dish.pairing.drink}</p>
                      </div>
                    )}
                    {dish.pairing.sides && dish.pairing.sides.length > 0 && (
                      <div className={cn(glass, 'p-5 sm:p-6')}>
                        <h4 className={miniLabel}>On the side</h4>
                        <p className="mt-3 text-[15.5px] leading-relaxed text-cream/80">{dish.pairing.sides.join(' · ')}</p>
                      </div>
                    )}
                  </div>
                </DishSection>
              )}

              {dish.allergens && dish.allergens.length > 0 && (
                <DishSection title={<>Good to <em>know</em></>}>
                  <p className={bodyText}>
                    Contains the following common allergens — please flag any sensitivities when you order and we&apos;ll adjust:
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {dish.allergens.map(a => <Tag key={a} tone="muted">{a.replace('-', ' ')}</Tag>)}
                  </div>
                </DishSection>
              )}

              {dish.story?.chefNote && (
                <blockquote className="relative mt-12 overflow-hidden rounded-[var(--radius-card)] border border-brass/30 bg-brass/[0.06] px-7 py-7 shadow-card first:mt-0 sm:px-9 sm:py-8">
                  <span aria-hidden="true" className="pointer-events-none absolute -right-3 -top-6 select-none font-serif text-[140px] italic leading-none text-brass/10">&ldquo;</span>
                  <div className={cn('relative', miniLabel)}>— From our kitchen</div>
                  <p className="relative mt-4 font-serif text-[clamp(18px,1.8vw,22px)] italic leading-[1.55] text-cream">&ldquo;{dish.story.chefNote}&rdquo;</p>
                </blockquote>
              )}

              {!dish.story && (
                <p className="mt-12 font-serif text-[17px] italic leading-relaxed text-cream/60 first:mt-0">
                  We&apos;re still writing the story for this plate — it&apos;ll show up here soon. In the meantime, ask your server about the dish when you visit.
                </p>
              )}

              {siblings.length > 0 && (
                <DishSection title={<>More from <em>{getCategoryLabel(dish.category)}</em></>}>
                  <ul className={cn(glass, 'overflow-hidden')}>
                    {siblings.map(s => (
                      <li key={s.slug} className="border-t border-cream/[0.06] first:border-t-0">
                        <Link
                          href={`/menu/${s.slug}`}
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

              {/* SEO batch 8: an in-body, descriptive-anchor link from all 67 dish
                  pages to the Orange County field guide (the footer link exists
                  site-wide, but contextual links carry more weight). */}
              <p className="mt-10 border-t border-cream/10 pt-6 text-[14px] leading-relaxed text-cream/55">
                Not sure how to judge a plate like this? Read our field guide to the{' '}
                <Link href="/thai-food-orange-county" className={inlineLink}>best Thai food in Orange County</Link> — five
                signs of a real Thai kitchen, and what to order once you&apos;re in one.
              </p>

              <div className="mt-12">
                {ORDER_ONLINE_URL ? (
                  <Button href={ORDER_ONLINE_URL} target="_blank" rel="noopener" variant="primary" size="lg" arrow>
                    Order Online
                  </Button>
                ) : (
                  <Button href="/contact/reservation" variant="primary" size="lg" arrow>
                    Save a Seat
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
