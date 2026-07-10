export type CategoryId =
  | 'appetizers' | 'salad' | 'grill' | 'soup' | 'curry'
  | 'rice' | 'overrice' | 'noodles' | 'alacarte' | 'seafood'
  | 'dessert' | 'drinks' | 'sides';

export type Category = { id: CategoryId; label: string };

export const CATEGORIES: Category[] = [
  { id: 'appetizers', label: 'Appetizers' },
  { id: 'salad',      label: 'Salads' },
  { id: 'grill',      label: 'BBQ' },
  { id: 'soup',       label: 'Soup' },
  { id: 'curry',      label: 'Curry' },
  { id: 'rice',       label: 'Rice' },
  { id: 'overrice',   label: 'Over Rice' },
  { id: 'noodles',    label: 'Noodles' },
  { id: 'alacarte',   label: 'À La Carte' },
  { id: 'seafood',    label: 'Poseidon' },
  { id: 'dessert',    label: 'Dessert' },
  { id: 'drinks',     label: 'Drinks' },
  { id: 'sides',      label: 'Sides & Protein' },
];

export function getCategoryLabel(id: CategoryId): string {
  return CATEGORIES.find(c => c.id === id)?.label ?? id;
}
