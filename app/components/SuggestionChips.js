'use client';

const SUGGESTIONS = [
  { icon: '👟', text: 'Waterproof running shoes under ₹3000' },
  { icon: '💻', text: 'Gaming laptop under ₹60,000' },
  { icon: '🎧', text: 'Best noise-cancelling headphones under ₹5000' },
  { icon: '📱', text: 'Budget smartphone with good camera under ₹15,000' },
  { icon: '⌚', text: 'Smartwatch with health tracking under ₹4000' },
  { icon: '🎒', text: 'Lightweight backpack for college under ₹1500' },
];

export default function SuggestionChips({ onSelect }) {
  return (
    <div className="suggestions-section">
      <p className="suggestions-label">✨ Try asking about...</p>
      <div className="chips-row">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            className="chip"
            onClick={() => onSelect(s.text)}
          >
            {s.icon} {s.text}
          </button>
        ))}
      </div>
    </div>
  );
}
