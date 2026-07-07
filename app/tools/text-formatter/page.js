'use client';
import { useState } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function TextFormatter() {
  const [text, setText] = useState('mindsuite ai productivity suite\nproductivity suite');
  const [copied, setCopied] = useState(false);

  const applyFormat = (mode) => {
    let result = text;
    if (mode === 'upper') {
      result = text.toUpperCase();
    } else if (mode === 'lower') {
      result = text.toLowerCase();
    } else if (mode === 'title') {
      result = text.replace(/\b\w/g, c => c.toUpperCase());
    } else if (mode === 'trim') {
      result = text.split('\n').map(line => line.trim()).join('\n');
    } else if (mode === 'remove-dup') {
      const set = new Set(text.split('\n'));
      result = [...set].join('\n');
    }
    setText(result);
    setCopied(false);
  };

  return (
    <ToolLayout icon="🔤" title="Text Formatter" category="Document Tools" badgeColor="#60a5fa">
      <div style={card}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>TEXT CONTENT</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            style={{ width: '100%', height: '200px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <button onClick={() => applyFormat('upper')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '12px' }}>UPPERCASE</button>
          <button onClick={() => applyFormat('lower')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '12px' }}>lowercase</button>
          <button onClick={() => applyFormat('title')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '12px' }}>Title Case</button>
          <button onClick={() => applyFormat('trim')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '12px' }}>Trim Lines</button>
          <button onClick={() => applyFormat('remove-dup')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '12px' }}>Remove Duplicates</button>
        </div>

        <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: copied ? '#10b981' : 'linear-gradient(135deg,#1d4ed8,#3b82f6)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          {copied ? '✓ Copied' : '📋 Copy Formatted Text'}
        </button>
      </div>
    </ToolLayout>
  );
}
