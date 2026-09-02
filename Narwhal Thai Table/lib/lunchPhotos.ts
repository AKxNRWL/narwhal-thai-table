/**
 * Lunch Specials — the facts the site repeats (homepage section, promo
 * library) and the plate photos that go with them.
 *
 * Facts come from the owner's Google Business Profile post of 28 Aug 2026 and
 * the /lunch page: weekdays 11:30–3, from $11.99, salad + spring roll with
 * every lunch, a cup of soup when dining in. Per-plate prices are NOT
 * published anywhere on the site until the owner sends them — never guess.
 *
 * Photos: public/images/lunch/<file>. Shot 22 Aug 2026 (originals:
 * D:\projects\Narwhal pic\Food\LS-*.jpg, portrait 896×1200 on white),
 * cropped to 4:3 centred on the plate so they fill a landscape frame without
 * cutting the food. Browser-safe: constants only.
 */
export const LUNCH_PHOTO_DIR = '/images/lunch';

export const LUNCH_PHOTOS: ReadonlyArray<{ file: string; label: string }> = [
  { file: 'pad-thai.jpg', label: 'Pad Thai' },
  { file: 'krapow.jpg', label: 'Krapow' },
  { file: 'pad-kee-mao.jpg', label: 'Pad Kee Mao' },
  { file: 'panang-curry.jpg', label: 'Panang Curry' },
  { file: 'yellow-curry.jpg', label: 'Yellow Curry' },
  { file: 'cashew-nut.jpg', label: 'Cashew Nut' },
  { file: 'garlic-pepper.jpg', label: 'Garlic & Pepper' },
  { file: 'mixed-veg.jpg', label: 'Mixed Vegetables' },
];

export const LUNCH = {
  days: 'Monday – Friday',
  hours: '11:30 AM – 3:00 PM',
  fromPrice: '$11.99',
  /** Every plate listed on the GBP post / lunch menu (Pad See Ew has no photo yet). */
  plates: ['Pad Thai', 'Pad See Ew', 'Pad Kee Mao', 'Krapow', 'Garlic & Pepper', 'Cashew Nut', 'Mixed Vegetables', 'Yellow Curry', 'Panang Curry'],
  includes: 'a fresh salad and a crispy spring roll, plus a cup of soup when you dine in',
  /** Where "See the lunch menu" goes — the /lunch page (live since 2 Sep 2026). */
  menuPath: '/lunch',
} as const;
