'use client';

/**
 * Loads the Noto Sans families (Latin/Thai/SC/TC/KR/JP) used ONLY by the
 * multi-language ticker — asynchronously, after hydration.
 *
 * Why: as a plain <link rel="stylesheet"> in <head> this Google Fonts CSS was
 * the last render-blocking third-party request on every page. The ticker is
 * decorative-priority text, so it's fine for it to paint in fallback fonts for
 * a beat and swap. Keep the URL in sync with the <noscript> copy in
 * app/layout.tsx (no-JS fallback).
 */
import { useEffect } from 'react';

const HREF =
  'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500&family=Noto+Sans+Thai:wght@400;500&family=Noto+Sans+SC:wght@400;500&family=Noto+Sans+TC:wght@400;500&family=Noto+Sans+KR:wght@400;500&family=Noto+Sans+JP:wght@400;500&display=swap';

export default function NotoTickerFonts() {
  useEffect(() => {
    if (document.querySelector(`link[data-noto-ticker]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = HREF;
    link.setAttribute('data-noto-ticker', '1');
    document.head.appendChild(link);
  }, []);
  return null;
}
