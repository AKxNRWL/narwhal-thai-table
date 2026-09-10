'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * ArtBand — a full-bleed piece of the placemat artwork (public/images/art)
 * that drifts at a fraction of the scroll speed (Aceternity "parallax
 * scroll" feel). Top and bottom fade into the page colour so the art reads
 * as a painted band between sections, not a photo. Pure transforms: one rAF
 * per scroll event, only while the band is on screen.
 *
 *   base   → '/images/art/siam-to-hb' resolves to `${base}-${w}.webp|jpg`
 *   widths → [small, large] — the two renditions that exist on disk
 */
export type ArtBandProps = {
  base: string;
  widths: [number, number];
  /** Tailwind height classes for the band */
  height?: string;
  /** CSS object-position for the artwork */
  position?: string;
  /** parallax strength, 0 = static … 0.4 = strong */
  speed?: number;
  /** which edges melt into the page */
  fade?: 'both' | 'top' | 'bottom' | 'none';
  /** the first block under the fixed nav — adds clearance and lets the art run under the bar */
  first?: boolean;
  /** load with priority (above the fold) */
  eager?: boolean;
  /** dims the art so copy on top stays readable (0–1) */
  dim?: number;
  className?: string;
  children?: ReactNode;
};

export default function ArtBand({
  base,
  widths,
  height = 'h-[52vh] min-h-[360px] max-h-[720px]',
  position = '50% 50%',
  speed = 0.18,
  fade = 'both',
  first = false,
  eager = false,
  dim = 0,
  className,
  children,
}: ArtBandProps) {
  const ref = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const [w0, w1] = widths;

  useEffect(() => {
    const el = ref.current;
    const img = imgRef.current;
    if (!el || !img || speed === 0) return;
    let raf = 0;
    let visible = false;
    const update = () => {
      raf = 0;
      if (!visible) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // -1 when the band is fully below the viewport, +1 when fully above
      const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2)));
      // overscan is a fixed 1.2 (10% each way); keep |translate| under that
      img.style.transform = `translate3d(0, ${(-p * Math.min(speed, 0.2) * 100).toFixed(2)}%, 0) scale(1.2)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries.some((e) => e.isIntersecting);
        if (visible) onScroll();
      },
      { rootMargin: '10% 0px' },
    );
    io.observe(el);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [speed]);

  return (
    <div
      ref={ref}
      className={cn(
        'relative isolate w-full overflow-hidden bg-navy-deep',
        height,
        first && 'pt-[calc(var(--cs-ticker-h)+72px)]',
        className,
      )}
    >
      {/* the artwork — overscanned so the parallax never shows an edge */}
      <div ref={imgRef} className="absolute inset-0 -z-10 will-change-transform [transform:scale(1.2)]">
        <picture>
          <source type="image/webp" srcSet={`${base}-${w0}.webp ${w0}w, ${base}-${w1}.webp ${w1}w`} sizes="100vw" />
          {/* eslint-disable-next-line @next/next/no-img-element -- art-directed, multi-format */}
          <img
            src={`${base}-${w1}.jpg`}
            srcSet={`${base}-${w0}.jpg ${w0}w, ${base}-${w1}.jpg ${w1}w`}
            sizes="100vw"
            alt=""
            aria-hidden="true"
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={eager ? 'high' : 'auto'}
            className="h-full w-full object-cover"
            style={{ objectPosition: position }}
          />
        </picture>
        {dim > 0 && <div aria-hidden="true" className="absolute inset-0 bg-navy-deep" style={{ opacity: dim }} />}
      </div>

      {/* edges melt into the page */}
      {(fade === 'both' || fade === 'top') && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[28%] bg-gradient-to-b from-navy-deep to-transparent" />
      )}
      {(fade === 'both' || fade === 'bottom') && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[32%] bg-gradient-to-t from-navy-deep to-transparent" />
      )}
      {/* gentle vignette so the middle glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(70%_80%_at_50%_50%,transparent_40%,rgba(6,18,31,0.55)_100%)]" />

      {children && <div className="relative z-[1] flex h-full w-full items-center justify-center">{children}</div>}
    </div>
  );
}
