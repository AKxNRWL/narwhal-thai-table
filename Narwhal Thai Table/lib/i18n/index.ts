import { deepMerge } from './merge';
import { en, type UiDict } from './ui.en';
import { vi } from './ui.vi';
import { th } from './ui.th';
import { zh } from './ui.zh';
import { ko } from './ui.ko';
import { ja } from './ui.ja';
import { es } from './ui.es';
import { zhTW } from './ui.zh-tw';
import type { Locale } from './locales';

export type { UiDict } from './ui.en';
export type { Locale } from './locales';
export { LOCALES, SECONDARY_LOCALES, DEFAULT_LOCALE, LOCALE_TAG, OG_LOCALE, HTML_LANG, LOCALE_NAME, isLocale, localePath, pathLocale, stripLocale, alternatesFor, hasTwin } from './locales';

const DICTS: Record<Locale, UiDict> = {
  en,
  vi: deepMerge(en, vi),
  th: deepMerge(en, th),
  zh: deepMerge(en, zh),
  ko: deepMerge(en, ko),
  ja: deepMerge(en, ja),
  es: deepMerge(en, es),
  'zh-tw': deepMerge(en, zhTW),
};

/**
 * Page copy for a locale — server components only (the dictionaries are
 * large; client components get the slice they need as a prop).
 */
export function ui(locale: Locale = 'en'): UiDict {
  return DICTS[locale] ?? en;
}
