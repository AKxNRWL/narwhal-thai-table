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
   3 signature dishes have full story content (Pad Thai, Tom Kha,
   Crying Tiger). The rest are placeholders with menu-list data
   only — story panels gracefully fall back to "story coming soon".
   ============================================================ */

/* ============================================================
   SOFT OPENING MENU — July 2026. Prices are final soft-opening
   prices. protein: true = guest picks a protein (priced from +$2
   under Sides & Protein).
   ============================================================ */

export const DISHES: Dish[] = [
  { slug: 'narwhal-chicken-wings', name: 'Narwhal Chicken Wings', thai: 'ปีกไก่ทอดนาร์วาล', category: 'appetizers', signature: true,
    description: "Shatter-crisp wings tossed hot in our Thai house seasoning — garlicky, peppery, juicy to the bone.", price: '$15' },
  { slug: 'chicken-wings', name: 'Chicken Wings', thai: 'ปีกไก่ทอด', category: 'appetizers',
    description: "The classic — golden, crackling skin, steaming-juicy inside.", price: '$14' },
  { slug: 'thai-fish-cake', name: 'Fish Cakes (6 pc)', thai: 'ทอดมันปลา', category: 'appetizers',
    description: "Bouncy-tender fish cakes fried deep bronze — cool cucumber-chili relish & crushed peanuts for crunch.", price: '$14' },
  { slug: 'crispy-spring-rolls', name: 'Pork Spring Rolls', thai: 'ปอเปี๊ยะหมู', category: 'appetizers',
    description: "Hand-rolled shells that crackle, giving way to a savory heart of ground pork & vegetables.", price: '$12' },
  { slug: 'vegetable-spring-rolls', name: 'Vegetable Spring Rolls', thai: 'ปอเปี๊ยะผัก', category: 'appetizers',
    description: "The garden version — same crackling shell, sweet stir-fried vegetables inside.", price: '$10' },
  { slug: 'calamari', name: 'Calamari', thai: 'ปลาหมึกทอด', category: 'appetizers',
    description: "Tender rings in a light golden crust — fried hot, gone fast.", price: '$15' },
  { slug: 'shrimp-tempura', name: 'Shrimp Tempura', thai: 'กุ้งเทมปุระ', category: 'appetizers',
    description: "Whisper-light, lacy batter over sweet snappy shrimp — pale gold and crisp.", price: '$15' },
  { slug: 'fresh-spring-rolls', name: 'Fresh Spring Rolls', thai: 'ปอเปี๊ยะสด', category: 'appetizers',
    description: "Cool rice-paper rolls — glass noodles, ground chicken & tofu, crisp lettuce, cucumber, carrot & basil.", price: '$12' },
  { slug: 'house-salad', name: 'House Salad', thai: 'สลัดผักสด', category: 'salad',
    description: "Crisp greens, cool cucumber & tomato, chewy-sweet dried cranberries, bright Thai dressing.", price: '$14' },
  { slug: 'rib-eye-salad', name: 'Rib-Eye Salad', thai: 'สลัดเนื้อย่าง', category: 'salad',
    description: "Char-grilled rib-eye sliced warm over cool greens, radish, green onion & mint — a tangy, fragrant Thai-herb dressing.", price: '$18' },
  { slug: 'som-tum-thai', name: 'Som Tum Thai', thai: 'ส้มตำไทย กุ้งแห้ง', category: 'salad', spicy: true,
    description: "Crisp green papaya pounded to order with dried shrimp — sour, sweet & spicy in one bright crunch.", price: '$12' },
  { slug: 'som-tum-black-crab', name: 'Som Tum · Black Crab', thai: 'ส้มตำไทย ปูเค็ม', category: 'salad', spicy: true,
    description: "The deeper cut — salted black crab adds a briny, savory punch.", price: '$14' },
  { slug: 'som-tum-fresh-shrimp', name: 'Som Tum · Fresh Shrimp', thai: 'ส้มตำไทย กุ้งสด', category: 'salad', spicy: true,
    description: "Sweet poached shrimp over that same bright, fiery crunch.", price: '$14' },
  { slug: 'larb', name: 'Larb', thai: 'ลาบไก่ หมู เนื้อ', category: 'salad', spicy: true,
    description: "Warm minced meat, red onion & chili flakes in a hot-sour dressing, toasted-rice powder for smoky crunch.", price: '$14 / $16',
    variants: ['Chicken or pork $14', 'Beef $16'] },
  { slug: 'nam-tok-salad', name: 'Nam Tok Salad', thai: 'น้ำตกเนื้อย่าง', category: 'salad', spicy: true,
    description: "'Waterfall' beef — grilled rib-eye sliced thin & juicy, tossed with lime, chili, Thai herbs & toasted rice. Cabbage wedge to tame the fire.", price: '$19' },
  { slug: 'thai-sausage', name: 'Thai Sausage (3)', thai: 'ไส้กรอกอีสานย่าง', category: 'grill',
    description: "Three coarse-ground sausages off the grill — snappy casings, juicy centers. Bite with fresh ginger, chili, lime & peanuts.", price: '$14' },
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
      history: 'Suea Rong Hai (เสือร้องไห้) literally means "crying tiger." Most people repeat the romantic version: the steak is so good it would make a tiger cry. The older Isaan story is the opposite — the cut used was traditionally a tough piece of brisket, called the "tiger cry" cut because even a tiger would weep trying to chew it. Pounding it tender, grilling it hard, then slicing thin across the grain was the village fix. Northeastern Thai cooks paired it with jaew — a dipping sauce of toasted rice powder, lime, fish sauce, and a serious amount of chili — and ate it with sticky rice and a bottle of lao khao. Chef Rainny learned it from her uncle, who ran a roadside grill outside Khon Kaen and refused to use anything but rib-eye after he moved to California. "If you can afford the rib-eye," he told her, "the tiger doesn\'t cry anymore." We use his rule.',
      howToEat: "Eat it the Isaan way: roll a small ball of sticky rice between your fingertips, dip it lightly in the jaew, then pick up a slice of beef with the sticky-rice ball and eat the whole thing in one bite. Don't soak the rice in the sauce — the rice should be a spoon, not a sponge. A bite of cabbage between mouthfuls resets your palate.",
      chefNote: 'My uncle said the test of a real crying tiger is the moment after the first bite — the sticky rice, the smoke, the lime, the chili — they should hit one after the other, like a small parade. If they all hit at once, the cook rushed it. If only one hits, the cook was scared of the grill. We are not scared of the grill.',
    },
  },
  { slug: 'tom-yum', name: 'Tom Yum', thai: 'ต้มยำ', category: 'soup', spicy: true, protein: true,
    description: "The famous hot & sour — lemongrass, galangal & kaffir lime steaming from a chili-red broth of straw mushrooms. Bowl $13 · pot $16.", price: '$13 / $16' },
  { slug: 'tom-yum-seafood', name: 'Tom Yum Seafood', thai: 'ต้มยำทะเล', category: 'soup', spicy: true,
    description: "The same famous fire, loaded with ocean treasure — pot for the table.", price: '$25' },
  { slug: 'tom-kha', name: 'Tom Kha', thai: 'ต้มข่า', category: 'soup', signature: true, protein: true,
    description: 'Silky coconut milk mellows hot & sour into something creamy, citrusy & dangerously drinkable. Bowl $14 · pot $17.', price: '$14 / $17',
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
      history: 'Tom kha gai (ต้มข่าไก่) is a Central-Thai everyday soup that became globally famous through Thai restaurants abroad. Its name is literal: tom = boil, kha = galangal, gai = chicken. The defining ingredient is the galangal — a rhizome that looks like ginger\'s cousin but tastes like nothing else: piney, citrusy, slightly soapy in the best way. Chef Rainny\'s family makes it every time someone in the house catches a cold. "Coconut milk for comfort," her mother used to say, "galangal for the medicine, lime for the soul." Most Western menus over-sweeten it and under-spice it. Ours stays closer to the home version: bright, hot enough to wake you up, fragrant enough to be a hug.',
      howToEat: "Tom kha is meant to be eaten with rice — not as a starter on its own. Spoon some of the broth and a few pieces of chicken or shrimp over a small mound of jasmine, mix gently, eat in a single bite. The slices of galangal in the bowl are not for chewing — they're flavor delivery, like a bay leaf. Push them to the side. If it's too spicy, add a small splash of coconut milk from a side dish (just ask); if it's too mild, ask for our nam prik pao chili oil. The lime wedge on top is yours to deploy when it lands.",
      chefNote: "When my mother was sick, she asked for tom kha before she asked for medicine. I think it's because every spoon tastes like the kitchen we grew up in — the same coconut, the same galangal, the same lime hitting the bowl right at the end. I cook it the same way now, in California. The galangal is harder to get here, but I won't substitute. It has to be kha.",
    },
  },
  { slug: 'tom-kha-seafood', name: 'Tom Kha Seafood', thai: 'ต้มข่าทะเล', category: 'soup', signature: true,
    description: "Creamy coconut hot & sour crowded with seafood — pot for the table.", price: '$25' },
  { slug: 'po-tak-seafood', name: 'Po Tak Seafood Soup', thai: 'โป๊ะแตก', category: 'soup', spicy: true,
    description: "'The fish-trap bursts' — a clear, blazing hot & sour broth crowded with seafood & Thai herbs. Pot.", price: '$25' },
  { slug: 'wonton-soup', name: 'Wonton Soup (6 pc)', thai: 'เกี๊ยวน้ำ', category: 'soup',
    description: "Silky pork & shrimp wontons in a clean broth, bean sprouts & green onion — the gentle one at the table.", price: '$13' },
  { slug: 'panang-curry', name: 'Panang Curry', thai: 'พะแนงเนื้อ', category: 'curry', signature: true,
    description: "Thick, sweet-savory panang hugging every bite in coconut cream, red bell pepper & holy basil.", price: '$17 / $32',
    variants: ['Chunk beef $17', 'Dino short ribs $32'] },
  { slug: 'yellow-curry', name: 'Yellow Curry', thai: 'แกงกะหรี่ไก่', category: 'curry',
    description: "Golden, gentle & comforting — slow-cooked chicken and soft potato in a creamy, turmeric-warm curry.", price: '$17' },
  { slug: 'green-curry', name: 'Green Curry', thai: 'แกงเขียวหวาน', category: 'curry', spicy: true, protein: true,
    description: "Herb-green & fragrant — zucchini, eggplant, bell pepper & basil in a lively coconut curry.", price: '$15' },
  { slug: 'house-fried-rice', name: 'Fried Rice', thai: 'ข้าวผัด', category: 'rice', protein: true,
    description: "Wok-fried red rice with egg & green onion, cool cucumber on the side.", price: '$12' },
  { slug: 'spicy-basil-fried-rice', name: 'Spicy Basil Fried Rice', thai: 'ข้าวผัดกะเพรา', category: 'rice', spicy: true, protein: true,
    description: "Krapow heat, fried-rice comfort — chili, garlic & holy basil in every spoonful.", price: '$13' },
  { slug: 'pineapple-fried-rice', name: 'Pineapple Fried Rice', thai: 'ข้าวผัดสับปะรด', category: 'rice', protein: true,
    description: "Sweet pineapple, raisins, tomato & cashews tumbled through egg-fried rice — sweet-savory & addictive.", price: '$15' },
  { slug: 'narwhal-garlic-beef', name: 'Narwhal Garlic Beef', thai: 'ข้าวผัดกระเทียมเนื้อ', category: 'rice', signature: true,
    description: "Our house fried rice — beef seared with a glorious amount of golden garlic, every grain glossy & savory.", price: '$22' },
  { slug: 'crab-fried-rice', name: 'Crab Fried Rice', thai: 'ข้าวผัดปู', category: 'rice', signature: true,
    description: "Sweet crab meat folded through egg-laced rice — light, delicate, ocean-fresh.", price: '$26' },
  { slug: 'garlic-pepper-over-rice', name: 'Garlic & Pepper', thai: 'ผัดกระเทียมพริกไทย', category: 'overrice', protein: true,
    description: "Golden garlic & cracked pepper over steamed rice — simple, savory, done right.", price: '$11' },
  { slug: 'krapow-over-rice', name: 'Krapow · Spicy Basil', thai: 'ผัดกะเพรา', category: 'overrice', spicy: true, protein: true,
    description: "Thailand's lunchtime legend — fiery, fragrant chili & holy basil over rice.", price: '$11' },
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
      history: 'Pad thai is younger than people think. It was popularized in the 1940s by Field Marshal Plaek Phibunsongkhram as part of a national identity campaign — rice was scarce in wartime, noodles ate less of the harvest, and the recipe spread from government cookbooks into every neighborhood. Chef Rainny learned it from her grandmother in Bangkok, who learned it from a noodle vendor in Chantaburi province (the home of chantaboon noodles) in the 1960s. The "OG" in the name is the chef\'s wink at how far the dish has drifted from this original — no ketchup, no peanut butter, no sweet pink sauce. Just the four-flavor balance Thai cooks chase: เปรี้ยว หวาน เค็ม เผ็ด — sour, sweet, salty, hot.',
      howToEat: 'A proper pad thai arrives with a lime wedge, raw bean sprouts, a small pile of dried chili flakes, and sometimes raw banana blossom on the side. Squeeze the lime over everything first. Then taste — if it needs more punch, sprinkle chili; if it needs more crunch, pile on the bean sprouts. The herbs and garnishes aren\'t decoration; they\'re your seat at the cook\'s table. The whole point is that you finish the seasoning to your own tongue.',
      chefNote: 'My grandmother told me: if your pad thai tastes like ketchup, you bought a tourist plate. Real pad thai is sour first, then sweet, then salty, then the chili sneaks in last. The smoke from the wok is the fifth flavor — and you can only get that with real heat. We cook every plate on a 200,000-BTU burner because anything less is a stir-fry, not pad thai.',
    },
  },
  { slug: 'pad-see-ew', name: 'Pad See Ew', thai: 'ผัดซีอิ๊ว', category: 'noodles', protein: true,
    description: "Wide rice noodles seared smoky-sweet in a hot wok, Chinese broccoli & egg.", price: '$12' },
  { slug: 'pad-kee-mao', name: 'Pad Kee Mao — Drunken Noodles', thai: 'ผัดขี้เมา', category: 'noodles', spicy: true, protein: true,
    description: "From a screaming-hot wok — Thai chili, bell pepper & holy basil. Spicy enough to mean it.", price: '$12' },
  { slug: 'thai-boat-noodles', name: 'Thai Boat Noodles', thai: 'ก๋วยเตี๋ยวเรือ', category: 'noodles',
    description: "Slow-simmered beef broth, dark & herbal — tender chunk beef, meatballs, Chinese broccoli & sprouts.", price: '$22' },
  { slug: 'rad-na', name: 'Rad Na', thai: 'ราดหน้า', category: 'noodles', protein: true,
    description: "Wok-charred flat noodles under a silky, peppery gravy with Chinese broccoli — comfort by the ladle.", price: '$16' },
  { slug: 'chow-mein', name: 'Chow Mein', thai: 'บะหมี่ผัด', category: 'noodles', protein: true,
    description: "Springy yakisoba noodles tossed with egg, cabbage, celery & carrot.", price: '$14' },
  { slug: 'spaghetti-kee-mao', name: 'Spaghetti Kee Mao', thai: 'สปาเก็ตตี้ขี้เมา', category: 'noodles', spicy: true, protein: true,
    description: "Drunken noodles gone Italian — spaghetti through a screaming-hot wok, Thai chili, bell pepper & holy basil.", price: '$14' },
  { slug: 'spaghetti-tom-yum', name: 'Spaghetti Tom Yum', thai: 'สปาเก็ตตี้ต้มยำ', category: 'noodles', spicy: true, protein: true,
    description: "Al dente spaghetti tossed in the famous hot & sour — chili paste, lemongrass, kaffir lime & galangal.", price: '$14' },
  { slug: 'garlic-pepper-alacarte', name: 'Garlic & Pepper', thai: 'ผัดกระเทียมพริกไทย', category: 'alacarte', protein: true,
    description: "Golden garlic & cracked white pepper, seared savory.", price: '$16' },
  { slug: 'spicy-basil-alacarte', name: 'Spicy Basil', thai: 'ผัดกะเพรา', category: 'alacarte', spicy: true, protein: true,
    description: "The krapow classic — chili & holy basil, loud & fragrant.", price: '$16' },
  { slug: 'spicy-basil-eggplant', name: 'Spicy Basil Eggplant', thai: 'ผัดกะเพรามะเขือยาว', category: 'alacarte', spicy: true, protein: true,
    description: "The krapow classic over silky, wok-charred eggplant.", price: '$16' },
  { slug: 'chinese-broccoli', name: 'Chinese Broccoli', thai: 'ผัดคะน้า', category: 'alacarte', protein: true,
    description: "Crisp-stemmed greens seared with garlic & oyster sauce.", price: '$16' },
  { slug: 'american-broccoli', name: 'American Broccoli', thai: 'ผัดบร็อกโคลี', category: 'alacarte', protein: true,
    description: "Tender broccoli in a silky gravy.", price: '$16' },
  { slug: 'mixed-vegetables', name: 'Mixed Vegetables', thai: 'ผัดผักรวม', category: 'alacarte', protein: true,
    description: "A hot-wok toss of market vegetables, crisp & glossy.", price: '$16' },
  { slug: 'ong-choy', name: 'Ong Choy', thai: 'ผัดผักบุ้งไฟแดง', category: 'alacarte',
    description: "Morning glory flash-seared over roaring flame — garlic, oyster sauce, crisp stems & glossy leaves.", price: '$16' },
  { slug: 'cashew-nut', name: 'Cashew Nut', thai: 'ผัดเม็ดมะม่วงหิมพานต์', category: 'alacarte', protein: true,
    description: "Buttery roasted cashews, green onion & toasted chilies — the sweet-savory wok classic.", price: '$16' },
  { slug: 'fried-whole-pompano', name: 'Fried Whole Pompano', thai: 'ปลาจะละเม็ดทอดราดพริก', category: 'seafood', signature: true,
    description: "A whole pompano fried until the skin crackles gold, lacquered in sweet chili sauce — bring friends.", price: '$35' },
  { slug: 'white-fish-mango-salad', name: 'White Fish & Mango Salad', thai: 'ปลาทอดยำมะม่วง', category: 'seafood', signature: true,
    description: "Featherweight batter, flaky white fish — a bright, spicy mango salad cuts through every rich bite.", price: '$29' },
  { slug: 'narwhal-sundae', name: 'Narwhal Sundae', thai: 'นาร์วาลซันเดย์', category: 'dessert',
    description: "Choose your ending — vanilla, chocolate or strawberry, a crisp cone & clouds of whipped cream.", price: '$11' },
  { slug: 'mango-sticky-rice', name: 'Mango Sticky Rice', thai: 'ข้าวเหนียวมะม่วง', category: 'dessert',
    description: "Warm sweet sticky rice, cool ripe mango, a river of sweet coconut cream — Thailand's favorite goodbye.", price: '$14' },
  { slug: 'coconut-ice-cream-bread', name: 'Coconut Ice Cream & Bread', thai: 'ไอศกรีมกะทิ ขนมปัง', category: 'dessert', signature: true,
    description: "Bangkok street-style — cool coconut ice cream on soft, pillowy bread.", price: '$12' },
  { slug: 'thai-tea', name: 'Thai Tea', thai: 'ชาไทย', category: 'drinks',
    description: "Strong-brewed, amber-orange, sweet & creamy over ice.", price: '$7' },
  { slug: 'lime-thai-tea', name: 'Lime Thai Tea', thai: 'ชามะนาว', category: 'drinks',
    description: "Thai tea, brightened with fresh lime — sweet, sharp, ice-cold.", price: '$7' },
  { slug: 'thai-green-tea', name: 'Thai Green Tea', thai: 'ชาเขียวไทย', category: 'drinks',
    description: "The emerald cousin — creamy, fragrant, ice-cold.", price: '$7' },
  { slug: 'thai-coffee', name: 'Thai Coffee', thai: 'กาแฟไทย', category: 'drinks',
    description: "Old-school dark roast, sweetened the Thai way.", price: '$7' },
  { slug: 'iced-tea', name: 'Iced Tea', thai: 'ชาดำเย็น', category: 'drinks',
    description: "Clean, cold & endless.", price: '$5' },
  { slug: 'fresh-coconut', name: 'Fresh Coconut', thai: 'มะพร้าวสด', category: 'drinks',
    description: "Young coconut, chilled — straight from the shell.", price: '$8' },
  { slug: 'hot-coffee', name: 'Hot Coffee', thai: 'กาแฟร้อน', category: 'drinks',
    description: "", price: '$4' },
  { slug: 'hot-tea', name: 'Hot Tea', thai: 'ชาร้อน', category: 'drinks',
    description: "", price: '$4' },
  { slug: 'soda', name: 'Soda', thai: 'น้ำอัดลม', category: 'drinks',
    description: "Coke · Diet Coke · Dr Pepper · Sprite.", price: '$4' },
  { slug: 'pink-milk', name: 'Pink Milk', thai: 'นมเย็น', category: 'drinks',
    description: "Icy sala-syrup milk — pink, sweet, pure nostalgia.", price: '$7' },
  { slug: 'passion-fruit', name: 'Passion Fruit', thai: 'น้ำเสาวรส', category: 'drinks',
    description: "Tart-sweet & sunny.", price: '$7' },
  { slug: 'fresh-cucumber', name: 'Fresh Cucumber', thai: 'น้ำแตงกวาสด', category: 'drinks',
    description: "Cool, green & quenching.", price: '$7' },
  { slug: 'pineapple-soda', name: 'Pineapple Soda', thai: 'สับปะรดโซดา', category: 'drinks',
    description: "Golden fruit with sparkle.", price: '$7' },
];

export function getDishBySlug(slug: string): Dish | undefined {
  return DISHES.find(d => d.slug === slug);
}
