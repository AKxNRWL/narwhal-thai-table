import type { Locale } from '@/lib/i18n/locales';
import { cn } from '@/lib/cn';

/**
 * Flag — small inline-SVG flags for the language switcher (owner, 11 Sep
 * 2026: "ตรงเปลี่ยนภาษาเอามีธงของประเทศนั้นด้วย"). Drawn by hand at 3:2 so
 * they render identically everywhere — emoji flags show as letter codes on
 * Windows. Simplified geometry: at 20px a star is a star, not a survey.
 *   en → US · vi → Vietnam · th → Thailand · zh → China · ko → South Korea ·
 *   ja → Japan
 */
const STAR5 = 'M0,-1 L0.2245,-0.309 L0.951,-0.309 L0.3633,0.118 L0.5878,0.809 L0,0.382 L-0.5878,0.809 L-0.3633,0.118 L-0.951,-0.309 L-0.2245,-0.309 Z';

function Star({ x, y, r, fill, rotate = 0 }: { x: number; y: number; r: number; fill: string; rotate?: number }) {
  return <path d={STAR5} fill={fill} transform={`translate(${x} ${y}) rotate(${rotate}) scale(${r})`} />;
}

/** One Korean trigram in local coords: three bars stacked along -y, centred 11 units from the flag centre. */
function Trigram({ bottom = false, gaps }: { bottom?: boolean; gaps: boolean[] }) {
  const sign = bottom ? 1 : -1;
  return (
    <g stroke="#000" strokeWidth="1" strokeLinecap="butt">
      {gaps.map((gap, i) => {
        const y = sign * (12.5 - i * 1.5);
        return gap ? (
          <path key={i} d={`M-3,${y}H-0.5M0.5,${y}H3`} />
        ) : (
          <path key={i} d={`M-3,${y}H3`} />
        );
      })}
    </g>
  );
}

export default function Flag({ locale, className }: { locale: Locale; className?: string }) {
  const common = {
    viewBox: '0 0 36 24',
    'aria-hidden': true as const,
    focusable: 'false' as const,
    className: cn('inline-block h-[1em] w-[1.5em] shrink-0 rounded-[2px] shadow-[0_0_0_1px_rgba(255,255,255,0.18)]', className),
  };
  switch (locale) {
    case 'en':
      return (
        <svg {...common}>
          <rect width="36" height="24" fill="#B22234" />
          {[1, 3, 5, 7, 9, 11].map((i) => (
            <rect key={i} y={(24 / 13) * i} width="36" height={24 / 13} fill="#fff" />
          ))}
          <rect width="14.4" height={(24 / 13) * 7} fill="#3C3B6E" />
          {Array.from({ length: 5 }, (_, r) =>
            Array.from({ length: 5 }, (_, c) => (
              <circle key={`${r}-${c}`} cx={1.6 + c * 2.8} cy={1.4 + r * 2.4} r="0.55" fill="#fff" />
            )),
          )}
        </svg>
      );
    case 'vi':
      return (
        <svg {...common}>
          <rect width="36" height="24" fill="#DA251D" />
          <Star x={18} y={12} r={7.2} fill="#FFFF00" />
        </svg>
      );
    case 'th':
      return (
        <svg {...common}>
          <rect width="36" height="24" fill="#A51931" />
          <rect y="4" width="36" height="16" fill="#F4F5F8" />
          <rect y="8" width="36" height="8" fill="#2D2A4A" />
        </svg>
      );
    case 'zh':
      return (
        <svg {...common}>
          <rect width="36" height="24" fill="#EE1C25" />
          <Star x={7} y={7} r={4.2} fill="#FFFF00" />
          <Star x={14} y={3} r={1.4} fill="#FFFF00" rotate={23} />
          <Star x={16.5} y={6} r={1.4} fill="#FFFF00" rotate={45} />
          <Star x={16.5} y={10} r={1.4} fill="#FFFF00" rotate={0} />
          <Star x={14} y={13} r={1.4} fill="#FFFF00" rotate={-23} />
        </svg>
      );
    case 'ko':
      return (
        <svg {...common}>
          <rect width="36" height="24" fill="#fff" />
          {/* construction follows the official proportions: yin-yang and trigrams on the diagonals (±56.31°) */}
          <g transform="translate(18 12)">
            <g transform="rotate(-56.31)">
              <circle r="6" fill="#CD2E3A" />
              <path d="M0,-6A6,6 0 0 0 0,6A3,3 0 0 0 0,0A3,3 0 0 1 0,-6Z" fill="#0047A0" />
              <Trigram gaps={[false, false, false]} />
              <Trigram bottom gaps={[true, true, true]} />
            </g>
            <g transform="rotate(56.31)">
              <Trigram gaps={[true, false, true]} />
              <Trigram bottom gaps={[false, true, false]} />
            </g>
          </g>
        </svg>
      );
    case 'ja':
      return (
        <svg {...common}>
          <rect width="36" height="24" fill="#fff" />
          <circle cx="18" cy="12" r="7.2" fill="#BC002D" />
        </svg>
      );
    default:
      return null;
  }
}
