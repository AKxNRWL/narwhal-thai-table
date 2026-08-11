'use client';

/**
 * Google Ads conversion events, fired on real guest intent:
 *   1. Any click on an Order Online link (order.toasttab.com) -> "Order Online Click"
 *   2. Any click on a tel: link (the restaurant number)       -> "Phone Call Click"
 *
 * One capture-phase listener on document covers every current and future
 * link on the site (hero, nav, footer, dish pages) with zero per-component
 * wiring. Each fires the Ads conversion (send_to label from the Ads UI)
 * plus a GA4 custom event so the same intent shows up in Analytics.
 *
 * Labels created Aug 9, 2026 in Google Ads account 776-410-0399 (welcome@):
 *   Begin checkout -> Order Online Click
 *   Contact        -> Phone Call Click
 */

import { useEffect } from 'react';

const ORDER_LABEL = 'AW-18329609126/MscPCK_Xt98cEKbHnqRE';
const PHONE_LABEL = 'AW-18329609126/_xDzCLLXt98cEKbHnqRE';

export default function AdsConversions() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const link = target?.closest?.('a');
      if (!link) return;
      const href = link.getAttribute('href') || '';
      const w = window as unknown as { gtag?: (...args: unknown[]) => void };
      if (typeof w.gtag !== 'function') return;

      if (href.includes('order.toasttab.com')) {
        w.gtag('event', 'conversion', { send_to: ORDER_LABEL, value: 1.0, currency: 'USD' });
        w.gtag('event', 'order_online_click', { link_url: href });
      } else if (href.startsWith('tel:')) {
        w.gtag('event', 'conversion', { send_to: PHONE_LABEL, value: 1.0, currency: 'USD' });
        w.gtag('event', 'phone_call_click', { link_url: href });
      }
    };
    // Capture phase: runs before navigation handling, catches every link.
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
