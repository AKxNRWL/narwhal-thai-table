import type { Dish, Pairing } from '@/lib/dishes';
import type { Locale } from './locales';
import { DISHES_VI } from './dishes.vi';
import { DISHES_TH } from './dishes.th';
import { DISHES_ZH } from './dishes.zh';
import { DISHES_KO } from './dishes.ko';
import { DISHES_JA } from './dishes.ja';

/** The translatable prose of a dish — everything else stays in lib/dishes.ts. */
export type DishL10n = {
  description?: string;
  variants?: string[];
  ingredients?: string[];
  pairing?: Pairing;
  story?: { lede?: string; history?: string; howToEat?: string; chefNote?: string };
};

const MAPS: Partial<Record<Locale, Record<string, DishL10n>>> = {
  vi: DISHES_VI,
  th: DISHES_TH,
  zh: DISHES_ZH,
  ko: DISHES_KO,
  ja: DISHES_JA,
};

/**
 * localizeDish — the same Dish record with its prose swapped for the
 * translation when one exists. Names, Thai script, prices, slugs, categories
 * and allergen codes never change (the menu and Toast stay the source of
 * truth for those); any field missing from the locale file keeps its English.
 */
export function localizeDish(dish: Dish, locale: Locale): Dish {
  if (locale === 'en') return dish;
  const t = MAPS[locale]?.[dish.slug];
  if (!t) return dish;
  return {
    ...dish,
    description: t.description ?? dish.description,
    ...(dish.variants ? { variants: t.variants ?? dish.variants } : {}),
    ...(dish.ingredients ? { ingredients: t.ingredients ?? dish.ingredients } : {}),
    ...(dish.pairing
      ? {
          pairing: {
            ...dish.pairing,
            ...(dish.pairing.drink ? { drink: t.pairing?.drink ?? dish.pairing.drink } : {}),
            ...(dish.pairing.sides ? { sides: t.pairing?.sides ?? dish.pairing.sides } : {}),
          },
        }
      : {}),
    ...(dish.story
      ? {
          story: {
            ...dish.story,
            lede: t.story?.lede ?? dish.story.lede,
            ...(dish.story.history ? { history: t.story?.history ?? dish.story.history } : {}),
            ...(dish.story.howToEat ? { howToEat: t.story?.howToEat ?? dish.story.howToEat } : {}),
            ...(dish.story.chefNote ? { chefNote: t.story?.chefNote ?? dish.story.chefNote } : {}),
          },
        }
      : {}),
  };
}

export function localizeDishes(dishes: Dish[], locale: Locale): Dish[] {
  return locale === 'en' ? dishes : dishes.map((d) => localizeDish(d, locale));
}
