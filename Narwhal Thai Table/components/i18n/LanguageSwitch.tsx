'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Flag from '@/components/i18n/Flag';
import { chrome } from '@/lib/i18n/chrome';
import { LOCALES, LOCALE_CODE, LOCALE_NAME, HTML_LANG, switchLocalePath, type Locale } from '@/lib/i18n/locales';
import { useLocale } from '@/lib/i18n/useLocale';
import { cn } from '@/lib/cn';

/**
 * Language switcher with flags (owner, 11 Sep 2026: "ตรงเปลี่ยนภาษาเอามีธงของ
 * ประเทศนั้นด้วย"). Two shapes:
 *   bar  — the nav bar: a flag + code pill that opens a glass menu of all six
 *          languages (native names), closed by click-outside / Escape / route.
 *   grid — the phone drawer: all six laid out as a grid (3 columns from
 *          390px, 2 on narrower phones), no menu.
 * Every entry links to the SAME page in that language (its hreflang twin);
 * one-language pages fall back to the nearest page that exists.
 */
export default function LanguageSwitch({ variant = 'bar', className }: { variant?: 'bar' | 'grid'; className?: string }) {
  const pathname = usePathname() ?? '/';
  const locale = useLocale();
  const t = chrome(locale).locale;
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (root.current && !root.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const entry = (code: Locale, compact: boolean) => {
    const current = code === locale;
    return (
      <Link
        key={code}
        href={switchLocalePath(pathname, code)}
        hrefLang={HTML_LANG[code]}
        lang={HTML_LANG[code]}
        role={compact ? undefined : 'menuitem'}
        aria-current={current ? 'true' : undefined}
        onClick={() => setOpen(false)}
        className={cn(
          'flex items-center rounded-xl font-sans transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-light',
          current ? 'bg-brass/15 text-brass-light' : 'text-cream/80 hover:bg-white/[0.06] hover:text-cream',
          // grid cells are narrow on phones ("Tiếng Việt" is the widest name):
          // tighter padding, smaller flag, and the tint alone marks the current one
          compact ? 'gap-2 border border-cream/10 px-2 py-2' : 'gap-2.5 px-2.5 py-2',
        )}
      >
        <Flag locale={code} className={compact ? 'text-[14px]' : 'text-[15px]'} />
        <span className={cn('min-w-0 flex-1 truncate tracking-normal normal-case', compact ? 'text-[12.5px]' : 'text-[13px]')}>{LOCALE_NAME[code]}</span>
        {current && !compact && (
          <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 8.5l3 3 7-7" />
          </svg>
        )}
      </Link>
    );
  };

  if (variant === 'grid') {
    return (
      <nav aria-label={t.switch} className={cn('grid grid-cols-2 gap-2 min-[390px]:grid-cols-3', className)}>
        {LOCALES.map((code) => entry(code, true))}
      </nav>
    );
  }

  return (
    <div ref={root} className={cn('relative', className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t.switch}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-cream/15 bg-white/[0.04] py-2 pl-2.5 pr-3 font-sans text-[10.5px] font-medium uppercase tracking-[0.18em] text-cream/85',
          'transition-[border-color,background-color,color] duration-300 hover:border-brass-light/60 hover:text-brass-light',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-light',
          open && 'border-brass-light/60 text-brass-light',
        )}
      >
        <Flag locale={locale} className="text-[13px]" />
        <span>{LOCALE_CODE[locale]}</span>
        <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={cn('transition-transform duration-300', open && 'rotate-180')}>
          <path d="M2.5 4.5 6 8l3.5-3.5" />
        </svg>
      </button>
      <div
        role="menu"
        aria-label={t.switch}
        hidden={!open}
        className="absolute right-0 top-[calc(100%+10px)] z-[110] w-[188px] rounded-2xl border border-brass/25 bg-navy-deep/95 p-1.5 shadow-lift backdrop-blur-xl"
      >
        {LOCALES.map((code) => entry(code, false))}
      </div>
    </div>
  );
}
