'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { chrome } from '@/lib/i18n/chrome';
import { hasViTwin, pathLocale, switchLocalePath } from '@/lib/i18n/locales';

const KEY = 'nt-vi-bar';

/**
 * "Trang này có bản tiếng Việt." — a quiet, dismissable pill that appears on
 * English pages for browsers whose language is Vietnamese. A suggestion, never
 * a redirect (auto-redirecting by Accept-Language hides pages from crawlers
 * and annoys bilingual guests). Dismissal is remembered per browser.
 */
export default function ViSuggestBar() {
  const pathname = usePathname() ?? '/';
  const [show, setShow] = useState(false);
  const t = chrome('vi').locale;

  useEffect(() => {
    if (pathLocale(pathname) === 'vi' || !hasViTwin(pathname)) {
      setShow(false);
      return;
    }
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(KEY) === '1';
    } catch {
      /* private mode etc. */
    }
    const langs = [navigator.language, ...(navigator.languages ?? [])].filter(Boolean);
    const vietnamese = langs.some((l) => /^vi(-|$)/i.test(l));
    setShow(vietnamese && !dismissed);
  }, [pathname]);

  if (!show) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  return (
    <div
      lang="vi"
      role="region"
      aria-label={t.suggest}
      className="fixed left-4 z-[70] flex max-w-[calc(100vw-104px)] items-center gap-3 rounded-full border border-brass/40 bg-navy-deep/90 py-2 pl-4 pr-2 shadow-lift backdrop-blur-xl bottom-[calc(16px+var(--mab-h))] sm:bottom-6 sm:left-6"
    >
      <span className="font-serif text-[14px] italic text-cream/85">{t.suggest}</span>
      <Link
        href={switchLocalePath(pathname, 'vi')}
        hrefLang="vi"
        onClick={() => {
          try { localStorage.setItem(KEY, '1'); } catch { /* ignore */ }
        }}
        className="shrink-0 rounded-full bg-brass px-3.5 py-1.5 font-sans text-[10.5px] font-medium uppercase tracking-[0.16em] text-navy transition-colors hover:bg-brass-light"
      >
        {t.suggestCta}
      </Link>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t.suggestDismiss}
        className="grid size-8 shrink-0 place-items-center rounded-full text-cream/60 transition-colors hover:bg-white/10 hover:text-cream"
      >
        <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" /></svg>
      </button>
    </div>
  );
}
