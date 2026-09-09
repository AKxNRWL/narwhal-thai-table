import type { Metadata } from 'next';
import ReserveForm from '@/components/ReserveForm';
import Button from '@/components/ui/Button';
import { Section, Container } from '@/components/ui/Section';

export const metadata: Metadata = {
  alternates: { canonical: '/contact/reservation' },
  title: 'Reservations',
  description: 'Request a table at Narwhal Thai Table, Huntington Beach.',
};

export default function ReservationPage() {
  return (
    <Section first tone="glow">
      <Container narrow>
        <Button href="/contact" variant="ghost" className="text-[10.5px]">
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-0.5">←</span> Contact
        </Button>
        <h1 className="visually-hidden">Reserve a table at Narwhal Thai Table, Huntington Beach</h1>
        {/* Visible page title — decorative; the semantic h1 above carries the full SEO phrase. */}
        <p aria-hidden="true" className="mt-8 font-display text-[clamp(34px,4.6vw,60px)] font-medium leading-[1.04] tracking-[-0.015em] text-cream text-balance">
          Reservations
        </p>
        <p className="mt-4 max-w-xl font-serif text-[17px] italic leading-relaxed text-cream/70 sm:text-[18px]">
          Your reservation request is sent straight to{' '}
          <a
            href="mailto:reservations@narwhalthaihb.com"
            className="text-brass-light underline decoration-brass/40 underline-offset-4 transition-colors duration-300 [overflow-wrap:anywhere] hover:text-cream hover:decoration-brass-light"
          >
            reservations@narwhalthaihb.com
          </a>
        </p>
        <div className="mt-10">
          <ReserveForm />
        </div>
      </Container>
    </Section>
  );
}
