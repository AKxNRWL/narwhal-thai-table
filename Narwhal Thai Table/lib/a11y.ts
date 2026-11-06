'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Accessibility preferences (6 Nov 2026) — the guest's own switches for
 * motion, contrast, text size, underlined links and reading spacing. They
 * live in localStorage, are applied as classes on <html> before the first
 * paint (a11yBootScript in app/layout.tsx) and read by app/globals.css
 * (`html.a11y-motion …`). The OS settings count too: prefers-reduced-motion
 * and prefers-contrast switch the same classes on unless the guest has set
 * the switch the other way by hand.
 *
 * Nothing here changes the page for a guest who touches none of it — the
 * owner's rule: every feature exists, none of it gets in the way.
 */
import { A11Y_KEY, A11Y_KEYS, type A11yKey } from './a11yBoot';

export { A11Y_KEY, A11Y_KEYS, type A11yKey };

/** true/false = set by the guest; undefined = follow the operating system (motion, contrast) or off. */
export type A11yPrefs = Partial<Record<A11yKey, boolean>>;

export function readPrefs(): A11yPrefs {
  try {
    const raw = localStorage.getItem(A11Y_KEY);
    const p = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    const out: A11yPrefs = {};
    for (const k of A11Y_KEYS) if (typeof p[k] === 'boolean') out[k] = p[k] as boolean;
    return out;
  } catch {
    return {};
  }
}

export function writePrefs(p: A11yPrefs) {
  try {
    const clean: A11yPrefs = {};
    for (const k of A11Y_KEYS) if (typeof p[k] === 'boolean') clean[k] = p[k];
    if (Object.keys(clean).length) localStorage.setItem(A11Y_KEY, JSON.stringify(clean));
    else localStorage.removeItem(A11Y_KEY);
  } catch {
    /* private mode — the classes still apply for this page view */
  }
}

function systemWants(k: A11yKey): boolean {
  if (typeof matchMedia !== 'function') return false;
  if (k === 'motion') return matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (k === 'contrast') return matchMedia('(prefers-contrast: more)').matches || matchMedia('(forced-colors: active)').matches;
  return false;
}

/** The switch as it stands: the guest's choice, else the OS, else off. */
export function effective(p: A11yPrefs, k: A11yKey): boolean {
  return typeof p[k] === 'boolean' ? (p[k] as boolean) : systemWants(k);
}

export function applyPrefs(p: A11yPrefs) {
  const c = document.documentElement.classList;
  for (const k of A11Y_KEYS) c.toggle(`a11y-${k}`, effective(p, k));
  document.documentElement.dispatchEvent(new CustomEvent('a11y-change'));
}

/** Is motion switched off right now (guest switch or OS setting)? Re-renders when it changes. */
export function useReducedMotion(): boolean {
  const [off, setOff] = useState(false);
  useEffect(() => {
    const read = () => setOff(document.documentElement.classList.contains('a11y-motion'));
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);
  return off;
}

/** The guest's switches + setters, for the panel and the /accessibility page. */
export function useA11yPrefs() {
  const [prefs, setPrefs] = useState<A11yPrefs>({});
  const [tick, setTick] = useState(0);
  // switches render "off" on the server and until mounted, so SSR and the first client paint agree
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setPrefs(readPrefs());
    setReady(true);
    // OS setting flips (dark-mode style) → re-read the effective state
    if (typeof matchMedia !== 'function') return;
    const qs = ['(prefers-reduced-motion: reduce)', '(prefers-contrast: more)', '(forced-colors: active)'].map((q) => matchMedia(q));
    const on = () => { applyPrefs(readPrefs()); setTick((t) => t + 1); };
    qs.forEach((q) => q.addEventListener('change', on));
    return () => qs.forEach((q) => q.removeEventListener('change', on));
  }, []);
  // latest value outside React's render cycle, so two quick taps never clobber each other
  const latest = useRef<A11yPrefs>({});
  latest.current = prefs;
  const commit = (next: A11yPrefs) => {
    latest.current = next;
    setPrefs(next);
    writePrefs(next);
    applyPrefs(next);
  };
  const set = (k: A11yKey, v: boolean) => commit({ ...latest.current, [k]: v });
  const reset = () => commit({});
  const is = (k: A11yKey) => ready && effective(prefs, k);
  return { prefs, is, set, reset, tick, ready };
}
