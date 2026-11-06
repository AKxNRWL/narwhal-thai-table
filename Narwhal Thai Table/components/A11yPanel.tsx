'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { A11Y_KEYS, useA11yPrefs, type A11yKey } from '@/lib/a11y';
import { cn } from '@/lib/cn';
import { chrome } from '@/lib/i18n/chrome';
import { localePath } from '@/lib/i18n/locales';
import { useLocale } from '@/lib/i18n/useLocale';

/**
 * Accessibility preferences (6 Nov 2026) — five switches (reduce motion,
 * higher contrast, larger text, underline links, reading spacing) that the
 * guest can flip from a small button in the nav or on /accessibility. The
 * switches are classes on <html> (lib/a11y.ts) read by app/globals.css.
 *
 * Deliberately quiet: a 44px icon button next to the language switcher, a
 * row in the phone drawer, nothing floating over the page — the owner's
 * rule is that none of this may get in the way of an ordinary visit.
 */

export function A11yIcon({ className }: { className?: string }) {
  // the universal "accessibility" figure — a head over open arms
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" className={className}>
      <circle cx="12" cy="4.6" r="2.1" />
      <path d="M20.3 8.1a1 1 0 0 1-.2 1.9l-4.6.9v3.2l2.3 6.3a1 1 0 0 1-1.9.7L12 15.3l-3.9 5.8a1 1 0 0 1-1.9-.7l2.3-6.3v-3.2l-4.6-.9a1 1 0 1 1 .4-2l5.5 1.1h4.4l5.5-1.1a1 1 0 0 1 .6.1z" />
    </svg>
  );
}

/** The five switches — used inside the dialog and inline on /accessibility. */
export function A11yControls({ tone = 'dark', className }: { tone?: 'dark' | 'light'; className?: string }) {
  const locale = useLocale();
  const t = chrome(locale).a11y;
  const { is, set, reset } = useA11yPrefs();
  const dark = tone === 'dark';
  const labels: Record<A11yKey, { label: string; desc: string }> = {
    motion: { label: t.motion, desc: t.motionDesc },
    contrast: { label: t.contrast, desc: t.contrastDesc },
    text: { label: t.text, desc: t.textDesc },
    underline: { label: t.underline, desc: t.underlineDesc },
    spacing: { label: t.spacing, desc: t.spacingDesc },
  };
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {A11Y_KEYS.map((k) => {
        const on = is(k);
        return (
          <button
            key={k}
            type="button"
            role="switch"
            aria-checked={on}
            onClick={() => set(k, !on)}
            className={cn(
              'flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition-colors',
              dark
                ? 'border-cream/15 bg-white/[0.04] text-cream hover:border-brass-light/60'
                : 'border-navy/15 bg-white text-navy hover:border-navy/40',
              on && (dark ? 'border-brass/60 bg-brass/10' : 'border-brass-deep bg-[#FFF8E8]'),
            )}
          >
            <span className="min-w-0">
              <span className="block font-sans text-[14.5px] font-medium">{labels[k].label}</span>
              <span className={cn('mt-0.5 block font-sans text-[12.5px] leading-snug', dark ? 'text-cream/75' : 'text-navy/70')}>{labels[k].desc}</span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <span className={cn('font-sans text-[10.5px] font-medium uppercase tracking-[0.18em]', dark ? 'text-cream/70' : 'text-navy/70')}>
                {on ? t.on : t.off}
              </span>
              <span
                aria-hidden="true"
                className={cn('relative block h-6 w-11 rounded-full transition-colors', on ? 'bg-brass' : dark ? 'bg-cream/25' : 'bg-navy/25')}
              >
                <span className={cn('absolute top-0.5 block size-5 rounded-full transition-[left]', dark ? 'bg-cream' : 'bg-white', on ? 'left-[22px]' : 'left-0.5')} />
              </span>
            </span>
          </button>
        );
      })}
      <div className="mt-1 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={reset}
          className={cn('rounded-full px-3 py-2 font-sans text-[11px] font-medium uppercase tracking-[0.18em] underline-offset-4 hover:underline', dark ? 'text-cream/80' : 'text-navy/80')}
        >
          {t.reset}
        </button>
      </div>
    </div>
  );
}

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** The button + dialog. `variant="row"` renders a full-width drawer row instead of the icon. */
export default function A11yButton({ variant = 'icon', className, onNavigate }: { variant?: 'icon' | 'row'; className?: string; onNavigate?: () => void }) {
  const locale = useLocale();
  const t = chrome(locale).a11y;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); return; }
      if (e.key !== 'Tab' || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const a = items[0], z = items[items.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      btnRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={variant === 'icon' ? t.open : undefined}
        title={variant === 'icon' ? t.open : undefined}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          variant === 'icon'
            ? 'grid size-11 place-items-center rounded-full border border-cream/15 bg-white/[0.04] text-cream/85 transition-[border-color,color] duration-300 hover:border-brass-light/60 hover:text-brass-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-light'
            : 'flex w-full items-center gap-3 border-b border-cream/10 py-3 font-sans text-[13px] font-medium uppercase tracking-[0.18em] text-cream/85 hover:text-brass-light',
          className,
        )}
      >
        <A11yIcon className={variant === 'icon' ? 'size-[22px]' : 'size-5 text-brass-light'} />
        {variant === 'row' && <span>{t.title}</span>}
      </button>

      {open && (
        <div className="fixed inset-0 z-[160]">
          <div className="absolute inset-0 bg-navy-deep/70 backdrop-blur-[2px]" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            data-lenis-prevent
            className="absolute inset-x-3 top-[calc(var(--cs-ticker-h)+84px)] mx-auto max-h-[calc(100dvh-var(--cs-ticker-h)-100px)] w-auto max-w-[440px] overflow-y-auto rounded-[22px] border border-brass/30 bg-[#0B1F33] p-5 text-cream shadow-lift sm:inset-x-6 sm:p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 id={titleId} className="font-display text-[22px] font-medium leading-tight">{t.title}</h2>
                <p className="mt-1 font-sans text-[13px] leading-snug text-cream/75">{t.intro}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.close}
                className="grid size-10 shrink-0 place-items-center rounded-full border border-cream/15 text-cream/85 hover:border-brass-light/60 hover:text-brass-light"
              >
                <span aria-hidden="true" className="text-[22px] leading-none">&times;</span>
              </button>
            </div>
            <A11yControls />
            <Link
              href={localePath(locale, '/accessibility')}
              onClick={() => { setOpen(false); onNavigate?.(); }}
              className="mt-4 inline-block font-sans text-[12px] font-medium uppercase tracking-[0.18em] text-brass-light underline-offset-4 hover:underline"
            >
              {t.statement} →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
