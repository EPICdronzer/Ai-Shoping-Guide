'use client';
import { useState } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };
const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', outline: 'none', fontFamily: 'inherit', resize: 'vertical' };
const selectStyle = { width: '100%', background: 'rgba(25,20,45,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', outline: 'none' };

async function callGemini(prompt) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

const LANGUAGES = ['Spanish','French','German','Italian','Portuguese','Chinese (Simplified)','Japanese','Korean','Arabic','Hindi','Russian','Dutch','Swedish','Turkish','Polish','Vietnamese','Thai','Indonesian','Malay','Bengali'];

export default function AiTranslator() {
  const [text, setText] = useState('');
  const [from, setFrom] = useState('Auto-Detect');
  const [to, setTo] = useState('Spanish');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const translate = async () => {
    if (!text.trim()) { setError('Please enter text to translate.'); return; }
    setLoading(true); setError(''); setOutput('');
    try {
      const fromLang = from === 'Auto-Detect' ? 'the source language (auto-detect it)' : from;
      const prompt = `Translate the following text from ${fromLang} to ${to}. Return ONLY the translated text, nothing else:\n\n${text}`;
      setOutput(await callGemini(prompt));
    } catch (e) { setError('Translation failed: ' + e.message); }
    setLoading(false);
  };

  const swap = () => { if (from !== 'Auto-Detect') { const tmp = from; setFrom(to); setTo(tmp); } };

  return (
    <ToolLayout icon="🌐" title="AI Translator" category="AI Tools" badgeColor="#34d399">
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>FROM</label>
            <select value={from} onChange={e => setFrom(e.target.value)} style={selectStyle}>
              <option>Auto-Detect</option>
              {LANGUAGES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <button onClick={swap} title="Swap languages" style={{ marginTop: '18px', padding: '12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}>⇄</button>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>TO</label>
            <select value={to} onChange={e => setTo(e.target.value)} style={selectStyle}>
              {LANGUAGES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>SOURCE TEXT</label>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={6} placeholder="Enter text to translate…" style={inputStyle} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px', marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>{text.length} characters</span>
        </div>

        <button onClick={translate} disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#374151' : 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          {loading ? `⏳ Translating to ${to}…` : `🌐 Translate to ${to}`}
        </button>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {output && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#34d399', fontWeight: '700' }}>🌐 {to} Translation</span>
            <button onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: copied ? '#10b981' : '#4b5563', color: '#fff', fontWeight: '700' }}>
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '16px', color: '#e2e8f0', lineHeight: '1.8', fontSize: '15px', maxHeight: '400px', overflowY: 'auto' }}>{output}</div>
        </div>
      )}
    </ToolLayout>
  );
}
