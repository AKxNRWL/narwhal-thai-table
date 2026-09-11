'use client';

import { useEffect } from 'react';
import { HTML_LANG } from '@/lib/i18n/locales';
import { useLocale } from '@/lib/i18n/useLocale';

/**
 * Keeps <html lang> in step with the page's locale during client-side
 * navigation (EN ⇄ VI ⇄ TH …). The very first paint is handled by the inline
 * script in app/layout.tsx (lib/i18n/locales.ts htmlLangScript), so the locale
 * fonts, screen readers and crawlers see the right language before hydration.
 * Renders nothing.
 */
export default function LangSync() {
  const locale = useLocale();
  useEffect(() => {
    document.documentElement.lang = HTML_LANG[locale];
  }, [locale]);
  return null;
}
