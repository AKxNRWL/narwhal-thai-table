import type { Metadata } from 'next';
import ReserveForm from '@/components/ReserveForm';
import ContactForm from '@/components/ContactForm';
import CateringForm from '@/components/CateringForm';
import Button from '@/components/ui/Button';
import { Section, Container } from '@/components/ui/Section';
import { ui } from '@/lib/i18n';
import { OG_LOCALE, alternatesFor, localePath, type Locale } from '@/lib/i18n/locales';

/**
 * /contact/{reservation,message,catering} and their /vi twins — one shell,
 * three forms. Each form posts English field values whatever the language, so
 * the team reads every request the same way.
 */
export type ContactKind = 'reservation' | 'message' | 'catering';

const EMAIL: Record<ContactKind, string> = {
  reservation: 'reservations@narwhalthaihb.com',
  message: 'welcome@narwhalthaihb.com',
  catering: 'catering@narwhalthaihb.com',
};

export function contactSubMetadata(kind: ContactKind, locale: Locale): Metadata {
  const t = ui(locale).meta[kind];
  return {
    title: t.title,
    description: t.description,
    alternates: alternatesFor(locale, `/contact/${kind}`),
    ...(locale === 'vi' ? { openGraph: { locale: OG_LOCALE.vi, title: t.title, description: t.description } } : {}),
  };
}

export default function ContactSubPage({ kind, locale = 'en' }: { kind: ContactKind; locale?: Locale }) {
  const t = ui(locale).contactSub;
  const k = t[kind];
  const email = EMAIL[kind];
  return (
    <Section first tone="glow">
      <Container narrow>
        <Button href={localePath(locale, '/contact')} variant="ghost" className="text-[10.5px]">
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-0.5">←</span> {t.back}
        </Button>
        <h1 className="visually-hidden">{k.h1}</h1>
        {/* Visible page title — decorative; the semantic h1 above carries the full SEO phrase. */}
        <p aria-hidden="true" className="mt-8 font-display text-[clamp(34px,4.6vw,60px)] font-medium leading-[1.04] tracking-[-0.015em] text-cream text-balance">
          {k.title}
        </p>
        <p className="mt-4 max-w-xl font-serif text-[17px] italic leading-relaxed text-cream/70 sm:text-[18px]">
          {k.sent}
          <a
            href={`mailto:${email}`}
            className="text-brass-light underline decoration-brass/40 underline-offset-4 transition-colors duration-300 [overflow-wrap:anywhere] hover:text-cream hover:decoration-brass-light"
          >
            {email}
          </a>
        </p>
        <div className="mt-10">
          {kind === 'reservation' && <ReserveForm locale={locale} />}
          {kind === 'message' && <ContactForm locale={locale} />}
          {kind === 'catering' && <CateringForm locale={locale} />}
        </div>
      </Container>
    </Section>
  );
}
