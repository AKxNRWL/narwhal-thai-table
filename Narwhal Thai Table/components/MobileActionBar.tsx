'use client';

import Link from 'next/link';
import { ORDER_ONLINE_URL, DIRECTIONS_URL } from '@/lib/site';
import { chrome } from '@/lib/i18n/chrome';
import { localePath } from '@/lib/i18n/locales';
import { useLocale } from '@/lib/i18n/useLocale';

const item =
  'flex min-h-[58px] flex-col items-center justify-center gap-1 font-sans text-[9.5px] font-medium uppercase tracking-[0.18em] ' +
  'text-cream/80 transition-colors duration-200 active:bg-brass/10 active:text-brass-light [-webkit-tap-highlight-color:transparent] ' +
  '[&+&]:border-l [&+&]:border-brass/15 [&_svg]:size-5';

/**
 * Sticky bottom action bar — phones only (hidden from 761px up via the
 * `min-[761px]:hidden` breakpoint, matching the `--mab-h` media query in
 * app/globals.css which reserves the bar's height on <body> and lifts the
 * Aileen chat launcher). Plain links; client only to read EN / VI from the URL.
 *
 * Google Ads conversions rely on the literal Toast href + tel: scheme — keep
 * these as real anchors.
 */
export default function MobileActionBar() {
  const locale = useLocale();
  const t = chrome(locale).mobileBar;
  return (
    <nav
      aria-label={t.label}
      className="fixed inset-x-0 bottom-0 z-[60] grid auto-cols-fr grid-flow-col border-t border-brass/25 bg-navy-deep/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-xl min-[761px]:hidden"
    >
      {ORDER_ONLINE_URL && (
        <a className={`${item} text-brass-light [&_svg]:text-brass`} href={ORDER_ONLINE_URL} target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" focusable="false">
            <path d="M4 8h16l-1.2 11a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8L4 8Z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </svg>
          <span>{t.order}</span>
        </a>
      )}
      <a className={item} href={DIRECTIONS_URL} target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" focusable="false">
          <path d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11Z" />
          <circle cx="12" cy="10" r="2.6" />
        </svg>
        <span>{t.directions}</span>
      </a>
      <Link className={item} href={localePath(locale, '/contact/reservation')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" focusable="false">
          <rect x="3.5" y="5" width="17" height="15" rx="2" />
          <path d="M3.5 10h17M8 3.5v3M16 3.5v3" />
        </svg>
        <span>{t.reserve}</span>
      </Link>
    </nav>
  );
}
