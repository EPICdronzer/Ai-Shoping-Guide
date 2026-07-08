// OpenRouter AI helper
// Works both client-side and server-side

export async function callAI(prompt, systemPrompt = '') {
  const apiKey = (typeof window === 'undefined'
    ? process.env.GEMINI_API_KEY
    : process.env.NEXT_PUBLIC_GEMINI_API_KEY) || '';

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "AI Web App"
    },
    body: JSON.stringify({
      model: "google/gemma-4-31b-it:free",
      messages: messages
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP error ${response.status}`);
  }

  const data = await response.json();
  if (!data.choices || data.choices.length === 0) {
    throw new Error("No choices returned from OpenRouter API.");
  }
  return data.choices[0].message.content;
}

export async function callAIChat(messages) {
  const apiKey = (typeof window === 'undefined'
    ? process.env.GEMINI_API_KEY
    : process.env.NEXT_PUBLIC_GEMINI_API_KEY) || '';

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "AI Web App"
    },
    body: JSON.stringify({
      model: "google/gemma-4-31b-it:free",
      messages: messages
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP error ${response.status}`);
  }

  const data = await response.json();
  if (!data.choices || data.choices.length === 0) {
    throw new Error("No choices returned from OpenRouter API.");
  }
  return data.choices[0].message.content;
}
