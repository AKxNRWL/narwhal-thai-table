import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Brand buttons.
 *   primary   — solid brass, navy text (the ONE action per screen)
 *   secondary — glass outline on dark backgrounds
 *   ghost     — text-only with arrow, for tertiary links
 *
 * IMPORTANT for Google Ads conversions: external CTAs (Toast Order Online,
 * tel:) must stay real <a href> elements — AdsConversions listens for the
 * literal `order.toasttab.com` / `tel:` hrefs. Use `href` (not onClick).
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'group inline-flex items-center justify-center gap-2.5 rounded-full font-sans font-medium tracking-[0.14em] uppercase ' +
  'transition-[transform,background-color,border-color,color,box-shadow] duration-300 ease-out-soft select-none ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-light focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep ' +
  'disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<ButtonVariant, string> = {
  primary:
    'btn-shine bg-brass text-navy shadow-[0_10px_30px_-10px_rgba(200,162,78,0.7)] ' +
    'hover:bg-brass-light hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_rgba(200,162,78,0.75)] active:translate-y-0',
  secondary:
    'border border-cream/20 bg-white/[0.04] text-cream backdrop-blur-md ' +
    'hover:border-brass-light/70 hover:bg-white/[0.08] hover:text-brass-light hover:-translate-y-0.5 active:translate-y-0',
  ghost:
    'rounded-none px-0 py-1 tracking-[0.18em] text-brass-light border-b border-transparent hover:border-brass-light/60',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-[10.5px]',
  md: 'px-6 py-3.5 text-[11px]',
  lg: 'px-7 py-4 text-[12px]',
};

export function Arrow({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('shrink-0 transition-transform duration-300 group-hover:translate-x-0.5', className)}
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  arrow?: boolean;
  className?: string;
  children: ReactNode;
};

type AnchorProps = Common & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'children'>;
type NativeButtonProps = Common & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

export type ButtonProps = AnchorProps | NativeButtonProps;

function classes(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return cn(base, variants[variant], variant === 'ghost' ? '' : sizes[size], className);
}

/**
 * Renders <Link> for internal paths, <a> for external/tel/mailto/hash, and a
 * <button> when no href is given.
 */
export default function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', arrow = false, className, children } = props;
  const cls = classes(variant, size, className);

  if (props.href !== undefined) {
    const { href, variant: _v, size: _s, arrow: _a, className: _c, children: _ch, ...rest } = props;
    const internal = href.startsWith('/') && !href.startsWith('//');
    const content = (
      <>
        {children}
        {arrow && <Arrow />}
      </>
    );
    if (internal) {
      return (
        <Link href={href} className={cls} {...rest}>
          {content}
        </Link>
      );
    }
    return (
      <a href={href} className={cls} {...rest}>
        {content}
      </a>
    );
  }

  const { variant: _v, size: _s, arrow: _a, className: _c, children: _ch, ...rest } = props;
  return (
    <button className={cls} {...rest}>
      {children}
      {arrow && <Arrow />}
    </button>
  );
}
