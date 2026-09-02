'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { PublicPromo } from '@/lib/promoShared';

/**
 * Promo pop-up — the owner's current special (lunch set, seasonal dish…),
 * shown once per visit as a compact card: centred on desktop, a bottom sheet
 * on phones. Content comes from /api/promo (owner edits it in /stats).
 *
 * Rules that keep it welcome rather than annoying:
 *  - never on the paid /order landing page or staff screens, never for
 *    guests who arrived from a table QR (?t=)
 *  - waits 1.4s so the page paints first; the photo is preloaded so the card
 *    never pops in empty
 *  - once per session; "×" / "Maybe later" hides it for DISMISS_DAYS
 *  - a changed offer has a new id, so it shows again to everyone
 *  - accessible: role=dialog, Escape closes, focus moves in and back out,
 *    Tab stays inside, reduced-motion users get no animation (CSS)
 */

const SEEN_KEY = 'nwh-promo-seen'; // sessionStorage: id shown this session
const DISMISS_KEY = 'nwh-promo-dismiss'; // localStorage: { id, until }
const DISMISS_DAYS = 3;
const SHOW_DELAY_MS = 1400;
const SKIP_PATHS = ['/order', '/stats', '/orders', '/calls', '/cal', '/play'];

const ss = (k: string, v?: string): string | null => {
  try {
    if (v !== undefined) sessionStorage.setItem(k, v);
    return sessionStorage.getItem(k);
  } catch {
    return null;
  }
};
function dismissedFor(id: string): boolean {
  try {
    const d = JSON.parse(localStorage.getItem(DISMISS_KEY) || 'null') as { id?: string; until?: number } | null;
    return !!d && d.id === id && typeof d.until === 'number' && Date.now() < d.until;
  } catch {
    return false;
  }
}
function rememberDismiss(id: string) {
  try {
    localStorage.setItem(DISMISS_KEY, JSON.stringify({ id, until: Date.now() + DISMISS_DAYS * 86_400_000 }));
  } catch {
    /* private mode — it simply shows again next visit */
  }
}
const isExternal = (url: string) => /^https?:\/\//i.test(url) && !url.startsWith('https://narwhalthaihb.com');

/* ── the card itself (also used as the live preview in /stats) ─────────── */

export function PromoCardView({
  promo,
  onClose,
  onCta,
  preview = false,
  closeRef,
}: {
  promo: PublicPromo;
  onClose?: () => void;
  onCta?: () => void;
  preview?: boolean;
  closeRef?: React.Ref<HTMLButtonElement>;
}) {
  const external = isExternal(promo.ctaUrl);
  const titleId = preview ? 'promo-preview-title' : 'promo-title';
  const bodyId = preview ? 'promo-preview-body' : 'promo-body';
  return (
    <div
      className="promo-card"
      role={preview ? undefined : 'dialog'}
      aria-modal={preview ? undefined : true}
      aria-labelledby={titleId}
      aria-describedby={promo.body ? bodyId : undefined}
    >
      <span className="promo-handle" aria-hidden="true" />
      <button ref={closeRef} type="button" className="promo-x" onClick={onClose} aria-label="Close">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" focusable="false">
          <path d="M3 3l10 10M13 3L3 13" />
        </svg>
      </button>
      {promo.image && (
        <div className="promo-media">
          {/* eslint-disable-next-line @next/next/no-img-element -- owner-uploaded or dish photo; plain <img> avoids remotePatterns config */}
          <img src={promo.image} alt="" decoding="sync" />
        </div>
      )}
      <div className="promo-copy">
        {promo.eyebrow && <span className="promo-eyebrow">{promo.eyebrow}</span>}
        <h2 className="promo-title" id={titleId}>{promo.title}</h2>
        {promo.body && <p className="promo-text" id={bodyId}>{promo.body}</p>}
        {(promo.price || promo.ctaUrl) && (
          <div className="promo-foot">
            {promo.price && <span className="promo-price">{promo.price}</span>}
            {promo.ctaUrl && (
              <a
                className="promo-cta"
                href={promo.ctaUrl}
                onClick={onCta}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener' : undefined}
              >
                {promo.ctaLabel || 'Order now'}
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </a>
            )}
          </div>
        )}
        <button type="button" className="promo-later" onClick={onClose}>Maybe later</button>
      </div>
    </div>
  );
}

/* ── loader: decides whether this visitor sees the card ────────────────── */

export default function PromoCard() {
  const pathname = usePathname();
  const [promo, setPromo] = useState<PublicPromo | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  const dismiss = useCallback(() => {
    setPromo((p) => {
      if (p) rememberDismiss(p.id);
      return null;
    });
  }, []);

  // Fetch + decide, once per page load (the session flag makes it once per visit).
  useEffect(() => {
    if (!pathname || SKIP_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) return;
    const params = new URLSearchParams(window.location.search);
    if (params.has('t')) return; // table-QR guests
    const force = params.get('promo') === 'show'; // owner's "ดูบนเว็บ" link from /stats
    const ctrl = new AbortController();
    let timer: number | undefined;
    // Normal visits share the edge-cached copy (60s). The owner's check reads
    // the uncached owner endpoint instead (same cookie as /stats) so a fresh
    // save shows immediately — the CDN ignores query strings here
    // (Netlify-Vary), so cache-busting the public URL would not work.
    const load = async (): Promise<{ promo?: PublicPromo | null; status?: string } | null> => {
      if (force) {
        const r = await fetch('/api/owner/promo', { signal: ctrl.signal, credentials: 'same-origin', cache: 'no-store' });
        if (r.ok) return r.json();
      }
      const r = await fetch('/api/promo', { signal: ctrl.signal, cache: force ? 'no-store' : 'default' });
      return r.ok ? r.json() : null;
    };
    load()
      .then((j) => {
        const p = j?.promo;
        if (!p || !p.id || !p.title) return;
        if (force && j?.status && j.status !== 'live') return; // owner data carries status
        if (!force && (ss(SEEN_KEY) === p.id || dismissedFor(p.id))) return;
        const show = () => {
          timer = window.setTimeout(() => {
            if (!force) ss(SEEN_KEY, p.id);
            setPromo(p);
          }, force ? 300 : SHOW_DELAY_MS);
        };
        if (p.image) {
          // decode() (not just onload) so the bitmap is ready to paint the
          // instant the card mounts — otherwise the photo area flashes navy
          // for a beat while the JPEG decodes.
          const im = new Image();
          im.src = p.image;
          im.decode().then(show, () => {
            p.image = ''; // broken photo → text-only card, never a grey box
            show();
          });
        } else show();
      })
      .catch(() => { /* offline / aborted — no card */ });
    return () => {
      ctrl.abort();
      if (timer) window.clearTimeout(timer);
    };
  }, [pathname]);

  // Open/close side effects: scroll lock, focus in/out, Escape, focus trap.
  useEffect(() => {
    if (!promo) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        dismiss();
        return;
      }
      if (e.key !== 'Tab' || !cardRef.current) return;
      const nodes = Array.from(cardRef.current.querySelectorAll<HTMLElement>('button, a[href]')).filter((n) => !n.hasAttribute('disabled'));
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      restoreRef.current?.focus?.();
    };
  }, [promo, dismiss]);

  if (!promo) return null;
  return (
    <div className="promo-root" ref={cardRef}>
      <div className="promo-backdrop" onClick={dismiss} aria-hidden="true" />
      <PromoCardView promo={promo} onClose={dismiss} onCta={dismiss} closeRef={closeRef} />
    </div>
  );
}
