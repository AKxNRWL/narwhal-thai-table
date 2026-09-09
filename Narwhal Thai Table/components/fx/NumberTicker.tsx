'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * NumberTicker — counts up from 0 to `value` the first time it scrolls into
 * view (Magic UI-style, no animation library needed).
 */
export default function NumberTicker({
  value,
  duration = 1400,
  delay = 0,
  suffix = '',
  className,
}: {
  value: number;
  duration?: number;
  delay?: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // Server-render the final number (crawlers + no-JS see the real value);
  // the count-up only starts once the element scrolls into view.
  const [n, setN] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setN(value);
      return;
    }
    let raf = 0;
    let started = false;
    const run = () => {
      setN(0);
      const t0 = performance.now() + delay;
      const tick = (now: number) => {
        const t = Math.min(1, Math.max(0, (now - t0) / duration));
        // easeOutExpo — fast start, soft landing
        const e = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        setN(Math.round(value * e));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((en) => en.isIntersecting) && !started) {
          started = true;
          run();
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration, delay]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {n}
      {suffix}
    </span>
  );
}
