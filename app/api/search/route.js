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

async function searchGoogleShopping(query, maxPrice) {
  try {
    const params = {
      engine: 'google_shopping',
      q: query,
      api_key: serpapi_key,
      gl: 'in',
      hl: 'en',
      num: 20,
    };
    if (maxPrice) {
      params.tbs = `mr:1,price:1,ppr_max:${maxPrice}`;
    }
    const response = await axios.get('https://serpapi.com/search', {
      params,
      timeout: 12000,
    });
    return response.data.shopping_results || [];
  } catch (err) {
    console.error('SerpAPI error:', err.message);
    return [];
  }
}

async function searchGoogleShoppingBroad(query) {
  try {
    const params = {
      engine: 'google_shopping',
      q: query,
      api_key: serpapi_key,
      gl: 'in',
      hl: 'en',
      num: 20,
    };
    const response = await axios.get('https://serpapi.com/search', {
      params,
      timeout: 12000,
    });
    return response.data.shopping_results || [];
  } catch (err) {
    console.error('SerpAPI broad error:', err.message);
    return [];
  }
}

function extractMaxPrice(query) {
  const q = query.toLowerCase();

  // Must match ONLY when a budget keyword OR ₹ is present, to avoid false positives
  // Order matters: lakh before bare 'l', crore before 'cr'

  // "5 lakh", "5lac", "5 l" — only after budget keyword or ₹
  const lakhRe = /(?:under|below|less than|within|budget|upto|up to|[₹])\s*[rs.]*\s*([\d.]+)\s*(?:lakh|lacs?|l)\b/;
  const lakhM = q.match(lakhRe);
  if (lakhM) return Math.round(parseFloat(lakhM[1]) * 100000);

  // "1.5 crore", "2cr"
  const croreRe = /(?:under|below|less than|within|budget|upto|up to|[₹])\s*[rs.]*\s*([\d.]+)\s*(?:crore|cr)\b/;
  const croreM = q.match(croreRe);
  if (croreM) return Math.round(parseFloat(croreM[1]) * 10000000);

  // "50k", "20K"
  const kRe = /(?:under|below|less than|within|budget|upto|up to|[₹])\s*[rs.]*\s*([\d.]+)\s*k\b/;
  const kM = q.match(kRe);
  if (kM) return Math.round(parseFloat(kM[1]) * 1000);

  // Plain number: "under 5000", "₹2000"
  const m =
    query.match(/(?:under|below|less than|within|budget|upto|up to)\s*[₹rs.]*\s*(\d[\d,]*)/i) ||
    query.match(/[₹]\s*(\d[\d,]*)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : null;
}

function findCheapestProductPriceFromHistory(history) {
  if (!history || history.length === 0) return null;
  for (let i = history.length - 1; i >= 0; i--) {
    const h = history[i];
    if (h.role === 'assistant' && h.content) {
      const matches = h.content.match(/(?:₹|rs\.?)\s*(\d[\d,]*)/gi);
      if (matches) {
        const prices = matches.map(m => {
          const val = parseInt(m.replace(/[^\d]/g, ''), 10);
          return val;
        }).filter(p => p > 5000); // Exclude accessories/outliers
        if (prices.length > 0) {
          return Math.min(...prices);
        }
      }
    }
  }
  return null;
}

function fallbackResolveQuery(currentQuery, history) {
  const lower = currentQuery.toLowerCase().trim();
  const genericTerms = [
    'show only top-rated ones', 'show only top rated ones', 'top-rated', 'top rated',
    'find cheaper alternatives', 'find cheaper alternative', 'cheaper', 'cheap',
    'compare features', 'compare',
    'find alternatives', 'find alternative', 'alternatives', 'alternative',
    'find better one', 'find a better one', 'show similar', 'similar option',
    'more options', 'show more'
  ];

  const isGeneric = genericTerms.some(term => lower.includes(term) || term.includes(lower));

  if (isGeneric && history && history.length > 0) {
    // Traverse history backwards to find the last valid non-generic search query
    for (let i = history.length - 1; i >= 0; i--) {
      const h = history[i];
      if (h.role === 'user') {
        const hLower = h.content.toLowerCase();
        const isPastGeneric = genericTerms.some(term => hLower.includes(term) || term.includes(hLower));
        if (!isPastGeneric) {
          let resolved = h.content;
          let maxPrice = extractMaxPrice(h.content);

          const isCheaperRequested = lower.includes('cheaper') || lower.includes('cheap') || lower.includes('budget') || lower.includes('value');

          if (isCheaperRequested) {
            resolved = `budget ${resolved}`;
            const cheapestPrevPrice = findCheapestProductPriceFromHistory(history);
            if (cheapestPrevPrice) {
              // Lower the budget ceiling strictly to 10% below the cheapest item found last time
              maxPrice = Math.floor((cheapestPrevPrice * 0.9) / 1000) * 1000;
              console.log(`[Search Fallback] 'Cheaper' request. Cheapest last item: ₹${cheapestPrevPrice} → new ceiling: ₹${maxPrice}`);
            }
          } else if (lower.includes('top-rated') || lower.includes('top rated') || lower.includes('best')) {
            resolved = `best ${resolved}`;
          } else if (lower.includes('alternative') || lower.includes('similar')) {
            resolved = `alternatives to ${resolved}`;
          } else if (lower.includes('compare')) {
            resolved = `${resolved} comparison`;
          }

          return {
            isFollowUp: true,
            resolvedQuery: resolved,
            maxPrice: maxPrice,
            contextSummary: `Applying "${currentQuery}" to your last search: "${h.content}"`
          };
        }
      }
    }
  }
  return null;
}

/**
 * Use Gemini to resolve follow-up queries like "find alternatives", "cheaper option",
 * "compare these" into a concrete, standalone search query using the chat history.
 */
async function resolveQueryWithHistory(currentQuery, history) {
  if (!history || history.length === 0) return null;

  // Build a readable conversation context from history
  const conversationContext = history
    .slice(-12) // last 12 turns max
    .map((h) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`)
    .join('\n');

  const prompt = `You are a shopping assistant query resolver. 

Previous conversation:
${conversationContext}

Current user message: "${currentQuery}"

Your task:
1. Determine if the current message is a FOLLOW-UP to the conversation (e.g., "find alternatives", "cheaper option", "show me something different", "compare these", "what about under 20k", "find better one", "show similar", etc.)
2. If it IS a follow-up, resolve it into a STANDALONE, specific search query that captures full context (product category, budget if mentioned, preferences).
3. If it is NOT a follow-up (it's a completely new search), just return the original query.
4. Extract any budget constraint from the full context (current message takes priority, else use previous budget if relevant).
   IMPORTANT: If they ask for "cheaper", "cheapest", or "lower budget", set "maxPrice" to be about 10-15% lower than the cheapest product price listed in the last Assistant response.

Reply ONLY with valid JSON (no markdown, no extra text):
{
  "isFollowUp": true or false,
  "resolvedQuery": "the final standalone search query to use",
  "maxPrice": null or a NUMBER in INR (rupees, integer),
  "contextSummary": "1 sentence: what the user is actually looking for"
}

CRITICAL RULES for maxPrice:
- ALWAYS convert budget expressions to a plain integer in INR:
  * "5 lakh" or "5L" or "5lac" = 500000
  * "1.5 lakh" = 150000
  * "10k" or "10K" = 10000
  * "50k" = 50000
  * "1 crore" = 10000000
  * "₹5000" = 5000
- If no budget is mentioned, set maxPrice to null.
- If user says "cheaper" or "lower budget", set maxPrice to ~15% below the cheapest price seen in the last assistant message.`;

  try {
    const raw = await generateWithFallback(prompt);
    const cleaned = raw.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn('Query resolution failed:', err.message?.slice(0, 60));
    return null;
  }
}

export async function POST(request) {
  try {
    const { query, history = [] } = await request.json();

    if (!query?.trim()) {
      return Response.json({ error: 'Please provide a search query.' }, { status: 400 });
    }
    if (!gemini_key) {
      return Response.json({ error: 'GEMINI_API_KEY not set in .env.local' }, { status: 500 });
    }
    if (!serpapi_key) {
      return Response.json({ error: 'SERPAPI_KEY not set in .env.local' }, { status: 500 });
    }

    // ── Step 1: Resolve query using full conversation context ──────────────
    let resolvedQuery = query;
    let maxPrice = extractMaxPrice(query);
    let contextSummary = null;
    let isFollowUp = false;
    let hasFallbackResolved = false;
    let geminiError = false;

    if (history.length > 0) {
      const resolution = await resolveQueryWithHistory(query, history);
      if (resolution) {
        resolvedQuery = resolution.resolvedQuery || query;
        isFollowUp = resolution.isFollowUp || false;
        contextSummary = resolution.contextSummary || null;
        if (!maxPrice && resolution.maxPrice) {
          maxPrice = resolution.maxPrice;
        }
      } else {
        // Fallback rule-based parsing if Gemini fails/unauthorized
        geminiError = true;
        const fallbackRes = fallbackResolveQuery(query, history);
        if (fallbackRes) {
          resolvedQuery = fallbackRes.resolvedQuery;
          isFollowUp = fallbackRes.isFollowUp;
          contextSummary = fallbackRes.contextSummary;
          maxPrice = fallbackRes.maxPrice || maxPrice;
          hasFallbackResolved = true;
        }
      }
    }

    // ── Step 2: Build clean product query for SerpAPI (strip price info) ───
    const cleanQuery = (() => {
      let q = resolvedQuery
        // Remove "under/below X lakh/crore/k" patterns
        .replace(/(?:under|below|less than|within|budget|upto|up to)\s*[₹rs\.]*\s*[\d.]+\s*(?:lakh|lac|crore|cr|k|l)\b/gi, '')
        // Remove "under/below ₹X" or "under X" (plain digits)
        .replace(/(?:under|below|less than|within|budget|upto|up to)\s*[₹rs\.]*\s*\d[\d,]*/gi, '')
        // Remove standalone ₹X
        .replace(/[₹]\s*[\d,]+/g, '')
        // Remove leftover lakh/crore/k if orphaned
        .replace(/\b(?:lakh|lac|crore|cr)\b/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
      // Guard: if stripping left something too short or empty, use full resolvedQuery
      return q.length > 3 ? q : resolvedQuery;
    })();

    console.log(`[Search] Original: "${query}" → Resolved: "${resolvedQuery}" | Budget: ₹${maxPrice} | FollowUp: ${isFollowUp}`);

    // ── Step 3: SerpAPI call + broad fallback if zero raw results ────────────
    let shoppingResults = await searchGoogleShopping(cleanQuery, maxPrice);

    // If SerpAPI returned nothing at all (not a budget issue), try without price cap
    if (shoppingResults.length === 0) {
      console.log(`[Search] Zero raw results, trying broad search for: "${cleanQuery}"`);
      shoppingResults = await searchGoogleShoppingBroad(cleanQuery);
    }

    // ── Step 4: Map results ──────────────────────────────────────────────────
    let products = shoppingResults.map((item) => ({
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

    // ── Step 4b: Apply strict budget filter ──────────────────────────────────
    if (maxPrice && products.length > 0) {
      // Only keep items confirmed within budget (items with no parsed price are excluded)
      const filtered = products.filter(
        (p) => p.extracted_price != null && p.extracted_price <= maxPrice
      );
      // If some results had no price tag at all, include those too (can't verify)
      const noPriceItems = products.filter((p) => p.extracted_price == null);
      products = filtered.length > 0
        ? [...filtered, ...noPriceItems].slice(0, 10)
        : []; // empty → triggers "no results in budget" message
    } else {
      products = products.slice(0, 10);
    }

    // ── Step 5a: No results within budget ─────────────────────────────────
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

      const conversationContext = history.slice(-8).map((h) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n');

      try {
        const prompt = `You are ShopMind AI, an honest Indian shopping assistant.

${history.length > 0 ? `Previous conversation context:\n${conversationContext}\n` : ''}
User's current search: "${query}"
Resolved search: "${resolvedQuery}"
Budget: ₹${maxPrice.toLocaleString('en-IN')}
No products found within this budget.

Reply ONLY with valid JSON (no markdown):
{
  "summary": "1-2 honest sentences explaining why this product can't be found in this budget in India. Reference previous context if it was a follow-up.",
  "alternatives": [
    { "title": "Alternative product name", "reason": "Why it's a good substitute", "approxPrice": "approx price in ₹" }
  ],
  "followUpSuggestions": ["3 alternative searches the user could try, relevant to the conversation"]
}
alternatives: suggest 2-3 REAL products that ARE available within or close to the budget.`;

        const raw = await generateWithFallback(prompt);
        const cleaned = raw.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        noResultsData = { ...noResultsData, ...parsed };
      } catch (err) {
        geminiError = true;
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
        resolvedQuery,
        isFollowUp,
        geminiError,
      });
    }

    // ── Step 5b: No results at all ─────────────────────────────────────────
    if (products.length === 0) {
      return Response.json({
        products: [],
        summary: `No products found for "${resolvedQuery}". Try a different search term.`,
        recommendation: null,
        alternatives: [],
        followUpSuggestions: [
          `Best ${cleanQuery} in India`,
          `${cleanQuery} under ₹10,000`,
          `Popular ${cleanQuery} brands`,
        ],
        noResultsMessage: `No products found for "${resolvedQuery}". Try broadening your search.`,
        searchQuery: cleanQuery,
        resolvedQuery,
        isFollowUp,
        geminiError,
      });
    }

    // ── Step 6: Gemini summary + badges with full conversation context ─────
    const conversationContext = history.length > 0
      ? history.slice(-8).map((h) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n')
      : '';

    let aiData = {
      summary: `Found ${products.length} results for "${resolvedQuery}".`,
      recommendation: 'Check the top-rated option for the best experience.',
      badges: products.map((_, i) => (i === 0 ? 'top' : i === products.length - 1 ? 'budget' : null)),
      followUpSuggestions: ['Show only top-rated ones', 'Find cheaper alternatives', 'Compare features'],
      aiPowered: false,
    };

    try {
      const productList = products
        .map((p, i) => `${i + 1}. ${p.title} | ${p.price || 'N/A'} | ${p.source || ''} | ⭐${p.rating || 'N/A'}`)
        .join('\n');

      const prompt = `You are ShopMind AI, an Indian shopping assistant.
${conversationContext ? `\nConversation so far:\n${conversationContext}\n` : ''}
${isFollowUp ? `This is a FOLLOW-UP search. The user asked: "${query}" → resolved to: "${resolvedQuery}"\n${contextSummary ? `Context: ${contextSummary}` : ''}` : `User asked: "${query}"`}

Products found:
${productList}

Reply ONLY with valid JSON (no markdown):
{
  "summary": "2-sentence overview. If this is a follow-up, acknowledge that and compare/contrast with what was previously discussed.",
  "recommendation": "Best pick and why (1 sentence, referencing user's context if available)",
  "badges": ${JSON.stringify(products.map(() => null))},
  "followUpSuggestions": ["3 short contextual follow-up questions relevant to THIS conversation and THESE results"]
}
badges: "top"=best overall, "value"=best value, "budget"=cheapest good one, null=others. Array must have exactly ${products.length} items.`;

      const raw = await generateWithFallback(prompt);
      const cleaned = raw.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      aiData = { ...aiData, ...parsed, aiPowered: true };
    } catch (err) {
      geminiError = true;
      console.warn('AI summary skipped:', err.message?.slice(0, 60));
    }

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
      resolvedQuery,
      isFollowUp,
      contextSummary,
      aiPowered: aiData.aiPowered,
      geminiError,
    });

  } catch (error) {
    console.error('Search error:', error.message);
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
