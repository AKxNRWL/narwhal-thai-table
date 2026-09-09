import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Marquee — an infinite horizontal scroller (Magic UI-style, pure CSS).
 * Children are rendered twice; the track translates by -50% so the loop is
 * seamless. Pauses on hover. `reverse` runs right-to-left.
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
  return (
    <div
      className={cn('group/marquee flex w-full overflow-hidden [--gap:20px]', className)}
      style={{ ['--gap' as string]: `${gap}px`, ['--duration' as string]: `${duration}s` }}
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          aria-hidden={i === 1 ? true : undefined}
          className={cn(
            'marquee-track flex shrink-0 items-center gap-[var(--gap)] pr-[var(--gap)]',
            reverse && '[animation-direction:reverse]',
            'group-hover/marquee:[animation-play-state:paused]',
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
