// API Keys Configuration
// These are read from environment variables first (for local dev via .env.local)
// and fall back to the hardcoded values (for Netlify deployment via git)

const config = {
  GEMINI_API_KEY:
    process.env.GEMINI_API_KEY || "",

  SERPAPI_KEY:
    process.env.SERPAPI_KEY ||
    "9e0af038e276e3320c2a02141b7a95d8f35ffc3beb1ee7bf3a86b13f8a6e950e",
};

export default config;
