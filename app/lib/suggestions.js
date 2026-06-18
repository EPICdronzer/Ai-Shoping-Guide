// Pure client-side suggestions — NO API calls, NO quota usage
// Expands typed query into smart shopping suggestions using pattern matching

const CATEGORY_TEMPLATES = {
  iphone: [
    'iPhone {q} under ₹30,000',
    'iPhone {q} best price India',
    'Refurbished iPhone {q} under ₹20,000',
    'iPhone {q} vs Samsung S24',
    'iPhone {q} features and specs',
  ],
  samsung: [
    'Samsung {q} under ₹20,000',
    'Samsung {q} best camera phone',
    'Samsung {q} vs OnePlus',
    'Samsung {q} official price India',
    'Samsung {q} deals online',
  ],
  redmi: [
    'Redmi {q} under ₹15,000',
    'Redmi {q} with best battery',
    'Redmi {q} vs Realme',
    'Best Redmi {q} deal on Flipkart',
  ],
  realme: [
    'Realme {q} under ₹12,000',
    'Realme {q} best buy India',
    'Realme {q} vs Redmi comparison',
  ],
  oneplus: [
    'OnePlus {q} under ₹25,000',
    'OnePlus {q} price drop',
    'OnePlus {q} vs Samsung',
  ],
  laptop: [
    '{q} under ₹30,000 for students',
    '{q} for gaming under ₹60,000',
    'Lightweight {q} for office under ₹40,000',
    '{q} with best battery life',
    'Best {q} brand in India 2024',
  ],
  headphone: [
    'Best noise-cancelling {q} under ₹5,000',
    'Wireless {q} under ₹2,000',
    '{q} for gym workout',
    'Sony vs boAt {q}',
    'Best {q} for music under ₹3,000',
  ],
  earphone: [
    'Best TWS {q} under ₹2,000',
    'Wireless {q} with mic under ₹1,500',
    '{q} with best sound quality',
    'boAt vs JBL {q}',
  ],
  shoe: [
    '{q} for running under ₹3,000',
    'Waterproof {q} under ₹2,500',
    'Nike vs Adidas {q}',
    'Best casual {q} under ₹2,000',
  ],
  watch: [
    'Smartwatch under ₹3,000 with health tracking',
    '{q} with longest battery life',
    'Best fitness {q} under ₹5,000',
    '{q} vs Apple Watch',
  ],
  tv: [
    '43 inch {q} under ₹30,000',
    '4K {q} under ₹25,000',
    'Best smart {q} for bedroom',
    'Samsung vs LG {q}',
  ],
  camera: [
    'DSLR {q} for beginners under ₹30,000',
    'Best mirrorless {q} under ₹50,000',
    'Action {q} under ₹15,000',
    '{q} with best low light performance',
  ],
  tablet: [
    '{q} for students under ₹15,000',
    '{q} with stylus pen',
    'Best Android {q} under ₹20,000',
    '{q} vs iPad',
  ],
  keyboard: [
    'Mechanical {q} under ₹3,000',
    'Wireless {q} under ₹2,000',
    'Best gaming {q} India',
  ],
  mouse: [
    'Gaming {q} under ₹1,500',
    'Wireless {q} under ₹1,000',
    'Ergonomic {q} for office',
  ],
  bag: [
    'Laptop {q} under ₹1,500',
    'Waterproof {q} for college',
    'Best {q} brand under ₹2,000',
  ],
  ac: [
    '1.5 ton {q} under ₹30,000',
    'Best inverter {q} India',
    'Split {q} under ₹25,000',
  ],
  refrigerator: [
    'Double door {q} under ₹25,000',
    'Best {q} brand India',
    '{q} under ₹15,000',
  ],
};

const GENERIC_TEMPLATES = [
  '{q} under ₹5,000',
  '{q} under ₹10,000',
  'Best {q} in India 2024',
  '{q} with best reviews',
  'Cheapest {q} online India',
  '{q} on sale now',
];

export function getClientSuggestions(query) {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim();
  const lower = q.toLowerCase();

  for (const [key, templates] of Object.entries(CATEGORY_TEMPLATES)) {
    if (lower.includes(key)) {
      return templates
        .map((t) => t.replace(/{q}/g, q))
        .slice(0, 5);
    }
  }

  // Generic fallbacks
  return GENERIC_TEMPLATES.map((t) => t.replace(/{q}/g, q)).slice(0, 5);
}
