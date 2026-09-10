'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

/**
 * TextReveal — Magic UI "text reveal": the words brighten one after another
 * as the line scrolls up through the viewport (dim → brass), so the reader's
 * eye is walked along the sentence. Scroll-linked, one rAF per scroll event;
 * SEO-safe — the full sentence is plain text in the markup.
 */
export default function TextReveal({
  text,
  className,
  from = 0.18,
}: {
  text: string;
  className?: string;
  /** starting opacity of unrevealed words */
  from?: number;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(' ');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = Array.from(el.querySelectorAll<HTMLElement>('span[data-w]'));
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 when the line enters at 90% of the viewport, 1 when it reaches 45%
      const p = Math.max(0, Math.min(1, (vh * 0.9 - r.top) / (vh * 0.45)));
      const n = spans.length;
      spans.forEach((s, i) => {
        const w = Math.max(0, Math.min(1, p * (n + 2) - i));
        s.style.opacity = String(from + (1 - from) * w);
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [from]);

  return (
    <p ref={ref} className={cn('text-balance', className)}>
      {words.map((w, i) => (
        <span key={i} data-w="" className="inline transition-opacity duration-150 ease-out" style={{ opacity: from }}>
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </p>
  );
}
