'use client';
import { useState } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };
const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', outline: 'none', fontFamily: 'inherit' };

async function callGemini(prompt) {
  const { callAI } = await import('@/lib/ai');
  return callAI(prompt);
}

const EMAIL_TYPES = ['Business Proposal', 'Follow-up Email', 'Apology Email', 'Thank You Email', 'Cold Outreach', 'Meeting Request', 'Complaint Email', 'Newsletter'];
const TONES = ['Professional', 'Friendly', 'Formal', 'Casual', 'Urgent', 'Persuasive'];

export default function AiEmail() {
  const [type, setType] = useState('Business Proposal');
  const [tone, setTone] = useState('Professional');
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [context, setContext] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!context) { setError('Please provide some context or key points for the email.'); return; }
    setLoading(true); setError(''); setOutput('');
    try {
      const prompt = `Write a ${tone.toLowerCase()}, ${type.toLowerCase()} email.
Recipient: ${to || 'the recipient'}
Subject hint: ${subject || 'auto-generate appropriate subject'}
Key Points / Context: ${context}

Write a complete email including: Subject Line, Greeting, Body (2-3 paragraphs), and Sign-off. The tone should be ${tone.toLowerCase()}. Do not add placeholders - write a real, polished, ready-to-send email.`;
      setOutput(await callGemini(prompt));
    } catch (e) { setError('Generation failed: ' + e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout icon="📧" title="AI Email Writer" category="AI Tools" badgeColor="#34d399">
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>EMAIL TYPE</label>
            <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%', background: 'rgba(25,20,45,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', outline: 'none' }}>
              {EMAIL_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>TONE</label>
            <select value={tone} onChange={e => setTone(e.target.value)} style={{ width: '100%', background: 'rgba(25,20,45,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', outline: 'none' }}>
              {TONES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>RECIPIENT (optional)</label>
            <input value={to} onChange={e => setTo(e.target.value)} placeholder="Mr. John, Marketing Head..." style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>SUBJECT HINT (optional)</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Partnership opportunity..." style={inputStyle} />
          </div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>KEY POINTS / CONTEXT *</label>
          <textarea value={context} onChange={e => setContext(e.target.value)} rows={4} placeholder="What should this email communicate? E.g.: Following up on Monday's call about Q3 partnership deal. We're ready to move forward with a 3-month pilot." style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <button onClick={generate} disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#374151' : 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          {loading ? '⏳ Crafting Email…' : '📧 Generate AI Email'}
        </button>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {output && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#34d399', fontWeight: '700' }}>✅ Email Ready</span>
            <button onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: copied ? '#10b981' : '#4b5563', color: '#fff', fontWeight: '700' }}>
              {copied ? '✓ Copied' : '📋 Copy Email'}
            </button>
          </div>
          <pre style={{ color: '#e2e8f0', fontSize: '13px', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontFamily: 'inherit', maxHeight: '500px', overflowY: 'auto' }}>{output}</pre>
        </div>
      )}
    </ToolLayout>
  );
}
