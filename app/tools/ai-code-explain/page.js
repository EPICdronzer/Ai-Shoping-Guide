'use client';
import { useState } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };
const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', outline: 'none', fontFamily: 'monospace', resize: 'vertical' };
const selectStyle = { width: '100%', background: 'rgba(25,20,45,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', outline: 'none' };

async function callGemini(prompt) {
  const { callAI } = await import('@/lib/ai');
  return callAI(prompt);
}

const LANGS = ['JavaScript','Python','TypeScript','Java','C++','C#','Go','Rust','PHP','Ruby','SQL','Bash'];
const MODES = [
  { id: 'explain', label: '📖 Explain Code', emoji: '📖' },
  { id: 'debug', label: '🐛 Find Bugs', emoji: '🐛' },
  { id: 'optimize', label: '⚡ Optimize', emoji: '⚡' },
  { id: 'review', label: '🔍 Code Review', emoji: '🔍' },
];

export default function AiCodeExplain() {
  const [code, setCode] = useState('');
  const [lang, setLang] = useState('JavaScript');
  const [mode, setMode] = useState('explain');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const run = async () => {
    if (!code.trim()) { setError('Please paste some code first.'); return; }
    setLoading(true); setError(''); setOutput('');
    const prompts = {
      explain: `Explain the following ${lang} code in plain English. Break it down step by step, explain what each function/block does, and note any important concepts:\n\n\`\`\`${lang}\n${code}\n\`\`\``,
      debug: `Analyze this ${lang} code and find all bugs, errors, and potential issues. For each issue, explain what's wrong and provide the corrected code:\n\n\`\`\`${lang}\n${code}\n\`\`\``,
      optimize: `Optimize this ${lang} code for performance, readability, and best practices. Show the optimized version with explanations of each improvement:\n\n\`\`\`${lang}\n${code}\n\`\`\``,
      review: `Perform a thorough code review of this ${lang} code. Assess: correctness, performance, security, readability, and best practices. Give a score and detailed feedback:\n\n\`\`\`${lang}\n${code}\n\`\`\``,
    };
    try {
      setOutput(await callGemini(prompts[mode]));
    } catch (e) { setError('Analysis failed: ' + e.message); }
    setLoading(false);
  };

  return (
    <ToolLayout icon="🔍" title="AI Code Explainer" category="AI Tools" badgeColor="#34d399">
      <div style={card}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: `1px solid ${mode === m.id ? '#8b5cf6' : 'rgba(255,255,255,0.08)'}`, background: mode === m.id ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)', color: mode === m.id ? '#a78bfa' : '#64748b', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'all 0.2s' }}>
              {m.label}
            </button>
          ))}
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>LANGUAGE</label>
          <select value={lang} onChange={e => setLang(e.target.value)} style={selectStyle}>
            {LANGS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>PASTE YOUR CODE *</label>
          <textarea value={code} onChange={e => setCode(e.target.value)} rows={8} placeholder={`// Paste your ${lang} code here...`} style={inputStyle} />
        </div>
        <button onClick={run} disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#374151' : 'linear-gradient(135deg,#7c3aed,#8b5cf6)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          {loading ? '⏳ Analyzing…' : `${MODES.find(m => m.id === mode)?.emoji} ${MODES.find(m => m.id === mode)?.label}`}
        </button>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {output && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#a78bfa', fontWeight: '700' }}>Analysis Complete</span>
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
