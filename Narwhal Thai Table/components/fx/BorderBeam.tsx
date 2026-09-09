import { cn } from '@/lib/cn';

/**
 * BorderBeam — a brass light that travels around the edge of its parent
 * (Magic UI-style, pure CSS via `offset-path`). The parent needs
 * `relative` + `overflow-hidden` + a border-radius; pass the same radius.
 * Motion-safe only (the keyframes are gated in globals.css).
 */
export default function BorderBeam({
  size = 220,
  duration = 12,
  delay = 0,
  radius = 22,
  className,
}: {
  /** length of the glowing segment in px */
  size?: number;
  /** seconds per lap */
  duration?: number;
  delay?: number;
  /** must match the parent's border-radius */
  radius?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]', className)}
      style={{ borderRadius: radius }}
    >
      <div
        className="border-beam absolute aspect-square bg-[linear-gradient(to_left,#E3C581,#C8A24E,transparent)]"
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${radius}px)`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
        }}
      />
    </div>
  );
}
