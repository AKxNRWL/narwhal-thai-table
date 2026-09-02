'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { PublicPromo } from '@/lib/promoShared';

/**
 * Promo pop-up — the owner's current special (lunch set, seasonal dish…),
 * shown once per visit as a compact card: centred on desktop, a bottom sheet
 * on phones. Content comes from /api/promo (owner edits it in /stats).
 * With 2+ photos the photo area is a swipeable carousel (scroll-snap, so it is
 * native touch scrolling) with dots, hover arrows on desktop and ←/→ keys.
 *
 * Rules that keep it welcome rather than annoying:
 *  - never on the paid /order landing page or staff screens, never for
 *    guests who arrived from a table QR (?t=)
 *  - waits 1.4s so the page paints first; the first photo is decoded before
 *    the card mounts so it never pops in empty
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
const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── photo carousel (1 photo = plain image, 2+ = swipe + dots) ──────────── */

function PromoPhotos({ images }: { images: PublicPromo['images'] }) {
  const track = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const n = images.length;

  const go = useCallback((i: number) => {
    const el = track.current;
    if (!el) return;
    const next = ((i % n) + n) % n;
    el.scrollTo({ left: next * el.clientWidth, behavior: reducedMotion() ? 'auto' : 'smooth' });
  }, [n]);

  // Active dot follows the snap position (rAF-throttled scroll listener).
  useEffect(() => {
    const el = track.current;
    if (!el || n < 2) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setIdx(Math.min(n - 1, Math.max(0, Math.round(el.scrollLeft / el.clientWidth)))));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [n]);

  if (!n) return null;
  return (
    <div
      className={'promo-media' + (n > 1 ? ' has-many' : '')}
      role={n > 1 ? 'region' : undefined}
      aria-roledescription={n > 1 ? 'carousel' : undefined}
      aria-label={n > 1 ? 'Photos' : undefined}
      onKeyDown={(e) => {
        if (n < 2) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1); }
      }}
    >
      <div className="promo-track" ref={track}>
        {images.map((im, i) => (
          <div className="promo-slide" key={im.src + i} role={n > 1 ? 'group' : undefined} aria-roledescription={n > 1 ? 'slide' : undefined} aria-label={n > 1 ? `${i + 1} of ${n}` : undefined}>
            {/* eslint-disable-next-line @next/next/no-img-element -- owner-uploaded or site photo; plain <img> avoids remotePatterns config */}
            <img src={im.src} alt={im.alt} decoding={i === 0 ? 'sync' : 'async'} loading={i < 2 ? 'eager' : 'lazy'} draggable={false} />
            {im.alt && <span className="promo-cap" aria-hidden="true">{im.alt}</span>}
          </div>
        ))}
      </div>
      {n > 1 && (
        <>
          <button type="button" className="promo-arrow promo-prev" aria-label="Previous photo" onClick={() => go(idx - 1)}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M10 3L5 8l5 5" /></svg>
          </button>
          <button type="button" className="promo-arrow promo-next" aria-label="Next photo" onClick={() => go(idx + 1)}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M6 3l5 5-5 5" /></svg>
          </button>
          <div className="promo-dots">
            {images.map((im, i) => (
              <button
                type="button"
                key={im.src + i}
                className={'promo-dot' + (i === idx ? ' is-on' : '')}
                aria-label={`Photo ${i + 1} of ${n}${im.alt ? ': ' + im.alt : ''}`}
                aria-current={i === idx ? 'true' : undefined}
                onClick={() => go(i)}
              >
                <i />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

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
      <PromoPhotos images={promo.images || []} />
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
        if (!Array.isArray(p.images)) p.images = [];
        const show = () => {
          timer = window.setTimeout(() => {
            if (!force) ss(SEEN_KEY, p.id);
            setPromo(p);
          }, force ? 300 : SHOW_DELAY_MS);
        };
        if (p.images[0]) {
          // decode() (not just onload) so the first photo is ready to paint the
          // instant the card mounts — otherwise the photo area flashes navy
          // for a beat while the JPEG decodes.
          const im = new Image();
          im.src = p.images[0].src;
          im.decode().then(show, () => {
            p.images = p.images.slice(1); // broken first photo → drop it, never a grey box
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
