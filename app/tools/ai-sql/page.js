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

const DB_TYPES = ['MySQL / MariaDB','PostgreSQL','SQLite','Microsoft SQL Server','Oracle','MongoDB (NoSQL)','BigQuery','Snowflake'];
const SQL_MODES = [
  { id: 'generate', label: '⚡ Generate SQL', desc: 'Describe what you want in plain English' },
  { id: 'explain', label: '📖 Explain SQL', desc: 'Paste SQL to get a plain English explanation' },
  { id: 'optimize', label: '🚀 Optimize Query', desc: 'Paste a slow query to get an optimized version' },
  { id: 'schema', label: '🏗️ Generate Schema', desc: 'Describe your app and get database schema' },
];

export default function AiSql() {
  const [mode, setMode] = useState('generate');
  const [db, setDb] = useState('MySQL / MariaDB');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const run = async () => {
    if (!input.trim()) { setError('Please provide input.'); return; }
    setLoading(true); setError(''); setOutput('');

    const prompts = {
      generate: `Generate ${db} SQL query for the following requirement. Return ONLY the SQL with proper formatting and helpful comments:\n\n${input}`,
      explain: `Explain the following ${db} SQL query in plain English. Break down each clause and explain what it does:\n\n\`\`\`sql\n${input}\n\`\`\``,
      optimize: `Optimize this ${db} SQL query for better performance. Show the optimized version and explain each optimization made:\n\n\`\`\`sql\n${input}\n\`\`\``,
      schema: `Design a complete ${db} database schema for: ${input}\n\nInclude: CREATE TABLE statements with proper data types, primary keys, foreign keys, indexes, and sample INSERT statements.`,
    };
    try {
      setOutput(await callGemini(prompts[mode]));
    } catch (e) { setError('Failed: ' + e.message); }
    setLoading(false);
  };

  const currentMode = SQL_MODES.find(m => m.id === mode);

  return (
    <ToolLayout icon="🗄️" title="AI SQL Generator" category="AI Tools" badgeColor="#34d399">
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          {SQL_MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)} style={{ padding: '12px', borderRadius: '10px', border: `1px solid ${mode === m.id ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`, background: mode === m.id ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)', color: mode === m.id ? '#60a5fa' : '#64748b', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
              <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '2px' }}>{m.label}</div>
              <div style={{ fontSize: '11px', opacity: 0.7 }}>{m.desc}</div>
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>DATABASE TYPE</label>
          <select value={db} onChange={e => setDb(e.target.value)} style={selectStyle}>
            {DB_TYPES.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>{currentMode?.desc.toUpperCase()}</label>
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={5}
            placeholder={mode === 'generate' ? 'Get all users who signed up in the last 30 days, sorted by email, with their order count...' : mode === 'schema' ? 'An e-commerce platform with users, products, orders, and reviews...' : 'Paste your SQL query here...'}
            style={inputStyle} />
        </div>
        <button onClick={run} disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#374151' : 'linear-gradient(135deg,#1d4ed8,#3b82f6)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          {loading ? '⏳ Processing…' : currentMode?.label}
        </button>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {output && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#60a5fa', fontWeight: '700' }}>🗄️ {db} Result</span>
            <button onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: copied ? '#10b981' : '#4b5563', color: '#fff', fontWeight: '700' }}>
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
          </div>
          <pre style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '16px', color: '#93c5fd', fontSize: '13px', lineHeight: '1.7', whiteSpace: 'pre-wrap', fontFamily: 'monospace', maxHeight: '500px', overflowY: 'auto' }}>{output}</pre>
        </div>
      )}
    </ToolLayout>
  );
}
