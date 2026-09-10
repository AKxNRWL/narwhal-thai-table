import { cn } from '@/lib/cn';

/**
 * FloatingLanterns — Loy Krathong sky lanterns drifting up through a section.
 * Server component, CSS-only: positions come from a seeded generator so the
 * server and client markup match (no hydration diff, no JS on the page).
 * Keyframes `lantern-rise` / `lantern-sway` live in globals.css.
 */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export default function FloatingLanterns({
  count = 14,
  seed = 7,
  className,
}: {
  count?: number;
  seed?: number;
  className?: string;
}) {
  const rnd = seeded(seed);
  const lanterns = Array.from({ length: count }, (_, i) => {
    const left = 3 + rnd() * 94;
    const size = 14 + rnd() * 22; // px
    const dur = 26 + rnd() * 30; // s
    const delay = -rnd() * dur; // negative → already mid-flight on load
    const sway = 6 + rnd() * 10; // s
    const opacity = 0.35 + rnd() * 0.45;
    return { i, left, size, dur, delay, sway, opacity };
  });
  return (
    <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0 -z-[5] overflow-hidden', className)}>
      {lanterns.map((l) => (
        <span
          key={l.i}
          className="absolute bottom-0 block animate-[lantern-rise_linear_infinite]"
          style={{
            left: `${l.left.toFixed(2)}%`,
            width: l.size,
            height: l.size * 1.35,
            opacity: l.opacity,
            animationDuration: `${l.dur.toFixed(1)}s`,
            animationDelay: `${l.delay.toFixed(1)}s`,
          }}
        >
          <svg
            viewBox="0 0 20 27"
            className="block h-full w-full animate-[lantern-sway_ease-in-out_infinite]"
            style={{ animationDuration: `${l.sway.toFixed(1)}s`, animationDelay: `${l.delay.toFixed(1)}s` }}
          >
            <defs>
              <radialGradient id={`lg${l.i}`} cx="50%" cy="60%" r="60%">
                <stop offset="0%" stopColor="#FFF1C9" stopOpacity="0.95" />
                <stop offset="55%" stopColor="#E3C581" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#C8A24E" stopOpacity="0.35" />
              </radialGradient>
            </defs>
            {/* soft glow */}
            <ellipse cx="10" cy="14" rx="10" ry="12" fill="#E3C581" opacity="0.18" />
            {/* body */}
            <path d="M5 4 h10 l1.5 14 q-6.5 3 -13 0 z" fill={`url(#lg${l.i})`} stroke="#C8A24E" strokeWidth="0.6" />
            <rect x="5" y="3" width="10" height="1.6" rx="0.8" fill="#C8A24E" />
            {/* flame */}
            <circle cx="10" cy="22" r="1.4" fill="#FFF6DC" />
          </svg>
        </span>
      ))}
    </div>
  );
}
