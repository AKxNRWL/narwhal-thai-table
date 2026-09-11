import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import MapEmbed from '@/components/MapEmbed';
import { Section, Container, SectionHead, Eyebrow, Heading, cardSurface } from '@/components/ui/Section';
import { DIRECTIONS_URL } from '@/lib/site';
import { ui } from '@/lib/i18n';
import { OG_LOCALE, alternatesFor, localePath, type Locale } from '@/lib/i18n/locales';
import Rich from '@/lib/i18n/rich';

/**
 * /contact and /vi/contact — the hub: three doors, the map, and the FAQ.
 *
 * FAQ note (SEO-13): plain content only — Google retired the FAQ rich result
 * in May 2026, so there is deliberately NO FAQPage schema here. The value is
 * the words themselves: real questions guests ask, answered honestly, in the
 * language people search with (now in Vietnamese too).
 */

export function contactMetadata(locale: Locale): Metadata {
  const t = ui(locale).meta.contact;
  return {
    title: t.title,
    description: t.description,
    alternates: alternatesFor(locale, '/contact'),
    ...(locale === 'vi' ? { openGraph: { locale: OG_LOCALE.vi, title: t.title, description: t.description } } : {}),
  };
}

/* Same glass card as HomeSections.ContactSection so the home teaser and this
   hub read as one system. */
function ContactCard({ href, num, title, email, go, children }: { href: string; num: string; title: ReactNode; email: string; go: string; children: ReactNode }) {
  return (
    <Link href={href} className={cardSurface('h-full p-7 sm:p-8')}>
      <span className="font-sans text-[11px] font-medium tracking-[0.3em] text-brass/80">{num}</span>
      <h3 className="mt-5 font-display text-[22px] font-medium leading-tight text-cream">{title}</h3>
      <p className="mt-3 text-[15px] leading-relaxed text-cream/70">{children}</p>
      <span className="mt-5 block break-all font-sans text-[12.5px] text-cream/50">{email}</span>
      <span className="mt-auto inline-flex items-center gap-2 pt-6 font-sans text-[10.5px] font-medium uppercase tracking-[0.18em] text-brass-light">
        {go} <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">&rarr;</span>
      </span>
    </Link>
  );
}

/* FAQ answer body — the answers are plain paragraphs + links, so the link
   styling is applied from the wrapper. */
const faqAnswer =
  'pt-4 text-[15.5px] leading-[1.75] text-cream/75 sm:pr-14 ' +
  '[&_a]:text-brass-light [&_a]:underline [&_a]:decoration-brass/40 [&_a]:underline-offset-4 [&_a]:transition-colors [&_a]:duration-300 ' +
  '[&_a:hover]:text-cream [&_a:hover]:decoration-brass-light';

export default function ContactPage({ locale = 'en' }: { locale?: Locale }) {
  const t = ui(locale).contact;
  const c = t.cards;
  const href = (p: string) => localePath(locale, p);
  return (
    <Section first tone="glow" id="contact">
      <Container>
        <SectionHead eyebrow={t.eyebrow} title={<Rich text={t.title} locale={locale} />} />

        <div className="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-3 lg:gap-8">
          <ContactCard href={href('/contact/reservation')} num="01" title={c.reservation.title} email="reservations@narwhalthaihb.com" go={c.reservation.go}>
            {c.reservation.body}
          </ContactCard>
          <ContactCard href={href('/contact/catering')} num="02" title={c.catering.title} email="catering@narwhalthaihb.com" go={c.catering.go}>
            {c.catering.body}
          </ContactCard>
          <ContactCard href={href('/contact/message')} num="03" title={c.message.title} email="welcome@narwhalthaihb.com" go={c.message.go}>
            {c.message.body}
          </ContactCard>
        </div>

        {/* Find us — mirrors the "Visit the table" block on the home page */}
        <div className="mt-16 grid gap-10 border-t border-cream/10 pt-14 lg:mt-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-16 lg:pt-16">
          <div className="flex flex-col items-start gap-5">
            <Eyebrow>{t.findEyebrow}</Eyebrow>
            <Heading as="h3" size="md">{t.findTitle}</Heading>
            <p className="text-[16.5px] leading-[1.8] text-cream/75">19072 Beach Boulevard<br/>Huntington Beach, CA 92648<br/><a href="tel:+17143786003" className="text-cream transition-colors duration-300 hover:text-brass-light">(714) 378-6003</a><br/>{t.findHours}</p>
          </div>
          <MapEmbed title={ui(locale).contactHome.mapTitle} label={ui(locale).contactHome.mapLink} />
        </div>

        {/* FAQ — native <details>; the head stays pinned beside the list on desktop */}
        <div
          id="faq"
          className="mt-16 scroll-mt-[calc(var(--cs-ticker-h)+96px)] border-t border-cream/10 pt-14 lg:mt-20 lg:grid lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:pt-16"
        >
          <div className="lg:sticky lg:top-[calc(var(--cs-ticker-h)+96px)] lg:self-start">
            <SectionHead align="left" eyebrow={t.faqEyebrow} title={<Rich text={t.faqTitle} locale={locale} />} />
          </div>
          <div className="mt-10 border-t border-cream/10 lg:mt-0">
            {t.faqs.map((f) => (
              <details key={f.q} className="faq-item group border-b border-cream/10 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-lg font-display text-[17px] font-medium leading-snug text-cream transition-colors duration-300 hover:text-brass-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-light focus-visible:ring-offset-4 focus-visible:ring-offset-navy-deep group-open:text-brass-light sm:text-[19px]">
                  <span>{f.q}</span>
                  <span
                    aria-hidden="true"
                    className="faq-plus grid size-8 shrink-0 place-items-center rounded-full border border-brass/30 bg-brass/[0.06] text-brass-light group-hover:border-brass/60 group-open:bg-brass/15"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" focusable="false">
                      <path d="M6 1v10M1 6h10" />
                    </svg>
                  </span>
                </summary>
                <div className={faqAnswer}>
                  <p><Rich text={f.a} vars={{ directions: DIRECTIONS_URL }} locale={locale} /></p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
