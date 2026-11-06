import type { Metadata } from 'next';
import { A11yControls } from '@/components/A11yPanel';
import { Section, Container, Heading } from '@/components/ui/Section';
import { accessibility } from '@/lib/i18n/accessibility';
import { OG_LOCALE, alternatesFor, localePath, type Locale } from '@/lib/i18n/locales';
import { RESTAURANT, SITE_URL } from '@/lib/site';

/**
 * /accessibility and its seven twins — the accessibility statement plus the
 * guest's own switches (components/A11yPanel). Words: lib/i18n/accessibility.ts.
 */
export function accessibilityMetadata(locale: Locale): Metadata {
  const t = accessibility(locale);
  return {
    title: { absolute: t.metaTitle },
    description: t.metaDescription,
    alternates: alternatesFor(locale, '/accessibility'),
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      url: `${SITE_URL}${localePath(locale, '/accessibility')}`,
      type: 'article',
      locale: OG_LOCALE[locale],
    },
  };
}

const h2 = 'font-display text-[clamp(22px,2.6vw,30px)] font-medium leading-tight text-cream';
const p = 'mt-3 font-sans text-[16px] leading-relaxed text-cream/85';

export default function AccessibilityPage({ locale = 'en' }: { locale?: Locale }) {
  const t = accessibility(locale);
  const tel = `tel:${RESTAURANT.phone.replace(/[^\d+]/g, '')}`;
  return (
    <Section first tone="glow">
      <Container narrow>
        <Heading as="h1" size="lg">{t.title}</Heading>
        <p className="mt-5 max-w-2xl font-serif text-[18px] italic leading-relaxed text-cream/80">{t.lede}</p>

        <section aria-labelledby="a11y-standard" className="mt-12">
          <h2 id="a11y-standard" className={h2}>{t.standardH}</h2>
          <p className={p}>{t.standard}</p>
          <p className="mt-2 font-sans text-[13px] text-cream/70">{t.updated}</p>
        </section>

        <section aria-labelledby="a11y-features" className="mt-12">
          <h2 id="a11y-features" className={h2}>{t.featuresH}</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {t.features.map((f, i) => (
              <li key={i} className="flex gap-3 font-sans text-[16px] leading-relaxed text-cream/85">
                <span aria-hidden="true" className="mt-[11px] h-px w-5 shrink-0 bg-brass" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="a11y-prefs" className="mt-12 rounded-[var(--radius-card)] border border-brass/25 bg-white/[0.03] p-6 sm:p-8">
          <h2 id="a11y-prefs" className={h2}>{t.prefsH}</h2>
          <p className={p}>{t.prefsLede}</p>
          <div className="mt-6">
            <A11yControls />
          </div>
        </section>

        <section aria-labelledby="a11y-third" className="mt-12">
          <h2 id="a11y-third" className={h2}>{t.thirdH}</h2>
          <p className={p}>{t.third}</p>
        </section>

        <section aria-labelledby="a11y-feedback" className="mt-12">
          <h2 id="a11y-feedback" className={h2}>{t.feedbackH}</h2>
          <p className={p}>{t.feedback}</p>
          <ul className="mt-5 flex flex-col gap-3 font-sans text-[16px] sm:flex-row sm:gap-8">
            <li>
              <span className="mr-2 text-[11px] font-medium uppercase tracking-[0.2em] text-brass-light">{t.call}</span>
              <a href={tel} className="text-cream underline decoration-brass/50 underline-offset-4 hover:decoration-brass-light">{RESTAURANT.phone}</a>
            </li>
            <li>
              <span className="mr-2 text-[11px] font-medium uppercase tracking-[0.2em] text-brass-light">{t.email}</span>
              <a href={`mailto:${RESTAURANT.email}`} className="text-cream underline decoration-brass/50 underline-offset-4 [overflow-wrap:anywhere] hover:decoration-brass-light">{RESTAURANT.email}</a>
            </li>
          </ul>
        </section>

        <section aria-labelledby="a11y-dining" className="mt-12">
          <h2 id="a11y-dining" className={h2}>{t.diningH}</h2>
          <p className={p}>{t.dining}</p>
        </section>
      </Container>
    </Section>
  );
}
