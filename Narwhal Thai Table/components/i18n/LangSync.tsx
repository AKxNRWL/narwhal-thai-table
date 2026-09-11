'use client';

import { useEffect } from 'react';
import { useLocale } from '@/lib/i18n/useLocale';

/**
 * Keeps <html lang> in step with the page's locale during client-side
 * navigation (EN ⇄ VI). The very first paint of a /vi page is handled by the
 * inline script in app/vi/layout.tsx, so screen readers and search engines
 * see `lang="vi"` before hydration. Renders nothing.
 */
export default function LangSync() {
  const locale = useLocale();
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
