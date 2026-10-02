'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import BorderBeam from '@/components/fx/BorderBeam';
import Marquee from '@/components/fx/Marquee';
import Particles from '@/components/fx/Particles';
import Tilt from '@/components/fx/Tilt';
import { cn } from '@/lib/cn';
import { embedUrl, posterUrl, watchUrl, type Film } from '@/lib/films';
import { openStatus } from '@/lib/serviceHours';
import SocialEmbed from './SocialEmbed';

/**
 * Narwhal TV — the /watch page as a television home screen.
 *
 * Owner, 1 Oct 2026: make /watch the restaurant's social hub, "ล้ำ ๆ", lots of
 * motion, like a Google TV / Vidaa launcher but ours. So: a status bar with the
 * live clock and open/closed chip; a SPOTLIGHT that auto-rotates through the
 * channel's films (poster with a slow Ken Burns drift, progress pills, press
 * play → the film plays right there); an APPS row of tiles — the four social
 * channels and the house apps (menu, reserve, rewards, game); a FILMS shelf
 * (choosing a title plays it in the spotlight, the TV way); the three
 * CHANNEL panels with the platforms' live embeds; a PICKS shelf of signature
 * dishes; and a marquee of handles at the bottom. Arrow keys walk the shelves.
 * Everything is the house palette — navy, cream, brass — with one accent per
 * platform. Words, not logos.
 */

export type Channel = {
  key: 'youtube' | 'instagram' | 'tiktok' | 'facebook';
  label: string;
  handle: string;
  url: string;
  note: string;
  /** the platform's own public embed, when it has one */
  embed?: { src: string; height: number };
};

export type Pick = { slug: string; name: string; thai: string; price?: string; image: string | null };

const DWELL_MS = 8000;

/* per-platform accents (glow + gradient), everything else stays navy/cream/brass */
const ACCENT: Record<Channel['key'] | 'house', { glow: string; from: string; to: string }> = {
  youtube: { glow: 'rgba(255,77,77,0.55)', from: '#3b1016', to: '#140a10' },
  instagram: { glow: 'rgba(255,122,184,0.5)', from: '#3a1232', to: '#170a1b' },
  tiktok: { glow: 'rgba(92,242,255,0.45)', from: '#0e2c36', to: '#0a1420' },
  facebook: { glow: 'rgba(106,163,255,0.5)', from: '#10213d', to: '#0a1424' },
  house: { glow: 'rgba(200,162,78,0.5)', from: '#13304a', to: '#0a1a2b' },
};

/* ------------------------------------------------------------------ */
/* status bar                                                          */
/* ------------------------------------------------------------------ */
function StatusBar() {
  const [time, setTime] = useState('');
  const [status, setStatus] = useState<{ open: boolean; label: string; short: string } | null>(null);
  useEffect(() => {
    const tick = () => {
      setTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
      setStatus(openStatus());
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex items-center justify-between gap-4 px-5 pb-3 pt-4 sm:px-8 lg:px-12">
      <Link href="/" className="group flex shrink-0 items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-mark-cream.png" alt="" className="h-auto w-8 opacity-95 transition-transform duration-500 group-hover:-rotate-6" />
        <span className="whitespace-nowrap font-display text-[14px] uppercase tracking-[0.18em] text-cream">
          Narwhal <em className="font-serif normal-case italic tracking-normal text-brass-light">TV</em>
        </span>
      </Link>
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <span
          className={cn(
            'inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 font-sans text-[9.5px] font-medium uppercase tracking-[0.16em] transition-opacity duration-700 sm:text-[10px] sm:tracking-[0.2em]',
            status ? 'opacity-100' : 'opacity-0',
            status?.open ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-brass/30 bg-brass/10 text-brass-light',
          )}
        >
          <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', status?.open ? 'tv-live bg-emerald-400' : 'bg-brass')} />
          <span className="sm:hidden">{status?.short ?? 'Open daily'}</span>
          <span className="hidden sm:inline">{status?.label ?? 'Open every day'}</span>
        </span>
        {/* the phone has its own clock in the status bar — the TV clock is for bigger screens */}
        <span className={cn('hidden font-mono text-[13px] tabular-nums tracking-[0.08em] text-cream/80 transition-opacity duration-700 sm:inline', time ? 'opacity-100' : 'opacity-0')}>
          {time || '0:00 PM'}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* spotlight                                                           */
/* ------------------------------------------------------------------ */
function Spotlight({
  films,
  index,
  playing,
  onIndex,
  onPlay,
}: {
  films: Film[];
  index: number;
  playing: boolean;
  onIndex: (i: number) => void;
  onPlay: (v: boolean) => void;
}) {
  const film = films[index] ?? films[0];
  const [cycle, setCycle] = useState(0); // restarts the progress animation after a manual pick

  // auto-advance while nothing is playing
  useEffect(() => {
    if (playing || films.length < 2) return;
    const id = setTimeout(() => onIndex((index + 1) % films.length), DWELL_MS);
    return () => clearTimeout(id);
  }, [index, playing, films.length, onIndex]);

  if (!film) return null;
  return (
    <section aria-label="Now showing" className="px-3 sm:px-8 lg:px-12">
      <div
        className={cn(
          'relative isolate overflow-hidden rounded-[var(--radius-card)] border border-brass/25 bg-navy shadow-card',
          playing ? 'aspect-video' : 'aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]',
        )}
      >
        {playing ? (
          <iframe
            key={film.id}
            src={embedUrl(film.id, true)}
            title={film.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <>
            {/* backdrop: the film's own poster, drifting */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={film.id}
              src={posterUrl(film.id, 'max')}
              alt=""
              aria-hidden="true"
              className="tv-kenburns absolute inset-0 h-full w-full object-cover"
              onError={(e) => {
                const el = e.currentTarget;
                if (!el.src.endsWith('hqdefault.jpg')) el.src = posterUrl(film.id, 'hq');
              }}
            />
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,18,31,0.25)_0%,rgba(6,18,31,0.05)_35%,rgba(6,18,31,0.72)_72%,#06121F_100%)]" />
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,18,31,0.55)_0%,transparent_55%)] max-sm:hidden" />
            <Particles className="absolute inset-0 opacity-70" quantity={36} size={1.2} />

            {/* the title block */}
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-5 sm:p-8 lg:max-w-[60%] lg:p-10">
              <span className="inline-flex items-center gap-3 font-sans text-[10.5px] font-medium uppercase tracking-[0.3em] text-brass-light">
                <span className="shiny-text">Now showing</span>
                {films.length > 1 && <span className="text-cream/50">· {index + 1} / {films.length}</span>}
              </span>
              <h1 className="heading-gold font-display text-[clamp(30px,5.2vw,60px)] font-medium leading-[1.02] tracking-[-0.015em] text-cream text-balance">
                {film.title}
              </h1>
              <p className="font-serif text-[15px] italic text-cream/65 sm:text-[16px]">
                A short film from Narwhal Thai Table{film.published ? ` · ${new Date(film.published + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : ''}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onPlay(true)}
                  data-magnetic
                  className="btn-shine group inline-flex items-center gap-2.5 rounded-full bg-brass px-6 py-3.5 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-navy shadow-[0_10px_30px_-10px_rgba(200,162,78,0.7)] transition-[transform,background-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:bg-brass-light hover:shadow-[0_18px_40px_-12px_rgba(200,162,78,0.75)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-light focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l12-7.5z" /></svg>
                  Play
                </button>
                <a
                  href={watchUrl(film.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-cream/20 bg-white/[0.04] px-5 py-3.5 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-cream backdrop-blur-md transition-colors duration-300 hover:border-brass-light/70 hover:text-brass-light"
                >
                  Open on YouTube ↗
                </a>
              </div>
            </div>

            {/* progress pills — one per film, the active one fills over the dwell */}
            {films.length > 1 && (
              <div className="absolute right-5 top-5 flex items-center gap-1.5 sm:right-8 sm:top-7">
                {films.map((f, i) => (
                  <button
                    key={f.id}
                    type="button"
                    aria-label={`Show ${f.title}`}
                    onClick={() => {
                      onIndex(i);
                      setCycle((c) => c + 1);
                    }}
                    className={cn('relative h-1 overflow-hidden rounded-full bg-cream/25 transition-[width] duration-500', i === index ? 'w-9' : 'w-3 hover:bg-cream/50')}
                  >
                    {i === index && <span key={cycle} className="tv-progress absolute inset-0 block rounded-full bg-brass-light" style={{ ['--tv-dwell' as string]: `${DWELL_MS}ms` }} />}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
        <BorderBeam size={300} duration={16} radius={22} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* shelf — a horizontal, snapping row with arrow keys and arrow buttons */
/* ------------------------------------------------------------------ */
function Shelf({
  title,
  aside,
  children,
  className,
}: {
  title: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const nudge = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const items = Array.from(ref.current?.querySelectorAll<HTMLElement>('[data-tv-item]') ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (i < 0) return;
    const next = items[i + (e.key === 'ArrowRight' ? 1 : -1)];
    if (next) {
      e.preventDefault();
      next.focus();
      next.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };
  return (
    <section className={cn('relative', className)}>
      <div className="mb-3 flex items-end justify-between gap-4 px-5 sm:px-8 lg:px-12">
        <h2 className="font-display text-[clamp(20px,2.4vw,26px)] font-medium tracking-[-0.01em] text-cream [&_em]:font-serif [&_em]:font-normal [&_em]:italic [&_em]:text-brass-light">{title}</h2>
        <div className="flex items-center gap-3">
          {aside}
          <div className="hidden items-center gap-1.5 lg:flex">
            {([-1, 1] as const).map((d) => (
              <button
                key={d}
                type="button"
                aria-label={d < 0 ? 'Scroll left' : 'Scroll right'}
                onClick={() => nudge(d)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-cream/15 text-cream/70 transition-colors hover:border-brass-light hover:text-brass-light"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {d < 0 ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div ref={ref} onKeyDown={onKey} className="tv-scroll flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-4 pt-2 scroll-px-5 sm:gap-4 sm:px-8 sm:scroll-px-8 lg:px-12 lg:scroll-px-12">
        {children}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* app tile                                                            */
/* ------------------------------------------------------------------ */
function AppTile({
  accent,
  label,
  sub,
  note,
  href,
  external,
}: {
  accent: keyof typeof ACCENT;
  label: string;
  sub: string;
  note?: string;
  href: string;
  external?: boolean;
}) {
  const a = ACCENT[accent];
  const inner = (
    <>
      <span aria-hidden="true" className="tv-tile absolute inset-0" style={{ background: `linear-gradient(135deg, ${a.from}, ${a.to} 55%, ${a.from})` }} />
      <span aria-hidden="true" className="absolute -right-6 -top-8 h-28 w-28 rounded-full opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100" style={{ background: a.glow }} />
      <span aria-hidden="true" className="absolute inset-0 rounded-[inherit] border border-white/[0.08] transition-colors duration-300 group-hover:border-brass-light/60 group-focus-visible:border-brass-light" />
      <span className="relative flex h-full flex-col justify-between p-4">
        <span className="flex items-start justify-between">
          <span className="font-sans text-[9.5px] font-medium uppercase tracking-[0.26em] text-cream/55">{note ?? 'Channel'}</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-cream/15 text-cream/70 transition-[transform,color,border-color] duration-300 group-hover:translate-x-0.5 group-hover:border-brass-light group-hover:text-brass-light">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {external ? <path d="M7 17 17 7M8 7h9v9" /> : <path d="M5 12h14M12 5l7 7-7 7" />}
            </svg>
          </span>
        </span>
        <span>
          <span className="block font-display text-[20px] leading-tight tracking-[0.02em] text-cream">{label}</span>
          <span className="mt-1 block truncate font-serif text-[13px] italic text-cream/60">{sub}</span>
        </span>
      </span>
    </>
  );
  const cls =
    'group relative block h-[132px] w-[150px] shrink-0 snap-start overflow-hidden rounded-[18px] bg-navy shadow-card transition-[transform,box-shadow] duration-300 hover:shadow-lift focus-visible:outline-none sm:h-[146px] sm:w-[172px]';
  return (
    <Tilt max={9} scale={1.03} className="shrink-0 snap-start">
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" data-tv-item className={cls}>
          {inner}
        </a>
      ) : (
        <Link href={href} data-tv-item className={cls}>
          {inner}
        </Link>
      )}
    </Tilt>
  );
}

/* ------------------------------------------------------------------ */
/* channel panel — platform embed in a TV frame                        */
/* ------------------------------------------------------------------ */
function ChannelPanel({ ch }: { ch: Channel }) {
  const a = ACCENT[ch.key];
  return (
    <article className="relative isolate overflow-hidden rounded-[var(--radius-card)] border border-cream/10 bg-[#0a1a2b] shadow-card">
      <span aria-hidden="true" className="pointer-events-none absolute -left-10 -top-16 h-44 w-44 rounded-full opacity-60 blur-3xl" style={{ background: a.glow }} />
      <header className="relative flex items-center justify-between gap-4 px-5 py-4">
        <div className="min-w-0">
          <span className="block font-sans text-[9.5px] font-medium uppercase tracking-[0.3em] text-brass-light">{ch.label}</span>
          <span className="mt-0.5 block truncate font-display text-[17px] tracking-[0.02em] text-cream">{ch.handle}</span>
        </div>
        <a
          href={ch.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-cream/15 px-3.5 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-cream/80 transition-colors hover:border-brass-light hover:text-brass-light"
        >
          Open ↗
        </a>
      </header>
      {ch.embed && <SocialEmbed src={ch.embed.src} height={ch.embed.height} title={`${ch.label} — ${ch.handle}`} className="rounded-b-[var(--radius-card)]" />}
      <footer className="relative flex items-center justify-between px-5 py-3 text-cream/45">
        <span className="font-serif text-[13px] italic">{ch.note}</span>
        <span className="tv-eq flex h-3 items-end gap-[3px]" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="block w-[3px] rounded-sm bg-brass-light/70" style={{ height: '100%', animationDelay: `${i * 160}ms` }} />
          ))}
        </span>
      </footer>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* the screen                                                          */
/* ------------------------------------------------------------------ */
export default function NarwhalTV({ films, channels, picks }: { films: Film[]; channels: Channel[]; picks: Pick[] }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const onIndex = useCallback((i: number) => setIndex(i), []);

  const playFilm = (i: number) => {
    setIndex(i);
    setPlaying(true);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const byKey = (k: Channel['key']) => channels.find((c) => c.key === k);
  const yt = byKey('youtube');
  const panels = channels.filter((c) => c.embed);

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-navy-deep pb-16 pt-[calc(var(--cs-ticker-h)+84px)]">
      <div aria-hidden="true" className="aurora pointer-events-none absolute -inset-[10%] -z-10 opacity-60" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(200,162,78,0.16),transparent_70%)]" />

      <div ref={topRef} className="scroll-mt-[calc(var(--cs-ticker-h)+80px)]" />
      <StatusBar />

      <Spotlight films={films} index={index} playing={playing} onIndex={onIndex} onPlay={setPlaying} />

      {/* apps */}
      <Shelf className="mt-8" title={<>Apps</>}>
        {yt && <AppTile accent="youtube" label="YouTube" sub={yt.handle} note="Films" href={yt.url} external />}
        {byKey('instagram') && <AppTile accent="instagram" label="Instagram" sub={byKey('instagram')!.handle} note="Reels" href={byKey('instagram')!.url} external />}
        {byKey('tiktok') && <AppTile accent="tiktok" label="TikTok" sub={byKey('tiktok')!.handle} note="Clips" href={byKey('tiktok')!.url} external />}
        {byKey('facebook') && <AppTile accent="facebook" label="Facebook" sub={byKey('facebook')!.handle} note="News" href={byKey('facebook')!.url} external />}
        <AppTile accent="house" label="The Menu" sub="75 dishes, with photos" note="House" href="/menu" />
        <AppTile accent="house" label="Reserve" sub="Save a seat" note="House" href="/contact/reservation" />
        <AppTile accent="house" label="Rewards" sub="Earn points at the table" note="House" href="/points" />
        <AppTile accent="house" label="Bubble Glide" sub="A little game" note="Play" href="/play" />
      </Shelf>

      {/* films */}
      <Shelf
        className="mt-6"
        title={<>Films <em>from our table</em></>}
        aside={
          yt && (
            <a href={yt.url} target="_blank" rel="noopener noreferrer" className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-brass-light transition-colors hover:text-cream">
              Channel ↗
            </a>
          )
        }
      >
        {films.map((f, i) => (
          <button
            key={f.id}
            type="button"
            data-tv-item
            onClick={() => playFilm(i)}
            aria-current={i === index ? 'true' : undefined}
            className={cn(
              'group relative w-[240px] shrink-0 snap-start overflow-hidden rounded-[18px] border bg-navy text-left shadow-card transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lift focus-visible:outline-none sm:w-[300px]',
              i === index ? 'border-brass-light/80' : 'border-cream/10 hover:border-brass/60 focus-visible:border-brass-light',
            )}
          >
            <span className="block aspect-video w-full overflow-hidden bg-navy">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={posterUrl(f.id, 'hq')} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
            </span>
            <span aria-hidden="true" className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-cream/30 bg-navy-deep/60 text-brass-light backdrop-blur-md transition-colors group-hover:bg-brass group-hover:text-navy">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5"><path d="M7 4.5v15l12-7.5z" /></svg>
            </span>
            <span className="block px-4 py-3">
              <span className="block truncate font-display text-[15px] tracking-[0.02em] text-cream">{f.title}</span>
              <span className="mt-0.5 block font-sans text-[9.5px] uppercase tracking-[0.22em] text-cream/45">{i === index && playing ? 'Now playing' : 'YouTube'}</span>
            </span>
          </button>
        ))}
        {films.length < 3 && (
          <div className="flex w-[240px] shrink-0 snap-start items-center justify-center rounded-[18px] border border-dashed border-cream/15 px-6 text-center sm:w-[300px]">
            <span className="font-serif text-[14px] italic leading-relaxed text-cream/50">More films are on the way — new ones appear here within the hour of going up on YouTube.</span>
          </div>
        )}
      </Shelf>

      {/* channels — the platforms' own live embeds */}
      {panels.length > 0 && (
        <section className="mt-10 px-5 sm:px-8 lg:px-12">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="font-display text-[clamp(20px,2.4vw,26px)] font-medium tracking-[-0.01em] text-cream">
              Live <em className="font-serif font-normal italic text-brass-light">from our channels</em>
            </h2>
            <span className="hidden font-sans text-[10px] uppercase tracking-[0.22em] text-cream/40 sm:block">Tap any post to open it</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {panels.map((ch) => (
              <ChannelPanel key={ch.key} ch={ch} />
            ))}
          </div>
        </section>
      )}

      {/* picks */}
      {picks.length > 0 && (
        <Shelf
          className="mt-10"
          title={<>Tonight&apos;s <em>picks</em></>}
          aside={
            <Link href="/menu" className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-brass-light transition-colors hover:text-cream">
              Full menu →
            </Link>
          }
        >
          {picks.map((p) => (
            <Link
              key={p.slug}
              href={`/menu/${p.slug}`}
              data-tv-item
              className="group relative w-[200px] shrink-0 snap-start overflow-hidden rounded-[18px] border border-cream/10 bg-navy shadow-card transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-brass/60 hover:shadow-lift focus-visible:border-brass-light focus-visible:outline-none sm:w-[230px]"
            >
              <span className="block aspect-[4/3] w-full overflow-hidden bg-navy">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt={p.name} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-serif text-[18px] italic text-brass-light/70">{p.thai}</span>
                )}
              </span>
              <span className="block px-4 py-3">
                <span className="block truncate font-display text-[15px] tracking-[0.02em] text-cream">{p.name}</span>
                <span className="mt-0.5 flex items-baseline justify-between gap-3">
                  <span className="truncate font-serif text-[13px] italic text-cream/55">{p.thai}</span>
                  {p.price && <span className="font-mono text-[11px] text-brass-light">{p.price}</span>}
                </span>
              </span>
            </Link>
          ))}
        </Shelf>
      )}

      {/* ticker of handles */}
      <div className="mt-10 border-y border-cream/10 py-3">
        <Marquee duration={40} gap={48}>
          {[...channels, ...channels].map((c, i) => (
            <span key={`${c.key}-${i}`} className="flex items-center gap-3 whitespace-nowrap font-sans text-[10.5px] font-medium uppercase tracking-[0.26em] text-cream/55">
              <span className="text-brass-light">{c.label}</span>
              <span className="normal-case tracking-[0.04em] text-cream/75">{c.handle}</span>
              <span className="text-brass/60">◆</span>
            </span>
          ))}
        </Marquee>
      </div>
      <p className="mt-6 px-5 text-center font-serif text-[14px] italic text-cream/45 sm:px-8">
        Scanned from the placemat? Welcome — this is Narwhal TV. Press play, and follow along for the next one.
      </p>
    </div>
  );
}
