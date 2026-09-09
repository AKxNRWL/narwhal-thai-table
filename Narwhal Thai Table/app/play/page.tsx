import type { Metadata } from 'next';
import Button from '@/components/ui/Button';
import { Section, Container, SectionHead } from '@/components/ui/Section';

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
 *   - The game page centres a portrait stage (500×620 canvas, max 520px
 *     wide) inside its own body, so the frame here is portrait on phones and
 *     a fixed 720px tall from `sm` up — tall enough for the whole stage plus
 *     the on-screen overlay without inner scrolling.
 */
export default function PlayPage() {
  return (
    <Section first tone="glow">
      <Container narrow>
        <SectionHead
          align="left"
          as="h2"
          size="md"
          eyebrow="While You Wait for Us to Open"
          title={<>Bubble Glide — <em>a little something from the kitchen</em>.</>}
          lede={
            <>
              We&apos;re still polishing the pans and tasting the curries, but the doors aren&apos;t open yet. In the meantime — glide our narwhal through ten levels of bubbles, kelp and whirlpools. Catch the gold stars, dodge the ink, chase the Aurora crown. Hi-scores save to your own device.
            </>
          }
        />
      </Container>

      <Container narrow className="mt-12 lg:mt-16">
        <div className="relative isolate w-full overflow-hidden rounded-[var(--radius-card)] border border-brass/25 bg-navy shadow-card aspect-[4/5] sm:aspect-auto sm:h-[720px]">
          <iframe
            className="absolute inset-0 h-full w-full"
            src="/games/narwhal-game.html"
            title="Bubble Glide — a narwhal game by Narwhal Thai Table"
            loading="lazy"
            allow="autoplay; fullscreen"
            referrerPolicy="no-referrer"
          />
        </div>

        <p className="mt-6 text-[14.5px] leading-relaxed text-cream/60">
          Tap or drag to move. Arrow keys / WASD work too. Sound toggles in the top-right of the game.
        </p>

        {/* Reserve already lives in the phone action bar — hide it there. */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button href="/menu" variant="secondary" arrow>Back to the menu</Button>
          <Button href="/contact/reservation" variant="primary" arrow className="max-[760px]:hidden">Save a Seat</Button>
        </div>
      </Container>
    </Section>
  );
}
