/**
 * Server-safe half of lib/a11y.ts: the storage key, the switch names and the
 * inline <head> script that applies the guest's accessibility switches (and
 * the operating-system ones) as classes on <html> before the first paint —
 * so a "reduce motion" or "larger text" choice never flashes the default
 * page first. Imported by app/layout.tsx; everything stateful stays in
 * lib/a11y.ts ('use client').
 */
export const A11Y_KEY = 'nt-a11y';

export type A11yKey = 'motion' | 'contrast' | 'text' | 'underline' | 'spacing';
export const A11Y_KEYS: A11yKey[] = ['motion', 'contrast', 'text', 'underline', 'spacing'];

export function a11yBootScript(): string {
  return (
    `(function(){try{var p=JSON.parse(localStorage.getItem('${A11Y_KEY}')||'{}')||{};var c=document.documentElement.classList;` +
    `var mm=function(q){return !!(window.matchMedia&&matchMedia(q).matches)};` +
    `var sys={motion:mm('(prefers-reduced-motion: reduce)'),contrast:mm('(prefers-contrast: more)')||mm('(forced-colors: active)')};` +
    `['motion','contrast','text','underline','spacing'].forEach(function(k){var v=typeof p[k]==='boolean'?p[k]:!!sys[k];if(v)c.add('a11y-'+k)})}catch(e){}})()`
  );
}
