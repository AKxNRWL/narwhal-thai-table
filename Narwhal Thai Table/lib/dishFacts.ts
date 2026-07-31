/**
 * Per-dish ingredient facts for Aileen.
 *
 * Source of truth policy:
 *  - `key` = the MAIN customer-facing ingredients (not exhaustive recipes).
 *  - `allergens` = major allergens we are confident about from the standard
 *    recipe. Thai kitchens use fish sauce, shrimp paste, soy sauce and shared
 *    woks/fryers everywhere, so the chatbot must ALWAYS add a cross-contact
 *    caveat and route severe-allergy guests to staff.
 *  - When the kitchen recipe cards (HQ Kitchen Lab) are fully awakened this
 *    file can be regenerated from the live BOM instead of this curated list.
 *
 * Allergen tags used: fish (incl. fish sauce), shellfish, peanut, tree nut,
 * coconut, egg, gluten (wheat / regular soy sauce), soy, dairy, sesame.
 */

export interface DishFacts {
  /** Main ingredients, short customer-friendly list. */
  key: string;
  /** Major allergens present in the standard recipe. */
  allergens: string[];
}

export const DISH_FACTS: Record<string, DishFacts> = {
  // ---------- Appetizers ----------
  'narwhal-chicken-wings': { key: 'chicken wings, garlic, white pepper, Thai house seasoning, fried', allergens: ['fish (fish sauce)', 'gluten (batter)'] },
  'chicken-wings': { key: 'chicken wings, light batter, fried', allergens: ['gluten (batter)'] },
  'thai-fish-cake': { key: 'fish, red curry paste, green beans, kaffir lime leaf; cucumber relish with crushed peanuts', allergens: ['fish', 'egg', 'peanut (relish)', 'shellfish (curry paste may contain shrimp paste)'] },
  'crispy-spring-rolls': { key: 'ground pork, cabbage, carrot, glass noodles, wheat wrapper, fried', allergens: ['gluten (wrapper)', 'soy'] },
  'vegetable-spring-rolls': { key: 'cabbage, carrot, glass noodles, wheat wrapper, fried', allergens: ['gluten (wrapper)', 'soy'] },
  'calamari': { key: 'squid rings, seasoned batter, fried', allergens: ['shellfish (squid)', 'gluten (batter)'] },
  'shrimp-tempura': { key: 'shrimp, light tempura batter, fried', allergens: ['shellfish (shrimp)', 'gluten (batter)', 'egg'] },
  'fresh-spring-rolls': { key: 'rice paper, glass noodles, ground chicken & tofu, lettuce, cucumber, carrot, basil', allergens: ['soy (tofu)', 'peanut (dipping sauce - ask staff)'] },
  'house-salad': { key: 'mixed greens, cucumber, tomato, dried cranberries, Thai dressing', allergens: ['fish (dressing)'] },
  'rib-eye-salad': { key: 'grilled rib-eye, mixed greens, radish, green onion, mint, Thai herb dressing', allergens: ['fish (dressing)'] },

  // ---------- Papaya Salad ----------
  'som-tum-thai': { key: 'green papaya, dried shrimp, peanuts, tomato, green beans, lime, chili, fish sauce', allergens: ['shellfish (dried shrimp)', 'peanut', 'fish (fish sauce)'] },
  'som-tum-black-crab': { key: 'green papaya, salted black crab, tomato, green beans, lime, chili, fish sauce', allergens: ['shellfish (crab)', 'fish (fish sauce)'] },
  'som-tum-fresh-shrimp': { key: 'green papaya, poached shrimp, tomato, green beans, lime, chili, fish sauce', allergens: ['shellfish (shrimp)', 'fish (fish sauce)'] },

  // ---------- Larb / BBQ ----------
  'larb': { key: 'minced meat (choice of protein), red onion, chili flakes, lime, toasted rice powder, fish sauce, herbs', allergens: ['fish (fish sauce)'] },
  'nam-tok-salad': { key: 'grilled rib-eye, lime, chili, Thai herbs, toasted rice powder, cabbage', allergens: ['fish (fish sauce)'] },
  'thai-sausage': { key: 'coarse-ground pork sausage, served with fresh ginger, chili, lime, peanuts', allergens: ['peanut (garnish)', 'fish (fish sauce)'] },
  'crying-tiger': { key: 'char-grilled rib-eye, smoky tamarind-toasted rice dipping sauce, mint', allergens: ['fish (fish sauce)'] },

  // ---------- Soup ----------
  'tom-yum': { key: 'hot & sour broth, lemongrass, galangal, kaffir lime, straw mushrooms, chili paste, choice of protein', allergens: ['fish (fish sauce)', 'shellfish (chili paste may contain dried shrimp)'] },
  'tom-yum-seafood': { key: 'hot & sour broth, mixed seafood, lemongrass, galangal, kaffir lime, mushrooms', allergens: ['shellfish', 'fish'] },
  'tom-kha': { key: 'coconut milk broth, galangal, lemongrass, kaffir lime, mushrooms, choice of protein', allergens: ['coconut', 'fish (fish sauce)'] },
  'tom-kha-seafood': { key: 'coconut milk broth, mixed seafood, galangal, lemongrass, kaffir lime', allergens: ['coconut', 'shellfish', 'fish'] },
  'po-tak-seafood': { key: 'clear spicy-sour herb broth, mixed seafood, Thai basil, lemongrass, galangal', allergens: ['shellfish', 'fish'] },
  'wonton-soup': { key: 'pork & shrimp wontons (wheat wrapper), clear broth, bean sprouts, green onion', allergens: ['shellfish (shrimp)', 'gluten (wrapper)', 'egg (wrapper)', 'soy'] },

  // ---------- Curry ----------
  'panang-curry': { key: 'panang curry paste, coconut cream, red bell pepper, basil, choice of protein', allergens: ['coconut', 'shellfish (curry paste contains shrimp paste)', 'fish (fish sauce)', 'peanut (paste may contain)'] },
  'yellow-curry': { key: 'yellow curry, coconut milk, chicken, potato, onion', allergens: ['coconut', 'fish (fish sauce)'] },
  'green-curry': { key: 'green curry paste, coconut milk, zucchini, Thai eggplant, bell pepper, basil, choice of protein', allergens: ['coconut', 'shellfish (curry paste contains shrimp paste)', 'fish (fish sauce)'] },

  // ---------- Rice ----------
  'house-fried-rice': { key: 'wok-fried jasmine/red rice, egg, green onion, cucumber', allergens: ['egg', 'soy', 'gluten (soy sauce)'] },
  'spicy-basil-fried-rice': { key: 'fried rice, chili, garlic, holy basil', allergens: ['egg', 'soy', 'gluten (soy sauce)', 'fish (fish sauce)'] },
  'pineapple-fried-rice': { key: 'fried rice, pineapple, raisins, tomato, cashews, egg', allergens: ['tree nut (cashew)', 'egg', 'soy', 'gluten (soy sauce)'] },
  'narwhal-garlic-beef': { key: 'fried rice, seared beef, golden fried garlic, egg', allergens: ['egg', 'soy', 'gluten (soy sauce)'] },
  'crab-fried-rice': { key: 'fried rice, real crab meat, egg, green onion', allergens: ['shellfish (crab)', 'egg', 'soy', 'gluten (soy sauce)'] },

  // ---------- Over Rice ----------
  'garlic-pepper-over-rice': { key: 'choice of protein stir-fried with golden garlic & cracked white pepper, over rice', allergens: ['soy', 'gluten (soy sauce)', 'fish (oyster/fish sauce)'] },
  'krapow-over-rice': { key: 'choice of protein stir-fried with chili, garlic & holy basil, over rice (add fried egg optional)', allergens: ['fish (fish sauce)', 'soy', 'gluten (soy sauce)', 'egg (if added)'] },

  // ---------- Noodles ----------
  'og-pad-thai': { key: 'rice noodles, tamarind sauce, egg, bean sprouts, chives, crushed peanuts, lime, choice of protein', allergens: ['peanut', 'egg', 'fish (fish sauce)', 'shellfish (may contain dried shrimp)'] },
  'pad-see-ew': { key: 'wide rice noodles, sweet dark soy, Chinese broccoli, egg, choice of protein', allergens: ['egg', 'soy', 'gluten (soy sauce)'] },
  'pad-kee-mao': { key: 'wide rice noodles, Thai chili, garlic, bell pepper, holy basil, choice of protein', allergens: ['soy', 'gluten (soy sauce)', 'fish (fish sauce)'] },
  'thai-boat-noodles': { key: 'slow-simmered herbal beef broth, chunk beef, meatballs, rice noodles, Chinese broccoli, bean sprouts', allergens: ['soy', 'gluten', 'fish (fish sauce)'] },
  'rad-na': { key: 'wok-charred flat rice noodles, silky pepper gravy, Chinese broccoli, choice of protein', allergens: ['soy (soybean paste)', 'gluten (soy sauce)', 'fish (oyster sauce)'] },
  'chow-mein': { key: 'yakisoba wheat noodles, egg, cabbage, celery, carrot, choice of protein', allergens: ['gluten (wheat noodles)', 'egg', 'soy'] },
  'spaghetti-kee-mao': { key: 'spaghetti, Thai chili, garlic, bell pepper, holy basil, choice of protein', allergens: ['gluten (wheat pasta)', 'soy', 'fish (fish sauce)'] },
  'spaghetti-tom-yum': { key: 'spaghetti, tom yum chili paste, lemongrass, kaffir lime, galangal, choice of protein', allergens: ['gluten (wheat pasta)', 'shellfish (chili paste)', 'fish (fish sauce)'] },

  // ---------- A La Carte ----------
  'spicy-basil-alacarte': { key: 'choice of protein stir-fried with chili & holy basil', allergens: ['fish (fish sauce)', 'soy', 'gluten (soy sauce)'] },
  'garlic-pepper-alacarte': { key: 'choice of protein stir-fried with golden garlic & cracked white pepper', allergens: ['soy', 'gluten (soy sauce)', 'fish (oyster/fish sauce)'] },
  'spicy-basil-eggplant': { key: 'wok-charred eggplant, chili, holy basil', allergens: ['soy', 'gluten (soy sauce)', 'fish (fish sauce)'] },
  'chinese-broccoli': { key: 'Chinese broccoli, garlic, oyster sauce', allergens: ['shellfish (oyster sauce)', 'soy', 'gluten (soy sauce)'] },
  'american-broccoli': { key: 'broccoli, light gravy', allergens: ['shellfish (oyster sauce)', 'soy', 'gluten (soy sauce)'] },
  'mixed-vegetables': { key: 'market vegetables, light stir-fry sauce', allergens: ['shellfish (oyster sauce)', 'soy', 'gluten (soy sauce)'] },
  'ong-choy': { key: 'morning glory, garlic, soybean paste, oyster sauce, flash-seared', allergens: ['shellfish (oyster sauce)', 'soy (soybean paste)', 'gluten (soy sauce)'] },
  'cashew-nut': { key: 'choice of protein, roasted cashews, green onion, toasted chilies, sweet-savory sauce', allergens: ['tree nut (cashew)', 'soy', 'gluten (soy sauce)', 'fish (oyster sauce)'] },

  // ---------- Poseidon ----------
  'fried-whole-pompano': { key: 'whole pompano fish, fried crisp, sweet chili glaze', allergens: ['fish', 'gluten (glaze)'] },
  'white-fish-mango-salad': { key: 'battered white fish, spicy fresh mango salad, red onion, cashew', allergens: ['fish', 'gluten (batter)', 'tree nut (cashew)'] },

  // ---------- Sides ----------
  'jasmine-rice': { key: 'steamed jasmine rice', allergens: [] },
  'brown-rice': { key: 'steamed brown rice', allergens: [] },
  'sticky-rice': { key: 'steamed Thai sticky rice', allergens: [] },
  'fried-egg': { key: 'crispy-edge fried egg', allergens: ['egg'] },
  'omelet': { key: 'Thai-style omelet', allergens: ['egg', 'fish (fish sauce)'] },

  // ---------- Dessert ----------
  'narwhal-sundae': { key: 'ice cream (vanilla / chocolate / strawberry), crisp cone, whipped cream', allergens: ['dairy', 'gluten (cone)', 'egg (may contain)'] },
  'mango-sticky-rice': { key: 'sweet sticky rice, ripe mango, sweet coconut cream', allergens: ['coconut'] },
  'coconut-ice-cream-bread': { key: 'coconut ice cream, soft bread', allergens: ['coconut', 'gluten (bread)', 'dairy (may contain)'] },

  // ---------- Drinks ----------
  'thai-tea': { key: 'strong-brewed Thai tea, sweetened milk, over ice', allergens: ['dairy'] },
  'lime-thai-tea': { key: 'Thai tea, fresh lime, over ice (no milk)', allergens: [] },
  'thai-green-tea': { key: 'Thai green tea, sweetened milk, over ice', allergens: ['dairy'] },
  'thai-coffee': { key: 'Thai dark-roast coffee, sweetened milk, over ice', allergens: ['dairy'] },
  'iced-tea': { key: 'plain brewed iced tea', allergens: [] },
  'hot-coffee': { key: 'hot brewed coffee', allergens: [] },
  'hot-tea': { key: 'hot Thai tea', allergens: [] },
  'fresh-coconut': { key: 'chilled young coconut', allergens: ['coconut'] },
  'soda': { key: 'Coke / Diet Coke / Dr Pepper / Sprite', allergens: [] },
  'pink-milk': { key: 'sala syrup, milk, over ice', allergens: ['dairy'] },
  'passion-fruit': { key: 'passion fruit juice', allergens: [] },
  'fresh-cucumber': { key: 'fresh cucumber juice', allergens: [] },
  'pineapple-soda': { key: 'pineapple juice, sparkling soda', allergens: [] },
};

/** One-line ingredient/allergen note for a dish, or '' if unknown. */
export function dishFactsLine(slug: string): string {
  const f = DISH_FACTS[slug];
  if (!f) return '';
  const al = f.allergens.length ? ` | allergens: ${f.allergens.join(', ')}` : ' | allergens: none of the major 9 in standard recipe';
  return `    ingredients: ${f.key}${al}`;
}
