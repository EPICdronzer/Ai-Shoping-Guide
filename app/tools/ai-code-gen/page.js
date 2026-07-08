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

const LANGS = ['JavaScript','Python','TypeScript','Java','C++','C#','Go','Rust','PHP','Ruby','Swift','Kotlin','SQL','Bash','HTML/CSS','React','Vue','Next.js'];

export default function AiCodeGen() {
  const [desc, setDesc] = useState('');
  const [lang, setLang] = useState('JavaScript');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!desc.trim()) { setError('Please describe what code you need.'); return; }
    setLoading(true); setError(''); setOutput('');
    try {
      const prompt = `Generate production-quality ${lang} code for the following requirement:

${desc}

Requirements:
- Write clean, well-commented, production-ready code
- Include error handling where appropriate
- Follow ${lang} best practices and conventions
- Add brief inline comments explaining key logic
- Return ONLY the code with markdown code blocks (use \`\`\`${lang.toLowerCase()}\`\`\` fencing)`;
      setOutput(await callGemini(prompt));
    } catch (e) { setError('Generation failed: ' + e.message); }
    setLoading(false);
  };

  const clean = output.replace(/```[\w\s]*/g, '').replace(/```/g, '').trim();

  return (
    <ToolLayout icon="💻" title="AI Code Generator" category="AI Tools" badgeColor="#34d399">
      <div style={card}>
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>PROGRAMMING LANGUAGE</label>
          <select value={lang} onChange={e => setLang(e.target.value)} style={selectStyle}>
            {LANGS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>DESCRIBE WHAT YOU NEED *</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={5} placeholder={`E.g.: A ${lang} function that fetches user data from an API, handles errors, and returns paginated results with caching...`} style={inputStyle} />
        </div>
        <button onClick={generate} disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#374151' : 'linear-gradient(135deg,#7c3aed,#8b5cf6)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          {loading ? '⏳ Generating Code…' : `💻 Generate ${lang} Code`}
        </button>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {output && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#a78bfa', fontWeight: '700' }}>💻 Generated {lang} Code</span>
            <button onClick={() => { navigator.clipboard.writeText(clean); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: copied ? '#10b981' : '#4b5563', color: '#fff', fontWeight: '700' }}>
              {copied ? '✓ Copied' : '📋 Copy Code'}
            </button>
          </div>
          <pre style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '16px', color: '#a78bfa', fontSize: '13px', lineHeight: '1.7', whiteSpace: 'pre-wrap', fontFamily: 'monospace', maxHeight: '500px', overflowY: 'auto' }}>{output}</pre>
        </div>
      )}
    </ToolLayout>
  );
}
