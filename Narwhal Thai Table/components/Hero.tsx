'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import type { HeroMedia } from '@/lib/media';

/**
 * Hero structure (z-stack inside the .hero section):
 *   z-0: .hero-video         — background video (when present)
 *   z-0: .hero-fallback      — flicker gradient under the video
 *   z-1: ::before / ::after  — vignette + grid pattern
 *   z-1: .hero-watermark     — giant outline "Coming Soon" atmospheric text
 *   z-2: .hero-inner         — actual content (text column + ornament card)
 *   z-2: .hero-scroll        — scroll cue at the bottom
 *
 * The ornament card now wraps the narwhal in a <button> so hover, focus,
 * and tap all trigger the whale-jump + wave-ripple animation defined in
 * globals.css. The animation runs once per interaction (no constant loop).
 */
export default function Hero({ media = { video: null, image: null } }: { media?: HeroMedia }) {
  const fallbackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    const f = fallbackRef.current;
    if (!v || !f) return;
    const reveal = () => { f.style.opacity = '0'; };
    v.addEventListener('playing', reveal, { once: true });
    v.addEventListener('canplay', () => { if (!v.paused) reveal(); });
  }, []);

  // Restart the narwhal animation on tap (covers touch devices where
  // :hover doesn't really exist). Briefly removing+re-adding the class
  // forces a CSS animation restart even if the element is still focused.
  const playNarwhal = (el: HTMLElement) => {
    el.classList.remove('is-playing');
    // Force reflow so the next class addition re-triggers the animation.
    void el.offsetWidth;
    el.classList.add('is-playing');
    window.setTimeout(() => el.classList.remove('is-playing'), 1500);
  };

  return (
    <section className="hero" aria-labelledby="hero-title">
      {/*
        HERO BACKGROUND (auto drop-in — no code edit needed):
          • Video: drop /public/media/hero.mp4 (or .webm) → plays automatically.
          • Image: drop /public/images/hero.jpg (.png/.webp/.avif) → shows as the
            still background, and as the video poster if both exist.
          • Neither present → the animated gradient fallback below shows.
        Detection happens at build time in lib/media.ts. Video tips: 1080p,
        8–15s seamless loop, muted, under ~4MB.
      */}
      <div className="hero-fallback" aria-hidden="true" ref={fallbackRef} />
      {media.video ? (
        <video
          ref={videoRef}
          className="hero-media hero-video"
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
        <img className="hero-media" src={media.image} alt="" aria-hidden="true" />
      ) : null}

      {/* Coming Soon messaging now lives in the multilingual top-of-page
          ticker (<ComingSoonTicker />) instead of a Hero watermark — the
          giant outline text didn't scale gracefully on mobile and the
          ticker reaches a broader audience in Huntington Beach. */}

      <div className="hero-inner">
        <div className="hero-text">
          <span className="label hero-coming-soon">Soft Opening July 16 · Huntington Beach</span>
          <h1 id="hero-title">
            Come sit<br/>with us, <em>neighbor</em>.
          </h1>
          <p>
            A Thai family kitchen on Beach Boulevard — where the recipes we grew up with meet the California coast we now call home. Every plate, by Chef Rainny&apos;s own hands. <strong>Soft opening Thursday, July 16</strong> — pull up a chair while we get the kitchen warm.
          </p>
          <div className="hero-cta">
            <Link href="/menu" className="btn-primary">
              Peek at the Menu
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link href="/play" className="btn-secondary">
              Play While You Wait
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          {/* Future: replace this stand-in with a real hero photo via <MediaFrame ratio="4/5" ornament="corners" src="/images/hero.jpg" alt="..." priority /> */}
          <div className="visual-frame">
            <div className="ornament">
              <button
                type="button"
                className="ornament-narwhal"
                aria-label="Tap to see the narwhal jump"
                onClick={(e) => playNarwhal(e.currentTarget)}
              >
                <span className="nm-stack" aria-hidden="true">
                  <img className="nm-waves" src="/images/logo-hero-waves.png" alt="" />
                  <img className="nm-whale" src="/images/logo-hero-whale.png" alt="" />
                  <img className="nm-spark" src="/images/logo-hero-spark.png" alt="" />
                </span>
              </button>
              <div className="ornament-text">Narwhal</div>
              <div className="ornament-divider"></div>
              <div className="ornament-tagline">Thai Table · Est. 2026</div>
            </div>
          </div>
        </div>
      </div>
      <div className="hero-scroll" aria-hidden="true">Scroll</div>
    </section>
  );
}
