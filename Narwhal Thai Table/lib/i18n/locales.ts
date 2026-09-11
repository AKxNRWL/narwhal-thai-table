/**
 * i18n — locale plumbing for the Vietnamese edition of the site.
 *
 * Design (owner decision, 11 Sep 2026 — "เวียดนามได้ผลกว่า"):
 *   • English stays at the root (/, /menu, …) — nothing moves.
 *   • Vietnamese lives under /vi (/vi, /vi/menu, /vi/menu/[slug], …) as thin
 *     routes that render the SAME page components with `locale="vi"`.
 *   • Copy comes from dictionaries in lib/i18n; a missing Vietnamese string
 *     falls back to English, so a half-translated page never shows a blank.
 *   • No auto-redirect by browser language (Google penalises that). English
 *     pages show a small "Xem trang tiếng Việt?" bar to Vietnamese browsers.
 *
 * Browser-safe: constants + pure functions only.
 */
export const LOCALES = ['en', 'vi'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/** BCP-47 tags for <html lang>, Open Graph and JSON-LD `inLanguage`. */
export const LOCALE_TAG: Record<Locale, string> = { en: 'en-US', vi: 'vi-VN' };
export const OG_LOCALE: Record<Locale, string> = { en: 'en_US', vi: 'vi_VN' };

/**
 * English paths that have a Vietnamese twin. Everything else (press, the OC
 * guide, /order, /play, the city pages) stays English-only, so links to those
 * are never prefixed.
 */
const VI_ROUTES = ['/', '/menu', '/lunch', '/about', '/contact', '/contact/reservation', '/contact/message', '/contact/catering'];

export function hasViTwin(path: string): boolean {
  const clean = path.split(/[?#]/)[0] || '/';
  if (VI_ROUTES.includes(clean)) return true;
  return clean.startsWith('/menu/');
}

/** Which locale a pathname belongs to. */
export function pathLocale(pathname: string | null | undefined): Locale {
  const p = pathname ?? '';
  return p === '/vi' || p.startsWith('/vi/') || p.startsWith('/vi#') || p.startsWith('/vi?') ? 'vi' : 'en';
}

/** '/vi/menu' → '/menu', '/vi' → '/'. English paths pass through. */
export function stripLocale(pathname: string): string {
  if (pathname === '/vi') return '/';
  if (pathname.startsWith('/vi/')) return pathname.slice(3);
  if (pathname.startsWith('/vi#') || pathname.startsWith('/vi?')) return '/' + pathname.slice(3);
  return pathname;
}

/**
 * Localise an internal href. localePath('vi', '/menu') → '/vi/menu';
 * '/#story' → '/vi#story'. External, tel:, mailto:, bare '#hash' and
 * English-only routes are returned untouched. English is the identity.
 */
export function localePath(locale: Locale, href: string): string {
  if (locale === 'en') return href;
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  if (pathLocale(href) === 'vi') return href;
  if (!hasViTwin(href)) return href;
  if (href === '/') return '/vi';
  if (href.startsWith('/#') || href.startsWith('/?')) return '/vi' + href.slice(1);
  return '/vi' + href;
}

/**
 * Vietnamese-only pages and the English page that stands in for them (the
 * switcher and hreflang never point at a URL that does not exist).
 */
const VI_ONLY: Record<string, string> = {
  '/vi/nha-hang-thai-little-saigon': '/thai-food-westminster',
};

/**
 * The same page in the other language (for the EN | VI switcher). Pages that
 * exist in one language only fall back to the nearest page that does exist.
 */
export function switchLocalePath(pathname: string, to: Locale): string {
  const clean = pathname.split(/[?#]/)[0] || '/';
  if (to === 'en') {
    if (clean in VI_ONLY) return VI_ONLY[clean];
    return stripLocale(clean);
  }
  if (pathLocale(clean) === 'vi') return clean;
  const viOnly = Object.entries(VI_ONLY).find(([, enPath]) => enPath === clean);
  if (viOnly) return viOnly[0];
  return hasViTwin(clean) ? localePath('vi', clean) : '/vi';
}

/**
 * Next.js `metadata.alternates` for a page that exists in both languages.
 * `enPath` is the English path ('/menu'); the canonical is the page's own URL.
 */
export function alternatesFor(locale: Locale, enPath: string) {
  const vi = localePath('vi', enPath);
  return {
    canonical: locale === 'vi' ? vi : enPath,
    languages: { 'en-US': enPath, 'vi-VN': vi, 'x-default': enPath },
  };
}
