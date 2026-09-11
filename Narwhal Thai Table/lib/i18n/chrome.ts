import type { CategoryId } from '@/lib/categories';
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
 * Vietnamese: Southern (Sài Gòn) register — "dĩa", "heo", "ba"/"má" — the
 * way Little Saigon speaks. Dish names stay in English + Thai everywhere.
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
    en: 'English',
    vi: 'Tiếng Việt',
    /** the "this page exists in Vietnamese" bar shown on English pages */
    suggest: 'Trang này có bản tiếng Việt.',
    suggestCta: 'Xem tiếng Việt',
    suggestDismiss: 'Đóng',
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

const vi: ChromeDict = {
  nav: {
    skip: 'Đến nội dung chính',
    home: 'Trang chủ Narwhal Thai Table',
    story: 'Câu chuyện',
    chef: 'Đầu bếp',
    menu: 'Thực đơn',
    lunch: 'Bữa trưa',
    experience: 'Trải nghiệm',
    play: 'Trò chơi',
    contact: 'Liên hệ',
    order: 'Đặt món',
    orderDrawer: 'Đặt món online',
    reserve: 'Đặt bàn',
    open: 'Mở menu',
    close: 'Đóng menu',
    primary: 'Chính',
    mobile: 'Di động',
    address: '19072 Beach Blvd · Huntington Beach',
  },
  locale: {
    switch: 'Ngôn ngữ',
    en: 'English',
    vi: 'Tiếng Việt',
    suggest: 'Trang này có bản tiếng Việt.',
    suggestCta: 'Xem tiếng Việt',
    suggestDismiss: 'Đóng',
  },
  footer: {
    brandLine: 'Ba anh chị em, ba mươi năm trong nghề nhà hàng, một bàn ăn trên đường Beach — món Thái cung đình, nấu tươi cho từng dĩa.',
    order: 'Đặt món online',
    reserve: 'Đặt bàn',
    visit: 'Địa chỉ',
    hours: 'Giờ mở cửa',
    explore: 'Khám phá',
    directions: 'Chỉ đường →',
    weekdays: 'Thứ Hai – Thứ Sáu',
    weekend: 'Thứ Bảy – Chủ Nhật',
    lunch: 'Bữa trưa',
    weekdayHours: '11:30 AM – 10:00 PM',
    weekendHours: '12:00 – 10:00 PM',
    lunchHours: 'Thứ Hai – Thứ Sáu, 11:30 – 3:00 PM',
    siteMap: 'Sơ đồ trang',
    social: 'Mạng xã hội',
    on: 'Narwhal Thai Table trên {label}',
    copyright: '© 2026 Narwhal Hospitality LLC · Huntington Beach, CA',
    links: {
      menu: 'Thực đơn đầy đủ',
      lunch: 'Món trưa đặc biệt',
      order: 'Đặt món online',
      reservation: 'Đặt bàn',
      catering: 'Đặt tiệc & sự kiện',
      about: 'Câu chuyện của chúng tôi',
      guide: 'Cẩm nang món Thái (English)',
      press: 'Báo chí',
      play: 'Bubble Glide',
      littleSaigon: 'Món Thái gần Little Saigon',
    },
  },
  mobileBar: {
    label: 'Thao tác nhanh',
    order: 'Đặt món',
    directions: 'Chỉ đường',
    reserve: 'Đặt bàn',
  },
  categories: {
    appetizers: 'Khai vị',
    salad: 'Gỏi & salad',
    grill: 'Đồ nướng',
    soup: 'Súp',
    curry: 'Cà ri',
    rice: 'Cơm chiên',
    overrice: 'Cơm dĩa',
    noodles: 'Mì & hủ tiếu',
    alacarte: 'Món xào',
    seafood: 'Poseidon · Hải sản',
    dessert: 'Tráng miệng',
    drinks: 'Thức uống',
    sides: 'Món kèm & chọn thịt',
  },
  menuList: {
    jump: 'Đi tới một phần thực đơn',
    dish: 'món',
    dishes: 'món',
    proteinsSides: 'Chọn thịt & món kèm',
    signature: 'Đặc trưng',
    spicy: 'Cay',
    protein: 'Chọn thịt',
    readStory: 'Đọc câu chuyện',
    alt: '{name} — món {category} kiểu Thái tại Narwhal Thai Table, Huntington Beach',
    footnote:
      '★ là những món đặc trưng của quán. Món ghi “Chọn thịt” là giá chưa gồm thịt — bạn chọn ở mục Món kèm & chọn thịt (từ +$2). Khi gọi món, cứ cho chúng tôi biết bạn dị ứng gì hay muốn cay cỡ nào — bếp sẽ nấu riêng cho bạn.',
    chooseProtein: '— Chọn thịt',
    onTheSide: '— Món kèm',
    proteins: {
      chicken: 'Gà',
      chickenShrimp: 'Gà & tôm (2 con)',
      pork: 'Heo',
      friedTofu: 'Đậu hũ chiên',
      softTofu: 'Đậu hũ non',
      groundPork: 'Heo bằm',
      groundChicken: 'Gà bằm',
      groundBeef: 'Bò bằm',
      beef: 'Bò',
      shrimp: 'Tôm',
      combo: 'Thập cẩm — gà, heo & bò',
      seafood: 'Hải sản',
    },
    sides: {
      jasmine: 'Cơm trắng (gạo thơm)',
      brown: 'Cơm gạo lứt',
      sticky: 'Cơm nếp (xôi)',
      friedEgg: 'Trứng ốp la',
      omelet: 'Trứng chiên kiểu Thái',
      omeletNote: '— thêm heo bằm hoặc gà bằm +$2, tôm bằm +$3',
    },
  },
};

const DICTS: Record<Locale, ChromeDict> = { en, vi };

export function chrome(locale: Locale): ChromeDict {
  return DICTS[locale] ?? en;
}

export function categoryLabel(locale: Locale, id: CategoryId): string {
  return chrome(locale).categories[id] ?? en.categories[id] ?? id;
}
