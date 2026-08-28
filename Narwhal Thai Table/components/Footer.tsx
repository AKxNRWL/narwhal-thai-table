import Link from 'next/link';
import { RESTAURANT, SOCIAL } from '@/lib/site';

export default function Footer() {
  const { address } = RESTAURANT;
  const live = SOCIAL.filter((s) => s.url); // links appear the moment a URL is filled in lib/site.ts

  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-brand" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/images/logo-mark-cream.png" alt="" style={{ width: 54, height: 'auto', opacity: 0.95 }} />
          <span>Narwhal <em>Thai Table</em></span>
        </div>
        {/*
          Social URLs live in lib/site.ts — one place to paste each account URL
          as it goes live. Links with an empty URL are hidden entirely, so the
          site never ships dead `#` anchors.

          The /play link is a discrete pointer to the Bubble Glide mini-game —
          we intentionally don't put it in the main nav (it would feel
          off-brand against the fine-dining tone), but it lives here for
          anyone who knows to look.
        */}
        <nav className="footer-social" aria-label="Social and extras">
          <a href={`mailto:${RESTAURANT.email}`} aria-label="Email Narwhal Thai Table">{RESTAURANT.email}</a>
          {live.map((s) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Narwhal Thai Table on ${s.label}`}
            >
              {s.label}
            </a>
          ))}
          <Link href="/thai-food-orange-county" aria-label="Our field guide to Thai food in Orange County">Thai Food Guide</Link>
          <Link href="/play" aria-label="Play Bubble Glide, our narwhal mini-game">Bubble Glide</Link>
        </nav>
        {/* NAP line — consistent address (+ phone once set) helps local SEO. */}
        <div className="footer-copy" style={{ opacity: 0.85 }}>
          {address.street} · {address.city}, {address.region} {address.zip}
          {RESTAURANT.phone ? <> · <a href={`tel:${RESTAURANT.phone.replace(/[^\d+]/g, '')}`} style={{ color: 'inherit' }}>{RESTAURANT.phone}</a></> : null}
        </div>
        <div className="footer-copy">© 2026 Narwhal Hospitality LLC · Huntington Beach, CA</div>
      </div>
    </footer>
  );
}
