'use client';
import { useState } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };
const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', outline: 'none', fontFamily: 'inherit', resize: 'vertical' };

async function callGemini(prompt) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export default function AiGrammar() {
  const [text, setText] = useState('');
  const [mode, setMode] = useState('grammar');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const MODES = [
    { id: 'grammar', label: '✅ Grammar & Spelling Fix', prompt: `Correct all grammar, spelling, and punctuation errors in the following text. Return ONLY the corrected text, no explanations:\n\n` },
    { id: 'paraphrase', label: '🔄 Paraphrase', prompt: `Rewrite the following text in a fresh way while keeping the same meaning. Return ONLY the paraphrased version:\n\n` },
    { id: 'formal', label: '👔 Make Formal', prompt: `Rewrite the following text in a professional, formal tone. Return ONLY the rewritten version:\n\n` },
    { id: 'casual', label: '😊 Make Casual', prompt: `Rewrite the following text in a friendly, casual tone. Return ONLY the rewritten version:\n\n` },
    { id: 'shorter', label: '✂️ Make Shorter', prompt: `Condense the following text to be 50% shorter while keeping all key information. Return ONLY the shortened version:\n\n` },
    { id: 'clearer', label: '💡 Improve Clarity', prompt: `Rewrite the following text to be clearer, more concise, and easier to understand. Return ONLY the improved version:\n\n` },
  ];

  const fix = async () => {
    if (!text.trim()) { setError('Please enter some text to fix.'); return; }
    setLoading(true); setError(''); setOutput('');
    const selected = MODES.find(m => m.id === mode);
    try {
      setOutput(await callGemini(selected.prompt + text));
    } catch (e) { setError('Failed: ' + e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout icon="✏️" title="AI Grammar Checker & Paraphraser" category="AI Tools" badgeColor="#34d399">
      <div style={card}>
        <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>SELECT MODE</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '16px' }}>
          {MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)} style={{ padding: '10px 8px', borderRadius: '10px', border: `1px solid ${mode === m.id ? '#10b981' : 'rgba(255,255,255,0.08)'}`, background: mode === m.id ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)', color: mode === m.id ? '#34d399' : '#94a3b8', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'all 0.2s' }}>
              {m.label}
            </button>
          ))}
        </div>

        <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>YOUR TEXT</label>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={6} placeholder="Paste your text here to fix grammar, paraphrase, or improve it..." style={inputStyle} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>{text.length} characters</span>
          <button onClick={() => { setText(''); setOutput(''); }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '12px' }}>Clear</button>
        </div>
        <button onClick={fix} disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#374151' : 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          {loading ? '⏳ Processing…' : '✏️ Improve My Text'}
        </button>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {output && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#34d399', fontWeight: '700' }}>✅ Improved Text</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: copied ? '#10b981' : '#4b5563', color: '#fff', fontWeight: '700' }}>
                {copied ? '✓ Copied' : '📋 Copy'}
              </button>
              <button onClick={() => setText(output)} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#7c3aed', color: '#fff', fontWeight: '700' }}>⬅ Use as Input</button>
            </div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '16px', color: '#e2e8f0', lineHeight: '1.8', fontSize: '14px', maxHeight: '400px', overflowY: 'auto' }}>{output}</div>
        </div>
      )}
    </ToolLayout>
  );
}
