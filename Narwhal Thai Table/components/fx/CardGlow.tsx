'use client';

import { useEffect } from 'react';

/**
 * CardGlow — one document-level pointer listener that feeds `--mx` / `--my`
 * to every `.glow-card` under the cursor, so glass cards get a soft brass
 * spotlight that follows the pointer (Aceternity "card spotlight" idea,
 * without per-card React state). Mounted once in the root layout; renders
 * nothing. Touch devices never fire pointermove with a mouse, so they simply
 * keep the static card.
 */
export default function CardGlow() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let raf = 0;
    let last: HTMLElement | null = null;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const target = (e.target as Element | null)?.closest?.('.glow-card') as HTMLElement | null;
      if (last && last !== target) {
        last.style.removeProperty('--glow-o');
        last = null;
      }
      if (!target) return;
      last = target;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = target.getBoundingClientRect();
        target.style.setProperty('--mx', `${e.clientX - r.left}px`);
        target.style.setProperty('--my', `${e.clientY - r.top}px`);
        target.style.setProperty('--glow-o', '1');
      });
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      document.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
