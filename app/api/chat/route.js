import { callAIChat } from '@/lib/ai';

export async function POST(request) {
  try {
    const { message, history = [] } = await request.json();

    if (!message?.trim()) {
      return Response.json({ error: 'Message is required.' }, { status: 400 });
    }

    const systemContext = `You are ShopMind AI, a friendly and knowledgeable shopping assistant specialized in the Indian market. 
You help users find products, compare options, understand prices in INR (₹), and make smart purchase decisions.
Be concise, helpful, and conversational. Keep responses under 150 words unless a detailed comparison is needed.`;

    const chatHistory = [
      { role: 'system', content: systemContext },
      ...history.slice(-10).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: message }
    ];

    const reply = await callAIChat(chatHistory);
    return Response.json({ reply });

  } catch (error) {
    console.error('Chat route error:', error);
    const errText = error.message || '';
    if (errText.includes('401') || errText.includes('Unauthorized') || errText.includes('auth') || errText.includes('credentials')) {
      return Response.json({
        reply: "⚠️ **API key authorization failed.** Please replace the `GEMINI_API_KEY` in your `.env.local` or `lib/config.js` with a valid OpenRouter API key (starting with `sk-or-v1-`).",
      });
    }
    if (errText.includes('429') || errText.includes('quota')) {
      return Response.json({
        reply: "⚠️ OpenRouter API quota reached or rate-limited. Please wait a moment and try again.",
      });
    }
    return Response.json({ reply: '⚠️ Failed to get a response: ' + errText });
  }
}
