import { cn } from '@/lib/cn';

/**
 * GoldCorners — four kanok-style brass flourishes hung in the corners of a
 * frame ("the art is on the plate… and in the frame"). Absolutely positioned;
 * the parent needs `relative`. Server component, pure SVG.
 */
const CORNER =
  // outer bracket
  'M2 44 C2 21 21 2 44 2 ' +
  // inner echo
  'M8 40 C10 24 24 10 40 8 ' +
  // curl at each end of the bracket
  'M2 44 C2 36 6 32 10 34 C14 36 12 42 8 42 ' +
  'M44 2 C36 2 32 6 34 10 C36 14 42 12 42 8 ' +
  // leaf in the crook
  'M14 14 C18 10 26 12 24 20 C22 26 16 26 14 22 C12 18 14 14 14 14 Z';

export default function GoldCorners({
  size = 44,
  inset = 12,
  className,
  opacity = 0.8,
}: {
  size?: number;
  inset?: number;
  className?: string;
  opacity?: number;
}) {
  const corners: Array<{ pos: React.CSSProperties; rot: number }> = [
    { pos: { top: inset, left: inset }, rot: 0 },
    { pos: { top: inset, right: inset }, rot: 90 },
    { pos: { bottom: inset, right: inset }, rot: 180 },
    { pos: { bottom: inset, left: inset }, rot: 270 },
  ];
  return (
    <>
      {corners.map((c, i) => (
        <svg
          key={i}
          aria-hidden="true"
          viewBox="0 0 48 48"
          width={size}
          height={size}
          className={cn('pointer-events-none absolute z-[2] text-brass-light drop-shadow-[0_0_6px_rgba(200,162,78,0.45)]', className)}
          style={{ ...c.pos, transform: `rotate(${c.rot}deg)`, opacity }}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={CORNER} />
        </svg>
      ))}
    </>
  );
}
