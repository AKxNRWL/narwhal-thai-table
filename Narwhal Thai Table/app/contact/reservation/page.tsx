import Link from 'next/link';
import type { Metadata } from 'next';
import ReserveForm from '@/components/ReserveForm';

export const metadata: Metadata = {
  alternates: { canonical: '/contact/reservation' },
  title: 'Reservations',
  description: 'Request a table at Narwhal Thai Table, Huntington Beach.',
};

export default function ReservationPage() {
  return (
    <section className="contact">
      <div className="container" style={{ maxWidth: 760 }}>
        <Link href="/contact" className="label" style={{ color: 'var(--brass-light)', display: 'inline-block', marginBottom: '1.5rem', textDecoration: 'none' }}>
          ←&nbsp;Contact
        </Link>
        <h1 className="visually-hidden">Reserve a table at Narwhal Thai Table, Huntington Beach</h1>
        <p className="form-route-note">Your reservation request is sent straight to <a href="mailto:reservations@narwhalthaihb.com">reservations@narwhalthaihb.com</a></p>
        <ReserveForm />
      </div>
    </section>
  );
}
