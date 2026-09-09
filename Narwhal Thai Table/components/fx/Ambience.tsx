'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Ambience — the site-wide "cinema" layer, mounted once in the root layout:
 *   • ScrollProgress — a hairline of brass across the very top that fills as
 *     you read (Magic UI ScrollProgress).
 *   • CursorAura — a soft brass ring that trails the pointer and blooms over
 *     links/buttons (desktop pointer devices only; the native cursor stays).
 *   • Grain — a static film-grain overlay for texture.
 * Renders nothing interactive; everything is pointer-events: none.
 */
export default function Ambience() {
  return (
    <>
      <ScrollProgress />
      <CursorAura />
      <Grain />
    </>
  );
}

function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      el.style.transform = `scaleX(${p.toFixed(4)})`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[130] h-[2px] origin-left scale-x-0 bg-[linear-gradient(90deg,#9C7A33,#E3C581,#FFF3D0)] shadow-[0_0_12px_rgba(227,197,129,0.8)]"
    />
  );
}

function CursorAura() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    setOn(true);
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let raf = 0;
    let hot = false;
    const loop = () => {
      x += (tx - x) * 0.16;
      y += (ty - y) * 0.16;
      if (ring.current) ring.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${hot ? 2.1 : 1})`;
      if (dot.current) dot.current.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX;
      ty = e.clientY;
      const t = e.target as Element | null;
      hot = Boolean(t?.closest?.('a, button, [role="button"], summary, input, select, textarea, label'));
      if (ring.current) ring.current.style.opacity = '1';
      if (dot.current) dot.current.style.opacity = '1';
    };
    const onLeave = () => {
      if (ring.current) ring.current.style.opacity = '0';
      if (dot.current) dot.current.style.opacity = '0';
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  if (!on) return null;
  return (
    <>
      <div
        ref={ring}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[1250] size-9 rounded-full border border-brass-light/70 opacity-0 mix-blend-screen will-change-transform [transition:opacity_.3s,transform_.12s_ease-out]"
      />
      <div
        ref={dot}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[1250] size-1.5 rounded-full bg-brass-light opacity-0 shadow-[0_0_10px_rgba(227,197,129,0.9)] will-change-transform"
      />
    </>
  );
}

function Grain() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1240] hidden h-full w-full opacity-[0.045] mix-blend-overlay lg:block"
    >
      <filter id="nt-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#nt-grain)" />
    </svg>
  );
}
