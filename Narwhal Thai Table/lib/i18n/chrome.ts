import type { CategoryId } from '@/lib/categories';
import { CHROME_LOCALES } from './chrome.locales';
import { deepMerge } from './merge';
import type { Locale } from './locales';

/**
 * Client-safe strings for the site chrome — nav, footer, mobile bar, the
 * language switcher and the interactive menu list. These components live in
 * the root layout (no page to hand them a locale) or run on the client, so
 * they read the locale from the pathname and pick their strings here.
 *
 * Kept deliberately small: this file ships in the client bundle. Page copy
 * lives in ui.en.ts / ui.vi.ts and is only ever read on the server.
 *
 * The translated editions live in chrome.locales.ts (vi · th · zh · ko · ja)
 * and are merged over `en` at load, so a missing key shows English.
 * Dish names stay in English + Thai everywhere.
 */
const en = {
  nav: {
    skip: 'Skip to content',
    home: 'Narwhal Thai Table home',
    story: 'Our Story',
    chef: 'The Chef',
    menu: 'Menu',
    lunch: 'Lunch',
    experience: 'Experience',
    play: 'Play',
    contact: 'Contact',
    order: 'Order Online',
    /** the drawer has room for the long form */
    orderDrawer: 'Order Online',
    reserve: 'Save a Seat',
    open: 'Open menu',
    close: 'Close menu',
    primary: 'Primary',
    mobile: 'Mobile',
    address: '19072 Beach Blvd · Huntington Beach',
  },
  locale: {
    switch: 'Language',
    /** the "this page exists in your language" pill — always shown in the language it offers */
    suggest: 'This page is available in English.',
    suggestCta: 'Read in English',
    suggestDismiss: 'Close',
  },
  footer: {
    brandLine: 'Three siblings, thirty years of restaurant life, one table on Beach Boulevard — royal-court Thai, cooked fresh for every plate.',
    order: 'Order Online',
    reserve: 'Save a Seat',
    visit: 'Visit',
    hours: 'Hours',
    explore: 'Explore',
    directions: 'Get directions →',
    weekdays: 'Mon – Fri',
    weekend: 'Sat – Sun',
    lunch: 'Lunch',
    weekdayHours: '11:30 AM – 10:00 PM',
    weekendHours: '12:00 – 10:00 PM',
    lunchHours: 'Mon – Fri 11:30 – 3',
    siteMap: 'Site map',
    social: 'Social',
    on: 'Narwhal Thai Table on {label}',
    copyright: '© 2026 Narwhal Hospitality LLC · Huntington Beach, CA',
    links: {
      menu: 'Full menu',
      lunch: 'Lunch specials',
      order: 'Order online',
      reservation: 'Reservations',
      catering: 'Catering & events',
      about: 'Our story',
      guide: 'Thai food guide',
      press: 'Press',
      play: 'Bubble Glide',
      littleSaigon: 'Thai food near Little Saigon',
    },
  },
  mobileBar: {
    label: 'Quick actions',
    order: 'Order',
    directions: 'Directions',
    reserve: 'Reserve',
  },
  categories: {
    appetizers: 'Appetizers',
    salad: 'Salads',
    grill: 'BBQ',
    soup: 'Soup',
    curry: 'Curry',
    rice: 'Rice',
    overrice: 'Over Rice',
    noodles: 'Noodles',
    alacarte: 'À La Carte',
    seafood: 'Poseidon',
    dessert: 'Dessert',
    drinks: 'Drinks',
    sides: 'Sides & Protein',
  } satisfies Record<CategoryId, string>,
  /** the dish 404 (also in ui.en.ts for the server-rendered English page) */
  notFound: {
    back: 'Back to menu',
    title: 'That plate isn’t on *this table*.',
    body: 'Maybe the link is old, or we’ve renamed the dish. Take a look at the full menu — our kitchen probably has something even better for you.',
    cta: 'See the full menu',
  },
  menuList: {
    jump: 'Jump to a course',
    dish: 'dish',
    dishes: 'dishes',
    proteinsSides: 'Proteins & sides',
    signature: 'Signature',
    spicy: 'Spicy',
    protein: 'Choice of Protein',
    readStory: 'Read the story',
    alt: '{name} — Thai {category} at Narwhal Thai Table, Huntington Beach',
    footnote:
      '★ are the house signature creations. Dishes marked “Choice of Protein” are priced before protein — pick yours under Sides & Protein (from +$2). Tell us about your allergies or spice level when you order — we’ll cook it just for you.',
    chooseProtein: '— Choose Your Protein',
    onTheSide: '— On the Side',
    proteins: {
      chicken: 'Chicken',
      chickenShrimp: 'Chicken & Shrimp (2 pc)',
      pork: 'Pork',
      friedTofu: 'Fried Tofu',
      softTofu: 'Soft Tofu',
      groundPork: 'Ground Pork',
      groundChicken: 'Ground Chicken',
      groundBeef: 'Ground Beef',
      beef: 'Beef',
      shrimp: 'Shrimp',
      combo: 'Combination — Chicken, Pork & Beef',
      seafood: 'Seafood',
    },
    sides: {
      jasmine: 'Jasmine Rice',
      brown: 'Brown Rice',
      sticky: 'Sticky Rice',
      friedEgg: 'Fried Egg',
      omelet: 'Omelet',
      omeletNote: '— add ground pork or chicken +$2, ground shrimp +$3',
    },
  },
};

export type ChromeDict = typeof en;

const DICTS: Record<Locale, ChromeDict> = {
  en,
  vi: deepMerge(en, CHROME_LOCALES.vi),
  th: deepMerge(en, CHROME_LOCALES.th),
  zh: deepMerge(en, CHROME_LOCALES.zh),
  ko: deepMerge(en, CHROME_LOCALES.ko),
  ja: deepMerge(en, CHROME_LOCALES.ja),
  es: deepMerge(en, CHROME_LOCALES.es),
  'zh-tw': deepMerge(en, CHROME_LOCALES['zh-tw']),
};

export function chrome(locale: Locale): ChromeDict {
  return DICTS[locale] ?? en;
}

export function categoryLabel(locale: Locale, id: CategoryId): string {
  return chrome(locale).categories[id] ?? en.categories[id] ?? id;
}
