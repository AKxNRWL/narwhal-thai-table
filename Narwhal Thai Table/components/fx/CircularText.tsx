import { useId } from 'react';
import { cn } from '@/lib/cn';

/**
 * CircularText — words set on a circle that slowly rotates (the classic
 * "rotating badge"). Sits around the hero medallion. Decorative.
 */
export default function CircularText({
  text = 'NARWHAL THAI TABLE · HUNTINGTON BEACH · EST. 2026 · ',
  size = 300,
  duration = 40,
  className,
}: {
  text?: string;
  size?: number;
  duration?: number;
  className?: string;
}) {
  const id = useId();
  const r = size / 2 - 14;
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${size} ${size}`}
      className={cn('spin-slow pointer-events-none absolute left-1/2 top-1/2', className)}
      style={{ width: size, height: size, animationDuration: `${duration}s` }}
    >
      <defs>
        <path id={id} d={`M ${size / 2},${size / 2} m -${r},0 a ${r},${r} 0 1,1 ${r * 2},0 a ${r},${r} 0 1,1 -${r * 2},0`} />
      </defs>
      <text className="fill-brass-light/80 font-sans text-[10.5px] font-medium uppercase" style={{ letterSpacing: '0.34em' }}>
        <textPath href={`#${id}`} startOffset="0">
          {text}
          {text}
        </textPath>
      </text>
    </svg>
  );
}
