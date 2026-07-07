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

const BLOG_TYPES = ['How-To Guide','Listicle (Top 10)','Opinion / Commentary','Case Study','News Article','Product Review','Tutorial','Beginner's Guide','Interview Style'];
const TONES = ['Professional','Conversational','Authoritative','Witty','Inspirational','Educational'];

export default function AiBlog() {
  const [title, setTitle] = useState('');
  const [keywords, setKeywords] = useState('');
  const [type, setType] = useState('How-To Guide');
  const [tone, setTone] = useState('Professional');
  const [length, setLength] = useState('medium');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const wordCount = { short: '500-700 words', medium: '800-1200 words', long: '1500-2000 words' };

  const generate = async () => {
    if (!title) { setError('Please enter a blog title or topic.'); return; }
    setLoading(true); setError(''); setOutput('');
    try {
      const prompt = `Write a complete, SEO-optimized ${type} blog post with the following requirements:

Title/Topic: ${title}
Keywords to include: ${keywords || 'naturally related keywords'}
Blog Type: ${type}
Tone: ${tone}
Length: ${wordCount[length]}

Requirements:
- Compelling headline (H1)
- Engaging introduction with a hook
- Well-structured body with H2/H3 subheadings
- Practical, valuable content
- SEO-friendly writing with natural keyword integration
- Strong conclusion with a call to action
- Professional and polished throughout

Write the complete blog post now:`;
      setOutput(await callGemini(prompt));
    } catch (e) { setError('Generation failed: ' + e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout icon="✍️" title="AI Blog Writer" category="AI Tools" badgeColor="#34d399">
      <div style={card}>
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>BLOG TITLE / TOPIC *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="10 Ways AI Is Transforming Healthcare in 2026" style={{ ...inputStyle, resize: undefined }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>BLOG TYPE</label>
            <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%', background: 'rgba(25,20,45,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', outline: 'none' }}>
              {BLOG_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>TONE</label>
            <select value={tone} onChange={e => setTone(e.target.value)} style={{ width: '100%', background: 'rgba(25,20,45,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', outline: 'none' }}>
              {TONES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>TARGET KEYWORDS</label>
          <input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="AI healthcare, medical technology, digital health..." style={{ ...inputStyle, resize: undefined }} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>ARTICLE LENGTH</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {Object.entries(wordCount).map(([k, v]) => (
              <button key={k} onClick={() => setLength(k)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: `1px solid ${length === k ? '#10b981' : 'rgba(255,255,255,0.08)'}`, background: length === k ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)', color: length === k ? '#34d399' : '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ fontWeight: '700', textTransform: 'capitalize' }}>{k}</div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>{v}</div>
              </button>
            ))}
          </div>
        </div>
        <button onClick={generate} disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#374151' : 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          {loading ? '⏳ Writing Blog Post…' : '✍️ Generate Blog Post'}
        </button>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {output && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#34d399', fontWeight: '700' }}>✅ Blog Post Ready</span>
            <button onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: copied ? '#10b981' : '#4b5563', color: '#fff', fontWeight: '700' }}>
              {copied ? '✓ Copied' : '📋 Copy Article'}
            </button>
          </div>
          <pre style={{ color: '#e2e8f0', fontSize: '13px', lineHeight: '1.9', whiteSpace: 'pre-wrap', fontFamily: 'inherit', maxHeight: '600px', overflowY: 'auto' }}>{output}</pre>
        </div>
      )}
    </ToolLayout>
  );
}
