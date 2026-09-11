'use client';

import { usePathname } from 'next/navigation';
import { pathLocale, type Locale } from './locales';

/** Locale of the page being viewed, derived from the URL (/vi/… → 'vi'). */
export function useLocale(): Locale {
  return pathLocale(usePathname());
}
