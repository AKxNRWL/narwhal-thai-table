'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * PhotoCarousel — a swipeable photo strip with dots.
 *
 * Used by the promo pop-up (components/PromoCard.tsx) and the Lunch Specials
 * section on the homepage. One photo renders as a plain image; two or more
 * become a scroll-snap track: native touch swiping on phones (no JS
 * scrolling, so it feels like the OS), hover arrows on desktop, ←/→ keys
 * when focused, dots that follow the snap position, and an optional caption
 * chip per photo (the dish name). The parent gives it a box — it fills it
 * (position:absolute; inset:0), so wrap it in something with an aspect-ratio.
 */
export type CarouselImage = { src: string; alt: string };

const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function PhotoCarousel({
  images,
  label = 'Photos',
  eagerCount = 2,
  className,
}: {
  images: CarouselImage[];
  /** Accessible name for the region, e.g. "Lunch Special plates" */
  label?: string;
  /** How many photos load eagerly (the rest are loading="lazy") */
  eagerCount?: number;
  className?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const n = images.length;

  const go = useCallback((i: number) => {
    const el = track.current;
    if (!el || !n) return;
    const next = ((i % n) + n) % n;
    el.scrollTo({ left: next * el.clientWidth, behavior: reducedMotion() ? 'auto' : 'smooth' });
  }, [n]);

  // Active dot follows the snap position (rAF-throttled scroll listener).
  useEffect(() => {
    const el = track.current;
    if (!el || n < 2) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setIdx(Math.min(n - 1, Math.max(0, Math.round(el.scrollLeft / el.clientWidth)))));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [n]);

  if (!n) return null;
  const many = n > 1;
  return (
    <div
      className={['pc', many ? 'has-many' : '', className].filter(Boolean).join(' ')}
      role={many ? 'region' : undefined}
      aria-roledescription={many ? 'carousel' : undefined}
      aria-label={many ? label : undefined}
      onKeyDown={(e) => {
        if (!many) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1); }
      }}
    >
      <div className="pc-track" ref={track}>
        {images.map((im, i) => (
          <div className="pc-slide" key={im.src + i} role={many ? 'group' : undefined} aria-roledescription={many ? 'slide' : undefined} aria-label={many ? `${i + 1} of ${n}` : undefined}>
            {/* eslint-disable-next-line @next/next/no-img-element -- site photo or owner upload; plain <img> keeps the strip simple and avoids remotePatterns config */}
            <img src={im.src} alt={im.alt} decoding={i === 0 ? 'sync' : 'async'} loading={i < eagerCount ? 'eager' : 'lazy'} draggable={false} />
            {im.alt && <span className="pc-cap" aria-hidden="true">{im.alt}</span>}
          </div>
        ))}
      </div>
      {many && (
        <>
          <button type="button" className="pc-arrow pc-prev" aria-label="Previous photo" onClick={() => go(idx - 1)}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M10 3L5 8l5 5" /></svg>
          </button>
          <button type="button" className="pc-arrow pc-next" aria-label="Next photo" onClick={() => go(idx + 1)}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M6 3l5 5-5 5" /></svg>
          </button>
          <div className="pc-dots">
            {images.map((im, i) => (
              <button
                type="button"
                key={im.src + i}
                className={'pc-dot' + (i === idx ? ' is-on' : '')}
                aria-label={`Photo ${i + 1} of ${n}${im.alt ? ': ' + im.alt : ''}`}
                aria-current={i === idx ? 'true' : undefined}
                onClick={() => go(i)}
              >
                <i />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
