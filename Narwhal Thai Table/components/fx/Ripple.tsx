import { cn } from '@/lib/cn';

/**
 * Ripple — concentric brass rings pulsing outward from the center of the
 * parent (Magic UI-style). Decorative; sits behind the hero medallion.
 */
export default function Ripple({
  circles = 6,
  baseSize = 220,
  step = 70,
  className,
}: {
  circles?: number;
  baseSize?: number;
  step?: number;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0 select-none', className)}>
      {Array.from({ length: circles }, (_, i) => {
        const s = baseSize + i * step;
        return (
          <span
            key={i}
            className="ripple-ring absolute left-1/2 top-1/2 rounded-full border border-brass/40 bg-brass/[0.03]"
            style={{
              width: s,
              height: s,
              marginLeft: -s / 2,
              marginTop: -s / 2,
              opacity: 0.4 - i * 0.05,
              animationDelay: `${i * 0.28}s`,
            }}
          />
        );
      })}
    </div>
  );
}
