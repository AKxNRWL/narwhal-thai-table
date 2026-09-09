import type { Metadata } from 'next';
import CateringForm from '@/components/CateringForm';
import Button from '@/components/ui/Button';
import { Section, Container } from '@/components/ui/Section';

export const metadata: Metadata = {
  alternates: { canonical: '/contact/catering' },
  title: 'Catering & Private Events',
  description: 'Catering, buyouts and private events at Narwhal Thai Table.',
};

export default function CateringPage() {
  return (
    <Section first tone="glow">
      <Container narrow>
        <Button href="/contact" variant="ghost" className="text-[10.5px]">
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-0.5">←</span> Contact
        </Button>
        <h1 className="visually-hidden">Thai catering & private events in Huntington Beach</h1>
        {/* Visible page title — decorative; the semantic h1 above carries the full SEO phrase. */}
        <p aria-hidden="true" className="mt-8 font-display text-[clamp(34px,4.6vw,60px)] font-medium leading-[1.04] tracking-[-0.015em] text-cream text-balance">
          Catering &amp; Private Events
        </p>
        <p className="mt-4 max-w-xl font-serif text-[17px] italic leading-relaxed text-cream/70 sm:text-[18px]">
          Your catering enquiry is sent straight to{' '}
          <a
            href="mailto:catering@narwhalthaihb.com"
            className="text-brass-light underline decoration-brass/40 underline-offset-4 transition-colors duration-300 [overflow-wrap:anywhere] hover:text-cream hover:decoration-brass-light"
          >
            catering@narwhalthaihb.com
          </a>
        </p>
        <div className="mt-10">
          <CateringForm />
        </div>
      </Container>
    </Section>
  );
}
