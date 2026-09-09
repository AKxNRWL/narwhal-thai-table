import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import MapEmbed from '@/components/MapEmbed';
import { Section, Container, SectionHead, Eyebrow, Heading, cardSurface } from '@/components/ui/Section';
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

/* FAQ answer body — the FAQS entries are plain <p> + links, so the link
   styling is applied from the wrapper. */
const faqAnswer =
  'pt-4 text-[15.5px] leading-[1.75] text-cream/75 sm:pr-14 ' +
  '[&_a]:text-brass-light [&_a]:underline [&_a]:decoration-brass/40 [&_a]:underline-offset-4 [&_a]:transition-colors [&_a]:duration-300 ' +
  '[&_a:hover]:text-cream [&_a:hover]:decoration-brass-light';

export default function ContactHubPage() {
  return (
    <Section first tone="glow" id="contact">
      <Container>
        <SectionHead eyebrow="Come See Us" title={<>How can we <em>help?</em></>} />

        <div className="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-3 lg:gap-8">
          <ContactCard href="/contact/reservation" num="01" title="Reservations" email="reservations@narwhalthaihb.com" go="Book a table">
            Request a table &mdash; we&apos;ll confirm within a few hours.
          </ContactCard>
          <ContactCard href="/contact/catering" num="02" title={<>Catering &amp; Events</>} email="catering@narwhalthaihb.com" go="Plan an event">
            Buyouts, family-style tastings, off-site catering.
          </ContactCard>
          <ContactCard href="/contact/message" num="03" title="Say Hello" email="welcome@narwhalthaihb.com" go="Send a message">
            Questions, suppliers, press &mdash; we&apos;ll get back to you.
          </ContactCard>
        </div>

        {/* Find us — mirrors the "Visit the table" block on the home page */}
        <div className="mt-16 grid gap-10 border-t border-cream/10 pt-14 lg:mt-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-16 lg:pt-16">
          <div className="flex flex-col items-start gap-5">
            <Eyebrow>Find us</Eyebrow>
            <Heading as="h3" size="md">Visit the table</Heading>
            <p className="text-[16.5px] leading-[1.8] text-cream/75">19072 Beach Boulevard<br/>Huntington Beach, CA 92648<br/><a href="tel:+17143786003" className="text-cream transition-colors duration-300 hover:text-brass-light">(714) 378-6003</a><br/>Open every day &middot; Mon&ndash;Fri 11:30 AM &ndash; 10:00 PM &middot; Sat&ndash;Sun 12:00 PM &ndash; 10:00 PM</p>
          </div>
          <MapEmbed />
        </div>

        {/* FAQ — native <details>; the head stays pinned beside the list on desktop */}
        <div
          id="faq"
          className="mt-16 scroll-mt-[calc(var(--cs-ticker-h)+96px)] border-t border-cream/10 pt-14 lg:mt-20 lg:grid lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:pt-16"
        >
          <div className="lg:sticky lg:top-[calc(var(--cs-ticker-h)+96px)] lg:self-start">
            <SectionHead align="left" eyebrow="Good to Know" title={<>Questions we hear <em>a lot</em></>} />
          </div>
          <div className="mt-10 border-t border-cream/10 lg:mt-0">
            {FAQS.map((f) => (
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
                <div className={faqAnswer}>{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
