import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  alternates: { canonical: '/play' },
  title: 'Bubble Glide · While You Wait for Us to Open',
  description: 'A little narwhal game from Narwhal Thai Table while we finish getting the kitchen ready — glide through ten levels, catch the bubbles, win the Aurora crown.',
  openGraph: {
    title: 'Bubble Glide · Narwhal Thai Table',
    description: 'A little narwhal game while we get ready to open — ten levels, one Aurora crown.',
  },
};

/**
 * Bubble Glide — a self-contained HTML5 canvas game shipped as a static
 * file at /games/narwhal-game.html and embedded here in an <iframe>.
 *
 * Why an iframe (and not a ported React component):
 *   - The game is a tightly-scoped IIFE with its own CSS, audio, and
 *     localStorage namespace. The iframe isolates all of that from the
 *     marketing site so neither side can leak styles or globals.
 *   - The HTML page is fully responsive on its own; we just give it a
 *     fixed-width brass-framed slot in our layout.
 *
 * Layout:
 *   - Sits inside <main> alongside the rest of the site (the root layout
 *     already provides nav + footer + brand fonts).
 *   - The iframe slot is centered, max 520px wide, with a tall enough
 *     min-height to fit the canvas + on-screen overlay.
 */
export default function PlayPage() {
  return (
    <section className="play-section">
      <div className="container">
        <div className="section-head">
          <span className="label">While You Wait for Us to Open</span>
          <h2>Bubble Glide — <em>a little something from the kitchen</em>.</h2>
          <p>
            We&apos;re still polishing the pans and tasting the curries, but the doors aren&apos;t open yet. In the meantime — glide our narwhal through ten levels of bubbles, kelp and whirlpools. Catch the gold stars, dodge the ink, chase the Aurora crown. Hi-scores save to your own device.
          </p>
        </div>

        <div className="play-frame">
          <iframe
            src="/games/narwhal-game.html"
            title="Bubble Glide — a narwhal game by Narwhal Thai Table"
            loading="lazy"
            allow="autoplay; fullscreen"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="play-footnote">
          <p>
            Tap or drag to move. Arrow keys / WASD work too. Sound toggles in the top-right of the game.
          </p>
          <div className="play-cta-row">
            <Link href="/menu" className="btn-secondary" style={{ color: 'var(--navy)', borderColor: 'var(--line-dark)' }}>
              Back to the menu
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link href="/contact/reservation" className="btn-primary">
              Save a Seat
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
