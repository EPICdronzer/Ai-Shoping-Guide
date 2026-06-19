import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '@/lib/config';
const gemini_key = config.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(gemini_key);

const MODEL_CHAIN = [
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-8b',
  'gemini-2.0-flash',
  'gemini-1.5-pro-latest',
];

async function chatWithFallback(history, message) {
  let lastError;
  for (const modelName of MODEL_CHAIN) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(message);
      console.log(`✓ Chat used model: ${modelName}`);
      return result.response.text();
    } catch (err) {
      console.warn(`✗ Chat model ${modelName} failed: ${err.message?.slice(0, 80)}`);
      lastError = err;
      if (!err.message?.includes('429') && !err.message?.includes('404') && !err.message?.includes('quota')) {
        break;
      }
    }
  }
  throw lastError;
}

export async function POST(request) {
  try {
    const { message, history = [] } = await request.json();

    if (!message?.trim()) {
      return Response.json({ error: 'Message is required.' }, { status: 400 });
    }

    if (!gemini_key) {
      return Response.json({ error: 'Gemini API key not configured.' }, { status: 500 });
    }

    const systemContext = `You are ShopMind AI, a friendly and knowledgeable shopping assistant specialized in the Indian market. 
You help users find products, compare options, understand prices in INR (₹), and make smart purchase decisions.
Be concise, helpful, and conversational. Keep responses under 150 words unless a detailed comparison is needed.`;

    const chatHistory = [
      { role: 'user', parts: [{ text: systemContext }] },
      { role: 'model', parts: [{ text: 'Understood! I am ShopMind AI, ready to help you find the best products in India.' }] },
      ...history.slice(-10).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    ];

    const reply = await chatWithFallback(chatHistory, message);
    return Response.json({ reply });

  } catch (error) {
    console.error('Chat route error:', error);
    // Friendly quota message
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return Response.json({
        reply: "⚠️ I'm experiencing high demand right now (API quota reached). Please wait a moment and try again, or try searching for a product — search results will still appear!",
      });
    }
    return Response.json({ error: 'Failed to get a response. ' + error.message }, { status: 500 });
  }
}
