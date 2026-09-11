'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Flag from '@/components/i18n/Flag';
import { chrome } from '@/lib/i18n/chrome';
import { HTML_LANG, SECONDARY_LOCALES, hasTwin, pathLocale, stripLocale, switchLocalePath, type Locale } from '@/lib/i18n/locales';

const KEY = 'nt-lang-bar';

/** Map a browser language tag to one of our editions ('zh-TW' → zh, 'th-TH' → th …). */
function match(tag: string): Locale | null {
  const base = tag.toLowerCase().split('-')[0];
  return (SECONDARY_LOCALES as readonly string[]).includes(base) ? (base as Locale) : base === 'en' ? 'en' : null;
}

/**
 * "This page is available in your language" — a quiet, dismissable pill for
 * browsers whose language has an edition on this site (Vietnamese, Thai,
 * Chinese, Korean, Japanese), shown in that language. A suggestion, never a
 * redirect (auto-redirecting by Accept-Language hides pages from crawlers and
 * annoys bilingual guests). Dismissal is remembered per browser and language.
 */
export default function LangSuggestBar() {
  const pathname = usePathname() ?? '/';
  const [target, setTarget] = useState<Locale | null>(null);

  useEffect(() => {
    const current = pathLocale(pathname);
    if (!hasTwin(stripLocale(pathname))) { setTarget(null); return; }
    const langs = [navigator.language, ...(navigator.languages ?? [])].filter(Boolean);
    // the first browser language we serve, if it is not the edition already open
    let want: Locale | null = null;
    for (const l of langs) {
      const m = match(l);
      if (m) { want = m; break; }
    }
    if (!want || want === 'en' || want === current) { setTarget(null); return; }
    let dismissed = false;
    try { dismissed = localStorage.getItem(`${KEY}-${want}`) === '1'; } catch { /* private mode etc. */ }
    setTarget(dismissed ? null : want);
  }, [pathname]);

  if (!target) return null;
  const t = chrome(target).locale;
  const remember = () => { try { localStorage.setItem(`${KEY}-${target}`, '1'); } catch { /* ignore */ } };

  return (
    <div
      lang={HTML_LANG[target]}
      role="region"
      aria-label={t.suggest}
      className="fixed left-4 z-[70] flex max-w-[calc(100vw-104px)] items-center gap-3 rounded-full border border-brass/40 bg-navy-deep/90 py-2 pl-3 pr-2 shadow-lift backdrop-blur-xl bottom-[calc(16px+var(--mab-h))] sm:bottom-6 sm:left-6"
    >
      <Flag locale={target} className="text-[14px]" />
      <span className="font-serif text-[14px] italic text-cream/85">{t.suggest}</span>
      <Link
        href={switchLocalePath(pathname, target)}
        hrefLang={HTML_LANG[target]}
        onClick={remember}
        className="shrink-0 rounded-full bg-brass px-3.5 py-1.5 font-sans text-[10.5px] font-medium uppercase tracking-[0.16em] text-navy transition-colors hover:bg-brass-light"
      >
        {t.suggestCta}
      </Link>
      <button
        type="button"
        onClick={() => { remember(); setTarget(null); }}
        aria-label={t.suggestDismiss}
        className="grid size-8 shrink-0 place-items-center rounded-full text-cream/60 transition-colors hover:bg-white/10 hover:text-cream"
      >
        <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" /></svg>
      </button>
    </div>
  );
}
