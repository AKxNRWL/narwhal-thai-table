import type { Metadata } from 'next';
import Link from 'next/link';
import FilmPlayer from '@/components/FilmPlayer';
import { Section, Container, SectionHead } from '@/components/ui/Section';
import { cn } from '@/lib/cn';
import { latestFilms, posterUrl, watchUrl, embedUrl, YOUTUBE } from '@/lib/films';
import { SITE_URL, SOCIAL, RESTAURANT_ID } from '@/lib/site';

/**
 * /watch — "while you wait".
 *
 * WHY THIS PAGE EXISTS: the paper placemat (Oct 2026) carries two QR codes —
 * THE MENU → /menu and WHILE YOU WAIT → here. A guest who has just ordered
 * scans it and gets the restaurant's films (the YouTube channel, newest first,
 * read live from the channel feed so nothing here goes stale) and one tap to
 * each of our four channels. It is the placemat's second half, not a social
 * links page: the film plays right here, on our own domain, and the follow
 * buttons come after.
 *
 * Channel names are written as words on purpose (no platform logos) — the
 * footer does the same.
 */

export const revalidate = 3600; // the channel feed is re-read once an hour

const TITLE = 'Watch — films from Narwhal Thai Table, Huntington Beach';
const DESCRIPTION =
  'Short films from the Narwhal Thai Table kitchen in Huntington Beach, CA — and where to follow along: YouTube, Instagram, TikTok and Facebook.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/watch' },
  openGraph: {
    title: 'While you wait · Narwhal Thai Table',
    description: DESCRIPTION,
    url: `${SITE_URL}/watch`,
    type: 'website',
  },
};

/** The four windows, in the order they go on the page — drawn from lib/site.ts. */
const NOTES: Record<string, string> = {
  YouTube: 'Our films, the long ones',
  Instagram: 'Plates, the patio, reels',
  TikTok: 'Quick cuts from the kitchen',
  Facebook: 'News, hours and events',
};
const ORDER = ['YouTube', 'Instagram', 'TikTok', 'Facebook'];

const linkRow =
  'group flex items-center justify-between gap-5 rounded-[var(--radius-card)] border border-cream/10 bg-white/[0.035] px-5 py-5 shadow-card ' +
  'transition-[transform,border-color,background-color] duration-300 ease-out-soft hover:-translate-y-0.5 hover:border-brass/50 hover:bg-white/[0.05] ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-light focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep sm:px-7';
const blockTitle =
  'font-display text-[clamp(26px,3vw,34px)] font-medium leading-[1.15] tracking-[-0.01em] text-cream text-balance [&_em]:font-serif [&_em]:font-normal [&_em]:italic [&_em]:text-brass-light';
const quietLink =
  'inline-flex items-center gap-2 border-b border-transparent font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-brass-light transition-colors duration-300 hover:border-brass-light/60 hover:text-cream';

export default async function WatchPage() {
  const films = await latestFilms();
  const channels = ORDER.map((l) => SOCIAL.find((s) => s.label === l && s.url)).filter((s): s is NonNullable<typeof s> => !!s);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/watch#page`,
        url: `${SITE_URL}/watch`,
        name: TITLE,
        description: DESCRIPTION,
        inLanguage: 'en-US',
        about: { '@id': RESTAURANT_ID },
      },
      ...films.map((f) => ({
        '@type': 'VideoObject',
        '@id': `${SITE_URL}/watch#${f.id}`,
        name: f.title,
        description: `${f.title} — a short film from Narwhal Thai Table, Huntington Beach.`,
        thumbnailUrl: [posterUrl(f.id, 'max'), posterUrl(f.id, 'hq')],
        uploadDate: f.published || undefined,
        embedUrl: embedUrl(f.id),
        contentUrl: watchUrl(f.id),
        publisher: { '@id': RESTAURANT_ID },
      })),
    ],
  };

  return (
    <Section first tone="glow">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Container narrow>
        <SectionHead
          align="left"
          as="h1"
          size="lg"
          eyebrow="While you wait"
          title={<>Stories from <em>our table</em>.</>}
          lede={
            <>
              Short films from the Narwhal kitchen and the family behind it. Press play — the sound is yours to turn
              on — and follow along for the next one.
            </>
          }
        />
      </Container>

      <Container narrow className="mt-10 lg:mt-12">
        <FilmPlayer films={films} label="Films from Narwhal Thai Table" />
        <p className="mt-5 font-serif text-[15px] italic leading-relaxed text-cream/60">
          New films go up on{' '}
          <a href={YOUTUBE.url} target="_blank" rel="noopener noreferrer" className="text-brass-light underline decoration-brass/40 underline-offset-4 transition-colors hover:text-cream">
            YouTube {YOUTUBE.handle}
          </a>{' '}
          first; this page catches up within the hour.
        </p>
      </Container>

      {/* Follow — four windows on the same kitchen */}
      <Container narrow className="mt-16 lg:mt-20">
        <h2 className={blockTitle}>
          Follow <em>along</em>
        </h2>
        <p className="mt-3 max-w-xl font-serif text-[16px] italic leading-relaxed text-cream/60">The same kitchen, four windows.</p>
        <ul className="mt-7 grid gap-3 sm:grid-cols-2">
          {channels.map((s) => (
            <li key={s.label}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className={linkRow}>
                <span className="min-w-0">
                  <span className="block font-sans text-[10.5px] font-medium uppercase tracking-[0.3em] text-brass-light">{s.label}</span>
                  <span className="mt-1.5 block truncate font-display text-[19px] tracking-[0.02em] text-cream">{s.handle}</span>
                  <span className="mt-1 block font-serif text-[14px] italic text-cream/55">{NOTES[s.label]}</span>
                </span>
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cream/15 text-brass-light transition-[transform,border-color,background-color,color] duration-300 group-hover:translate-x-0.5 group-hover:border-brass-light group-hover:bg-brass group-hover:text-navy"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17 17 7M8 7h9v9" />
                  </svg>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Container>

      {/* Back to the table */}
      <Container narrow className="mt-16 lg:mt-20">
        <div className={cn('flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-cream/10 pt-8')}>
          <Link href="/menu" className={quietLink}>
            The menu <span aria-hidden="true">→</span>
          </Link>
          <Link href="/contact/reservation" className={quietLink}>
            Reserve a table <span aria-hidden="true">→</span>
          </Link>
          <Link href="/play" className={quietLink}>
            A little game for the table <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Container>
    </Section>
  );
}
