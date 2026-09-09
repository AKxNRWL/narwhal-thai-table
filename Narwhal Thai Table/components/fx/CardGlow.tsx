'use client';

import { useEffect } from 'react';

/**
 * CardGlow — one document-level pointer listener that powers three hover
 * effects without per-element React state (desktop pointer devices only):
 *   • `.glow-card`  — brass spotlight that follows the cursor (--mx/--my) and
 *                     a gentle 3D tilt toward it (--rx/--ry). See globals.css.
 *   • `[data-magnetic]` — magnetic buttons: the element leans toward the
 *                     cursor while hovered and springs back on leave.
 * Mounted once in the root layout; renders nothing.
 */
export default function CardGlow() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let raf = 0;
    let lastCard: HTMLElement | null = null;
    let lastMag: HTMLElement | null = null;

    const resetCard = (el: HTMLElement) => {
      el.style.removeProperty('--glow-o');
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    };
    const resetMag = (el: HTMLElement) => {
      el.style.transform = '';
      el.style.transition = 'transform .45s cubic-bezier(.2,.9,.2,1.2)';
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const t = e.target as Element | null;
      const card = t?.closest?.('.glow-card') as HTMLElement | null;
      const mag = t?.closest?.('[data-magnetic]') as HTMLElement | null;
      if (lastCard && lastCard !== card) { resetCard(lastCard); lastCard = null; }
      if (lastMag && lastMag !== mag) { resetMag(lastMag); lastMag = null; }
      if (!card && !mag) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (card) {
          lastCard = card;
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          card.style.setProperty('--mx', `${(e.clientX - r.left).toFixed(1)}px`);
          card.style.setProperty('--my', `${(e.clientY - r.top).toFixed(1)}px`);
          card.style.setProperty('--glow-o', '1');
          card.style.setProperty('--rx', `${((px - 0.5) * 7).toFixed(2)}deg`);
          card.style.setProperty('--ry', `${((py - 0.5) * -7).toFixed(2)}deg`);
        }
        if (mag) {
          lastMag = mag;
          const r = mag.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width / 2)) * 0.28;
          const dy = (e.clientY - (r.top + r.height / 2)) * 0.28;
          mag.style.transition = 'transform .18s ease-out';
          mag.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
        }
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
