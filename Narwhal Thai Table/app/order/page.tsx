import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import MediaFrame from '@/components/MediaFrame';
import Button, { Arrow } from '@/components/ui/Button';
import { Section, Container, SectionHead, Tag, cardSurface } from '@/components/ui/Section';
import { cn } from '@/lib/cn';
import { DISHES } from '@/lib/dishes';
import { getDishImage } from '@/lib/media';
import { ORDER_ONLINE_URL, DIRECTIONS_URL, RESTAURANT } from '@/lib/site';

/**
 * /order — the ad landing page.
 *
 * WHY THIS PAGE EXISTS: the Google Ads campaign ("Order Thai Online Now")
 * was landing on the homepage, which opens with story and atmosphere — the
 * right welcome for a browser, the wrong one for someone who clicked an ad
 * because they are hungry RIGHT NOW. This page has one job: get that person
 * into the Toast order flow in one tap. Everything on it is either an order
 * path or removes a reason to hesitate (open status, hours, real photos).
 *
 * Conversion tracking needs no wiring here — AdsConversions.tsx listens
 * document-wide and fires the Ads conversion on any order.toasttab.com or
 * tel: click, including every link on this page.
 */

const DOORDASH_URL = 'https://www.doordash.com/store/50580864';

export const metadata: Metadata = {
  title: 'Order Online — Thai Takeout & Delivery',
  description:
    'Order Thai food online from Narwhal Thai Table in Huntington Beach — pickup on Beach Blvd or delivery. Hand-pounded curries, wok noodles, and 67 dishes cooked when you order. Open every day.',
  alternates: { canonical: '/order' },
  openGraph: {
    title: 'Order Online · Narwhal Thai Table',
    description:
      'Thai takeout & delivery in Huntington Beach — cooked to order, ready on Beach Blvd.',
  },
};

/* Inline text link inside body copy (brass, hairline underline). */
const inlineLink =
  'text-brass-light underline decoration-brass/40 underline-offset-4 transition-colors duration-300 hover:text-cream hover:decoration-brass-light';

/* Muted one-liners under the CTA row (hours, lunch pointer). */
const hoursLine = 'text-center font-sans text-[13.5px] leading-relaxed text-cream/60';

/* CTA buttons stack full-width on phones (one thumb, one tap) and sit in a
   row from the sm breakpoint up. */
const ctaBtn = 'w-full sm:w-auto';

/* One "How pickup works" step: a glass card with a serif numeral. The <ol>
   already conveys the order to assistive tech, so the numeral is decorative.
   Non-interactive → the card's hover lift is neutralised (same trick as the
   Experience pillars on the home page). */
function PickupStep({ num, children }: { num: string; children: ReactNode }) {
  return (
    <li className={cardSurface('h-full p-7 hover:translate-y-0 sm:p-8')}>
      <div aria-hidden="true" className="flex items-center gap-4">
        <span className="font-serif text-[30px] italic leading-none text-brass">{num}</span>
        <span className="h-px flex-1 bg-brass/25 transition-colors duration-500 group-hover:bg-brass/45" />
      </div>
      <p className="mt-5 text-[15.5px] leading-relaxed text-cream/70 [&_strong]:font-semibold [&_strong]:text-cream">{children}</p>
    </li>
  );
}

export default function OrderPage() {
  // Same photographed-signatures rule as the homepage preview: only real
  // plates on an ad landing page, never placeholders.
  const photographed = DISHES.filter(
    (d) => d.signature && (d.image?.src ?? getDishImage(d.slug)),
  ).slice(0, 6);

  return (
    <>
      {/* No FadeUp here on purpose — an ad click must see the order button and
          the plates instantly, with nothing waiting on a scroll observer. */}
      <Section first tone="glow">
        <Container>
          <SectionHead
            as="h1"
            eyebrow="Takeout & Delivery"
            title={<>Hungry now? <em>The wok is ready</em>.</>}
            lede="Every plate is cooked when you order it — nothing made ahead, nothing under a lamp. Order pickup on Beach Blvd, or have it brought to you."
          />

          {/* The one job of this page. Real <a href> to Toast + tel: — the Ads
              conversion listener keys off those literal hrefs. The primary is
              full-width and taller on phones so it is the obvious thumb target. */}
          <div className="mx-auto mt-10 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center">
            {ORDER_ONLINE_URL && (
              <Button
                href={ORDER_ONLINE_URL}
                target="_blank"
                rel="noopener"
                variant="primary"
                size="lg"
                arrow
                className={cn(ctaBtn, 'max-sm:py-5 max-sm:text-[13px]')}
              >
                Order Pickup — Toast
              </Button>
            )}
            <Button href={DOORDASH_URL} target="_blank" rel="noopener" variant="secondary" size="lg" arrow className={ctaBtn}>
              Delivery — DoorDash
            </Button>
            <Button href="tel:+17143786003" variant="secondary" size="lg" className={ctaBtn}>
              Call it in — (714) 378-6003
            </Button>
          </div>

          <p className={cn('mt-8', hoursLine)}>
            Open every day · Mon–Fri 11:30 AM – 10 PM · Sat–Sun 12 – 10 PM ·{' '}
            <a href={DIRECTIONS_URL} target="_blank" rel="noopener" className={inlineLink}>
              {RESTAURANT.address.street}, {RESTAURANT.address.city} →
            </a>
          </p>
          <p className={cn('mt-2.5', hoursLine)}>
            Weekday lunch? <Link href="/lunch" className={inlineLink}>Lunch specials from $11.99, Mon–Fri 11:30–3 →</Link>
          </p>

          <ol aria-label="How pickup works" className="mt-14 grid gap-6 md:grid-cols-3 lg:mt-20 lg:gap-8">
            <PickupStep num="1">
              <strong>Order online.</strong> The menu, your spice level, any allergies — checkout tells you exactly when it&apos;ll be ready.
            </PickupStep>
            <PickupStep num="2">
              <strong>We light the wok.</strong> Your order goes straight to the kitchen — it isn&apos;t cooked until you&apos;ve asked for it.
            </PickupStep>
            <PickupStep num="3">
              <strong>Grab it hot.</strong> Park right outside on Beach Blvd, tell us your name, and dinner&apos;s handled.
            </PickupStep>
          </ol>
        </Container>
      </Section>

      <Section className="border-t border-cream/[0.06]">
        <Container>
          <SectionHead title={<>People order these <em>first</em>.</>} />

          {/* Every card goes straight to Toast (real <a>, not a router Link) —
              the plate is the pitch, the tap is the order. */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-8">
            {photographed.map((d) => {
              const photo = d.image?.src ?? getDishImage(d.slug) ?? undefined;
              return (
                <a key={d.slug} href={ORDER_ONLINE_URL} target="_blank" rel="noopener" className={cardSurface('h-full')}>
                  <MediaFrame
                    ratio="4/3"
                    flush
                    hoverZoom
                    src={photo}
                    alt={`${d.name}${d.thai ? ` (${d.thai})` : ''} — Thai takeout in Huntington Beach`}
                    sizes="(max-width: 600px) 100vw, (max-width: 980px) 50vw, 33vw"
                  />
                  <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-display text-[19px] font-medium leading-tight text-cream">{d.name}</h3>
                        <span lang="th" className="mt-1 block font-serif text-[13px] italic text-cream/55">{d.thai}</span>
                      </div>
                      {d.price && (
                        <span className="shrink-0 font-display text-[17px] font-medium leading-tight text-brass-light">{d.price}</span>
                      )}
                    </div>
                    <p className="line-clamp-2 text-[14.5px] leading-relaxed text-cream/70">{d.description}</p>
                    <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-cream/10 pt-4">
                      <Tag>Signature</Tag>
                      {d.spicy && <Tag tone="spicy">Spicy</Tag>}
                      <span className="ml-auto inline-flex items-center gap-1.5 font-sans text-[10.5px] font-medium uppercase tracking-[0.18em] text-brass-light">
                        Add to your order <Arrow />
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          <p className="mx-auto mt-12 max-w-2xl text-center text-[15px] leading-relaxed text-cream/60 lg:mt-16">
            Sixty-seven dishes across thirteen categories — <Link href="/menu" className={inlineLink}>browse the full menu</Link> with every story and price.
            Dining in tonight instead? The patio is dog-friendly and the mango sticky rice is worth staying for — <Link href="/contact/reservation" className={inlineLink}>save a seat</Link>.
          </p>
        </Container>
      </Section>
    </>
  );
}
