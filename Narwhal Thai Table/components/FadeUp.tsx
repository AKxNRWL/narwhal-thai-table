'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Props = {
  className?: string;
  /** Cascade the direct children in one by one (grids of cards). */
  stagger?: boolean;
  children: ReactNode;
};

/**
 * Wraps content in a div that fades up into view on scroll using
 * IntersectionObserver. The `.fade-up` / `.visible` / `.stagger` styles live
 * in app/globals.css and respect prefers-reduced-motion.
 */
export default function FadeUp({ className, stagger = false, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      el.classList.add('visible');
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn('fade-up', stagger && 'stagger', className)}>
      {children}
    </div>
  );
}
