import Link from 'next/link';
import type { Metadata } from 'next';
import CateringForm from '@/components/CateringForm';

export const metadata: Metadata = {
  title: 'Catering & Private Events',
  description: 'Catering, buyouts and private events at Narwhal Thai Table.',
};

export default function CateringPage() {
  return (
    <section className="contact">
      <div className="container" style={{ maxWidth: 760 }}>
        <Link href="/contact" className="label" style={{ color: 'var(--brass-light)', display: 'inline-block', marginBottom: '1.5rem', textDecoration: 'none' }}>
          ←&nbsp;Contact
        </Link>
        <p className="form-route-note">Your catering enquiry is sent straight to <a href="mailto:catering@narwhalthaihb.com">catering@narwhalthaihb.com</a></p>
        <CateringForm />
      </div>
    </section>
  );
}
