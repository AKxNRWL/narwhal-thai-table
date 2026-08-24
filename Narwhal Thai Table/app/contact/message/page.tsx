import Link from 'next/link';
import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  alternates: { canonical: '/contact/message' },
  title: 'Contact Us',
  description: 'Questions, suppliers, press — get in touch with Narwhal Thai Table.',
};

export default function MessagePage() {
  return (
    <section className="contact">
      <div className="container" style={{ maxWidth: 760 }}>
        <Link href="/contact" className="label" style={{ color: 'var(--brass-light)', display: 'inline-block', marginBottom: '1.5rem', textDecoration: 'none' }}>
          ←&nbsp;Contact
        </Link>
        <h1 className="visually-hidden">Contact Narwhal Thai Table, Huntington Beach</h1>
        <p className="form-route-note">Your message is sent straight to <a href="mailto:welcome@narwhalthaihb.com">welcome@narwhalthaihb.com</a></p>
        <ContactForm />
      </div>
    </section>
  );
}
