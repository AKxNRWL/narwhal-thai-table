import { deepMerge } from './merge';
import { en, type UiDict } from './ui.en';
import { vi } from './ui.vi';
import type { Locale } from './locales';

export type { UiDict } from './ui.en';
export type { Locale } from './locales';
export { LOCALES, DEFAULT_LOCALE, LOCALE_TAG, OG_LOCALE, localePath, pathLocale, stripLocale, alternatesFor, hasViTwin } from './locales';

const DICTS: Record<Locale, UiDict> = {
  en,
  vi: deepMerge(en, vi),
};

/**
 * Page copy for a locale — server components only (the dictionaries are
 * large; client components get the slice they need as a prop).
 */
export function ui(locale: Locale = 'en'): UiDict {
  return DICTS[locale] ?? en;
}
