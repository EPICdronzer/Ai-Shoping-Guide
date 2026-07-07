'use client';
import { useState } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function Base64Converter() {
  const [input, setInput] = useState('Hello MindSuite!');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode'); // encode | decode
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const processText = () => {
    try {
      setError(null);
      if (mode === 'encode') {
        setOutput(btoa(input));
      } else {
        setOutput(atob(input));
      }
      setCopied(false);
    } catch (err) {
      setError('Error processing string: ' + err.message);
      setOutput('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout icon="🔗" title="Base64 Encoder/Decoder" category="Utilities" badgeColor="#a78bfa">
      <div style={card}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button onClick={() => { setMode('encode'); setOutput(''); setError(null); }} style={{
            flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: mode === 'encode' ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'rgba(255,255,255,0.05)',
            color: '#fff', fontWeight: '700', fontSize: '13px'
          }}>🔒 Encode to Base64</button>
          <button onClick={() => { setMode('decode'); setOutput(''); setError(null); }} style={{
            flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: mode === 'decode' ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'rgba(255,255,255,0.05)',
            color: '#fff', fontWeight: '700', fontSize: '13px'
          }}>🔓 Decode Base64</button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>INPUT TEXT</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            style={{ width: '100%', height: '120px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', fontFamily: 'monospace', outline: 'none' }}
          />
        </div>

        <button onClick={processText} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          Run {mode === 'encode' ? 'Encode' : 'Decode'}
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>
          ⚠️ {error}
        </div>
      )}

      {output && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>CONVERTED OUTPUT</span>
            <button onClick={copyToClipboard} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: copied ? '#10b981' : '#4b5563', color: '#fff', fontWeight: '700' }}>
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
          </div>
          <textarea
            readOnly
            value={output}
            style={{ width: '100%', height: '120px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#a78bfa', fontFamily: 'monospace', outline: 'none' }}
          />
        </div>
      )}
    </ToolLayout>
  );
}
