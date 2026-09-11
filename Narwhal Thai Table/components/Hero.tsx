'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import type { HeroMedia } from '@/lib/media';
import { ORDER_ONLINE_URL } from '@/lib/site';
import Button, { Arrow } from '@/components/ui/Button';
import Particles from '@/components/fx/Particles';
import Ripple from '@/components/fx/Ripple';
import Tilt from '@/components/fx/Tilt';
import CircularText from '@/components/fx/CircularText';
import { cn } from '@/lib/cn';
import { localePath, type Locale } from '@/lib/i18n/locales';
import type { UiDict } from '@/lib/i18n/ui.en';

/**
 * Placemat art in the hero — owner, 7 Sep 2026 ("อยากให้ในเว็บเป็นงานอาร์ตแบบนี้"):
 * the printed night placemat (Loy Krathong lanterns over the Huntington Beach
 * pier, the narwhal riding Thai waves) is the hero background instead of the
 * food video. Files live in public/images/art — plain crops of the print
 * raster, nothing repainted. Set HERO_ART to false to fall back to the
 * drop-in video/photo detection below (public/media/hero.mp4 is still there).
 */
const HERO_ART = true;
const ART = '/images/art';

const mediaCls = 'absolute inset-0 z-0 h-full w-full object-cover';

/** The dish pinned above the headline — resolved server-side in app/page.tsx. */
export type HeroFeatured = { slug: string; name: string; price?: string; image: string | null };

export default function Hero({
  media = { video: null, image: null },
  featured = null,
  locale = 'en',
  t,
}: {
  media?: HeroMedia;
  featured?: HeroFeatured | null;
  /** page locale — internal links are prefixed for /vi */
  locale?: Locale;
  /** hero copy for that locale (ui(locale).hero) — supplied by the server page so the dictionary stays out of the client bundle */
  t: UiDict['hero'];
}) {
  const href = (p: string) => localePath(locale, p);
  const fallbackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);

  // Spotlight: a soft brass light follows the pointer across the hero.
  const onSpot = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse' || !spotRef.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    spotRef.current.style.setProperty('--sx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
    spotRef.current.style.setProperty('--sy', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
  };

  // Parallax: the placemat art scrolls at ~15% of the page speed (desktop
  // only). Cheap: one rAF per scroll event, transform-only.
  useEffect(() => {
    const el = artRef.current;
    if (!el) return;
    const mq = window.matchMedia('(min-width: 1024px)');
    if (!mq.matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, window.innerHeight);
        el.style.transform = `translate3d(0, ${(y * 0.15).toFixed(1)}px, 0) scale(1.08)`;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    const f = fallbackRef.current;
    if (!v || !f) return;
    const reveal = () => { f.style.opacity = '0'; };
    v.addEventListener('playing', reveal, { once: true });
    v.addEventListener('canplay', () => { if (!v.paused) reveal(); });
  }, []);

  // Restart the narwhal animation on tap (touch devices have no :hover).
  // Removing + re-adding the class after a forced reflow restarts the CSS animation.
  const playNarwhal = (el: HTMLElement) => {
    el.classList.remove('is-playing');
    void el.offsetWidth;
    el.classList.add('is-playing');
    window.setTimeout(() => el.classList.remove('is-playing'), 1500);
  };

  return (
    <section
      aria-labelledby="hero-title"
      onPointerMove={onSpot}
      className="relative isolate flex min-h-[calc(100svh-var(--cs-ticker-h))] flex-col justify-end overflow-hidden bg-[#0F2034] pt-[calc(var(--cs-ticker-h)+96px)] lg:justify-center"
    >
      {/* z0 — animated gradient fallback under the media */}
      <div
        ref={fallbackRef}
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-[radial-gradient(70%_60%_at_70%_40%,#152F4A_0%,#0B1F33_55%,#06121F_100%)] transition-opacity duration-1000"
      />

      {HERO_ART ? (
        /* Landscape art on laptops/tablets; on phones a portrait crop of the
           right-hand side so the whale stays in frame behind the copy.
           The wrapper is the parallax layer (see artRef); overscan via scale
           so the edges never show while it drifts. */
        <div ref={artRef} className="absolute inset-0 z-0 will-change-transform lg:scale-[1.08]">
        <picture className="contents">
          <source media="(max-width:700px)" type="image/avif" srcSet={`${ART}/hero-night-portrait-1080.avif`} />
          <source media="(max-width:700px)" type="image/webp" srcSet={`${ART}/hero-night-portrait-720.webp 720w, ${ART}/hero-night-portrait-1080.webp 1080w`} sizes="100vw" />
          <source media="(max-width:700px)" srcSet={`${ART}/hero-night-portrait-720.jpg 720w, ${ART}/hero-night-portrait-1080.jpg 1080w`} sizes="100vw" />
          <source type="image/avif" srcSet={`${ART}/hero-night-1600.avif 1600w, ${ART}/hero-night-2560.avif 2560w`} sizes="100vw" />
          <source type="image/webp" srcSet={`${ART}/hero-night-1600.webp 1600w, ${ART}/hero-night-2560.webp 2560w`} sizes="100vw" />
          {/* eslint-disable-next-line @next/next/no-img-element -- art-directed <picture>; next/image can't switch crops per breakpoint */}
          <img
            className={cn(
              mediaCls,
              'object-[50%_50%] lg:object-[50%_62%]',
              'lg:animate-drift lg:[transform-origin:60%_50%]',
            )}
            src={`${ART}/hero-night-1600.jpg`}
            srcSet={`${ART}/hero-night-1600.jpg 1600w, ${ART}/hero-night-2560.jpg 2560w`}
            sizes="100vw"
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        </div>
      ) : media.video ? (
        <video
          ref={videoRef}
          className={mediaCls}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          poster={media.image ?? undefined}
        >
          <source src={media.video} type={media.video.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
        </video>
      ) : media.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={mediaCls} src={media.image} alt="" aria-hidden="true" />
      ) : null}

      {/* z1 — scrims: left for the headline, top for the nav, bottom into the page */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(6,18,31,0.88)_0%,rgba(6,18,31,0.55)_42%,rgba(6,18,31,0.05)_75%)] max-lg:bg-[linear-gradient(180deg,rgba(6,18,31,0.55)_0%,rgba(6,18,31,0.15)_35%,rgba(6,18,31,0.9)_78%,#06121F_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-40 bg-gradient-to-b from-navy-deep/80 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-48 bg-gradient-to-t from-navy-deep via-navy-deep/70 to-transparent"
      />

      {/* z1 — drifting brass embers over the lanterns (desktop-weight only) */}
      <Particles className="z-[1]" quantity={70} />
      <div ref={spotRef} aria-hidden="true" className="hero-spot pointer-events-none absolute inset-0 z-[1] hidden lg:block" />

      {/* z2 — content */}
      <div className="relative z-[2] mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-24 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-12 lg:pb-28 lg:pt-6">
        {/* min-w-0: a grid item defaults to min-width:auto, so a wide inline
            chip would stretch the column past the phone's viewport */}
        <div className="min-w-0 max-w-2xl">
          <span
            className="inline-flex items-center gap-3 font-sans text-[11px] font-medium uppercase tracking-[0.34em] text-brass-light"
            style={{ animation: 'heroIn 0.9s var(--ease-out-soft) both' }}
          >
            <span aria-hidden="true" className="size-1.5 rounded-full bg-brass-light shadow-[0_0_12px_rgba(227,197,129,0.9)] animate-pulse-dot" />
            <span className="shiny-text">{t.eyebrow}</span>
          </span>

          {/* Featured-dish chip — owner (9 Sep 2026): the weekday-lunch pill that
              sat here since 2 Sep is retired; the whole fried pompano takes the
              spot (slug set in app/page.tsx). Photo thumb + name + price, links
              to the dish story. */}
          {featured && (
            <div className="mt-5" style={{ animation: 'heroIn 0.9s var(--ease-out-soft) 0.06s both' }}>
              <Link
                href={href(`/menu/${featured.slug}`)}
                className="group inline-flex max-w-full items-center gap-3 rounded-full border border-brass/40 bg-navy-deep/55 py-1.5 pl-1.5 pr-4 text-cream backdrop-blur-md transition-[border-color,background-color,transform] duration-300 hover:border-brass-light hover:bg-navy-deep/75"
              >
                {featured.image ? (
                  // eslint-disable-next-line @next/next/no-img-element -- tiny decorative thumb, art-directed
                  <img
                    src={featured.image}
                    alt=""
                    width={44}
                    height={44}
                    className="size-11 shrink-0 rounded-full object-cover ring-1 ring-brass/60 shadow-[0_0_18px_rgba(200,162,78,0.35)] transition-transform duration-500 group-hover:scale-[1.06]"
                  />
                ) : (
                  <span aria-hidden="true" className="ml-2 size-2 shrink-0 rounded-full bg-brass animate-pulse-dot" />
                )}
                <span className="flex min-w-0 flex-col leading-tight">
                  <span className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-brass-light">{t.featuredKicker}</span>
                  <span className="font-display text-[14px] font-medium tracking-[-0.01em] text-balance sm:text-[15px]">
                    {featured.name}
                    {featured.price && <b className="ml-2 font-sans text-[12px] font-semibold text-brass-light">{featured.price}</b>}
                  </span>
                </span>
                <Arrow className="shrink-0 text-brass-light" />
              </Link>
            </div>
          )}

          <h1
            id="hero-title"
            className="mt-7 font-display text-[clamp(44px,8.2vw,96px)] font-medium leading-[0.96] tracking-[-0.025em] text-cream text-balance [text-shadow:0_2px_24px_rgba(6,18,31,0.6)]"
          >
            {/* Owner (9 Sep 2026): keep the original headline; the "food as art"
                idea lives in the paragraph as figurative language, never stated
                outright. */}
            <Words text={t.h1a} />
            <br />
            {/* The gold line animates as ONE block, not word by word: a
                background-clip:text parent goes invisible in Chromium when its
                children carry a filter/transform (the finished .word-in spans
                keep `filter: blur(0px)`), which silently hid this line from
                8–9 Sep 2026. Both animations must be declared together here —
                .text-gold and .word-in each set the `animation` shorthand. */}
            <em
              className="text-gold word-in font-serif font-normal italic [text-shadow:none]"
              style={{ animation: 'word-in 0.9s var(--ease-out-soft) 0.42s forwards, shine-text 7s linear infinite' }}
            >
              {t.h1b}
            </em>
          </h1>

          {/* A signed note from the siblings — owner-approved wording, 9 Sep 2026
              ("เอาอันนี้ 1"): greeting first, the art is on the plate and in the
              room around it, every guest loved and respected; SEO terms kept
              (Thai restaurant · Beach Boulevard · Huntington Beach · royal-court
              Thai recipes · made fresh). Do not paraphrase without the owner. */}
          <p
            className="mt-7 max-w-xl font-serif text-[17px] italic leading-relaxed text-cream/80 sm:text-[19px] [text-shadow:0_1px_12px_rgba(6,18,31,0.7)]"
            style={{ animation: 'heroIn 0.9s var(--ease-out-soft) 0.24s both' }}
          >
            <strong className="not-italic font-sans text-[15px] font-semibold uppercase tracking-[0.06em] text-cream">{t.noteLead}</strong>{' '}
            {t.note}
          </p>
          <p
            className="mt-4 font-sans text-[12px] font-medium uppercase tracking-[0.28em] text-brass-light"
            style={{ animation: 'heroIn 0.9s var(--ease-out-soft) 0.3s both' }}
          >
            {t.signed}
          </p>
          {/* Hours stay in the hero copy for search engines; the top ticker
              already carries them on phones, so hide there. */}
          <p
            className="mt-3 max-w-xl font-sans text-[13px] leading-relaxed text-cream/65 max-[760px]:hidden"
            style={{ animation: 'heroIn 0.9s var(--ease-out-soft) 0.33s both' }}
          >
            {t.hours}
          </p>

          <div className="mt-8 flex flex-wrap gap-3" style={{ animation: 'heroIn 0.9s var(--ease-out-soft) 0.36s both' }}>
            {ORDER_ONLINE_URL && (
              <Button href={ORDER_ONLINE_URL} target="_blank" rel="noopener" variant="primary" size="lg" arrow data-magnetic>
                {t.order}
              </Button>
            )}
            <Button href={href('/menu')} variant={ORDER_ONLINE_URL ? 'secondary' : 'primary'} size="lg" arrow data-magnetic>
              {t.explore}
            </Button>
            {/* Hidden on phones — the MobileActionBar carries Reserve there. */}
            <Button href={href('/contact/reservation')} variant="secondary" size="lg" arrow className="max-[760px]:hidden">
              {t.reserve}
            </Button>
          </div>
        </div>

        {/* The narwhal medallion — glass card; tap/hover makes the whale jump */}
        <div className="hidden justify-self-end lg:block" style={{ animation: 'heroIn 1s var(--ease-out-soft) 0.3s both' }}>
          <Tilt max={9} className="rounded-[28px]">
          <div className="relative w-[340px] rounded-[28px] border border-brass/30 bg-navy-deep/40 p-9 text-center shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl xl:w-[380px]">
            <div aria-hidden="true" className="pointer-events-none absolute inset-3 rounded-[20px] border border-brass/20" />
            <div className="relative">
            <Ripple className="-top-6 h-[280px]" baseSize={240} step={60} circles={4} />
            <CircularText size={300} className="top-[110px] xl:top-[120px]" />
            <button
              type="button"
              className="ornament-narwhal relative z-[1] mx-auto mb-6 block size-[220px] cursor-pointer rounded-full border border-brass/90 bg-[radial-gradient(circle_at_50%_42%,#FBF6EA_0%,#F7F0E1_72%)] p-0 shadow-[0_0_0_8px_rgba(247,240,225,0.06),0_30px_60px_-30px_rgba(0,0,0,0.8)] transition-transform duration-500 hover:scale-[1.04] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-brass xl:size-[240px]"
              aria-label={t.narwhalTap}
              onClick={(e) => playNarwhal(e.currentTarget)}
            >
              <span className="nm-stack" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="nm-waves" src="/images/logo-hero-waves.png" alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="nm-whale" src="/images/logo-hero-whale.png" alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="nm-spark" src="/images/logo-hero-spark.png" alt="" />
              </span>
            </button>
            </div>
            <div className="font-serif text-[38px] italic leading-none tracking-[0.02em] text-cream">{t.medallionName}</div>
            <div aria-hidden="true" className="mx-auto my-4 h-px w-12 bg-brass" />
            <div className="font-sans text-[10px] font-medium uppercase tracking-[0.34em] text-brass-light">{t.medallionSub}</div>
          </div>
          </Tilt>
        </div>
      </div>

      {/* scroll cue */}
      <div
        aria-hidden="true"
        className="absolute bottom-7 left-1/2 z-[2] hidden -translate-x-1/2 flex-col items-center gap-3 font-sans text-[10px] uppercase tracking-[0.32em] text-cream/55 lg:flex"
      >
        {t.scroll}
        <span className="block h-10 w-px origin-top bg-brass animate-scroll-cue" />
      </div>
    </section>
  );
}

/** Word-by-word blur reveal (Magic UI "TextAnimate" feel) — pure CSS, SEO-safe. */
function Words({ text, start = 0, step = 0.07 }: { text: string; start?: number; step?: number }) {
  return (
    <>
      {text.split(' ').map((w, i) => (
        <span key={i} className="word-in" style={{ animationDelay: `${0.1 + (start + i) * step}s` }}>
          {w}
          {i < text.split(' ').length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </>
  );
}
