import type { CategoryId } from './categories';

export type Allergen =
  | 'peanut' | 'tree-nut' | 'shellfish' | 'fish'
  | 'gluten' | 'soy' | 'dairy' | 'egg' | 'sesame';

export type Pairing = {
  drink?: string;
  sides?: string[];
};

export type DishStory = {
  /** Short one-paragraph "lede" shown right under the title */
  lede: string;
  /** Where the dish comes from — region, tradition, family memory */
  history?: string;
  /** How Chef Rainny wants the diner to experience it */
  howToEat?: string;
  /** Chef Rainny's voice — first-person quote */
  chefNote?: string;
};

export type Dish = {
  slug: string;
  name: string;
  thai: string;
  category: CategoryId;
  signature?: boolean;
  spicy?: boolean;
  /** Short menu blurb (≤120 chars) — shown on the menu list */
  description: string;
  /** Indicative price; "MKT" when seasonal/market */
  price?: string;
  /** Variants e.g. "Som Tum Thai (dried shrimp)" */
  variants?: string[];
  /** Key ingredients shown on the detail page */
  ingredients?: string[];
  allergens?: Allergen[];
  pairing?: Pairing;
  story?: DishStory;
  /** Requires choosing a protein — priced separately under Sides & Protein. */
  protein?: boolean;
  /** Future: real photography. When set, the dish detail page renders an image. */
  image?: { src: string; alt: string };
};

/* ============================================================
   ALL DISHES — ported from the original menu.
   Every dish carries a story (lede + researched history; house
   originals carry the Narwhal story). The 3 signatures (Pad Thai,
   Tom Kha, Crying Tiger) additionally keep howToEat + chefNote.
   ============================================================ */

/* ============================================================
   SOFT OPENING MENU — July 2026. Prices are final soft-opening
   prices. protein: true = guest picks a protein (priced from +$2
   under Sides & Protein).
   ============================================================ */

export const DISHES: Dish[] = [
  { slug: 'narwhal-chicken-wings', name: 'Narwhal Chicken Wings', thai: 'ปีกไก่ทอดนาร์วาล', category: 'appetizers', signature: true,
    description: "Shatter-crisp wings tossed hot in our Thai house seasoning — garlicky, peppery, juicy to the bone.", price: '$15',
    story: {
      lede: "The first dish this kitchen ever cooked — and the one we will never take off the menu.",
      history: "Every Narwhal recipe starts as a family-meal experiment, and this one never survived the staff table. Through our build-out summer, our chef kept tossing test batches in the dry Thai seasoning she blends by hand — golden garlic, white pepper, a whisper of coriander root — until the crew started arriving early just to claim a plate. By the time the soft-opening menu was printed, the wings had named themselves after the house.",
    }  },
  { slug: 'chicken-wings', name: 'Chicken Wings', thai: 'ปีกไก่ทอด', category: 'appetizers',
    description: "The classic — golden, crackling skin, steaming-juicy inside.", price: '$14',
    story: {
      lede: "Proof that a perfect wing needs no costume — just heat, salt and patience.",
      history: "Fried chicken is one of Thailand's great street romances: gai tod stands perfume every market in the country, each vendor guarding a batter mix and a fry time like a family heirloom. Ours keeps that faith — a light dredge and a hard fry, so the skin crackles while the meat stays steaming-juicy. No sauce required. That is the point.",
    }  },
  { slug: 'thai-fish-cake', name: 'Fish Cakes (6 pc)', thai: 'ทอดมันปลา', category: 'appetizers',
    description: "Bouncy-tender fish cakes fried deep bronze — cool cucumber-chili relish & crushed peanuts for crunch.", price: '$14',
    story: {
      lede: "A market-day classic from Thailand's river country — springy, herb-flecked, fried to deep bronze.",
      history: "Tod mun pla comes from the Central Plains, where rivers and canals once gave every town more fish than it could eat. Cooks pounded the catch with red curry paste, slivered kaffir lime leaf and snappy green beans, then fried spoonfuls until the edges blistered. That springy bounce is the prized mark of a patient cook. The cool cucumber-peanut relish, ajat, is its lifelong partner: one bite hot, one bite cold.",
    }  },
  { slug: 'crispy-spring-rolls', name: 'Pork Spring Rolls', thai: 'ปอเปี๊ยะหมู', category: 'appetizers',
    description: "Hand-rolled shells that crackle, giving way to a savory heart of ground pork & vegetables.", price: '$12',
    story: {
      lede: "A crackling parcel with a passport — born in China's Fujian province, perfected in Thai kitchens.",
      history: "Spring rolls reached Siam with Hokkien and Teochew immigrants, whose soft popiah crepes once marked the arrival of spring. Thai cooks did what Thai cooks do: they turned up the heat. Fried hard, the wrapper shatters over a savory heart of ground pork, glass noodles and vegetables. Po pia tod is now as Thai as anything on this menu — the sound of the first bite is the same in Bangkok as it is here.",
    }  },
  { slug: 'vegetable-spring-rolls', name: 'Vegetable Spring Rolls', thai: 'ปอเปี๊ยะผัก', category: 'appetizers',
    description: "The garden version — same crackling shell, sweet stir-fried vegetables inside.", price: '$10',
    story: {
      lede: "The garden version of a street legend — same shattering shell, sweet vegetables inside.",
      history: "Thailand keeps meat-free days — temple mornings, merit-making, the great vegetarian festival each autumn — and the spring roll adapted generations ago. Cabbage, carrot and glass noodles cook down sweet inside the wrapper, so the roll needs nothing but its own crunch and a bright dipping sauce. Some order it out of principle; most reorder it out of love.",
    }  },
  { slug: 'calamari', name: 'Calamari', thai: 'ปลาหมึกทอด', category: 'appetizers',
    description: "Tender rings in a light golden crust — fried hot, gone fast.", price: '$15',
    story: {
      lede: "The Mediterranean's favorite snack meets a Thai fryer — tender rings, light gold crust, zero chew.",
      history: "Fried squid circles the globe, from calamari fritti on Italian coasts to pla muek tod in Bangkok's night markets, where squid hits the fryer within sight of the boats that caught it. Our version splits the difference: a thin seasoned crust in the Mediterranean style, fried hot and fast the street-stall way so the rings stay tender. A beach town felt like the right home for it.",
    }  },
  { slug: 'shrimp-tempura', name: 'Shrimp Tempura', thai: 'กุ้งเทมปุระ', category: 'appetizers',
    description: "Whisper-light, lacy batter over sweet snappy shrimp — pale gold and crisp.", price: '$15',
    story: {
      lede: "A whisper-light batter with a 400-year passport — Portugal taught it, Japan perfected it, Thailand embraced it.",
      history: "Tempura began with Portuguese traders and missionaries in 16th-century Nagasaki, who fried seafood during the fasting days they called quattuor tempora. Japanese cooks refined the technique into lace — ice-cold batter, barely mixed, flash-fried so it shatters rather than crunches. Thai kitchens, forever in love with a good fryer, adopted it long ago. Sweet, snappy shrimp; batter like frost.",
    }  },
  { slug: 'fresh-spring-rolls', name: 'Fresh Spring Rolls', thai: 'ปอเปี๊ยะสด', category: 'appetizers',
    description: "Cool rice-paper rolls of crisp lettuce, cucumber, mint & carrot — creamy peanut sauce for dipping.", price: '$12',
    story: {
      lede: "The cool customer — no fryer, no crunch, just a fresh bundle eaten like a secret.",
      history: "Fresh rolls are Southeast Asia's answer to a salad you can hold: rice paper stretched around glass noodles, herbs and cool vegetables. They flow from the same popiah tradition that produced the fried roll — the fresh version simply refuses the oil. Ours bundles ground chicken and tofu with crisp lettuce, cucumber, carrot and basil: the calm, cold counterpoint to a spicy table.",
    }  },
  { slug: 'house-salad', name: 'House Salad', thai: 'สลัดผักสด', category: 'salad',
    description: "Crisp greens, cool cucumber & tomato, chewy-sweet dried cranberries, bright Thai dressing.", price: '$14',
    story: {
      lede: "Familiar greens, unmistakably Thai dressing — our quiet bridge between two food cultures.",
      history: "Every Thai restaurant abroad eventually invents its own house salad; this one is ours. The greens are pure California, the dressing pure Thailand — savory depth, lime brightness, just enough sweetness to hold hands with the chewy dried cranberries. It is the plate we hand to the friend who claims they don't do Thai food. By the last bite, they do.",
    }  },
  { slug: 'rib-eye-salad', name: 'Rib-Eye Salad', thai: 'สลัดเนื้อย่าง', category: 'salad',
    description: "Char-grilled rib-eye sliced warm over cool greens, radish, green onion & mint — a tangy, fragrant Thai-herb dressing.", price: '$18',
    story: {
      lede: "Thailand doesn't really do quiet salads — this one arrives with char-grilled rib-eye and a dressing that bites back.",
      history: "Yam means to toss or mix, and the yam family is Thailand's answer to the salad course: the dressing — lime, fish sauce, chili, a breath of sugar — matters more than any leaf. Yam nuea yang, the grilled-beef yam, is what Thai cooks crave when a salad needs to eat like a meal. We slice rib-eye warm off the grill over cool greens, radish, green onion and mint, so every forkful runs hot and cold at once.",
    }  },
  { slug: 'som-tum-thai', name: 'Som Tum Thai', thai: 'ส้มตำไทย กุ้งแห้ง', category: 'salad', spicy: true,
    description: "Crisp green papaya pounded to order with dried shrimp — sour, sweet & spicy in one bright crunch.", price: '$12',
    story: {
      lede: "Pounded to order in the mortar, as it has been since papayas first reached Siam — sour, sweet, salty and hot in one bright crunch.",
      history: "The papaya is not native to Thailand: Iberian traders carried it from the Americas in the 1600s, and by 1693 it was growing across Siam. Lao and Isaan cooks folded the crisp green fruit into their far older pounded-salad tradition, and tam mak hoong was born. It conquered Bangkok only in the mid-1900s, arriving with Isaan workers and sold outside boxing stadiums before sweeping the country. Som tum Thai is the capital's cut — dried shrimp, peanuts, a touch sweeter, the fire intact.",
    }  },
  { slug: 'som-tum-black-crab', name: 'Som Tum · Black Crab', thai: 'ส้มตำไทย ปูเค็ม', category: 'salad', spicy: true,
    description: "The deeper cut — salted black crab adds a briny, savory punch.", price: '$14',
    story: {
      lede: "The deeper, older cut of som tum — salted black crab, the way the northeast actually eats it.",
      history: "Before som tum moved to the city and got polite, it was pounded with salted rice-paddy crab — funkier, saltier, closer to the Lao original. The brined crab releases a savory depth the dried-shrimp version cannot reach; it is the difference between a postcard of Isaan and a visit. Order sticky rice alongside and eat it the northeastern way: slowly, and with respect.",
    }  },
  { slug: 'som-tum-fresh-shrimp', name: 'Som Tum · Fresh Shrimp', thai: 'ส้มตำไทย กุ้งสด', category: 'salad', spicy: true,
    description: "Sweet poached shrimp over that same bright, fiery crunch.", price: '$14',
    story: {
      lede: "The gentlest door into the som tum family — sweet poached shrimp over the same bright fire.",
      history: "Som tum has always been a dish of what's on hand: paddy crab in the northeast, dried shrimp in Bangkok, fresh seafood wherever the coast comes close. Ours leans coastal — plump poached shrimp over papaya pounded with tomato, green bean, lime and chili, the shrimp's sweetness cooling the chili's temper just enough. Newcomers, start here. Veterans, you already know.",
    }  },
  { slug: 'larb', name: 'Larb', thai: 'ลาบไก่ หมู เนื้อ', category: 'salad', spicy: true,
    description: "Warm minced meat, red onion & chili flakes in a hot-sour dressing, toasted-rice powder for smoky crunch.", price: '$14',
    story: {
      lede: "Isaan's good-luck dish — 'larb' echoes the Thai word for fortune, and no northeastern celebration happens without it.",
      history: "Larb came down the Mekong from Laos into Isaan and became the dish of weddings, new years and homecomings — its name sounds like laap, fortune, so eating it is halfway to a blessing. Warm minced meat is tossed with lime, fish sauce, chili flakes, mint and khao khua: raw rice toasted in a dry pan and pounded, the smoky crunch that makes larb larb. Tradition gives the head of the family the honor of mixing. Ours is mixed in the kitchen — the luck transfers anyway.",
    }  },
  { slug: 'nam-tok-salad', name: 'Nam Tok Salad', thai: 'น้ำตกเนื้อย่าง', category: 'salad', spicy: true,
    description: "'Waterfall' beef — grilled rib-eye sliced thin & juicy, tossed with lime, chili, Thai herbs & toasted rice. Cabbage wedge to tame the fire.", price: '$19',
    story: {
      lede: "'Waterfall' beef — named for the hiss of juices falling onto hot coals as the rib-eye grills.",
      history: "Nam tok means waterfall, and the poetry is practical: as beef grills over charcoal, its juices drip and sizzle on the embers — that sound gave the dish its name. An Isaan grilling classic, it applies everything larb knows — lime, chili, herbs, toasted-rice crunch — to sliced steak instead of minced meat. We grill rib-eye, slice it thin and still blushing, and send a cabbage wedge along to tame the fire between bites.",
    }  },
  { slug: 'thai-sausage', name: 'Thai Sausage (3)', thai: 'ไส้กรอกอีสานย่าง', category: 'grill',
    description: "Three coarse-ground sausages off the grill — snappy casings, juicy centers. Bite with fresh ginger, chili, lime & peanuts.", price: '$14',
    story: {
      lede: "Isaan's famous sour sausage — days of patience in every snap.",
      history: "Sai krok Isan is the northeast's roadside treasure: coarse pork and sticky rice seasoned with garlic, stuffed by hand and left to ferment until natural lactic cultures turn it gently, addictively sour — a matter of days, never hours. You smell the charcoal before you see the cart. Tradition dictates the escort of raw cabbage, fresh ginger, bird's-eye chili and peanuts: alternate bites, and let sour, hot and cool keep trading places.",
    }  },
  { slug: 'crying-tiger', name: 'Crying Tiger', thai: 'เสือร้องไห้', category: 'grill', signature: true,
    description: 'Fire-charred rib-eye with a smoky toasted rice–mint–tamarind sauce — so good the tiger wept.', price: '$20',
    ingredients: [
      'Prime rib-eye, grilled over open flame to a hard sear',
      'Jaew dipping sauce: toasted sticky-rice powder (khao kua), fish sauce, lime, chili flakes',
      'Fresh mint, cilantro, sliced shallot',
      'Grilled cabbage wedges and sticky rice on the side',
    ],
    allergens: ['fish'],
    pairing: {
      drink: 'A bold Thai iced coffee or a smoky mezcal — both pick up the char from the grill.',
      sides: ['Sticky Rice', 'Som Tum Thai', 'Pink Milk for the kids'],
    },
    story: {
      lede: 'A grilled steak with a name that gets a lot of theories. The real story is older and quieter than the legend — Northeastern (Isaan) farmers grilled tougher cuts of beef hard, sliced them paper-thin, and chased the smoke with a sour-fire dip called jaew.',
      history: 'Suea Rong Hai (เสือร้องไห้) literally means "crying tiger." Most people repeat the romantic version: the steak is so good it would make a tiger cry. The older Isaan story is the opposite — the cut used was traditionally a tough piece of brisket, called the "tiger cry" cut because even a tiger would weep trying to chew it. Pounding it tender, grilling it hard, then slicing thin across the grain was the village fix. Northeastern Thai cooks paired it with jaew — a dipping sauce of toasted rice powder, lime, fish sauce, and a serious amount of chili — and ate it with sticky rice and a bottle of lao khao. Our chef learned it from her uncle, who ran a roadside grill outside Khon Kaen and refused to use anything but rib-eye after he moved to California. "If you can afford the rib-eye," he told her, "the tiger doesn\'t cry anymore." We use his rule.',
      howToEat: "Eat it the Isaan way: roll a small ball of sticky rice between your fingertips, dip it lightly in the jaew, then pick up a slice of beef with the sticky-rice ball and eat the whole thing in one bite. Don't soak the rice in the sauce — the rice should be a spoon, not a sponge. A bite of cabbage between mouthfuls resets your palate.",
      chefNote: 'My uncle said the test of a real crying tiger is the moment after the first bite — the sticky rice, the smoke, the lime, the chili — they should hit one after the other, like a small parade. If they all hit at once, the cook rushed it. If only one hits, the cook was scared of the grill. We are not scared of the grill.',
    },
  },
  { slug: 'tom-yum', name: 'Tom Yum', thai: 'ต้มยำ', category: 'soup', spicy: true, protein: true,
    description: "The famous hot & sour — lemongrass, galangal & kaffir lime steaming from a chili-red broth of straw mushrooms.", price: '$13',
    story: {
      lede: "Thailand's most famous pot — the hot-and-sour broth that taught the world to say lemongrass and galangal.",
      history: "Tom means to boil; yam is Thailand's great family of sour-spicy tosses. The marriage happened in the riverine Central Plains, where the day's catch met the lemongrass, galangal and kaffir lime growing along every bank. Tom yum kung, the shrimp version, rose with Bangkok in the Rattanakosin era and went on to become the country's global calling card. Ours steams with straw mushrooms in a chili-bright broth — clear, fierce, restorative.",
    }  },
  { slug: 'tom-yum-seafood', name: 'Tom Yum Seafood', thai: 'ต้มยำทะเล', category: 'soup', spicy: true,
    description: "The same famous fire, loaded with ocean treasure — pot for the table.", price: '$25',
    story: {
      lede: "The famous fire, sent out to sea — a sharing pot crowded with the ocean.",
      history: "Along the Gulf of Thailand, tom yum was never a one-shrimp affair: coastal cooks tip the whole catch into the pot and let the broth make the introductions. This is that version — the same lemongrass, galangal and lime, loaded family-style. In Thailand, a steaming pot at the center of the table is the shape of a good evening. Order this and yours is underway.",
    }  },
  { slug: 'tom-kha', name: 'Tom Kha', thai: 'ต้มข่า', category: 'soup', signature: true, protein: true,
    description: 'Silky coconut milk mellows hot & sour into something creamy, citrusy & dangerously drinkable.', price: '$14',
    ingredients: [
      'Fresh coconut milk and coconut cream',
      'Galangal (kha) — sliced thick, the soup is named after it',
      'Lemongrass, kaffir lime leaves, Thai chili',
      'Straw mushrooms, cherry tomato',
      'Lime juice, fish sauce, palm sugar',
      'Choice of chicken, shrimp, or mushroom',
    ],
    allergens: ['fish','shellfish'],
    pairing: {
      drink: 'Pink milk or a chilled coconut water — both keep the heat friendly without numbing the herbs.',
      sides: ['Jasmine Rice', 'Fresh Spring Rolls', 'Sticky Rice'],
    },
    story: {
      lede: 'The gentler cousin of tom yum. Coconut milk softens the chili; galangal — not ginger, never ginger — gives it the perfume that makes Thai kitchens smell like home.',
      history: 'Tom kha gai (ต้มข่าไก่) is a Central-Thai everyday soup that became globally famous through Thai restaurants abroad. Its name is literal: tom = boil, kha = galangal, gai = chicken. The defining ingredient is the galangal — a rhizome that looks like ginger\'s cousin but tastes like nothing else: piney, citrusy, slightly soapy in the best way. Our chef\'s family makes it every time someone in the house catches a cold. "Coconut milk for comfort," her mother used to say, "galangal for the medicine, lime for the soul." Most Western menus over-sweeten it and under-spice it. Ours stays closer to the home version: bright, hot enough to wake you up, fragrant enough to be a hug.',
      howToEat: "Tom kha is meant to be eaten with rice — not as a starter on its own. Spoon some of the broth and a few pieces of chicken or shrimp over a small mound of jasmine, mix gently, eat in a single bite. The slices of galangal in the bowl are not for chewing — they're flavor delivery, like a bay leaf. Push them to the side. If it's too spicy, add a small splash of coconut milk from a side dish (just ask); if it's too mild, ask for our nam prik pao chili oil. The lime wedge on top is yours to deploy when it lands.",
      chefNote: "When my mother was sick, she asked for tom kha before she asked for medicine. I think it's because every spoon tastes like the kitchen we grew up in — the same coconut, the same galangal, the same lime hitting the bowl right at the end. I cook it the same way now, in California. The galangal is harder to get here, but I won't substitute. It has to be kha.",
    },
  },
  { slug: 'tom-kha-seafood', name: 'Tom Kha Seafood', thai: 'ต้มข่าทะเล', category: 'soup', signature: true,
    description: "Creamy coconut hot & sour crowded with seafood — pot for the table.", price: '$25',
    story: {
      lede: "The silkiest broth in the house meets the day's catch — coconut, galangal and the sea in one pot.",
      history: "Tom kha made its name as a chicken soup, but Thai coastal kitchens have always known what coconut milk does for seafood: softens, rounds, flatters. The galangal stays non-negotiable — it is the kha in the name — and the lime still lands right at the end. Served center-table the Thai way: creamy enough for the cautious, fragrant enough for the devoted.",
    }  },
  { slug: 'po-tak-seafood', name: 'Po Tak Seafood Soup', thai: 'โป๊ะแตก', category: 'soup', spicy: true,
    description: "'The fish-trap bursts' — a clear, blazing hot & sour broth crowded with seafood & Thai herbs. Pot.", price: '$25',
    story: {
      lede: "'The fish trap bursts' — a fisherman's boast of a soup, so loaded the gear gave way.",
      history: "A po is the staked fish trap Thai coastal fishermen have set in the shallows for generations; taek means it breaks. Po taek is the soup for the day the catch overwhelms the equipment — everything goes into a clear, blazing broth of lemongrass, galangal and Thai basil, with no coconut milk to soften the blow. Tom yum's leaner, saltier cousin: pure sea, pure herb, pure heat.",
    }  },
  { slug: 'wonton-soup', name: 'Wonton Soup (6 pc)', thai: 'เกี๊ยวน้ำ', category: 'soup',
    description: "Silky pork & shrimp wontons in a clean broth, bean sprouts & green onion — the gentle one at the table.", price: '$13',
    story: {
      lede: "The gentle one at the table — silky parcels in clean broth, a gift from Bangkok's Chinatown.",
      history: "Wontons sailed to Siam with Cantonese and Teochew immigrants whose noodle shops made Bangkok's Yaowarat one of the great eating streets of Asia — the name in Cantonese famously suggests 'swallowing clouds.' Thai cooks kept the broth clear and honest, added bean sprouts and green onion, and made kiao nam the dish a Thai family orders for the kids, the grandparents, and anyone who needs looking after.",
    }  },
  { slug: 'panang-curry', name: 'Panang Curry', thai: 'พะแนงเนื้อ', category: 'curry', signature: true,
    description: "Thick, sweet-savory panang hugging every bite in coconut cream, red bell pepper & holy basil.", price: '$15',
    story: {
      lede: "The velvet curry — thicker, quieter and richer than its red cousin, in Thai cookbooks since 1889.",
      history: "Phanaeng appears in Thai print as early as 1889, already at home on Rattanakosin-era tables. Its name is a happy mystery — some hear the Malay panggang, grilled; some hear the island of Penang; some insist it is Thai to the bone. Its character is certain: more coconut cream, fewer chilies, peanuts worked into the paste, simmered until the oil rises and the sauce clings like velvet. We finish it with red bell pepper and basil.",
    }  },
  { slug: 'yellow-curry', name: 'Yellow Curry', thai: 'แกงกะหรี่ไก่', category: 'curry',
    description: "Golden, gentle & comforting — slow-cooked chicken and soft potato in a creamy, turmeric-warm curry.", price: '$15',
    story: {
      lede: "The golden, gentle one — where the Indian spice road meets Thai coconut cream.",
      history: "Kaeng kari is what centuries of Indian Ocean trade left in the Thai pot: turmeric, cumin and coriander seed carried on monsoon winds, folded into coconut milk by Thai-Muslim kitchens until they turned round and comforting. Slow-cooked chicken, soft potato, sweet onion. It is the curry Thai parents order for their children — and the one homesick Thais order for themselves.",
    }  },
  { slug: 'green-curry', name: 'Green Curry', thai: 'แกงเขียวหวาน', category: 'curry', spicy: true, protein: true,
    description: "Herb-green & fragrant — zucchini, eggplant, bell pepper & basil in a lively coconut curry.", price: '$15',
    story: {
      lede: "The 'sweet-green' curry — named for its color, not its sugar — and barely a century old.",
      history: "Kaeng khiao wan is a young classic, first recorded between 1908 and 1926, late in Siam's royal era. The name fools translators: wan, sweet, describes the pale creamy shade Thais call 'sweet green' — not the taste, which runs hotter than red curry. Fresh green bird's-eye chilies give the paste both its color and its temper; coconut milk, eggplant, zucchini and basil round it into one of the best-loved curries on earth.",
    }  },
  { slug: 'house-fried-rice', name: 'Fried Rice', thai: 'ข้าวผัด', category: 'rice', protein: true,
    description: "Wok-fried red rice with egg & green onion, cool cucumber on the side.", price: '$12',
    story: {
      lede: "The world's greatest second act — humble rice, reborn glossy in a screaming wok.",
      history: "Fried rice came south with Chinese immigrants and found its soulmate in Thailand's fragrant rice — drier, more perfumed, built for the wok. Khao pad became the country's universal comfort: every shophouse, every grandmother, every late-night craving. Ours wok-fries red rice with egg and green onion until every grain turns glossy, with cool cucumber on the side — the traditional Thai punctuation mark.",
    }  },
  { slug: 'spicy-basil-fried-rice', name: 'Spicy Basil Fried Rice', thai: 'ข้าวผัดกะเพรา', category: 'rice', spicy: true, protein: true,
    description: "Krapow heat, fried-rice comfort — chili, garlic & holy basil in every spoonful.", price: '$13',
    story: {
      lede: "Two Thai legends in one wok — krapow's fire folded through fried-rice comfort.",
      history: "When pad kaphrao became Thailand's default lunch, the fried-rice version followed as surely as noon follows morning: the same chili, garlic and holy basil, now carried by rice that has been through the flame itself. It is rice-shop logic — one wok, two cravings, zero compromise. Add a fried egg on top and you are eating like a Bangkok regular.",
    }  },
  { slug: 'pineapple-fried-rice', name: 'Pineapple Fried Rice', thai: 'ข้าวผัดสับปะรด', category: 'rice', protein: true,
    description: "Sweet pineapple, raisins, tomato & cashews tumbled through egg-fried rice — sweet-savory & addictive.", price: '$15',
    story: {
      lede: "The celebration rice — sweet pineapple, raisins and cashews tumbled through egg-laced grains.",
      history: "Khao pad sapparot is Thai fried rice in its party dress — famously served in a hollowed pineapple when there is something to celebrate. The idea is old Thai wisdom: fruit belongs in savory food, and pineapple's sweet acidity wakes up wok-fried rice the way lime wakes up a curry. Raisins, tomato and buttery cashews finish a plate that has converted more skeptics than any dish we know.",
    }  },
  { slug: 'narwhal-garlic-beef', name: 'Narwhal Garlic Beef', thai: 'ข้าวผัดกระเทียมเนื้อ', category: 'rice', signature: true,
    description: "Our house fried rice — beef seared with a glorious amount of golden garlic, every grain glossy & savory.", price: '$22',
    story: {
      lede: "Our house rice, our house rule: there is no such thing as too much golden garlic.",
      history: "This one is pure Narwhal. In recipe testing, our chef kept doubling the fried garlic on a beef fried rice just to see — and the plate kept coming back empty. The final version sears the beef hard, folds it through glossy egg rice, and finishes with a landslide of garlic fried to the exact second it turns gold and sweet. It never existed in Thailand. It could only have happened here — and we are a little proud of that.",
    }  },
  { slug: 'crab-fried-rice', name: 'Crab Fried Rice', thai: 'ข้าวผัดปู', category: 'rice', signature: true,
    description: "Sweet crab meat folded through egg-laced rice — light, delicate, ocean-fresh.", price: '$26',
    story: {
      lede: "The dish Thai food lovers use to judge a kitchen — there is nowhere to hide.",
      history: "Khao pad pu is Bangkok shophouse royalty: sweet crab folded through egg-laced rice, seasoned so lightly that only wok skill holds it together. Thai-Chinese cooks made it the quiet test of a kitchen — too much sauce and you are hiding something; too little fire and the rice goes dull. Ours stays delicate and ocean-fresh. A squeeze of lime, one spoonful, and you will know everything about us.",
    }  },
  { slug: 'garlic-pepper-over-rice', name: 'Garlic & Pepper', thai: 'ผัดกระเทียมพริกไทย', category: 'overrice', protein: true,
    description: "Golden garlic & cracked pepper over steamed rice — simple, savory, done right.", price: '$11',
    story: {
      lede: "Thailand's oldest flavor memory — garlic and white pepper, the heat that predates the chili itself.",
      history: "Chilies only reached Siam in the 1600s aboard Portuguese ships. Before that, Thai heat meant white peppercorn and garlic — and pad kratiem prik thai keeps that older flame burning. Golden garlic, cracked pepper and a savory glaze over steamed rice: the taste of the Thai kitchen before the Americas arrived, still ordered daily by anyone who wants lunch to feel like being taken care of.",
    }  },
  { slug: 'krapow-over-rice', name: 'Krapow · Spicy Basil', thai: 'ผัดกะเพรา', category: 'overrice', spicy: true, protein: true,
    description: "Thailand's lunchtime legend — fiery, fragrant chili & holy basil over rice.", price: '$11',
    story: {
      lede: "Thailand's lunchtime legend — the dish Thais order when they can't decide what to order.",
      history: "Pad kaphrao emerged in the 1920s and 30s as Chinese wok technique met bai kaphrao — the peppery, clove-scented holy basil Thais have grown for centuries — and after the 1950s it swept the nation. Today it is the unofficial national lunch, so universal that krapow is the standing answer to the question 'what should I eat?' Screaming wok, chili, garlic, holy basil, rice. Add the crispy fried egg; everyone does.",
    }  },
  { slug: 'og-pad-thai', name: 'OG Pad Thai', thai: 'ผัดไทยต้นตำรับ', category: 'noodles', signature: true, protein: true,
    description: 'Chewy rice noodles in tamarind-sweet sauce, bean sprouts & chives — lime for spark, peanuts for crunch.', price: '$12',
    ingredients: [
      'Hand-cut chantaboon rice noodles (jantaboon)',
      'House tamarind concentrate, palm sugar, fish sauce',
      'Pressed tofu, dried shrimp, salted radish (chai poh)',
      'Fresh garlic chives, bean sprouts, banana blossom',
      'Toasted peanuts, lime wedge, dried chili flakes',
      'Choice of chicken, shrimp, tofu, or no protein',
    ],
    allergens: ['peanut','fish','soy','egg','shellfish'],
    pairing: {
      drink: 'Thai iced tea (pictured) or a clean lager — both cut the tamarind sugar without fighting the dish.',
      sides: ['House Iced Tea', 'Fresh Cucumber Cooler', 'Crispy Spring Rolls'],
    },
    story: {
      lede: 'The pad thai that started in the kitchens of 1940s Bangkok, not the Americanized one with ketchup. Sweet from palm sugar, sour from tamarind, salty from fish sauce, smoky from a properly hot wok — and that\'s it.',
      history: 'Pad thai is younger than people think. It was popularized in the 1940s by Field Marshal Plaek Phibunsongkhram as part of a national identity campaign — rice was scarce in wartime, noodles ate less of the harvest, and the recipe spread from government cookbooks into every neighborhood. Our chef learned it from her grandmother in Bangkok, who learned it from a noodle vendor in Chantaburi province (the home of chantaboon noodles) in the 1960s. The "OG" in the name is the chef\'s wink at how far the dish has drifted from this original — no ketchup, no peanut butter, no sweet pink sauce. Just the four-flavor balance Thai cooks chase: เปรี้ยว หวาน เค็ม เผ็ด — sour, sweet, salty, hot.',
      howToEat: 'A proper pad thai arrives with a lime wedge, raw bean sprouts, a small pile of dried chili flakes, and sometimes raw banana blossom on the side. Squeeze the lime over everything first. Then taste — if it needs more punch, sprinkle chili; if it needs more crunch, pile on the bean sprouts. The herbs and garnishes aren\'t decoration; they\'re your seat at the cook\'s table. The whole point is that you finish the seasoning to your own tongue.',
      chefNote: 'My grandmother told me: if your pad thai tastes like ketchup, you bought a tourist plate. Real pad thai is sour first, then sweet, then salty, then the chili sneaks in last. The smoke from the wok is the fifth flavor — and you can only get that with real heat. We cook every plate on a 200,000-BTU burner because anything less is a stir-fry, not pad thai.',
    },
  },
  { slug: 'pad-see-ew', name: 'Pad See Ew', thai: 'ผัดซีอิ๊ว', category: 'noodles', protein: true,
    description: "Wide rice noodles seared smoky-sweet in a hot wok, Chinese broccoli & egg.", price: '$12',
    story: {
      lede: "The smoky-sweet comfort noodle — the charred edges are the whole point.",
      history: "Pad see ew, 'fried with soy sauce,' is Thailand's branch of a noodle family that runs from Cantonese chow fun to Singapore's char kway teow — planted wherever Chinese wok cooks settled. Wide rice noodles meet dark soy, egg and Chinese broccoli in a screaming wok; the sugars scorch and the noodles blister. That faint, smoky bitterness — the breath of the wok — separates the real thing from a sauté. Ours blisters properly.",
    }  },
  { slug: 'pad-kee-mao', name: 'Pad Kee Mao — Drunken Noodles', thai: 'ผัดขี้เมา', category: 'noodles', spicy: true, protein: true,
    description: "From a screaming-hot wok — Thai chili, bell pepper & holy basil. Spicy enough to mean it.", price: '$12',
    story: {
      lede: "Drunken noodles — no alcohol in the pan, three legends behind the name, one serious level of heat.",
      history: "No one fully agrees on why pad kee mao means drunkard's noodles. Some say it is the dish flung together after a long night from whatever the kitchen still holds; some say the chili is pitched to cut through a dulled palate; one tale blames a wife spicing her husband's dinner into a lesson. Everyone agrees on the medicine itself: wide noodles, a violent wok, Thai chili and holy basil. We cook it spicy enough to mean it.",
    }  },
  { slug: 'thai-boat-noodles', name: 'Thai Boat Noodles', thai: 'ก๋วยเตี๋ยวเรือ', category: 'noodles',
    description: "Slow-simmered beef broth, dark & herbal — tender chunk beef, meatballs, Chinese broccoli & sprouts.", price: '$19',
    story: {
      lede: "A bowl with a hundred years of river underneath it — sold from floating kitchens on the canals of old Siam.",
      history: "Before Thailand had highways it had canals, and before food courts it had boat noodles: vendors rowing the khlongs with a charcoal pot balanced amidships, ladling dark, herb-deep beef broth into small bowls — small, so nothing spilled when a wake rolled through. The Rangsit canals near Bangkok made the dish famous; roads eventually beached the boats, but the bowl survived. Ours honors it with slow-simmered broth, chunk beef, meatballs and greens.",
    }  },
  { slug: 'rad-na', name: 'Rad Na', thai: 'ราดหน้า', category: 'noodles', protein: true,
    description: "Wok-charred flat noodles under a silky, peppery gravy with Chinese broccoli — comfort by the ladle.", price: '$16',
    story: {
      lede: "Comfort by the ladle — wok-charred noodles under a silky, peppery gravy, a gift from Teochew Bangkok.",
      history: "Rad na — roughly, 'poured over' — arrived with Teochew immigrants from China's Chaoshan coast, whose shophouses taught Bangkok the pleasure of gravy. The wide noodles are charred first for smokiness, then blanketed in a sauce built on fermented soybean, thickened to silk and studded with Chinese broccoli. It is Thailand's great rainy-day dish: the one you order when dinner should feel like a warm blanket.",
    }  },
  { slug: 'chow-mein', name: 'Chow Mein', thai: 'บะหมี่ผัด', category: 'noodles', protein: true,
    description: "Springy yakisoba noodles tossed with egg, cabbage, celery & carrot.", price: '$14',
    story: {
      lede: "The Cantonese traveler that settled in every port on earth — springy noodles, hot wok, no borders.",
      history: "Chow mein simply means 'fried noodles,' and few dishes have traveled further on two words. Cantonese cooks carried it across the Pacific over a century ago, and it put down roots everywhere it landed — Thailand's wok culture adopted it without a second thought. Ours tosses springy yakisoba-style noodles with egg, cabbage, celery and carrot: a crossroads dish for a crossroads table.",
    }  },
  { slug: 'spaghetti-kee-mao', name: 'Spaghetti Kee Mao', thai: 'สปาเก็ตตี้ขี้เมา', category: 'noodles', spicy: true, protein: true,
    description: "Drunken noodles gone Italian — spaghetti through a screaming-hot wok, Thai chili, bell pepper & holy basil.", price: '$14',
    story: {
      lede: "Bangkok's favorite Italian plot twist — spaghetti that ran away and joined the wok.",
      history: "Thailand fell for spaghetti decades ago, then did something Italy never sanctioned: threw it into a flaming wok with chili, garlic and holy basil. Spaghetti kee mao is now a beloved modern classic across Bangkok — al dente pasta takes the drunken-noodle fire beautifully, holding its bite through the char. Our kitchen cooks it unapologetically Thai. Somewhere an Italian grandmother is frowning; somewhere a Thai one is winking.",
    }  },
  { slug: 'spaghetti-tom-yum', name: 'Spaghetti Tom Yum', thai: 'สปาเก็ตตี้ต้มยำ', category: 'noodles', spicy: true, protein: true,
    description: "Al dente spaghetti tossed in the famous hot & sour — chili paste, lemongrass, kaffir lime & galangal.", price: '$14',
    story: {
      lede: "The famous broth becomes a sauce — lemongrass, kaffir lime and chili paste clinging to every strand.",
      history: "Once Thai cooks learned spaghetti could survive the wok, the next question was inevitable: could it carry tom yum? This plate is the answer — chili paste, lemongrass, kaffir lime and galangal reduced from Thailand's most famous soup into a glossy coat for al dente pasta. Modern Thai cooking at its most confident: national-treasure flavors on a borrowed Italian spine. Our test kitchen refused to let this one go.",
    }  },
  { slug: 'garlic-pepper-alacarte', name: 'Garlic & Pepper', thai: 'ผัดกระเทียมพริกไทย', category: 'alacarte', protein: true,
    description: "Golden garlic & cracked white pepper, seared savory.", price: '$14',
    story: {
      lede: "The old guard of Thai stir-fries — garlic and white pepper, holding the line since before chilies reached Siam.",
      history: "Pad kratiem prik thai is built on the Thai kitchen's founding trio: garlic, white peppercorn and coriander root, pounded together since long before Portuguese traders brought the chili in the 1600s. That ancient paste still underpins half of Thai cooking; here it steps forward as the whole show, seared golden and savory. Simple, ancient, exactly right.",
    }  },
  { slug: 'spicy-basil-alacarte', name: 'Spicy Basil', thai: 'ผัดกะเพรา', category: 'alacarte', spicy: true, protein: true,
    description: "The krapow classic — chili & holy basil, loud & fragrant.", price: '$14',
    story: {
      lede: "The krapow classic served the purist's way — all fire in the wok, jasmine rice standing by.",
      history: "Born in the 1920s when Chinese wok technique embraced Thailand's sacred holy basil, pad kaphrao grew into the country's default order — the dish that answers every undecided lunch. This is the à la carte cut for the table that wants the legend itself: chili, garlic, your protein and a storm of true bai kaphrao, loud and fragrant. The fried egg is optional but historically encouraged.",
    }  },
  { slug: 'spicy-basil-eggplant', name: 'Spicy Basil Eggplant', thai: 'ผัดกะเพรามะเขือยาว', category: 'alacarte', spicy: true, protein: true,
    description: "The krapow classic over silky, wok-charred eggplant.", price: '$16',
    story: {
      lede: "The krapow treatment applied to its best student — eggplant that chars silky and drinks the sauce.",
      history: "Long eggplant is the quiet genius of the Thai wok: charred, its flesh turns custard-soft and holds chili-basil sauce the way bread holds butter. Pairing it with krapow's fire is a vegetable-lover's classic all over Thailand — proof the dish never needed meat to be beloved. Same roaring flame, same holy basil finish. The eggplant does the rest.",
    }  },
  { slug: 'chinese-broccoli', name: 'Chinese Broccoli', thai: 'ผัดคะน้า', category: 'alacarte', protein: true,
    description: "Crisp-stemmed greens seared with garlic & oyster sauce.", price: '$14',
    story: {
      lede: "Gai lan, garlic, oyster sauce, fire — four ingredients that built half of Thai-Chinese cooking.",
      history: "Pad khana is what happens when nobody overthinks a vegetable. Chinese broccoli arrived with the immigrant cooks who reshaped Bangkok's food a century ago, and Thais fell hard for its crisp stems and mineral bite. Flash-seared with garlic and oyster sauce, it is the standard-issue green from street stalls to banquet halls — and the plate Thai cooks order to check whether a kitchen respects vegetables.",
    }  },
  { slug: 'american-broccoli', name: 'American Broccoli', thai: 'ผัดบร็อกโคลี', category: 'alacarte', protein: true,
    description: "Tender broccoli in a silky gravy.", price: '$13',
    story: {
      lede: "The American cousin, warmly adopted by the wok — tender florets in a silky gravy.",
      history: "Thai menus abroad grew this dish for the simplest reason: Western broccoli loves the wok too. The technique treats it kindly — a hard sear, then a light gravy that pools in the florets. It is the gentle green of the menu: no chili, no drama, cooked with the same care as everything else. Missing khana? Order its Chinese cousin. Feeding a careful eater? This one, every time.",
    }  },
  { slug: 'mixed-vegetables', name: 'Mixed Vegetables', thai: 'ผัดผักรวม', category: 'alacarte', protein: true,
    description: "A hot-wok toss of market vegetables, crisp & glossy.", price: '$13',
    story: {
      lede: "The family-table classic — whatever the market did best today, tossed glossy in a hot wok.",
      history: "Pad pak ruam is less a recipe than a philosophy: the Thai home cook shops first and decides later, and the day's best vegetables meet in one wok with garlic and a light, glossy sauce. On a table crowded with curry and chili, this is the green pause — the dish that lets every other dish shine. Ours changes with the market, exactly as it should.",
    }  },
  { slug: 'ong-choy', name: 'Ong Choy', thai: 'ผัดผักบุ้งไฟแดง', category: 'alacarte',
    description: "Morning glory flash-seared over roaring flame — garlic, oyster sauce, crisp stems & glossy leaves.", price: '$13',
    story: {
      lede: "Morning glory over roaring flame — a stir-fry so theatrical one Thai town started throwing it through the air.",
      history: "Pad pak boong fai daeng — morning glory, red flame — is named for the fire that leaps when the greens hit hot oil. In Phitsanulok it became literal street theater: the famous 'flying vegetable' vendors hurl flaming wokfuls across the street to a catcher balancing a plate. Under the show is a serious dish — hollow-stemmed greens that stay crisp, garlic, soybean paste and oyster sauce, cooked in seconds. We keep the fire in the kitchen; the flavor still flies.",
    }  },
  { slug: 'cashew-nut', name: 'Cashew Nut', thai: 'ผัดเม็ดมะม่วงหิมพานต์', category: 'alacarte', protein: true,
    description: "Buttery roasted cashews, green onion & toasted chilies — the sweet-savory wok classic.", price: '$16',
    story: {
      lede: "The banquet favorite named after a mythical forest — Thailand's most welcoming Chinese inheritance.",
      history: "In Thai, the cashew is med mamuang himmaphan — seed of the mango of Himmaphan, mythology's enchanted forest — because the nut dangles beneath its fruit like something a storyteller invented. The stir-fry descends from Chinese banquet cooking, softened to Thai taste: buttery roasted cashews, green onion and toasted dry chilies that trade burn for aroma. Sweet-savory and crowd-uniting, it is the plate that empties first at every family table.",
    }  },
  { slug: 'fried-whole-pompano', name: 'Fried Whole Pompano', thai: 'ปลาจะละเม็ดทอดราดพริก', category: 'seafood', signature: true,
    description: "A whole pompano fried until the skin crackles gold, lacquered in sweet chili sauce — bring friends.", price: '$35',
    story: {
      lede: "The centerpiece — a whole fish, golden and crackling, the way Thai celebrations have always insisted.",
      history: "In Thailand a whole fish means abundance: it anchors weddings, new-year feasts and every homecoming dinner worth the drive. Pla tod rad prik is the beloved form — fried until the skin crackles, then lacquered in a sweet-hot chili glaze that finds every crevice. We give the honor to pompano, clean and silver-fleshed, a fish that loves the fryer. It arrives whole because that is the point: one fish, many hands, good fortune.",
    }  },
  { slug: 'white-fish-mango-salad', name: 'White Fish & Mango Salad', thai: 'ปลาทอดยำมะม่วง', category: 'seafood', signature: true,
    description: "Featherweight batter, flaky white fish — a bright, spicy mango salad cuts through every rich bite.", price: '$29',
    story: {
      lede: "Crisp meets bright — featherweight fried fish under a spicy mango salad, the great Thai contrast plate.",
      history: "Thai cooks have always known that fried wants sour. The yam mamuang — mango tossed with lime, chili, shallot and cashew — has partnered crispy fish in Thai kitchens for generations, the salad landing cold and electric over the hot crust. The batter stays featherweight so the fish shatters; the mango resets your palate for the next rich bite. A dish built on rhythm, and it never gets old.",
    }  },
  { slug: 'narwhal-sundae', name: 'Narwhal Sundae', thai: 'นาร์วาลซันเดย์', category: 'dessert',
    description: "Choose your ending — vanilla, chocolate or strawberry, a crisp cone & clouds of whipped cream.", price: '$11',
    story: {
      lede: "The house finale — your ice cream, your ending, our weather system of whipped cream.",
      history: "Every family restaurant needs one dessert that requires no explanation and produces instant silence. Ours is the Narwhal Sundae: vanilla, chocolate or strawberry, a crisp cone, and clouds of whipped cream — built for the kid at the table and for the adult who swears they are only having one bite. We named it after ourselves because, like the narwhal, it is simple, slightly magical, and impossible not to smile at.",
    }  },
  { slug: 'mango-sticky-rice', name: 'Mango Sticky Rice', thai: 'ข้าวเหนียวมะม่วง', category: 'dessert',
    description: "Warm sweet sticky rice, cool ripe mango, a river of sweet coconut cream — Thailand's favorite goodbye.", price: '$14',
    story: {
      lede: "Thailand's favorite goodbye — traced to the late Ayutthaya era, and still the reason people fly home in mango season.",
      history: "Khao niao mamuang is old love: sweetened sticky rice and prized mangoes appear in Siamese records from the late Ayutthaya period, and the pairing was cherished through the reign of King Chulalongkorn. The ritual is seasonal — when nam dok mai mangoes ripen each spring, the whole country eats it at once: warm rice, cool fruit, salted coconut cream tying them together. We serve it year-round. California homesickness does not check the calendar.",
    }  },
  { slug: 'coconut-ice-cream-bread', name: 'Coconut Ice Cream & Bread', thai: 'ไอศกรีมกะทิ ขนมปัง', category: 'dessert', signature: true,
    description: "Bangkok street-style — cool coconut ice cream on soft, pillowy bread.", price: '$12',
    story: {
      lede: "Bangkok street style — cool coconut ice cream on pillowy bread, born when ice was a royal luxury.",
      history: "Ice reached Siam by ship in the 1860s and was precious enough for royal receptions; only when ice factories spread under King Rama V did frozen treats reach the street. Thai vendors, short on dairy, churned coconut milk instead — and i-tim kati was born, scooped for schoolchildren ever since. The bread is the masterstroke: a soft sweet roll cradling the cold scoops, dessert you can eat while walking. Humble treat, royal backstory.",
    }  },
  { slug: 'thai-tea', name: 'Thai Tea', thai: 'ชาไทย', category: 'drinks',
    description: "Strong-brewed, amber-orange, sweet & creamy over ice.", price: '$7',
    story: {
      lede: "The amber icon — born of Bangkok's Chinatown tea trade in 1945, poured tall over ice ever since.",
      history: "Thai tea began on Yaowarat Road, where a Teochew tea-trading family found hot Chinese tea a hard sell in the tropics. In 1945 they blended a red tea meant to be brewed strong, sweetened and poured over ice — the birth of cha yen. Condensed and evaporated milk, pantry-stable in the heat, gave it the creamy crown; the blend's roasted, spiced notes give the famous amber glow. One sip, and you are on a Bangkok sidewalk.",
    }  },
  { slug: 'lime-thai-tea', name: 'Lime Thai Tea', thai: 'ชามะนาว', category: 'drinks',
    description: "Thai tea, brightened with fresh lime — sweet, sharp, ice-cold.", price: '$7',
    story: {
      lede: "Cha manao — the street-stall sibling that trades the cream for a squeeze of lime.",
      history: "For every Thai who takes tea creamy, there is one who takes it bright. Cha manao is the same strong-brewed red tea, skipping milk for fresh lime and sugar over ice — the drink of the hottest hour of the day. Street vendors will tell you it cuts through spicy food even better than its famous sibling. Sweet, sharp, ice-cold, gone too fast.",
    }  },
  { slug: 'thai-green-tea', name: 'Thai Green Tea', thai: 'ชาเขียวไทย', category: 'drinks',
    description: "The emerald cousin — creamy, fragrant, ice-cold.", price: '$7',
    story: {
      lede: "The emerald cousin — Thailand's creamy iced-tea ritual, painted green.",
      history: "When green tea swept across Asia, Thailand answered in its own accent: brew it strong, sweeten it honestly, pour it over ice with milk — the full cha yen treatment, in emerald. Thai green milk tea became a modern night-market classic, a shade gentler than its amber sibling, with a fragrant, almost floral finish. Same soul, different color.",
    }  },
  { slug: 'thai-coffee', name: 'Thai Coffee', thai: 'กาแฟไทย', category: 'drinks',
    description: "Old-school dark roast, sweetened the Thai way.", price: '$7',
    story: {
      lede: "Old-school Thai coffee — roasted dark the traditional way and sweetened without apology.",
      history: "Thailand's classic cup descends from Teochew coffee stalls — the tradition whose iced black version, oliang, takes its name from the Teochew for 'black and cold.' The beans are roasted dark, traditionally rounded with toasted grains and sesame, brewed through a cloth sock filter, and finished sweet and creamy. It is coffee as Bangkok has poured it for generations: strong enough to stand up to ice, sweet enough to count as a treat.",
    }  },
  { slug: 'iced-tea', name: 'Iced Tea', thai: 'ชาดำเย็น', category: 'drinks',
    description: "Clean, cold & endless.", price: '$4',
    story: { lede: "The straightforward sip — brewed clean, poured tall, impossible to argue with." }  },
  { slug: 'fresh-coconut', name: 'Fresh Coconut', thai: 'มะพร้าวสด', category: 'drinks',
    description: "Young coconut, chilled — straight from the shell.", price: '$8',
    story: {
      lede: "Straight from the shell — Thailand's original refreshment, older than every recipe on this menu.",
      history: "Thais call the coconut palm the tree of a hundred uses: it roofs houses, sweetens curries, thickens soups — and hands you a drink. A young coconut, chilled whole, is the country's oldest thirst-quencher: clear, gently sweet water with soft spoonable flesh waiting at the bottom. No recipe. No possible improvement. We just keep them very, very cold.",
    }  },
  { slug: 'hot-coffee', name: 'Hot Coffee', thai: 'กาแฟร้อน', category: 'drinks',
    description: "Old-school dark roast, served hot & honest.", price: '$4',
    story: { lede: "For the traditionalist — a hot, unhurried cup to close the meal." }  },
  { slug: 'hot-tea', name: 'Hot Tea', thai: 'ชาร้อน', category: 'drinks',
    description: "Thai tea, steaming & fragrant.", price: '$4',
    story: { lede: "The warm goodbye — Thai tea without the ice, all of the fragrance." }  },
  { slug: 'soda', name: 'Soda', thai: 'น้ำอัดลม', category: 'drinks',
    description: "Coke · Diet Coke · Dr Pepper · Sprite.", price: '$4',
    story: { lede: "The fizzy classics on ice — every table's common ground." }  },
  { slug: 'pink-milk', name: 'Pink Milk', thai: 'นมเย็น', category: 'drinks',
    description: "Icy sala-syrup milk — pink, sweet, pure nostalgia.", price: '$7',
    story: {
      lede: "Pink, sweet, pure nostalgia — the drink every Thai kid grew up ordering after school.",
      history: "Nom yen — 'cold milk' — is Thailand in a glass: milk over ice, dyed rose-pink with syrup of the sala fruit, most famously from the Hale's Blue Boy bottle standing in every Thai pantry. It is the taste of school canteens and corner shops, the reward parents buy for a good report card. Order it beside something spicy — this is the best fire extinguisher on the menu.",
    }  },
  { slug: 'passion-fruit', name: 'Passion Fruit', thai: 'น้ำเสาวรส', category: 'drinks',
    description: "Tart-sweet & sunny.", price: '$7',
    story: { lede: "Tart-sweet and sunny — the tropics doing the talking." }  },
  { slug: 'fresh-cucumber', name: 'Fresh Cucumber', thai: 'น้ำแตงกวาสด', category: 'drinks',
    description: "Cool, green & quenching.", price: '$7',
    story: { lede: "Cool, green and quenching — the calmest glass on the menu." }  },
  { slug: 'pineapple-soda', name: 'Pineapple Soda', thai: 'สับปะรดโซดา', category: 'drinks',
    description: "Golden fruit with sparkle.", price: '$7',
    story: { lede: "Golden Thai pineapple, lifted with sparkle — sunshine with bubbles." }  },
];

export function getDishBySlug(slug: string): Dish | undefined {
  return DISHES.find(d => d.slug === slug);
}
