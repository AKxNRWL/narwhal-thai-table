'use client';

import { useEffect, useRef } from 'react';
import { ReactLenis, type LenisRef } from 'lenis/react';
import { useReducedMotion } from '@/lib/a11y';

/**
 * SmoothScroll — inertial page scrolling (Lenis, MIT). Mounted once in the
 * root layout. Pauses itself whenever something locks the page (the mobile
 * nav drawer sets body[data-nav-open], the promo pop-up sets
 * body.style.overflow = hidden) and resumes when it's released.
 * Nested scrollers opt out with `data-lenis-prevent` (chat panel, promo card).
 */
export default function SmoothScroll() {
  const ref = useRef<LenisRef>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const body = document.body;
    const sync = () => {
      const lenis = ref.current?.lenis;
      if (!lenis) return;
      const locked = body.dataset.navOpen === 'true' || body.style.overflow === 'hidden';
      if (locked) lenis.stop();
      else lenis.start();
    };
    const mo = new MutationObserver(sync);
    mo.observe(body, { attributes: true, attributeFilter: ['data-nav-open', 'style'] });
    sync();
    return () => mo.disconnect();
  }, []);

  // "Reduce motion" (guest switch or OS): native scrolling, no inertia.
  if (reduced) return null;

  return (
    <ReactLenis
      ref={ref}
      root
      options={{
        lerp: 0.085,
        duration: 1.25,
        smoothWheel: true,
        wheelMultiplier: 0.95,
        touchMultiplier: 1.15,
        // smooth-scroll hash links (nav "Our Story", hero lunch pill …) and
        // stop just under the fixed ticker + nav
        anchors: { offset: -118 },
      }}
    />
  );
}
