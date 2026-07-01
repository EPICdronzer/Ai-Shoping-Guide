'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ProductCard from '../components/ProductCard';
import TypingIndicator from '../components/TypingIndicator';
import SuggestionChips from '../components/SuggestionChips';
import CompareModal from '../components/CompareModal';
import { getClientSuggestions } from '../lib/suggestions';

const WELCOME_MSG = {
  id: 'welcome',
  role: 'bot',
  type: 'text',
  content: "👋 Hi! I'm **ShopMind AI** — your personal shopping assistant.\n\nJust describe what you're looking for, like *\"waterproof running shoes under ₹3000\"* or *\"best gaming laptop under ₹60,000\"* and I'll search the web, compare results, and give you a clean summary instantly!",
  time: new Date(),
};

function formatTime(d) {
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}

/* ─────────────────────────────────────────────
   CLARIFY CARD — multi-question chip selector
   ───────────────────────────────────────────── */
function ClarifyCard({ originalQuery, questions, onSearch }) {
  const [answers, setAnswers] = useState({});

  const pick = (qId, chip) => {
    setAnswers(prev => ({ ...prev, [qId]: chip }));
  };

  const composeQuery = () => {
    const budget = answers.budget && answers.budget !== 'No limit' ? answers.budget : '';
    const usecase = answers.usecase || '';
    const brand = answers.brand && answers.brand !== 'No preference' ? answers.brand : '';
    const parts = [originalQuery, usecase, brand, budget].filter(Boolean);
    return parts.join(' ').replace(/\s{2,}/g, ' ').trim();
  };

  const readyToSearch = questions.length === 0 || Object.keys(answers).length > 0;

  return (
    <div className="clarify-card">
      <div className="clarify-card-header">
        <span className="clarify-icon">🎯</span>
        <div>
          <div className="clarify-title">Help me find exactly what you need</div>
          <div className="clarify-subtitle">You searched for <strong>"{originalQuery}"</strong> — answer a few quick questions for better results</div>
        </div>
      </div>

      <div className="clarify-questions">
        {questions.map((q) => (
          <div key={q.id} className="clarify-question-block">
            <div className="clarify-question-label">
              {q.id === 'budget' ? '💰' : q.id === 'usecase' ? '🎯' : '🏷️'}
              {q.question}
            </div>
            <div className="clarify-chips-row">
              {q.chips.map((chip) => (
                <button
                  key={chip}
                  className={`clarify-chip ${answers[q.id] === chip ? 'selected' : ''}`}
                  onClick={() => pick(q.id, chip)}
                >
                  {answers[q.id] === chip && <span className="clarify-check">✓ </span>}
                  {chip}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="clarify-footer">
        {readyToSearch && (
          <div className="clarify-preview">
            🔍 Will search: <strong>"{composeQuery()}"</strong>
          </div>
        )}
        <div className="clarify-actions">
          <button
            className="clarify-skip-btn"
            onClick={() => onSearch(originalQuery)}
          >
            Skip — search as-is
          </button>
          <button
            className="clarify-search-btn"
            onClick={() => onSearch(composeQuery())}
            disabled={!readyToSearch}
          >
            Search →
          </button>
        </div>
      </div>
    </div>
  );
}

function highlightMatch(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="autocomplete-match">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

const SEARCH_ICONS = ['👟', '💻', '📱', '🎧', '⌚', '📷', '🖥️', '🎮', '👕', '🎒'];
function getIcon(text) {
  const t = text.toLowerCase();
  if (t.includes('shoe') || t.includes('sneaker') || t.includes('boot')) return '👟';
  if (t.includes('laptop') || t.includes('notebook')) return '💻';
  if (t.includes('phone') || t.includes('mobile') || t.includes('iphone') || t.includes('samsung')) return '📱';
  if (t.includes('headphone') || t.includes('earphone') || t.includes('airpod') || t.includes('earbud')) return '🎧';
  if (t.includes('watch')) return '⌚';
  if (t.includes('camera')) return '📷';
  if (t.includes('tv') || t.includes('monitor') || t.includes('screen')) return '🖥️';
  if (t.includes('gaming') || t.includes('game')) return '🎮';
  if (t.includes('bag') || t.includes('backpack')) return '🎒';
  if (t.includes('tablet') || t.includes('ipad')) return '📟';
  return '🔍';
}

export default function Home() {
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [compareProducts, setCompareProducts] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const handleCompareToggle = useCallback((product) => {
    setCompareProducts((prev) => {
      const exists = prev.some((p) => p.title === product.title && p.price === product.price);
      if (exists) {
        return prev.filter((p) => !(p.title === product.title && p.price === product.price));
      } else {
        if (prev.length >= 3) {
          alert("You can compare up to 3 products at a time.");
          return prev;
        }
        return [...prev, product];
      }
    });
  }, []);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const inputAreaRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  // Click outside → close dropdown
  useEffect(() => {
    const handler = (e) => {
      if (inputAreaRef.current && !inputAreaRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Instant client-side suggestions
  useEffect(() => {
    const trimmed = input.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const results = getClientSuggestions(trimmed);
    setSuggestions(results);
    setShowSuggestions(results.length > 0);
    setActiveSuggestion(-1);
  }, [input]);

  const addMessage = (msg) =>
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), time: new Date(), ...msg }]);

  const isShoppingQuery = (text) => {
    const kw = [
      'buy','purchase','shop','price','cost','cheap','affordable','best','top','under','budget',
      'recommend','suggest','find','search','₹','rs','rupee','shoes','laptop','phone','mobile',
      'headphone','watch','bag','camera','tablet','earphone','keyboard','mouse','monitor','tv',
      'refrigerator','washing','ac','cooler','fan','shirt','dress','jacket','jeans','sneakers',
      'sandals','gaming','iphone','samsung','oneplus','redmi','realme','xiaomi','oppo','vivo',
      'compare','rating','review','alternative','select','choose','versus','vs','show only','other','different'
    ];
    const lower = text.toLowerCase();
    return kw.some((k) => lower.includes(k));
  };

  const handleSearch = useCallback(async (queryText) => {
    const trimmed = (queryText || input).trim();
    if (!trimmed || isLoading) return;

    setInput('');
    setSuggestions([]);
    setShowSuggestions(false);
    setIsLoading(true);

    addMessage({ role: 'user', type: 'text', content: trimmed });
    const newHistory = [...chatHistory, { role: 'user', content: trimmed }];
    setChatHistory(newHistory);

    try {
      if (isShoppingQuery(trimmed)) {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: trimmed, history: chatHistory }),
        });
        const data = await res.json();

        if (!res.ok || data.error) {
          addMessage({ role: 'bot', type: 'error', content: data.error || 'Something went wrong.' });
        } else if (data.needsClarification) {
          addMessage({
            role: 'bot',
            type: 'clarify',
            originalQuery: data.originalQuery || trimmed,
            questions: data.questions || [],
          });
          setChatHistory(newHistory);
        } else if (data.needsBudgetClarification) {
          addMessage({
            role: 'bot',
            type: 'clarification',
            content: data.clarificationMessage,
            resolvedQuery: data.resolvedQuery,
            isFollowUp: true,
          });
          setChatHistory(newHistory);
        } else {
          addMessage({
            role: 'bot',
            type: 'search-result',
            summary: data.summary,
            recommendation: data.recommendation,
            products: data.products || [],
            alternatives: data.alternatives || [],
            followUpSuggestions: data.followUpSuggestions || [],
            noResultsMessage: data.noResultsMessage,
            budgetNotRealistic: data.budgetNotRealistic || false,
            searchQuery: data.searchQuery,
            resolvedQuery: data.resolvedQuery,
            isFollowUp: data.isFollowUp || false,
            contextSummary: data.contextSummary,
            aiPowered: data.aiPowered,
            geminiError: data.geminiError || false,
          });

          const productSummaryForMemory = (data.products || []).length > 0
            ? `Found ${data.products.length} products:\n` +
              data.products
                .map((p, i) => `  ${i + 1}. ${p.title} | ${p.price || 'N/A'} | ⭐${p.rating || 'N/A'} | ${p.source || ''}`)
                .join('\n')
            : 'No products found within budget.';

          const assistantMemory = [
            data.summary,
            data.recommendation ? `Recommendation: ${data.recommendation}` : '',
            `Search resolved to: "${data.resolvedQuery || data.searchQuery}"`,
            productSummaryForMemory,
          ].filter(Boolean).join('\n');

          setChatHistory([...newHistory, {
            role: 'assistant',
            content: assistantMemory,
          }]);
        }
      } else {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed, history: chatHistory }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          addMessage({ role: 'bot', type: 'error', content: data.error || 'Something went wrong.' });
        } else {
          addMessage({ role: 'bot', type: 'text', content: data.reply });
          setChatHistory([...newHistory, { role: 'assistant', content: data.reply }]);
        }
      }
    } catch {
      addMessage({ role: 'bot', type: 'error', content: '⚠️ Network error. Please check your connection.' });
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  }, [input, isLoading, chatHistory]);

  const handleKeyDown = (e) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestion((prev) => Math.max(prev - 1, -1));
        return;
      }
      if (e.key === 'Tab' && activeSuggestion >= 0) {
        e.preventDefault();
        setInput(suggestions[activeSuggestion]);
        setShowSuggestions(false);
        return;
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (activeSuggestion >= 0 && showSuggestions) {
        handleSearch(suggestions[activeSuggestion]);
      } else {
        handleSearch(input);
      }
    }
  };

  const handleSuggestionClick = (s) => {
    setInput(s);
    setShowSuggestions(false);
    handleSearch(s);
  };

  const clearChat = () => {
    setMessages([WELCOME_MSG]);
    setChatHistory([]);
    setInput('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const isWelcome = messages.length === 1 && messages[0].id === 'welcome';

  return (
    <>
      <div className="bg-orbs" aria-hidden="true">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>
      <div className="bg-grid" aria-hidden="true" />

      <div className="app-wrapper">
        {/* ── HEADER ── */}
        <header className="header">
          <div className="header-brand">
            <a href="/" className="back-dash-btn" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '500',
              marginRight: '12px',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}>
              🏠 Hub
            </a>
            <div className="bot-avatar" aria-hidden="true">🛍️</div>
            <div>
              <div className="header-title">ShopMind AI</div>
              <div className="header-subtitle">
                <span>✦</span> Powered by Gemini + Google Shopping
              </div>
            </div>
          </div>
          <div className="header-right">
            <div className="status-badge">
              <div className="status-dot" />
              Online
            </div>
            {!isWelcome && (
              <button className="clear-btn" onClick={clearChat} id="clear-chat-btn">
                ✕ New Chat
              </button>
            )}
          </div>
        </header>

        {/* ── CHAT AREA ── */}
        <main className="chat-area" id="chat-area" role="main">
          {isWelcome ? (
            <>
              <div className="welcome-screen">
                <div className="welcome-orb" aria-hidden="true">🛍️</div>
                <div>
                  <h1 className="welcome-title">Your AI Shopping<br />Assistant</h1>
                  <p className="welcome-subtitle" style={{ marginTop: '14px' }}>
                    Stop wasting time on 10 tabs. Describe what you want and get instant comparisons, prices, and AI-powered recommendations.
                  </p>
                </div>
                <div className="welcome-features">
                  {['🔍 Web Search', '⚖️ AI Compare', '💰 Price Filter', '⭐ Smart Rank', '🇮🇳 India Focused'].map((f) => (
                    <div className="feature-pill" key={f}>{f}</div>
                  ))}
                </div>
              </div>
              <SuggestionChips onSelect={handleSearch} />
            </>
          ) : (
            messages.map((msg) => (
              <MessageRenderer 
                key={msg.id} 
                msg={msg} 
                onFollowUp={handleSearch} 
                compareProducts={compareProducts}
                onCompareToggle={handleCompareToggle}
              />
            ))
          )}
          {isLoading && <TypingIndicator />}
          <div ref={chatEndRef} />
        </main>

        {/* ── INPUT AREA ── */}
        <div className="input-area" ref={inputAreaRef}>
          {showSuggestions && (
            <div className="autocomplete-dropdown" role="listbox" id="autocomplete-dropdown">
              <div className="autocomplete-header">
                💡 Suggestions
              </div>
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  className={`autocomplete-item ${i === activeSuggestion ? 'active' : ''}`}
                  role="option"
                  aria-selected={i === activeSuggestion}
                  onClick={() => handleSuggestionClick(s)}
                  onMouseEnter={() => setActiveSuggestion(i)}
                >
                  <span className="autocomplete-icon">{getIcon(s)}</span>
                  <span style={{ flex: 1 }}>{highlightMatch(s, input.trim())}</span>
                </div>
              ))}
            </div>
          )}

          <div className="input-wrapper" id="input-wrapper">
            <textarea
              ref={textareaRef}
              className="chat-input"
              id="chat-input"
              placeholder='Describe what you want… e.g. "best headphones under ₹2000"'
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (e.target.value.trim().length >= 2) setShowSuggestions(true);
                else setShowSuggestions(false);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => { if (suggestions.length > 0 && input.trim().length >= 2) setShowSuggestions(true); }}
              rows={1}
              disabled={isLoading}
              autoComplete="off"
              aria-label="Search input"
              aria-autocomplete="list"
              aria-controls="autocomplete-dropdown"
            />
            <button
              className="send-btn"
              id="send-btn"
              onClick={() => handleSearch(input)}
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              {isLoading ? '⏳' : '🚀'}
            </button>
          </div>
          <p className="input-hint">
            <span>↵ Enter to search</span> · <span>↑↓ navigate suggestions</span> · <span>Tab to select</span>
          </p>
        </div>
      </div>

      {compareProducts.length > 0 && (
        <div className="floating-compare-bar">
          <div className="compare-bar-info">
            <span className="compare-bar-icon">⚖️</span>
            <span className="compare-bar-text">
              <strong>{compareProducts.length}</strong> {compareProducts.length === 1 ? 'item' : 'items'} selected to compare (max 3)
            </span>
          </div>
          <div className="compare-bar-actions">
            <button className="compare-bar-clear" onClick={() => setCompareProducts([])}>Clear</button>
            <button 
              className="compare-bar-btn" 
              onClick={() => setIsCompareModalOpen(true)}
              disabled={compareProducts.length < 2}
              title={compareProducts.length < 2 ? "Select at least 2 products to compare" : "Compare selected products"}
            >
              Compare {compareProducts.length > 1 ? `(${compareProducts.length})` : ''}
            </button>
          </div>
        </div>
      )}

      {isCompareModalOpen && (
        <CompareModal 
          products={compareProducts} 
          onClose={() => setIsCompareModalOpen(false)} 
        />
      )}
    </>
  );
}

/* ─────────────────────────────────────────────
   MESSAGE RENDERER
   ───────────────────────────────────────────── */
function MessageRenderer({ msg, onFollowUp, compareProducts = [], onCompareToggle }) {
  if (msg.role === 'user') {
    return (
      <div className="message-wrapper user">
        <div className="msg-avatar user">👤</div>
        <div className="msg-body">
          <div className="msg-bubble user">{msg.content}</div>
          <div className="msg-time">{formatTime(msg.time)}</div>
        </div>
      </div>
    );
  }

  if (msg.type === 'error') {
    return (
      <div className="message-wrapper">
        <div className="msg-avatar bot">🤖</div>
        <div className="msg-body">
          <div className="error-bubble">⚠️ {msg.content}</div>
          <div className="msg-time">{formatTime(msg.time)}</div>
        </div>
      </div>
    );
  }

  if (msg.type === 'clarify') {
    return (
      <div className="message-wrapper">
        <div className="msg-avatar bot">🤖</div>
        <div className="msg-body">
          <ClarifyCard
            originalQuery={msg.originalQuery}
            questions={msg.questions || []}
            onSearch={onFollowUp}
          />
          <div className="msg-time">{formatTime(msg.time)}</div>
        </div>
      </div>
    );
  }

  if (msg.type === 'clarification') {
    const budgetChips = ['under ₹300', 'under ₹500', 'under ₹800', 'under ₹1000', 'under ₹2000'];
    return (
      <div className="message-wrapper">
        <div className="msg-avatar bot">🤖</div>
        <div className="msg-body">
          <div className="clarification-card">
            <div className="clarification-header">
              <span>💰</span>
              <span>Budget Needed</span>
            </div>
            <p className="clarification-text"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
            />
            <div className="clarification-chips">
              {budgetChips.map((chip, i) => (
                <button
                  key={i}
                  className="clarification-chip"
                  onClick={() => onFollowUp(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
          <div className="msg-time">{formatTime(msg.time)}</div>
        </div>
      </div>
    );
  }

  if (msg.type === 'search-result') {
    return (
      <div className="message-wrapper">
        <div className="msg-avatar bot">🤖</div>
        <div className="msg-body" style={{ maxWidth: '100%', width: '100%' }}>
          {msg.isFollowUp && msg.contextSummary && (
            <div className="followup-context-banner">
              <span>🔗</span>
              <span>{msg.contextSummary}</span>
            </div>
          )}

          {(msg.summary || msg.recommendation) && (
            <div className="ai-summary">
              <div className="ai-summary-header">
                ✦ AI Analysis
                {msg.resolvedQuery && msg.isFollowUp ? (
                  <span className="search-tag">🔗 "{msg.resolvedQuery}"</span>
                ) : msg.searchQuery ? (
                  <span className="search-tag">🔍 "{msg.searchQuery}"</span>
                ) : null}
              </div>
              {msg.summary && <p>{msg.summary}</p>}
              {msg.recommendation && (
                <div className="ai-recommendation">
                  <span>🏆</span>
                  <span>{msg.recommendation}</span>
                </div>
              )}
            </div>
          )}

          {!msg.products?.length && msg.budgetNotRealistic && (
            <div className="no-results-card">
              <div className="no-results-header">
                <span>😔</span>
                <span>No results found in this budget</span>
              </div>
              <p className="no-results-msg">{msg.summary}</p>

              {msg.alternatives?.length > 0 && (
                <div className="alternatives-section">
                  <div className="alternatives-label">💡 Try these alternatives instead:</div>
                  {msg.alternatives.map((alt, i) => (
                    <div key={i} className="alternative-item">
                      <div className="alternative-title">{alt.title}</div>
                      <div className="alternative-meta">
                        <span className="alternative-price">~{alt.approxPrice}</span>
                        <span className="alternative-reason">{alt.reason}</span>
                      </div>
                      <button
                        className="alternative-search-btn"
                        onClick={() => onFollowUp(alt.title)}
                      >
                        🔍 Search this
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!msg.products?.length && !msg.budgetNotRealistic && msg.noResultsMessage && (
            <div className="msg-bubble bot" style={{ marginTop: 8 }}>
              🔍 {msg.noResultsMessage}
            </div>
          )}

          {msg.products?.length > 0 && (
            <div className="products-section" style={{ marginTop: 14 }}>
              <div className="products-header">
                🛒 Products Found
                <span className="products-count">{msg.products.length}</span>
              </div>
              <div className="products-grid">
                {msg.products.map((p, i) => (
                  <ProductCard 
                    key={i} 
                    product={p} 
                    index={i} 
                    isComparing={compareProducts.some(cp => cp.title === p.title && cp.price === p.price)}
                    onCompareToggle={onCompareToggle}
                  />
                ))}
              </div>
            </div>
          )}

          {msg.followUpSuggestions?.length > 0 && (
            <div className="followup-wrap">
              <p className="followup-label">💬 Ask a follow-up…</p>
              <div className="followup-chips">
                {msg.followUpSuggestions.map((s, i) => (
                  <button key={i} className="followup-chip" onClick={() => onFollowUp(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="msg-time">{formatTime(msg.time)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="message-wrapper">
      <div className="msg-avatar bot">🤖</div>
      <div className="msg-body">
        <div
          className="msg-bubble bot"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
        />
        <div className="msg-time">{formatTime(msg.time)}</div>
      </div>
    </div>
  );
}
