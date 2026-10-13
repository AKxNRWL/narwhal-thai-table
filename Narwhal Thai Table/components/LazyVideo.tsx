'use client';

import { useEffect, useRef, type VideoHTMLAttributes } from 'react';

/**
 * A looping background video that costs nothing until it is about to be seen.
 *
 * Why: an `autoplay` <video> is fetched at page load whatever `preload` says, so
 * the 1.4 MB room loop 11,000 px down the home page was the single largest
 * download on every visit (Lighthouse, 12 Oct 2026). Here the <source> is only
 * attached once the element comes within ~600 px of the viewport; until then
 * the poster shows. `load()` + `play()` are then called by hand because the
 * autoplay attribute does not re-trigger for a source added later.
 */
export default function LazyVideo({ src, type = 'video/mp4', ...rest }: { src: string; type?: string } & VideoHTMLAttributes<HTMLVideoElement>) {
  const ref = useRef<HTMLVideoElement>(null);
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
      v.play().catch(() => { /* autoplay refused — the poster stays, which is fine */ });
    };
    if (!('IntersectionObserver' in window)) { arm(); return; }
    const io = new IntersectionObserver(
      (entries) => { if (entries.some((e) => e.isIntersecting)) { arm(); io.disconnect(); } },
      { rootMargin: '600px 0px' },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [src, type]);
  return <video ref={ref} muted loop playsInline preload="none" {...rest} />;
}
