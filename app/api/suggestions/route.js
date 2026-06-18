import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Smart predefined suggestions by keyword
const SUGGESTION_MAP = {
  iphone: [
    'iPhone {q} under ₹30,000',
    'Best refurbished iPhone {q} deal',
    'iPhone {q} vs Samsung S24',
    'iPhone {q} lowest price India',
  ],
  samsung: [
    'Samsung {q} under ₹20,000',
    'Samsung {q} best camera phone',
    'Samsung {q} vs OnePlus',
    'Samsung {q} official price India',
  ],
  laptop: [
    '{q} for students under ₹40,000',
    '{q} for gaming under ₹60,000',
    'Best lightweight {q} for office',
    '{q} with best battery life',
  ],
  headphone: [
    'Best noise cancelling {q} under ₹5,000',
    'Wireless {q} under ₹2,000',
    '{q} for gym workout',
    'Sony vs Boat {q}',
  ],
  earphone: [
    'Best TWS {q} under ₹2,000',
    'Wireless {q} with mic under ₹1,500',
    '{q} with best sound quality',
    'boAt vs JBL {q}',
  ],
  shoes: [
    '{q} for running under ₹3,000',
    'Waterproof {q} under ₹2,500',
    'Nike vs Adidas {q}',
    'Best casual {q} under ₹2,000',
  ],
  watch: [
    'Smartwatch {q} under ₹3,000',
    '{q} with health monitoring',
    '{q} with longest battery life',
    'Best fitness {q} under ₹5,000',
  ],
  tv: [
    '{q} 43 inch under ₹30,000',
    '4K {q} under ₹25,000',
    'Best smart {q} for bedroom',
    'Samsung vs LG {q} comparison',
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
    '{q} vs iPad comparison',
  ],
};

function getPatternSuggestions(query) {
  const lower = query.toLowerCase();
  for (const [key, templates] of Object.entries(SUGGESTION_MAP)) {
    if (lower.includes(key)) {
      return templates
        .map((t) => t.replace(/{q}/g, query))
        .slice(0, 5);
    }
  }
  // Generic fallbacks
  return [
    `${query} under ₹5,000`,
    `${query} under ₹10,000`,
    `Best ${query} in India 2024`,
    `${query} with best reviews`,
    `Cheapest ${query} online`,
  ];
}

export async function POST(request) {
  try {
    const { query } = await request.json();
    if (!query || query.trim().length < 2) {
      return Response.json({ suggestions: [] });
    }

    const trimmed = query.trim();

    // Try AI suggestions first (fast & short prompt)
    if (process.env.GEMINI_API_KEY) {
      try {
        const MODEL_CHAIN = ['gemini-2.0-flash-lite', 'gemini-1.5-flash-8b', 'gemini-2.0-flash'];
        for (const modelName of MODEL_CHAIN) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const prompt = `Generate 5 smart shopping search suggestions for an Indian user who typed: "${trimmed}"
Return ONLY a JSON array of 5 short suggestion strings (under 60 chars each). Focus on price ranges in ₹, popular brands, and use cases.
Example: ["iPhone 14 under ₹50,000", "iPhone 14 vs Samsung S23", "Best refurbished iPhone 14"]
Return ONLY the JSON array, nothing else.`;

            const result = await Promise.race([
              model.generateContent(prompt),
              new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
            ]);

            const raw = result.response.text().trim();
            const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const suggestions = JSON.parse(cleaned);
            if (Array.isArray(suggestions) && suggestions.length > 0) {
              return Response.json({ suggestions: suggestions.slice(0, 5), aiPowered: true });
            }
            break;
          } catch (modelErr) {
            if (!modelErr.message?.includes('429') && !modelErr.message?.includes('quota') && !modelErr.message?.includes('404')) break;
          }
        }
      } catch {
        // fall through to pattern suggestions
      }
    }

    // Fallback: pattern-based suggestions
    const suggestions = getPatternSuggestions(trimmed);
    return Response.json({ suggestions, aiPowered: false });
  } catch (error) {
    console.error('Suggestions error:', error);
    return Response.json({ suggestions: [] });
  }
}
