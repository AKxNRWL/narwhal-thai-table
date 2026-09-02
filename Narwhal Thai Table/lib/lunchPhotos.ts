/**
 * Lunch Special plate photos — public/images/lunch/<file>.
 * Shot 22 Aug 2026 (originals: D:\projects\Narwhal pic\Food\LS-*.jpg, portrait
 * 896×1200 on white); cropped here to 4:3 centred on the plate so they fill the
 * promo card's photo area without cutting the food.
 *
 * Used by the promo photo library in /stats ("＋ Lunch Specials ทั้งหมด") and
 * free for /lunch or the menu to reuse. Browser-safe: constants only.
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
