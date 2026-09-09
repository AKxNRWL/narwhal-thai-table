import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/* ------------------------------------------------------------------ */
/* Container — the 1280px column every section shares                  */
/* ------------------------------------------------------------------ */
export function Container({
  className,
  narrow,
  ...rest
}: ComponentPropsWithoutRef<'div'> & { narrow?: boolean }) {
  return (
    <div
      className={cn('mx-auto w-full px-5 sm:px-8 lg:px-12', narrow ? 'max-w-3xl' : 'max-w-7xl', className)}
      {...rest}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Section — vertical rhythm + optional "lit" top glow                  */
/* ------------------------------------------------------------------ */
type SectionProps<T extends ElementType = 'section'> = {
  as?: T;
  tone?: 'deep' | 'navy' | 'glow';
  /** first section under the fixed nav needs top clearance */
  first?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>;

export function Section<T extends ElementType = 'section'>({
  as,
  tone = 'deep',
  first = false,
  className,
  children,
  ...rest
}: SectionProps<T>) {
  const Tag = (as ?? 'section') as ElementType;
  return (
    <Tag
      className={cn(
        'relative isolate py-20 sm:py-24 lg:py-32',
        first && 'pt-[calc(var(--cs-ticker-h)+112px)] sm:pt-[calc(var(--cs-ticker-h)+128px)]',
        tone === 'navy' && 'bg-navy',
        tone === 'glow' &&
          'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:-z-10 before:h-[420px] ' +
          'before:bg-[radial-gradient(60%_60%_at_50%_0%,rgba(200,162,78,0.14),transparent_70%)]',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* Eyebrow — small brass label above headings                          */
/* ------------------------------------------------------------------ */
export function Eyebrow({ className, children, ...rest }: ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-3 font-sans text-[10.5px] font-medium uppercase tracking-[0.3em] text-brass-light',
        "before:h-px before:w-6 before:bg-brass/70 before:content-['']",
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Heading — display sans with an italic serif accent (<em>)          */
/* ------------------------------------------------------------------ */
type HeadingLevel = 'h1' | 'h2' | 'h3';
export function Heading({
  as = 'h2',
  size = 'lg',
  className,
  children,
  ...rest
}: {
  as?: HeadingLevel;
  size?: 'xl' | 'lg' | 'md' | 'sm';
} & ComponentPropsWithoutRef<'h2'>) {
  const Tag = as;
  const sizes = {
    xl: 'text-[clamp(44px,7vw,92px)] leading-[0.98] tracking-[-0.02em]',
    lg: 'text-[clamp(34px,4.6vw,60px)] leading-[1.04] tracking-[-0.015em]',
    md: 'text-[clamp(28px,3.4vw,42px)] leading-[1.1] tracking-[-0.01em]',
    sm: 'text-[clamp(22px,2.4vw,28px)] leading-[1.2]',
  } as const;
  return (
    <Tag
      className={cn(
        'font-display font-medium text-cream text-balance',
        sizes[size],
        '[&_em]:font-serif [&_em]:font-normal [&_em]:italic [&_em]:text-brass-light',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* SectionHead — eyebrow + heading + optional lede, centered or left    */
/* ------------------------------------------------------------------ */
export function SectionHead({
  eyebrow,
  title,
  lede,
  align = 'center',
  as = 'h2',
  size = 'lg',
  className,
  id,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  align?: 'center' | 'left';
  as?: HeadingLevel;
  size?: 'xl' | 'lg' | 'md';
  className?: string;
  id?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-5',
        align === 'center' ? 'mx-auto max-w-3xl items-center text-center' : 'max-w-2xl items-start text-left',
        className,
      )}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <Heading as={as} size={size} id={id}>
        {title}
      </Heading>
      {lede && <p className="max-w-xl font-serif text-[17px] italic leading-relaxed text-cream/70 sm:text-[18px]">{lede}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tag — small pill used on dish cards                                  */
/* ------------------------------------------------------------------ */
export function Tag({
  tone = 'brass',
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<'span'> & { tone?: 'brass' | 'spicy' | 'muted' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-sans text-[9.5px] font-medium uppercase tracking-[0.18em]',
        tone === 'brass' && 'border-brass/40 bg-brass/10 text-brass-light',
        tone === 'spicy' && 'border-red-400/40 bg-red-500/10 text-red-300',
        tone === 'muted' && 'border-cream/15 bg-white/[0.04] text-cream/70',
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Card — glass surface used for dish / info cards                     */
/* ------------------------------------------------------------------ */
export function cardSurface(extra?: string) {
  return cn(
    'group glow-card relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-cream/10 bg-white/[0.035] ',
    'shadow-card transition-[transform,border-color,box-shadow,background-color] duration-500 ease-out-soft',
    'hover:-translate-y-1.5 hover:border-brass/45 hover:bg-white/[0.05] hover:shadow-lift',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-light focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep',
    extra,
  );
}
