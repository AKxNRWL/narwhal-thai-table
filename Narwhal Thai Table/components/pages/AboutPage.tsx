import type { Metadata } from 'next';
import MediaFrame from '@/components/MediaFrame';
import ArtBand from '@/components/fx/ArtBand';
import Button from '@/components/ui/Button';
import { Section, Container, SectionHead } from '@/components/ui/Section';
import { cn } from '@/lib/cn';
import { DISHES } from '@/lib/dishes';
import { SITE_URL, RESTAURANT_ID, DIRECTIONS_URL, RESTAURANT } from '@/lib/site';
import { ui } from '@/lib/i18n';
import { LOCALE_TAG, OG_LOCALE, alternatesFor, localePath, type Locale } from '@/lib/i18n/locales';
import Rich from '@/lib/i18n/rich';

/**
 * /about and /vi/about — the entity page.
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
 * The words live in lib/i18n (EN / VI).
 */

export function aboutMetadata(locale: Locale): Metadata {
  const t = ui(locale).meta.about;
  return {
    title: { absolute: t.title },
    description: t.description,
    alternates: alternatesFor(locale, '/about'),
    openGraph: {
      title: t.ogTitle,
      description: t.description,
      url: `${SITE_URL}${localePath(locale, '/about')}`,
      type: 'article',
      locale: OG_LOCALE[locale],
      images: [{ url: '/images/room/family-spread.jpg', width: 1448, height: 1086, alt: t.ogImageAlt }],
    },
  };
}

function aboutJsonLd(locale: Locale) {
  const m = ui(locale).meta.about;
  const t = ui(locale).about;
  const url = `${SITE_URL}${localePath(locale, '/about')}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': `${url}#page`,
        url,
        name: m.title,
        description: m.description,
        inLanguage: LOCALE_TAG[locale],
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
          { '@type': 'Person', name: 'Aileen', jobTitle: t.coOwner },
          { '@type': 'Person', name: 'Annie', jobTitle: t.coOwner },
          { '@type': 'Person', name: 'AK', jobTitle: t.coOwner },
        ],
        foundingDate: '2026-07',
        foundingLocation: { '@type': 'Place', name: 'Huntington Beach, California' },
        slogan: t.slogan,
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

export default function AboutPage({ locale = 'en' }: { locale?: Locale }) {
  const t = ui(locale).about;
  const href = (p: string) => localePath(locale, p);
  // Values the fact table and prose interpolate — kept out of the dictionaries
  // so NAP facts have exactly one source (lib/site.ts).
  const vars = { email: RESTAURANT.email, street: RESTAURANT.address.street, directions: DIRECTIONS_URL, count: DISHES.length };
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd(locale)) }} />

      <Container narrow>
        <SectionHead
          align="left"
          as="h1"
          size="lg"
          eyebrow={t.eyebrow}
          title={<Rich text={t.title} locale={locale} />}
          lede={t.lede}
        />
      </Container>

      {/* The photo pair breaks out to the full column between the narrow intro and the narrow story. */}
      <Container className="mt-12 grid gap-4 lg:mt-16 lg:grid-cols-[1.5fr_1fr]">
        <MediaFrame
          ratio="16/10"
          src="/images/room/family-spread.jpg"
          alt={t.spreadAlt}
          sizes="(max-width: 900px) 100vw, 60vw"
          className="border border-brass/20 shadow-card"
        />
        {/* 16/15 next to a 16/10 frame at 1.5fr:1fr — same rendered height. */}
        <MediaFrame
          ratio="16/15"
          src="/images/room/storefront.jpg"
          alt={t.storefrontAlt}
          sizes="(max-width: 900px) 100vw, 40vw"
          className="border border-brass/20 shadow-card"
        />
      </Container>

      <Container narrow className="mt-16 lg:mt-24">
        <div className="prose-nt">
          <h2><Rich text={t.h2Origin} locale={locale} /></h2>
          <p>{t.origin1}</p>
          <p>{t.origin2}</p>

          <h2><Rich text={t.h2Values} locale={locale} /></h2>
          <ul>
            {t.values.map((v, i) => (
              <li key={i}><Rich text={v} vars={vars} locale={locale} /></li>
            ))}
          </ul>

          <h2><Rich text={t.h2Order} locale={locale} /></h2>
          <p><Rich text={t.order} locale={locale} /></p>
        </div>
      </Container>

      {/* The fact sheet — every owner-confirmed fact in one crawlable table. */}
      <Container narrow className="mt-16 lg:mt-20">
        <div aria-labelledby="fact-list-title" className={glassCard}>
          <h2 id="fact-list-title" className={blockTitle}><Rich text={t.factsTitle} locale={locale} /></h2>
          <dl className={cn('mt-7 border-t border-cream/10', inlineLinks)}>
            {t.facts.map((f) => (
              <div key={f.k} className="grid gap-x-6 gap-y-1 border-b border-cream/10 py-3 sm:grid-cols-[180px_1fr]">
                <dt className="font-sans text-[10.5px] font-medium uppercase tracking-[0.22em] text-brass-light sm:pt-1">{f.k}</dt>
                <dd className="text-[15.5px] leading-[1.65] text-cream/80"><Rich text={f.v} vars={vars} locale={locale} /></dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>

      <Container narrow className="mt-16 lg:mt-20">
        <div className="prose-nt">
          <h2>{t.timelineTitle}</h2>
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
          {t.timeline.map((item, i) => (
            <li key={i} className={timelineItem}><Rich text={item} locale={locale} /></li>
          ))}
        </ul>

        {/* Reserve + directions already live in the phone action bar — hide those two there. */}
        <div className="mt-14 flex flex-wrap items-center gap-3 border-t border-cream/10 pt-10">
          <Button href={href('/menu')} variant="primary" arrow>{t.seeMenu}</Button>
          <Button href={href('/contact/reservation')} variant="secondary" className="max-[760px]:hidden">{t.reserve}</Button>
          <Button href={DIRECTIONS_URL} variant="secondary" target="_blank" rel="noopener" className="max-[760px]:hidden">{t.directions}</Button>
        </div>
      </Container>
    </Section>
    </>
  );
}
