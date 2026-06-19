import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import config from '@/lib/config';
const gemini_key = config.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(gemini_key);

const MODEL_CHAIN = [
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-8b',
  'gemini-2.0-flash',
];

// ONE Gemini call that does BOTH intent parsing + summary/ranking
async function generateWithFallback(prompt) {
  let lastError;
  for (const modelName of MODEL_CHAIN) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      console.log(`✓ Model: ${modelName}`);
      return result.response.text();
    } catch (err) {
      console.warn(`✗ ${modelName}: ${err.message?.slice(0, 60)}`);
      lastError = err;
      if (!err.message?.includes('429') && !err.message?.includes('404') && !err.message?.includes('quota')) break;
    }
  }
  throw lastError;
}
const serpapi_key = config.SERPAPI_KEY;
// SINGLE SerpAPI call — only Google Shopping
async function searchGoogleShopping(query, maxPrice) {
  try {
    const params = {
      engine: 'google_shopping',
      q: query,
      api_key: serpapi_key,
      gl: 'in',
      hl: 'en',
      num: 10,
    };

    // Pass price ceiling directly to Google Shopping so results come pre-filtered
    if (maxPrice) {
      params.tbs = `mr:1,price:1,ppr_max:${maxPrice}`;
    }

    const response = await axios.get('https://serpapi.com/search', {
      params,
      timeout: 10000,
    });
    return response.data.shopping_results || [];
  } catch (err) {
    console.error('SerpAPI error:', err.message);
    return [];
  }
}

// Extract max price from text using regex (no AI needed)
function extractMaxPrice(query) {
  const m = query.match(/(?:under|below|less than|within|budget|upto|up to)\s*[₹rs\.]*\s*(\d[\d,]*)/i)
    || query.match(/[₹]\s*(\d[\d,]*)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : null;
}

export async function POST(request) {
  try {
    const { query } = await request.json();

    if (!query?.trim()) {
      return Response.json({ error: 'Please provide a search query.' }, { status: 400 });
    }
    if (!gemini_key) {
      return Response.json({ error: 'GEMINI_API_KEY not set in .env.local' }, { status: 500 });
    }
    if (!serpapi_key) {
      return Response.json({ error: 'SERPAPI_KEY not set in .env.local' }, { status: 500 });
    }

    // ── Step 1: Extract clean search query (regex, no AI) ──────────
    const maxPrice = extractMaxPrice(query);
    const cleanQuery = query
      .replace(/(?:under|below|less than|within|budget|upto|up to)\s*[₹rs\.]*\s*\d[\d,]*/gi, '')
      .replace(/[₹]\s*\d[\d,]*/g, '')
      .trim() || query;

    // ── Step 2: ONE SerpAPI call (with price cap baked in) ─────────
    const shoppingResults = await searchGoogleShopping(cleanQuery, maxPrice);

    // ── Step 3: Map + strict price-filter ──────────────────────────
    let products = shoppingResults.slice(0, 10).map((item) => ({
      title: item.title,
      price: item.price,
      extracted_price: item.extracted_price,
      source: item.source,
      link: item.link || item.product_link,
      thumbnail: item.thumbnail,
      rating: item.rating,
      reviews: item.reviews,
      badge: null,
    }));

    if (maxPrice && products.length > 0) {
      // Only keep products whose price is known AND within budget
      const filtered = products.filter(
        (p) => p.extracted_price && p.extracted_price <= maxPrice
      );
      // If nothing passes the budget filter, keep products empty —
      // NEVER fall back to out-of-budget items
      products = filtered;
    }
    products = products.slice(0, 6);

    // ── Step 4a: No results within budget → honest AI response ─────
    if (products.length === 0 && maxPrice) {
      let noResultsData = {
        summary: `We couldn't find any reliable results for "${cleanQuery}" under ₹${maxPrice.toLocaleString('en-IN')}. This budget may not be realistic for this product.`,
        alternatives: [],
        followUpSuggestions: [
          `Best ${cleanQuery} under ₹${(maxPrice * 2).toLocaleString('en-IN')}`,
          `Budget alternatives to ${cleanQuery}`,
          `Refurbished ${cleanQuery} under ₹${maxPrice.toLocaleString('en-IN')}`,
        ],
      };

      try {
        const prompt = `You are ShopMind AI, an honest Indian shopping assistant.

A user searched: "${query}"

No products were found within ₹${maxPrice.toLocaleString('en-IN')} budget.

Reply ONLY with valid JSON (no markdown):
{
  "summary": "1-2 honest sentences explaining why this product can't be found in this budget in India (e.g. minimum price, market reality)",
  "alternatives": [
    { "title": "Alternative product name", "reason": "Why it's a good substitute", "approxPrice": "approx price in ₹" }
  ],
  "followUpSuggestions": ["3 alternative searches the user could try"]
}
alternatives: suggest 2-3 REAL products that ARE available within or close to the budget. Do NOT make up products.`;

        const raw = await generateWithFallback(prompt);
        const cleaned = raw.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        noResultsData = { ...noResultsData, ...parsed };
      } catch (err) {
        console.warn('No-results AI skipped:', err.message?.slice(0, 60));
      }

      return Response.json({
        products: [],
        summary: noResultsData.summary,
        recommendation: null,
        alternatives: noResultsData.alternatives || [],
        followUpSuggestions: noResultsData.followUpSuggestions || [],
        noResultsMessage: noResultsData.summary,
        budgetNotRealistic: true,
        searchQuery: cleanQuery,
      });
    }

    // ── Step 4b: No results at all (no budget query) ───────────────
    if (products.length === 0) {
      return Response.json({
        products: [],
        summary: `No products found for "${query}". Try a different search term.`,
        recommendation: null,
        alternatives: [],
        followUpSuggestions: [`Best ${cleanQuery} in India`, `${cleanQuery} under ₹10,000`, `Popular ${cleanQuery} brands`],
        noResultsMessage: `No products found for "${query}". Try broadening your search.`,
        searchQuery: cleanQuery,
      });
    }

    // ── Step 5: Normal flow — Gemini summary + badges ───────────────
    let aiData = {
      summary: `Found ${products.length} results for "${query}".`,
      recommendation: 'Check the top-rated option for the best experience.',
      badges: products.map((_, i) => (i === 0 ? 'top' : i === products.length - 1 ? 'budget' : null)),
      followUpSuggestions: ['Show only top-rated ones', 'Find cheaper alternatives', 'Compare features'],
      aiPowered: false,
    };

    try {
      const productList = products
        .map((p, i) => `${i + 1}. ${p.title} | ${p.price || 'N/A'} | ${p.source || ''} | ⭐${p.rating || 'N/A'}`)
        .join('\n');

      const prompt = `You are ShopMind AI, an Indian shopping assistant. User asked: "${query}"

Products found:
${productList}

Reply ONLY with valid JSON (no markdown):
{
  "summary": "2-sentence overview with price range and key insight",
  "recommendation": "Best pick and why (1 sentence)",
  "badges": ${JSON.stringify(products.map(() => null))},
  "followUpSuggestions": ["3 short follow-up questions"]
}
badges: "top"=best overall, "value"=best value, "budget"=cheapest good one, null=others. Array must have ${products.length} items.`;

      const raw = await generateWithFallback(prompt);
      const cleaned = raw.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      aiData = { ...aiData, ...parsed, aiPowered: true };
    } catch (err) {
      console.warn('AI summary skipped:', err.message?.slice(0, 60));
    }

    // Apply badges
    if (Array.isArray(aiData.badges) && aiData.badges.length === products.length) {
      products = products.map((p, i) => ({ ...p, badge: aiData.badges[i] || null }));
    }

    return Response.json({
      products,
      summary: aiData.summary,
      recommendation: aiData.recommendation,
      alternatives: [],
      followUpSuggestions: aiData.followUpSuggestions || [],
      noResultsMessage: null,
      searchQuery: cleanQuery,
      apiCalls: 2,
    });

  } catch (error) {
    console.error('Search error:', error.message);
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
