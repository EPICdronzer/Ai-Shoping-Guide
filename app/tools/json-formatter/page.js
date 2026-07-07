'use client';
import { useState } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function JsonFormatter() {
  const [input, setInput] = useState('{"name":"MindSuite","version":"2.1.0","active":true,"tags":["productivity","ai","utility"]}');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);

  const formatJSON = (mode) => {
    try {
      setError(null);
      const parsed = JSON.parse(input);
      if (mode === 'beautify') {
        setOutput(JSON.stringify(parsed, null, indent));
      } else {
        setOutput(JSON.stringify(parsed));
      }
      setCopied(false);
    } catch (err) {
      setError('Invalid JSON: ' + err.message);
      setOutput('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout icon="💻" title="JSON Formatter" category="Utilities" badgeColor="#34d399">
      <div style={card}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>INPUT RAW JSON</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            style={{ width: '100%', height: '160px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', fontFamily: 'monospace', outline: 'none' }}
            placeholder='Paste your JSON string here...'
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => formatJSON('beautify')} style={{ padding: '12px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '14px', fontWeight: '700' }}>
            ✨ Beautify & Format
          </button>
          <button onClick={() => formatJSON('minify')} style={{ padding: '12px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '14px', fontWeight: '700', border: '1px solid rgba(255,255,255,0.1)' }}>
            🗜️ Minify JSON
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Indent:</span>
            <select
              value={indent}
              onChange={e => setIndent(Number(e.target.value))}
              style={{ background: 'rgba(25,20,45,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px 10px', color: '#fff', outline: 'none' }}
            >
              <option value={2}>2 Spaces</option>
              <option value={4}>4 Spaces</option>
              <option value={8}>8 Spaces</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>
          ⚠️ {error}
        </div>
      )}

      {output && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>FORMATTED OUTPUT</span>
            <button onClick={copyToClipboard} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: copied ? '#10b981' : '#4b5563', color: '#fff', fontWeight: '700' }}>
              {copied ? '✓ Copied' : '📋 Copy Output'}
            </button>
          </div>
          <textarea
            readOnly
            value={output}
            style={{ width: '100%', height: '240px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#a78bfa', fontFamily: 'monospace', outline: 'none' }}
          />
        </div>
      )}
    </ToolLayout>
  );
}
