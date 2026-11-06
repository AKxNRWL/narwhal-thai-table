'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { chrome } from '@/lib/i18n/chrome';
import { useLocale } from '@/lib/i18n/useLocale';

/**
 * Marquee — an infinite horizontal scroller (Magic UI-style, pure CSS).
 * Children are rendered twice; the track translates by -50% so the loop is
 * seamless. Pauses on hover. `reverse` runs right-to-left.
 *
 * Accessibility (6 Nov 2026): the duplicate track is aria-hidden AND inert
 * (screen readers hear the strip once, keyboards never tab into the copy);
 * a small pause/play button (WCAG 2.2.2) sits at the right edge; and the
 * guest's "reduce motion" switch stops the strip outright (globals.css).
 */
export default function Marquee({
  children,
  reverse = false,
  duration = 60,
  gap = 20,
  className,
}: {
  children: ReactNode;
  reverse?: boolean;
  /** seconds per loop */
  duration?: number;
  /** px between items */
  gap?: number;
  className?: string;
}) {
  const [paused, setPaused] = useState(false);
  const t = chrome(useLocale()).a11y;
  return (
    <div
      className={cn('group/marquee relative flex w-full overflow-hidden [--gap:20px]', className)}
      style={{ ['--gap' as string]: `${gap}px`, ['--duration' as string]: `${duration}s` }}
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          aria-hidden={i === 1 ? true : undefined}
          inert={i === 1 ? true : undefined}
          className={cn(
            'marquee-track flex shrink-0 items-center gap-[var(--gap)] pr-[var(--gap)]',
            reverse && '[animation-direction:reverse]',
            'group-hover/marquee:[animation-play-state:paused]',
            paused && 'is-paused',
          )}
        >
          {children}
        </div>
      ))}
      <button
        type="button"
        className="fx-pause right-3 top-1/2 -translate-y-1/2"
        aria-pressed={paused}
        aria-label={paused ? t.playStrip : t.pauseStrip}
        onClick={() => setPaused((p) => !p)}
      >
        {paused ? (
          <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2.2 1l6.8 4-6.8 4z" fill="currentColor" /></svg>
        ) : (
          <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1h2.3v8H2zM5.7 1H8v8H5.7z" fill="currentColor" /></svg>
        )}
      </button>
    </div>
  );
}
