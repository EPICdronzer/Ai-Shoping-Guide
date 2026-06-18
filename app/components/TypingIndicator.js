'use client';

export default function TypingIndicator() {
  return (
    <div className="typing-wrapper">
      <div className="message-avatar bot">🤖</div>
      <div className="typing-bubble">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
