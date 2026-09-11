import type { Dish } from '@/lib/dishes';
import type { Locale } from './locales';
import { DISHES_VI, type DishVi } from './dishes.vi';

/**
 * localizeDish — the same Dish record with its prose swapped for the
 * Vietnamese translation when one exists. Names, Thai script, prices, slugs,
 * categories and allergen codes never change (the menu and Toast stay the
 * source of truth for those); any field missing from dishes.vi.ts keeps its
 * English text.
 */
export function localizeDish(dish: Dish, locale: Locale): Dish {
  if (locale === 'en') return dish;
  const t: DishVi | undefined = DISHES_VI[dish.slug];
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
