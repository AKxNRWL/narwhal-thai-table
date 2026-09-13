/**
 * i18n — locale plumbing for the translated editions of the site.
 *
 * Design (owner decisions, 11–13 Sep 2026 — Vietnamese first, then "เอาเป็น
 * ภาษาไทยด้วย และก็จีน เกาหลี และญี่ปุ่น", then Spanish + Traditional Chinese):
 *   • English stays at the root (/, /menu, …) — nothing moves.
 *   • Each other language lives under its prefix (/es, /vi, /th, /zh, /zh-tw,
 *     /ko, /ja) as
 *     thin routes (app/[locale]/…) that render the SAME page components with a
 *     `locale` prop.
 *   • Copy comes from dictionaries in lib/i18n; a missing string falls back to
 *     English, so a half-translated page never shows a blank.
 *   • No auto-redirect by browser language (Google penalises that). Pages show
 *     a small "this page exists in your language" pill instead.
 *
 * Browser-safe: constants + pure functions only.
 */
export const LOCALES = ['en', 'es', 'vi', 'th', 'zh', 'zh-tw', 'ko', 'ja'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
/** The translated editions (everything but English). */
export const SECONDARY_LOCALES = LOCALES.filter((l): l is Exclude<Locale, 'en'> => l !== 'en');

export function isLocale(v: string | undefined | null): v is Locale {
  return !!v && (LOCALES as readonly string[]).includes(v);
}

/** BCP-47 tags for hreflang and JSON-LD `inLanguage`. */
export const LOCALE_TAG: Record<Locale, string> = { en: 'en-US', es: 'es-US', vi: 'vi-VN', th: 'th-TH', zh: 'zh-CN', 'zh-tw': 'zh-TW', ko: 'ko-KR', ja: 'ja-JP' };
/** <html lang> values. */
export const HTML_LANG: Record<Locale, string> = { en: 'en', es: 'es', vi: 'vi', th: 'th', zh: 'zh-CN', 'zh-tw': 'zh-TW', ko: 'ko', ja: 'ja' };
/** Open Graph locale values. */
export const OG_LOCALE: Record<Locale, string> = { en: 'en_US', es: 'es_LA', vi: 'vi_VN', th: 'th_TH', zh: 'zh_CN', 'zh-tw': 'zh_TW', ko: 'ko_KR', ja: 'ja_JP' };
/** The language's own name — what the switcher shows. */
export const LOCALE_NAME: Record<Locale, string> = { en: 'English', es: 'Español', vi: 'Tiếng Việt', th: 'ไทย', zh: '简体中文', 'zh-tw': '繁體中文', ko: '한국어', ja: '日本語' };
/** Two-letter code shown next to the flag in the compact switcher. */
export const LOCALE_CODE: Record<Locale, string> = { en: 'EN', es: 'ES', vi: 'VI', th: 'TH', zh: 'ZH', 'zh-tw': 'TW', ko: 'KO', ja: 'JA' };
/** Which editions need a non-Latin webfont (loaded only on their pages). */
export const NON_LATIN: ReadonlySet<Locale> = new Set<Locale>(['th', 'zh', 'zh-tw', 'ko', 'ja']);

/**
 * English paths that have a translated twin. Everything else (press, the OC
 * guide, /order, /play, the city pages) stays English-only, so links to those
 * are never prefixed.
 */
const TWIN_ROUTES = ['/', '/menu', '/lunch', '/about', '/contact', '/contact/reservation', '/contact/message', '/contact/catering'];

export function hasTwin(path: string): boolean {
  const clean = path.split(/[?#]/)[0] || '/';
  if (TWIN_ROUTES.includes(clean)) return true;
  return clean.startsWith('/menu/');
}

/** Locale codes for a regex alternation — longest first ('zh-tw' before 'zh'). */
const CODES_ALT = [...SECONDARY_LOCALES].sort((a, b) => b.length - a.length).join('|');
const PREFIX = new RegExp(`^/(${CODES_ALT})(?=/|$|[#?])`);

/** Which locale a pathname belongs to. */
export function pathLocale(pathname: string | null | undefined): Locale {
  const m = PREFIX.exec(pathname ?? '');
  return m && isLocale(m[1]) ? m[1] : 'en';
}

/** '/vi/menu' → '/menu', '/th' → '/'. English paths pass through. */
export function stripLocale(pathname: string): string {
  const rest = pathname.replace(PREFIX, '');
  return rest === '' || rest.startsWith('#') || rest.startsWith('?') ? '/' + rest : rest;
}

/**
 * Localise an internal href. localePath('vi', '/menu') → '/vi/menu';
 * '/#story' → '/vi#story'. External, tel:, mailto:, bare '#hash' and
 * English-only routes are returned untouched. English is the identity.
 */
export function localePath(locale: Locale, href: string): string {
  if (locale === 'en') return href;
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  if (pathLocale(href) !== 'en') return href;
  if (!hasTwin(href)) return href;
  if (href === '/') return `/${locale}`;
  if (href.startsWith('/#') || href.startsWith('/?')) return `/${locale}` + href.slice(1);
  return `/${locale}` + href;
}

/**
 * Pages that exist in ONE language only, and the English page that stands in
 * for them (so the switcher and hreflang never point at a URL that does not
 * exist).
 */
const SINGLE_LANGUAGE_PAGES: Record<string, string> = {
  '/vi/nha-hang-thai-little-saigon': '/thai-food-westminster',
};

/**
 * The same page in another language (for the switcher). Pages that exist in
 * one language only fall back to the nearest page that does exist.
 */
export function switchLocalePath(pathname: string, to: Locale): string {
  const clean = pathname.split(/[?#]/)[0] || '/';
  const enPath = clean in SINGLE_LANGUAGE_PAGES ? SINGLE_LANGUAGE_PAGES[clean] : stripLocale(clean);
  if (to === 'en') return enPath;
  if (pathLocale(clean) === to) return clean;
  const single = Object.entries(SINGLE_LANGUAGE_PAGES).find(([p, en]) => en === enPath && pathLocale(p) === to);
  if (single) return single[0];
  return hasTwin(enPath) ? localePath(to, enPath) : `/${to}`;
}

/**
 * Next.js `metadata.alternates` for a page that exists in every language.
 * `enPath` is the English path ('/menu'); the canonical is the page's own URL.
 */
export function alternatesFor(locale: Locale, enPath: string) {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[LOCALE_TAG[l]] = localePath(l, enPath);
  languages['x-default'] = enPath;
  return { canonical: localePath(locale, enPath), languages };
}

/**
 * Inline script for <head>: sets <html lang> from the URL before the first
 * paint, so the locale fonts (globals.css `html[lang=…]`) and screen readers
 * are right from the start. LangSync keeps it in step on client navigation.
 */
export function htmlLangScript(): string {
  const map = JSON.stringify(Object.fromEntries(SECONDARY_LOCALES.map((l) => [l, HTML_LANG[l]])));
  return `(function(){var m=location.pathname.match(/^\\/(${CODES_ALT})(?=\\/|$)/);document.documentElement.lang=m?${map}[m[1]]:'en'})()`;
}
