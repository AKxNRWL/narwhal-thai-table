import Link from 'next/link';
import type { Metadata } from 'next';
import MapEmbed from '@/components/MapEmbed';
import { DIRECTIONS_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Reservations, catering and private events, hours, directions, and answers to common questions for Narwhal Thai Table in Huntington Beach.',
  alternates: { canonical: '/contact' },
};

/* FAQ note (SEO-13): plain content only — Google retired the FAQ rich result
   in May 2026, so there is deliberately NO FAQPage schema here. The value is
   the words themselves: real questions guests ask, answered honestly, in the
   language people search with. */
const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'Are you the same restaurant as Thai Gulf?',
    a: (
      <p>
        In a way — we bought Thai Gulf, then rebuilt it as our own. Same address on Beach
        Boulevard, new name, new habits: three siblings in the kitchen, curry pastes started in a
        granite mortar, every plate cooked when you order it. If you got here looking for Thai
        Gulf — welcome back. The table is still here. <Link href="/about">Read the whole story</Link>.
      </p>
    ),
  },
  {
    q: 'Do you take reservations?',
    a: (
      <p>
        Yes — <Link href="/contact/reservation">request a table</Link> and we&apos;ll confirm within a
        few hours, or call <a href="tel:+17143786003">(714) 378-6003</a>. Walk-ins are always
        welcome too.
      </p>
    ),
  },
  {
    q: 'Do you do takeout and delivery?',
    a: (
      <p>
        Both. Order pickup online and it&apos;s ready hot on Beach Blvd, or get delivery through
        DoorDash — everything is on the <Link href="/order">order page</Link>.
      </p>
    ),
  },
  {
    q: 'What are your hours?',
    a: <p>Open every day: Mon–Fri 11:30 AM–10 PM · Sat–Sun 12–10 PM. Weekday <Link href="/lunch">lunch specials</Link> run Mon–Fri 11:30 AM–3 PM.</p>,
  },
  {
    q: 'Do you have lunch specials?',
    a: (
      <p>
        Yes — Monday through Friday, 11:30 AM to 3 PM, <Link href="/lunch">lunch specials</Link> start
        at $11.99: Pad Thai, Pad See Ew, Pad Kee Mao, Krapow, Garlic &amp; Pepper, Cashew, Mixed
        Vegetables, or a Yellow or Panang curry. Every lunch comes with a fresh salad and a crispy
        spring roll, plus a cup of soup when you dine in. Call <a href="tel:+17143786003">(714) 378-6003</a> ahead for pickup.
      </p>
    ),
  },
  {
    q: 'How spicy is the food?',
    a: (
      <p>
        As spicy as you ask. Every dish is cooked to order, so you set the heat — mild, medium,
        spicy, or Thai hot. Not sure? Start medium. We&apos;d rather you come back tomorrow than
        sweat through tonight.
      </p>
    ),
  },
  {
    q: 'Can you cook vegetarian? What about allergies?',
    a: (
      <p>
        Many dishes can be made vegetarian — just ask. Eating gluten-free? Tell us when you
        order and we&apos;ll point you to the rice-based plates that can be cooked without soy
        sauce or wheat that day. And always tell us about an allergy when you order: we cook
        each plate fresh, but our kitchen works with peanuts, shellfish, egg, soy, and wheat
        every day, so we can&apos;t promise zero cross-contact.
      </p>
    ),
  },
  {
    q: 'What should we order first?',
    a: (
      <p>
        The plates people ask about most: <Link href="/menu/crab-fried-rice">Super Crab Fried Rice</Link>,{' '}
        <Link href="/menu/narwhal-chicken-wings">Narwhal Chicken Wings</Link>,{' '}
        <Link href="/menu/og-pad-thai">OG Pad Thai</Link>, <Link href="/menu/panang-curry">Panang Curry</Link>{' '}
        and the <Link href="/menu/fried-whole-pompano">Fried Whole Pompano</Link> for the table. Order a
        curry and a wok dish to share, and save room for dessert.
      </p>
    ),
  },
  {
    q: 'What should we order for dessert?',
    a: (
      <p>
        <Link href="/menu/mango-sticky-rice">Mango Sticky Rice</Link> is the one we&apos;d send you home
        with — warm coconut sticky rice, ripe mango, a whisper of salt. The{' '}
        <Link href="/menu/coconut-ice-cream-bread">Coconut Ice Cream &amp; Bread</Link> is the Bangkok
        street classic, and the <Link href="/menu/narwhal-sundae">Narwhal Sundae</Link> is built for
        sharing.
      </p>
    ),
  },
  {
    q: 'Where exactly are you?',
    a: (
      <p>
        19072 Beach Blvd, Suite A &amp; B, Huntington Beach — in the plaza on Beach Boulevard at
        Garfield Avenue.{' '}
        <a href={DIRECTIONS_URL} target="_blank" rel="noopener">Get directions</a>.
      </p>
    ),
  },
  {
    q: 'Is there parking?',
    a: (
      <p>
        Yes, and it&apos;s free — park in the plaza lot right in front of the restaurant. If the lot
        is busy, there&apos;s free street parking nearby too. Coming from{' '}
        <Link href="/thai-food-fountain-valley">Fountain Valley</Link> or{' '}
        <Link href="/thai-food-westminster">Westminster</Link>? We&apos;re about 8 and 12 minutes away.
      </p>
    ),
  },
  {
    q: 'Do you cater events?',
    a: (
      <p>
        We do — off-site catering, family-style tastings, and full buyouts.{' '}
        <Link href="/contact/catering">Tell us about your event</Link>.
      </p>
    ),
  },
];

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
        <div className="faq-wrap" id="faq">
          <div className="section-head">
            <span className="label" style={{ color: 'var(--brass-light)' }}>Good to Know</span>
            <h2 style={{ color: 'var(--off-white)' }}>Questions we hear <em style={{ color: 'var(--brass-light)' }}>a lot</em></h2>
          </div>
          <div className="faq-list">
            {FAQS.map((f) => (
              <details key={f.q} className="faq-item">
                <summary>{f.q}</summary>
                {f.a}
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
