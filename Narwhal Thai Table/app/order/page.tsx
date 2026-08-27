import type { Metadata } from 'next';
import Link from 'next/link';
import MediaFrame from '@/components/MediaFrame';
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

export default function OrderPage() {
  // Same photographed-signatures rule as the homepage preview: only real
  // plates on an ad landing page, never placeholders.
  const photographed = DISHES.filter(
    (d) => d.signature && (d.image?.src ?? getDishImage(d.slug)),
  ).slice(0, 6);

  return (
    <section className="menu-section order-page" style={{ paddingTop: 140 }}>
      <div className="container">
        <div className="section-head">
          <span className="label">Takeout &amp; Delivery</span>
          <h1>Hungry now? <em>The wok is ready</em>.</h1>
          <p>
            Every plate is cooked when you order it — nothing made ahead, nothing under a lamp.
            Order pickup on Beach Blvd, or have it brought to you.
          </p>
        </div>

        <div className="order-ctas">
          {ORDER_ONLINE_URL && (
            <a href={ORDER_ONLINE_URL} target="_blank" rel="noopener" className="btn-primary">
              Order Pickup — Toast
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          )}
          <a href={DOORDASH_URL} target="_blank" rel="noopener" className="btn-secondary">
            Delivery — DoorDash
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a href="tel:+17143786003" className="btn-secondary">
            Call it in — (714) 378-6003
          </a>
        </div>

        <p className="order-hours">
          Open every day · Mon–Fri 11:30 AM – 10 PM · Sat–Sun 12 – 10 PM ·{' '}
          <a href={DIRECTIONS_URL} target="_blank" rel="noopener">
            {RESTAURANT.address.street}, {RESTAURANT.address.city} →
          </a>
        </p>

        <div className="order-steps" aria-label="How pickup works">
          <div className="order-step">
            <span className="order-step-num">1</span>
            <p><strong>Order online.</strong> The menu, your spice level, any allergies — checkout tells you exactly when it&apos;ll be ready.</p>
          </div>
          <div className="order-step">
            <span className="order-step-num">2</span>
            <p><strong>We light the wok.</strong> Your order goes straight to the kitchen — it isn&apos;t cooked until you&apos;ve asked for it.</p>
          </div>
          <div className="order-step">
            <span className="order-step-num">3</span>
            <p><strong>Grab it hot.</strong> Park right outside on Beach Blvd, tell us your name, and dinner&apos;s handled.</p>
          </div>
        </div>

        <div className="section-head" style={{ marginTop: 72 }}>
          <h2>People order these <em>first</em>.</h2>
        </div>

        <div className="sig-grid">
          {photographed.map((d) => {
            const photo = d.image?.src ?? getDishImage(d.slug) ?? undefined;
            return (
              <a key={d.slug} href={ORDER_ONLINE_URL} target="_blank" rel="noopener" className="sig-card">
                <MediaFrame
                  ratio="4/3"
                  src={photo}
                  alt={`${d.name}${d.thai ? ` (${d.thai})` : ''} — Thai takeout in Huntington Beach`}
                  sizes="(max-width: 600px) 100vw, (max-width: 980px) 50vw, 33vw"
                />
                <div className="sig-body">
                  <div className="sig-head">
                    <div className="sig-name">{d.name}<span className="thai">{d.thai}</span></div>
                    {d.price && <div className="sig-price">{d.price}</div>}
                  </div>
                  <p className="sig-desc">{d.description}</p>
                  <div className="sig-foot">
                    <span className="sig-tag">Signature</span>
                    {d.spicy && <span className="sig-tag spicy">Spicy</span>}
                    <span className="sig-read">Add to your order</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        <p className="menu-note" style={{ marginTop: 48 }}>
          Sixty-seven dishes across thirteen categories — <Link href="/menu" style={{ color: 'var(--brass-light)' }}>browse the full menu</Link> with every story and price.
          Dining in tonight instead? Dinner here ends with ice cream on the house — <Link href="/contact/reservation" style={{ color: 'var(--brass-light)' }}>save a seat</Link>.
        </p>
      </div>
    </section>
  );
}
