'use client';
import { useState } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };
const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', outline: 'none', fontFamily: 'inherit' };

async function callGemini(prompt) {
  const { callAI } = await import('@/lib/ai');
  return callAI(prompt);
}

export default function AiCoverLetter() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [jd, setJd] = useState('');
  const [highlights, setHighlights] = useState('');
  const [tone, setTone] = useState('Professional');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!name || !role) { setError('Name and Target Role are required.'); return; }
    setLoading(true); setError(''); setOutput('');
    try {
      const prompt = `Write a compelling, ${tone.toLowerCase()} cover letter for a job application:
Applicant Name: ${name}
Target Role: ${role}
Company: ${company || 'the company'}
Job Description: ${jd || 'Not provided'}
My Key Highlights: ${highlights || 'Not specified'}

Write a 3-4 paragraph cover letter that is personalized, engaging, and demonstrates why this candidate is ideal. Start with a strong opening line. End with a clear call to action. Format it as a proper business letter.`;
      setOutput(await callGemini(prompt));
    } catch (e) { setError('Generation failed: ' + e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout icon="✉️" title="AI Cover Letter Generator" category="AI Tools" badgeColor="#34d399">
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>YOUR NAME *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>TARGET ROLE *</label>
            <input value={role} onChange={e => setRole(e.target.value)} placeholder="Product Manager" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>COMPANY NAME</label>
            <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Google, Apple..." style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>TONE</label>
            <select value={tone} onChange={e => setTone(e.target.value)} style={{ width: '100%', background: 'rgba(25,20,45,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', outline: 'none' }}>
              {['Professional', 'Enthusiastic', 'Formal', 'Conversational'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>JOB DESCRIPTION (optional)</label>
          <textarea value={jd} onChange={e => setJd(e.target.value)} rows={3} placeholder="Paste job description here..." style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>YOUR KEY ACHIEVEMENTS</label>
          <textarea value={highlights} onChange={e => setHighlights(e.target.value)} rows={2} placeholder="Led team of 10, increased revenue by 40%..." style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <button onClick={generate} disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#374151' : 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          {loading ? '⏳ Generating Cover Letter…' : '✉️ Generate AI Cover Letter'}
        </button>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {output && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#34d399', fontWeight: '700' }}>✅ Cover Letter Ready</span>
            <button onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: copied ? '#10b981' : '#4b5563', color: '#fff', fontWeight: '700' }}>
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
          </div>
          <pre style={{ color: '#e2e8f0', fontSize: '13px', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontFamily: 'inherit', maxHeight: '500px', overflowY: 'auto' }}>{output}</pre>
        </div>
      )}
    </ToolLayout>
  );
}
