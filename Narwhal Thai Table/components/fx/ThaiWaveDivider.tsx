import { useId } from 'react';
import { cn } from '@/lib/cn';

/**
 * ThaiWaveDivider — two layers of gold kanok-style wave crests drifting in
 * opposite directions, the seam between sections. Server component: plain
 * SVG + SMIL, no JS. One wave period is 300 units, drawn once in <defs> and
 * stamped with <use>; each layer slides exactly one period per loop, so the
 * motion is seamless.
 */
const PERIOD = 300;
const REPEATS = 9;

// one period: a rolling swell with a curled crest (kanok / woodblock feel)
const CREST =
  'M0 34 C30 34 46 22 70 16 C96 10 118 12 132 22 C142 30 150 30 158 22 C166 14 160 4 150 6 C142 8 142 18 150 20 ' +
  'M150 20 C170 20 190 30 210 34 C240 40 270 38 300 34';
const SWELL = 'M0 40 C40 40 60 28 100 28 C140 28 160 42 200 42 C240 42 260 30 300 30';

export default function ThaiWaveDivider({ className, flip = false }: { className?: string; flip?: boolean }) {
  const id = useId().replace(/:/g, '');
  const stamps = Array.from({ length: REPEATS }, (_, i) => i * PERIOD);
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none relative h-12 w-full overflow-hidden text-brass sm:h-14', flip && 'rotate-180', className)}
    >
      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${PERIOD * 5} 48`} preserveAspectRatio="none" fill="none">
        <defs>
          <path id={`${id}c`} d={CREST} />
          <path id={`${id}s`} d={SWELL} />
        </defs>
        <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.42">
          {stamps.map((x) => (
            <use key={x} href={`#${id}c`} x={x} />
          ))}
          <animateTransform attributeName="transform" type="translate" from="0 0" to={`-${PERIOD} 0`} dur="26s" repeatCount="indefinite" />
        </g>
        <g stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" opacity="0.22">
          {stamps.map((x) => (
            <use key={x} href={`#${id}s`} x={x - PERIOD} />
          ))}
          <animateTransform attributeName="transform" type="translate" from="0 0" to={`${PERIOD} 0`} dur="38s" repeatCount="indefinite" />
        </g>
      </svg>
    </div>
  );
}
