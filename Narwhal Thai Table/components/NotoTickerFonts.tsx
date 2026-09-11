'use client';

/**
 * Loads the Noto Sans families (Latin/Thai/SC/TC/KR/JP) used by the
 * multi-language ticker — asynchronously, after hydration.
 *
 * Why: as a plain <link rel="stylesheet"> in <head> this Google Fonts CSS was
 * the last render-blocking third-party request on every page. The ticker is
 * decorative-priority text, so it's fine for it to paint in fallback fonts for
 * a beat and swap. The URL lives in lib/notoFonts.ts — shared with
 * app/[locale]/layout.tsx, which hoists the same stylesheet into <head> for
 * the Thai / Chinese / Korean / Japanese editions — and with the <noscript>
 * copy in app/layout.tsx (no-JS fallback).
 */
import { useEffect } from 'react';
import { NOTO_FONTS_HREF } from '@/lib/notoFonts';

export default function NotoTickerFonts() {
  useEffect(() => {
    if (document.querySelector(`link[data-noto-ticker]`) || document.querySelector(`link[rel="stylesheet"][href="${NOTO_FONTS_HREF}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = NOTO_FONTS_HREF;
    link.setAttribute('data-noto-ticker', '1');
    document.head.appendChild(link);
  }, []);
  return null;
}
