'use client';
import { useState } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };
const textareaStyle = { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', outline: 'none', fontFamily: 'inherit', resize: 'vertical' };

async function callGemini(prompt) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

const MODES = [
  { id: 'brief', label: '⚡ Brief Summary', desc: '2-3 sentences', ratio: '10%' },
  { id: 'key', label: '🔑 Key Points', desc: 'Bullet points', ratio: '20%' },
  { id: 'detailed', label: '📋 Detailed Summary', desc: 'Full paragraphs', ratio: '30%' },
  { id: 'eli5', label: '👶 Explain Simply', desc: 'Easy to understand', ratio: '15%' },
];

export default function AiSummarize() {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState('key');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const summarize = async () => {
    const content = text.trim() || url.trim();
    if (!content) { setError('Please paste text or enter a URL to summarize.'); return; }
    setLoading(true); setError(''); setOutput('');
    const prompts = {
      brief: `Summarize the following in 2-3 clear, concise sentences:\n\n${content}`,
      key: `Extract the key points from the following text as a clear, well-organized bullet list. Include all important information:\n\n${content}`,
      detailed: `Write a detailed summary of the following text in well-structured paragraphs, covering all major points:\n\n${content}`,
      eli5: `Explain the following text in simple, easy-to-understand language as if explaining to someone with no background knowledge:\n\n${content}`,
    };
    try {
      setOutput(await callGemini(prompts[mode]));
    } catch (e) { setError('Summarization failed: ' + e.message); }
    setLoading(false);
  };

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  return (
    <ToolLayout icon="📝" title="AI Summarizer" category="AI Tools" badgeColor="#34d399">
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          {MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)} style={{ padding: '12px', borderRadius: '10px', border: `1px solid ${mode === m.id ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`, background: mode === m.id ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)', color: mode === m.id ? '#fbbf24' : '#64748b', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
              <div style={{ fontWeight: '700', fontSize: '13px' }}>{m.label}</div>
              <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>{m.desc}</div>
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>PASTE TEXT TO SUMMARIZE</label>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={7} placeholder="Paste your article, research paper, document, or any long text here…" style={textareaStyle} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>{wordCount} words</span>
            <button onClick={() => { setText(''); setOutput(''); }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '12px' }}>Clear</button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>OR ENTER URL:</span>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/article..." style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontFamily: 'inherit' }} />
        </div>

        <button onClick={summarize} disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#374151' : 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          {loading ? '⏳ Summarizing…' : '📝 Summarize Now'}
        </button>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {output && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#fbbf24', fontWeight: '700' }}>✅ Summary Ready</span>
            <button onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: copied ? '#10b981' : '#4b5563', color: '#fff', fontWeight: '700' }}>
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '16px', color: '#e2e8f0', lineHeight: '1.9', fontSize: '14px', maxHeight: '400px', overflowY: 'auto' }}>{output}</div>
        </div>
      )}
    </ToolLayout>
  );
}
