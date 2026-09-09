import { useId } from 'react';
import { cn } from '@/lib/cn';

/**
 * DotPattern — an SVG dot grid used as a soft section texture (Magic UI-style).
 * Fade it with a mask, e.g. `[mask-image:radial-gradient(60%_60%_at_50%_40%,#000,transparent)]`.
 */
export default function DotPattern({
  width = 22,
  height = 22,
  radius = 1,
  className,
}: {
  width?: number;
  height?: number;
  radius?: number;
  className?: string;
}) {
  const id = useId();
  return (
    <svg
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 -z-10 h-full w-full fill-brass/25', className)}
    >
      <defs>
        <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse">
          <circle cx={width / 2} cy={height / 2} r={radius} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
