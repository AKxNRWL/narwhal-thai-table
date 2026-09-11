import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NON_LATIN, SECONDARY_LOCALES, isLocale, type Locale } from '@/lib/i18n/locales';
import { NOTO_FONTS_HREF } from '@/lib/notoFonts';

/**
 * app/[locale] — the translated editions (/vi, /th, /zh, /ko, /ja). Every
 * page under here is a thin wrapper that renders the shared component from
 * components/pages with the locale from the URL; English stays at the root.
 *
 * Only the five known locales are generated (dynamicParams = false), so any
 * other first segment is a 404 exactly as before. <html lang> is set by the
 * inline script in the root layout; the Thai / CJK editions also get the Noto
 * stylesheet hoisted into <head> here so their glyphs never paint in a
 * fallback font first (English pages keep loading it lazily for the ticker).
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return SECONDARY_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'en') notFound();
  const l = locale as Locale;
  return (
    <>
      {NON_LATIN.has(l) && <link rel="stylesheet" href={NOTO_FONTS_HREF} precedence="default" />}
      {children}
    </>
  );
}
