import type { Dish } from '@/lib/dishes';

/**
 * What a menu card needs — the server page trims the (already localised)
 * Dish records to this before handing them to the client-side MenuSections,
 * so the client bundle carries no dish prose it never shows. Plain module:
 * MenuSections is 'use client', and a client module's exports cannot be
 * called from the server.
 */
export type MenuCard = Pick<Dish, 'slug' | 'name' | 'thai' | 'category' | 'price' | 'description' | 'variants' | 'signature' | 'spicy' | 'protein'> & {
  hasStory: boolean;
};

export function toMenuCard(d: Dish): MenuCard {
  return {
    slug: d.slug,
    name: d.name,
    thai: d.thai,
    category: d.category,
    price: d.price,
    description: d.description,
    variants: d.variants,
    signature: d.signature,
    spicy: d.spicy,
    protein: d.protein,
    hasStory: Boolean(d.story),
  };
}
