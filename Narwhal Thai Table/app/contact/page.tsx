import Link from 'next/link';
import type { Metadata } from 'next';
import MapEmbed from '@/components/MapEmbed';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Reservations, catering and private events, and general enquiries for Narwhal Thai Table in Huntington Beach.',
  alternates: { canonical: '/contact' },
};

export default function ContactHubPage() {
  return (
    <section className="contact" id="contact">
      <div className="container">
        <div className="section-head">
          <span className="label" style={{ color: 'var(--brass-light)' }}>Come See Us</span>
          <h2 style={{ color: 'var(--off-white)' }}>How can we <em style={{ color: 'var(--brass-light)' }}>help?</em></h2>
        </div>
        <div className="contact-cards">
          <Link className="contact-card" href="/contact/reservation">
            <span className="contact-card-num">01</span>
            <h3>Reservations</h3>
            <p>Request a table &mdash; we&apos;ll confirm within a few hours.</p>
            <span className="contact-card-email">reservations@narwhalthaihb.com</span>
            <span className="contact-card-go">Book a table <span aria-hidden="true">&rarr;</span></span>
          </Link>
          <Link className="contact-card" href="/contact/catering">
            <span className="contact-card-num">02</span>
            <h3>Catering &amp; Events</h3>
            <p>Buyouts, family-style tastings, off-site catering.</p>
            <span className="contact-card-email">catering@narwhalthaihb.com</span>
            <span className="contact-card-go">Plan an event <span aria-hidden="true">&rarr;</span></span>
          </Link>
          <Link className="contact-card" href="/contact/message">
            <span className="contact-card-num">03</span>
            <h3>Say Hello</h3>
            <p>Questions, suppliers, press &mdash; we&apos;ll get back to you.</p>
            <span className="contact-card-email">welcome@narwhalthaihb.com</span>
            <span className="contact-card-go">Send a message <span aria-hidden="true">&rarr;</span></span>
          </Link>
        </div>
        <div className="contact-visit">
          <div className="contact-visit-info">
            <span className="label">Find us</span>
            <h3>Visit the table</h3>
            <p>19072 Beach Boulevard<br/>Huntington Beach, CA 92648<br/><a href="tel:+17143786003" style={{ color: 'inherit' }}>(714) 378-6003</a><br/>Open every day &middot; Mon&ndash;Fri 11:30 AM &ndash; 10:00 PM &middot; Sat&ndash;Sun 12:00 PM &ndash; 10:00 PM</p>
          </div>
          <MapEmbed />
        </div>
      </div>
    </section>
  );
}
