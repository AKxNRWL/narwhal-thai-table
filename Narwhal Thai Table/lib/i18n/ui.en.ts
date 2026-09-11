/**
 * English page copy — the source of truth for every string the page
 * components render. The Vietnamese edition (ui.vi.ts) is a deep-partial of
 * this shape; anything it leaves out falls back to the English line below.
 *
 * Markup inside strings (rendered by lib/i18n/rich.tsx):
 *   *text*  → <em> (brass italic)    **text** → <strong>
 *   [label](/path) → link (internal paths are localised per page)
 *   {var}   → a value the component supplies (price, count, …)
 *
 * Server-only: never import this from a 'use client' component — pass the
 * slice a client component needs as a prop instead (see Hero, MenuSections).
 */
export const en = {
  meta: {
    home: {
      title: 'Narwhal Thai Table · Thai Restaurant in Huntington Beach, CA',
      description:
        'Family-run Thai restaurant in Huntington Beach — three siblings, thirty years of restaurant life, one table on Beach Boulevard. Royal-court Thai recipes cooked fresh for every plate. Open every day: Mon–Fri 11:30 AM–10 PM · Sat–Sun 12–10 PM.',
      ogTitle: 'Narwhal Thai Table · Huntington Beach',
      ogDescription: 'Three siblings, thirty years of restaurant life, one table on Beach Boulevard — royal-court Thai, cooked fresh for every plate.',
    },
    menu: {
      title: 'Menu',
      description: 'The full Narwhal Thai Table menu — thirteen categories of royal-court Thai dishes. Tap any plate for its story, ingredients, and how to eat it.',
      ogTitle: 'Menu · Narwhal Thai Table',
      ogDescription: 'Thirteen categories of royal-court Thai dishes, made by hand.',
    },
    dish: {
      /** {name} → dish name */
      title: '{name} — Thai in Huntington Beach',
      ogTitle: '{name} · Narwhal Thai Table',
      ogImageAlt: '{name} at Narwhal Thai Table, Huntington Beach',
      notFound: 'Dish not found',
    },
    lunch: {
      title: 'Thai Lunch Specials in Huntington Beach — Mon–Fri from $11.99 · Narwhal Thai Table',
      description:
        'Weekday Thai lunch specials on Beach Blvd: Pad Thai, Pad See Ew, Pad Kee Mao, Krapow, Garlic & Pepper, Cashew, Mixed Vegetables, or a Yellow or Panang curry from $11.99 — with a fresh salad and a crispy spring roll, plus a cup of soup when you dine in. Monday–Friday, 11:30 AM–3:00 PM.',
      ogTitle: 'Lunch Specials · Narwhal Thai Table',
      ogDescription: 'Mon–Fri 11:30–3 · from $11.99 · salad + spring roll with every lunch, soup when you dine in.',
    },
    about: {
      title: 'About Narwhal Thai Table — Three Siblings, One Table in Huntington Beach',
      description:
        'The story of Narwhal Thai Table: three siblings — Aileen, Annie and AK — who bought Huntington Beach’s Thai Gulf Restaurant in July 2026, renamed it, and cook Thai the way they grew up eating it. The facts, the timeline, and what to expect at the table.',
      ogTitle: 'Our Story · Narwhal Thai Table',
      ogImageAlt: 'A family-style spread at Narwhal Thai Table',
    },
    contact: {
      title: 'Contact',
      description: 'Reservations, catering and private events, hours, directions, and answers to common questions for Narwhal Thai Table in Huntington Beach.',
    },
    reservation: { title: 'Reservations', description: 'Request a table at Narwhal Thai Table, Huntington Beach.' },
    message: { title: 'Contact Us', description: 'Questions, suppliers, press — get in touch with Narwhal Thai Table.' },
    catering: { title: 'Catering & Private Events', description: 'Catering, buyouts and private events at Narwhal Thai Table.' },
  },

  /* ---------------- home ---------------- */
  hero: {
    eyebrow: 'Now Open · Every Day',
    featuredKicker: 'Signature · Poseidon',
    h1a: 'From Siam’s royal court',
    h1b: 'to Huntington Beach',
    noteLead: 'Sawasdee, Huntington Beach — welcome to our table.',
    note:
      'We’re Aileen, Annie and AK, three siblings who came to open a Thai restaurant on Beach Boulevard because cooking is the one art we never wanted to put down. Here, the art is on the plate — royal-court Thai recipes, made fresh for every order — and in everything around it: the string lights, the hum of the wok, the welcome at the door. And whoever you are, however you found us, you’re not a table number to us. You’re the reason the art exists.',
    signed: '— Aileen, Annie & AK',
    hours: 'Open every day — Mon–Fri 11:30 AM – 10 PM · Sat–Sun 12 – 10 PM. Walk in, order online, or save a seat.',
    order: 'Order Online',
    explore: 'Explore the Menu',
    reserve: 'Save a Seat',
    medallionName: 'Narwhal',
    medallionSub: 'Thai Table · Est. 2026',
    narwhalTap: 'Tap to see the narwhal jump',
    scroll: 'Scroll',
  },
  marquee: {
    eyebrow: 'From the kitchen',
    /** {count} → number of photographed plates */
    title: '{count} plates, *one wok at a time*.',
    lede: 'Every plate here travels with its papers — Over Rice, À La Carte, Curry, Noodles — so the dish you picture is the dish that arrives. Tap one for the story behind it.',
    spicy: 'Spicy',
    alt: '{name} — {course} at Narwhal Thai Table, Huntington Beach',
  },
  menuPreview: {
    eyebrow: 'What’s Cooking',
    title: 'Fresh isn’t a claim here. *It’s a schedule*.',
    lede: 'Nothing at this table is made ahead and nothing waits under a lamp — every plate begins when you ask for it. These are the plates we’d point you to first; the full menu, thirteen categories deep, has a page of its own.',
    signature: 'Signature',
    spicy: 'Spicy',
    readStory: 'Read the story',
    seeMenu: 'See the full menu',
  },
  bands: {
    siamEyebrow: 'Narwhal Thai Table',
    siamLine: 'Three siblings, thirty years of restaurant life, one table on Beach Boulevard.',
    patioEyebrow: '19072 Beach Blvd · Huntington Beach',
    patioLine: 'Open every day — Mon–Fri 11:30 AM – 10 PM · Sat–Sun 12 – 10 PM',
  },
  story: {
    eyebrow: 'Our Story',
    title: 'Some families build houses. *Ours builds tables*.',
    p1: 'We are three siblings — Aileen, Annie, and AK — with thirty years of restaurant life between us: opening rooms, running kitchens, learning what makes a stranger relax into a chair. Somewhere along the way, Huntington Beach won us over — the salt air, the long gold light down PCH, the way this town waves at itself on the walk to the pier.',
    p2: 'So we did what our family has always done with the places we love: we cooked for it. Narwhal Thai Table is the promise we’ve been keeping our whole working lives — Thai recipes rooted in the royal-court tradition, made fresh for every single plate, from ingredients we choose the slow, stubborn way. No shortcuts, no almost.',
    p3: 'If this address feels familiar, it should. For years it was Thai Gulf — a neighborhood standby. Our family bought the business, hung a new name on the door, and made it our own: our recipes, our mortar, our welcome. If you got here looking for Thai Gulf — welcome back. The table is still here.',
    readMore: 'Read the whole story →',
    closing: 'Because what we serve isn’t just dinner. It’s everything around it — the warmth, the welcome, the wanting you back.',
    stats: [
      { num: '3', label: 'Siblings, One Table' },
      { num: '30', label: 'Years of Restaurant Life' },
      { num: 'HB', label: 'Our Hometown' },
    ],
    artAlt: 'Gold line-art of a Thai royal-court banquet — tiered pedestal trays, lotus blossoms and candles under a palace gable',
    artCaption: 'Established MMXXVI · Huntington Beach',
  },
  lunchHome: {
    eyebrow: 'Weekday Lunch Specials',
    /** {price} → LUNCH.fromPrice */
    title: 'Thai lunch specials, *from {price}*',
    /** {includes} → LUNCH.includes */
    lede: 'Pick a plate — every lunch comes with {includes}.',
    includes: 'a fresh salad and a crispy spring roll, plus a cup of soup when you dine in',
    days: 'Monday – Friday',
    tile: 'Lunch Special · from {price}',
    alt: '{label} — weekday lunch special with salad and a spring roll at Narwhal Thai Table, Huntington Beach',
    platesLabel: 'Lunch Special plates',
    call: 'Call to order lunch',
    seeMenu: 'See the lunch menu',
  },
  experience: {
    eyebrow: 'The Experience',
    title: 'You come for dinner. *You leave with more*.',
    lede: 'Three things hold this house together. Thirty years of restaurant life taught them to us, and we’d rather stay small forever than compromise a single one.',
    artAlt: 'Gold line-art of a Thai wok mid-toss over an open flame — shrimp, holy basil and chilies caught in the air',
    artCaption: 'The wok isn’t lit until you order',
    pillars: [
      {
        numeral: 'I.',
        title: 'Fresh, Every Plate',
        body: 'The wok isn’t lit until your order reaches the kitchen. Vegetables go in raw and come out with a bite; herbs are cut the same hour you taste them. Nothing waits under a heat lamp — if it isn’t fresh, it doesn’t leave our kitchen.',
      },
      {
        numeral: 'II.',
        title: 'Chosen by Hand',
        body: 'Lemongrass, galangal, makrut lime, coriander root, bird’s-eye chilies — cut fresh, never from a jar. The dry spices are toasted and ground here, in small amounts, because ground spice loses its smell in weeks. Every curry paste in this kitchen starts as whole ingredients and a mortar. [How to spot a real Thai kitchen →](/thai-food-orange-county)',
      },
      {
        numeral: 'III.',
        title: 'From Our Family',
        body: 'Aileen, Annie, and AK — three siblings who grew up in dining rooms and never wanted to leave. We still believe the finest thing a restaurant can serve is the feeling of being expected.',
      },
    ],
  },
  room: {
    eyebrow: 'The Room',
    title: 'A little room with *a lot of heart*.',
    lede: 'String lights over the patio, orchids at the counter, a good glass of wine while the kitchen hums. Bring everyone — save room for the mango sticky rice, and we’ll happily squeeze in one more chair.',
    videoLabel: 'Inside Narwhal Thai Table — the dining room on opening night',
    storefrontAlt: 'The Narwhal Thai Table storefront at dusk, string lights glowing over the patio',
    spreadAlt: 'A family-style spread — tom yum seafood hot pot, crying tiger, orange chicken, morning glory and Thai iced tea',
  },
  contactHome: {
    eyebrow: 'Come See Us',
    title: 'Tell us you’re coming — *we’ll do the rest*.',
    cards: {
      reservation: { title: 'Reservations', go: 'Book a table', body: 'Ask for a table and consider it held — we confirm within a few hours.' },
      catering: { title: 'Catering & Events', go: 'Plan an event', body: 'Buyouts, family-style feasts, catering that travels well — your occasion, our table.' },
      message: { title: 'Say Hello', go: 'Send a message', body: 'Questions, ideas, a hello from down the street — every note reaches one of us three.' },
    },
    findEyebrow: 'Find us',
    findTitle: 'Visit the table',
    findHours: 'Open every day · Mon–Fri 11:30 AM – 10:00 PM · Sat–Sun 12:00 PM – 10:00 PM',
    mapTitle: 'Narwhal Thai Table on Google Maps — 19072 Beach Blvd, Huntington Beach',
    mapLink: 'Get directions',
  },

  /* ---------------- /menu ---------------- */
  menuPage: {
    eyebrow: 'The Menu',
    title: 'The full menu — *tap a plate to hear its story*.',
    intro: 'Thirteen categories, cooked to order from the first bite to the last sweet one. ★ marks the house signatures. Every plate carries its own story — the recipe’s history, how to eat it well, and what belongs beside it.',
    lunchPill: 'Mon–Fri · 11:30–3',
    lunchLine: 'Lunch specials from $11.99 — Pad Thai, curries, krapow & more, with salad and a spring roll',
    lunchGo: 'See lunch',
    jsonLdName: 'Narwhal Thai Table Menu',
    sidesDescription: 'Choose your protein (chicken, pork, tofu, beef, shrimp, seafood) and sides — jasmine rice, brown rice, sticky rice, fried egg, omelet.',
  },

  /* ---------------- /menu/[slug] ---------------- */
  dish: {
    back: 'Back to menu',
    photoSoon: 'Photo coming soon',
    signature: 'Signature',
    signatureTag: '★ Signature',
    spicy: 'Spicy',
    from: 'Where it comes *from*',
    howToEat: 'How to *eat it*',
    inTheBowl: 'What’s in *the bowl*',
    goesWith: 'What goes *with it*',
    toDrink: 'To drink',
    onTheSide: 'On the side',
    goodToKnow: 'Good to *know*',
    allergensIntro: 'Contains the following common allergens — please flag any sensitivities when you order and we’ll adjust:',
    allergen: {
      peanut: 'peanut',
      'tree-nut': 'tree nut',
      shellfish: 'shellfish',
      fish: 'fish',
      gluten: 'gluten',
      soy: 'soy',
      dairy: 'dairy',
      egg: 'egg',
      sesame: 'sesame',
    },
    chefNote: '— From our kitchen',
    noStory: 'We’re still writing the story for this plate — it’ll show up here soon. In the meantime, ask your server about the dish when you visit.',
    /** {category} → localised category label */
    more: 'More from *{category}*',
    guide: 'Not sure how to judge a plate like this? Read our field guide to the [best Thai food in Orange County](/thai-food-orange-county) — five signs of a real Thai kitchen, and what to order once you’re in one.',
    order: 'Order Online',
    reserve: 'Save a Seat',
    alt: '{name} — {description} Served at Narwhal Thai Table, Huntington Beach.',
    breadcrumbHome: 'Narwhal Thai Table',
    breadcrumbMenu: 'Menu',
    sidesSection: 'Sides & Protein',
    menuName: 'Narwhal Thai Table Menu',
  },

  /* ---------------- /lunch ---------------- */
  lunch: {
    eyebrow: 'Lunch Specials · Mon–Fri',
    title: 'Weekday lunch, *cooked to order* — from $11.99.',
    lede: 'Monday through Friday, 11:30 AM to 3:00 PM. Pick a plate below and it comes with a fresh salad and a crispy spring roll — plus a cup of soup when you dine in. Quick, cozy, and right on Beach Boulevard: the lunch break you actually look forward to.',
    hoursLine: 'Mon–Fri 11:30 AM – 3:00 PM · dine in or take it to go · ',
    trayLabel: 'What comes with every lunch special',
    tray: [
      '**Your plate.** Nine choices — wok noodles, a rice plate, stir-fried vegetables, or a curry — each one cooked when you order it, at the spice level you ask for.',
      '**Salad and a spring roll.** A fresh salad and a crispy spring roll come with every lunch, dine-in or to-go.',
      '**Soup, when you stay.** Dine in and a cup of soup is included — and if you have ten more minutes, the mango sticky rice is right there.',
    ],
    pickTitle: 'Pick your *plate*.',
    pickLede: 'Tap a plate to read its story. Weekday lunch specials start at $11.99 — ask us for the price of the plate you’re eyeing.',
    from: 'from',
    tag: 'Lunch special',
    spicy: 'Spicy',
    readStory: 'Read the story',
    alt: '{name} — weekday lunch special{withSides} at Narwhal Thai Table, Huntington Beach',
    altSides: ' with salad and a spring roll',
    goodTitle: 'Good to know at *lunch*',
    good: [
      '**Weekdays only.** Lunch specials run Monday–Friday until 3 PM. On weekends, and after 3 on weekdays, the [full menu](/menu) is served all day.',
      '**Taking it back to the office?** Call [(714) 378-6003](tel:+17143786003) and it’ll be ready when you pull up — there’s free parking in the plaza lot right outside. Everything on the regular menu can also be ordered online for [pickup]({order}).',
      '**Spice and swaps.** Every plate is cooked when you order it, so you set the heat — mild to Thai hot — and most of these plates can be made with tofu or vegetables instead of meat. Just tell us when you order, and always mention an allergy.',
      '**Coming from Fountain Valley or Westminster?** We’re at Beach Blvd & Garfield — about 8 minutes from central [Fountain Valley](/thai-food-fountain-valley) and 12 minutes straight down Beach from [Westminster](/thai-food-westminster).',
    ],
    call: 'Call in a lunch order',
    directions: 'Get directions',
    seeMenu: 'See the full menu',
    jsonLdName: 'Narwhal Thai Table Lunch Specials',
    jsonLdDescription: 'Weekday lunch specials, Monday–Friday 11:30 AM–3:00 PM, from $11.99. Every lunch comes with a fresh salad and a crispy spring roll, plus a cup of soup when you dine in.',
    jsonLdSection: 'Lunch Specials (Monday–Friday, 11:30 AM–3:00 PM)',
    jsonLdSectionDescription: 'Pick one plate. Served with a fresh salad and a crispy spring roll; a cup of soup is included when you dine in.',
    jsonLdItem: 'Lunch Special — {name}',
    breadcrumbHome: 'Home',
    breadcrumb: 'Lunch Specials',
  },

  /* ---------------- /about ---------------- */
  about: {
    eyebrow: 'Our Story',
    title: 'Three siblings. *One table.*',
    lede: 'We are Aileen, Annie and AK — a Thai family with thirty years of restaurant life between us, and one small dining room on Beach Boulevard where we cook the food we grew up eating.',
    spreadAlt: 'A family-style spread at Narwhal Thai Table in Huntington Beach — tom yum seafood hot pot, crying tiger, orange chicken, morning glory and Thai iced tea',
    storefrontAlt: 'The Narwhal Thai Table storefront on Beach Blvd at dusk, string lights over the patio',
    h2Origin: 'How this table *came to be*',
    origin1: 'For years, the corner of Beach Boulevard and Garfield had a neighborhood Thai restaurant called Thai Gulf. In July 2026 our family bought the business, hung a new name on the door, and started cooking the way our own family does: curry pastes pounded from whole chilies, garlic, lemongrass and galangal in a granite mortar; dry spices toasted and ground here in small batches; every plate started only when someone has ordered it.',
    origin2: 'We opened the doors softly on Sunday, August 9, 2026, and have been open every day since. If you came here looking for Thai Gulf — welcome back. Same address, same warm little room, new name, new habits. The table is still here.',
    h2Values: 'What we *stand on*',
    values: [
      '**Fresh, every plate.** The wok isn’t lit until your order reaches the kitchen. Nothing waits under a heat lamp.',
      '**Made by hand.** Lemongrass, galangal, makrut lime, coriander root and bird’s-eye chilies, cut fresh; curry pastes that start whole in a mortar.',
      '**Cooked for you.** You set the heat, from mild to Thai hot. Many dishes can be made vegetarian. Tell us about allergies and we’ll steer you honestly.',
      '**From our family.** Every message to [{email}](mailto:{email}) reaches one of us three, and when you leave a review, a sibling answers it — not a service.',
    ],
    h2Order: 'What to *order*',
    order:
      'Start with the [Narwhal Chicken Wings](/menu/narwhal-chicken-wings), then share a curry and a wok plate: [Panang Curry](/menu/panang-curry) and [OG Pad Thai](/menu/og-pad-thai) are the ones people ask about most. Seafood lovers order the [Super Crab Fried Rice](/menu/crab-fried-rice) or a [whole fried pompano](/menu/fried-whole-pompano) for the table. If you miss home, head for the Isaan corner — [som tum](/menu/som-tum-thai), [larb](/menu/larb), [crying tiger](/menu/crying-tiger) — or a bowl of [boat noodles](/menu/thai-boat-noodles). Weekdays until 3, the [lunch specials](/lunch) start at $11.99. And if you want to know how we judge any Thai kitchen, ours included, we wrote a field guide to the [best Thai food in Orange County](/thai-food-orange-county).',
    factsTitle: 'The short version, *for the record*',
    facts: [
      { k: 'Name', v: 'Narwhal Thai Table (people also say “Narwhal Thai” or “Narwhal HB”)' },
      { k: 'Formerly', v: 'Thai Gulf Restaurant — same address; our family bought the business and renamed it in July 2026' },
      { k: 'Owned by', v: 'Three siblings — Aileen, Annie and AK — under Narwhal Hospitality LLC' },
      { k: 'Opened', v: 'Soft opening Sunday, August 9, 2026 · open every day since · grand opening to come' },
      { k: 'Where', v: '[{street}, Huntington Beach, CA 92648]({directions}) — Beach Blvd at Garfield Ave, free parking in the plaza lot' },
      { k: 'Hours', v: 'Open every day · Mon–Fri 11:30 AM–10 PM · Sat–Sun 12–10 PM · [lunch specials](/lunch) Mon–Fri 11:30–3' },
      { k: 'What we cook', v: 'Thai food the way we grew up eating it — curry pastes pounded in a granite mortar, wok noodles and fried rice made to order, whole fried fish, an Isaan corner of som tum, larb and crying tiger. [{count} dishes across 13 categories](/menu).' },
      { k: 'Price', v: 'Most plates $12–20, seafood plates up to $35 · [lunch specials](/lunch) from $11.99' },
      { k: 'The room', v: 'A small dining room and a dog-friendly patio under string lights · a short wine list by the glass · mango sticky rice for the table' },
      { k: 'Ways to eat', v: 'Dine in · [reservations](/contact/reservation) · [pickup and delivery](/order) · [catering and private events](/contact/catering)' },
      { k: 'Payment', v: 'Credit and debit cards, Apple Pay and Google Pay (and cash)' },
      { k: 'Languages', v: 'English and Thai' },
      { k: 'Reach us', v: '[(714) 378-6003](tel:+17143786003) · [{email}](mailto:{email}) · [press kit](/press)' },
    ],
    timelineTitle: 'Timeline',
    timeline: [
      '**Before 2026 —** Thai Gulf Restaurant serves the neighborhood at 19072 Beach Blvd.',
      '**July 2026 —** Our family buys the business and renames it Narwhal Thai Table. New recipes, new kitchen habits, same address.',
      '**Sunday, August 9, 2026 —** Soft opening. Open every day since.',
      '**Late August 2026 —** Weekday [lunch specials](/lunch) begin, Monday–Friday from $11.99.',
      '**Coming up —** The grand opening, with the chef’s introduction. Follow [@narwhalthaitablehb](https://www.instagram.com/narwhalthaitablehb/) so you don’t miss it.',
    ],
    seeMenu: 'See the menu',
    reserve: 'Save a seat',
    directions: 'Get directions',
    breadcrumbHome: 'Home',
    breadcrumb: 'About',
    slogan: 'Come as a neighbor, leave as family.',
    coOwner: 'Co-owner',
  },

  /* ---------------- /contact ---------------- */
  contact: {
    eyebrow: 'Come See Us',
    title: 'How can we *help?*',
    cards: {
      reservation: { title: 'Reservations', go: 'Book a table', body: 'Request a table — we’ll confirm within a few hours.' },
      catering: { title: 'Catering & Events', go: 'Plan an event', body: 'Buyouts, family-style tastings, off-site catering.' },
      message: { title: 'Say Hello', go: 'Send a message', body: 'Questions, suppliers, press — we’ll get back to you.' },
    },
    findEyebrow: 'Find us',
    findTitle: 'Visit the table',
    findHours: 'Open every day · Mon–Fri 11:30 AM – 10:00 PM · Sat–Sun 12:00 PM – 10:00 PM',
    faqEyebrow: 'Good to Know',
    faqTitle: 'Questions we hear *a lot*',
    faqs: [
      {
        q: 'Are you the same restaurant as Thai Gulf?',
        a: 'In a way — we bought Thai Gulf, then rebuilt it as our own. Same address on Beach Boulevard, new name, new habits: three siblings in the kitchen, curry pastes started in a granite mortar, every plate cooked when you order it. If you got here looking for Thai Gulf — welcome back. The table is still here. [Read the whole story](/about).',
      },
      {
        q: 'Do you take reservations?',
        a: 'Yes — [request a table](/contact/reservation) and we’ll confirm within a few hours, or call [(714) 378-6003](tel:+17143786003). Walk-ins are always welcome too.',
      },
      {
        q: 'Do you do takeout and delivery?',
        a: 'Both. Order pickup online and it’s ready hot on Beach Blvd, or get delivery through DoorDash — everything is on the [order page](/order).',
      },
      {
        q: 'What are your hours?',
        a: 'Open every day: Mon–Fri 11:30 AM–10 PM · Sat–Sun 12–10 PM. Weekday [lunch specials](/lunch) run Mon–Fri 11:30 AM–3 PM.',
      },
      {
        q: 'Do you have lunch specials?',
        a: 'Yes — Monday through Friday, 11:30 AM to 3 PM, [lunch specials](/lunch) start at $11.99: Pad Thai, Pad See Ew, Pad Kee Mao, Krapow, Garlic & Pepper, Cashew, Mixed Vegetables, or a Yellow or Panang curry. Every lunch comes with a fresh salad and a crispy spring roll, plus a cup of soup when you dine in. Call [(714) 378-6003](tel:+17143786003) ahead for pickup.',
      },
      {
        q: 'How spicy is the food?',
        a: 'As spicy as you ask. Every dish is cooked to order, so you set the heat — mild, medium, spicy, or Thai hot. Not sure? Start medium. We’d rather you come back tomorrow than sweat through tonight.',
      },
      {
        q: 'Can you cook vegetarian? What about allergies?',
        a: 'Many dishes can be made vegetarian — just ask. Eating gluten-free? Tell us when you order and we’ll point you to the rice-based plates that can be cooked without soy sauce or wheat that day. And always tell us about an allergy when you order: we cook each plate fresh, but our kitchen works with peanuts, shellfish, egg, soy, and wheat every day, so we can’t promise zero cross-contact.',
      },
      {
        q: 'What should we order first?',
        a: 'The plates people ask about most: [Super Crab Fried Rice](/menu/crab-fried-rice), [Narwhal Chicken Wings](/menu/narwhal-chicken-wings), [OG Pad Thai](/menu/og-pad-thai), [Panang Curry](/menu/panang-curry) and the [Fried Whole Pompano](/menu/fried-whole-pompano) for the table. Order a curry and a wok dish to share, and save room for dessert.',
      },
      {
        q: 'What should we order for dessert?',
        a: '[Mango Sticky Rice](/menu/mango-sticky-rice) is the one we’d send you home with — warm coconut sticky rice, ripe mango, a whisper of salt. The [Coconut Ice Cream & Bread](/menu/coconut-ice-cream-bread) is the Bangkok street classic, and the [Narwhal Sundae](/menu/narwhal-sundae) is built for sharing.',
      },
      {
        q: 'Where exactly are you?',
        a: '19072 Beach Blvd, Suite A & B, Huntington Beach — in the plaza on Beach Boulevard at Garfield Avenue. [Get directions]({directions}).',
      },
      {
        q: 'Is there parking?',
        a: 'Yes, and it’s free — park in the plaza lot right in front of the restaurant. If the lot is busy, there’s free street parking nearby too. Coming from [Fountain Valley](/thai-food-fountain-valley) or [Westminster](/thai-food-westminster)? We’re about 8 and 12 minutes away.',
      },
      {
        q: 'Do you cater events?',
        a: 'We do — off-site catering, family-style tastings, and full buyouts. [Tell us about your event](/contact/catering).',
      },
    ],
  },
  contactSub: {
    back: 'Contact',
    reservation: {
      h1: 'Reserve a table at Narwhal Thai Table, Huntington Beach',
      title: 'Reservations',
      sent: 'Your reservation request is sent straight to ',
    },
    message: {
      h1: 'Contact Narwhal Thai Table, Huntington Beach',
      title: 'Contact Us',
      sent: 'Your message is sent straight to ',
    },
    catering: {
      h1: 'Thai catering & private events in Huntington Beach',
      title: 'Catering & Private Events',
      sent: 'Your catering enquiry is sent straight to ',
    },
  },

  /* ---------------- 404 (dish) ---------------- */
  notFound: {
    back: 'Back to menu',
    title: 'That plate isn’t on *this table*.',
    body: 'Maybe the link is old, or we’ve renamed the dish. Take a look at the full menu — our kitchen probably has something even better for you.',
    cta: 'See the full menu',
  },
};

export type UiDict = typeof en;
