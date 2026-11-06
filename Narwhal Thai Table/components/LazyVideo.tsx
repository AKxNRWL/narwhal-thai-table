'use client';

import { useEffect, useRef, useState, type VideoHTMLAttributes } from 'react';
import { useReducedMotion } from '@/lib/a11y';
import { chrome } from '@/lib/i18n/chrome';
import { useLocale } from '@/lib/i18n/useLocale';

/**
 * A looping background video that costs nothing until it is about to be seen.
 *
 * Why: an `autoplay` <video> is fetched at page load whatever `preload` says, so
 * the 1.4 MB room loop 11,000 px down the home page was the single largest
 * download on every visit (Lighthouse, 12 Oct 2026). Here the <source> is only
 * attached once the element comes within ~600 px of the viewport; until then
 * the poster shows. `load()` + `play()` are then called by hand because the
 * autoplay attribute does not re-trigger for a source added later.
 *
 * Accessibility (6 Nov 2026): a pause/play button in the corner (WCAG 2.2.2),
 * and the guest's "reduce motion" switch keeps the poster still. Renders the
 * <video> plus the button, so the parent must be `position: relative`.
 */
export default function LazyVideo({ src, type = 'video/mp4', ...rest }: { src: string; type?: string } & VideoHTMLAttributes<HTMLVideoElement>) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  // 'auto' follows the reduce-motion switch; the button makes it explicit either way
  const [mode, setMode] = useState<'auto' | 'play' | 'pause'>('auto');
  const stopped = mode === 'pause' || (mode === 'auto' && reduced);
  const stoppedRef = useRef(stopped);
  stoppedRef.current = stopped;
  const t = chrome(useLocale()).a11y;

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    let done = false;
    const arm = () => {
      if (done) return;
      done = true;
      const source = document.createElement('source');
      source.src = src;
      source.type = type;
      v.appendChild(source);
      v.load();
      if (!stoppedRef.current) v.play().catch(() => { /* autoplay refused — the poster stays, which is fine */ });
    };
    if (!('IntersectionObserver' in window)) { arm(); return; }
    const io = new IntersectionObserver(
      (entries) => { if (entries.some((e) => e.isIntersecting)) { arm(); io.disconnect(); } },
      { rootMargin: '600px 0px' },
    );
    io.observe(v);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, type]);

  // the switch flips after mount (OS setting, or the guest in the panel) → stop / resume
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (stopped) v.pause();
    else if (v.querySelector('source')) v.play().catch(() => {});
  }, [stopped]);

  return (
    <>
      <video ref={ref} muted loop playsInline preload="none" {...rest} />
      <button
        type="button"
        className="fx-pause bottom-3 right-3"
        aria-pressed={stopped}
        aria-label={stopped ? t.playVideo : t.pauseVideo}
        onClick={() => setMode(stopped ? 'play' : 'pause')}
      >
        {stopped ? (
          <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2.2 1l6.8 4-6.8 4z" fill="currentColor" /></svg>
        ) : (
          <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1h2.3v8H2zM5.7 1H8v8H5.7z" fill="currentColor" /></svg>
        )}
      </button>
    </>
  );
}
