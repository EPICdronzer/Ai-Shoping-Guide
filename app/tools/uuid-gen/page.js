'use client';
import { useState } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function UuidGenerator() {
  const [quantity, setQuantity] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [uuids, setUuids] = useState([]);
  const [copied, setCopied] = useState(false);

  const generateUUIDs = () => {
    const list = [];
    for (let i = 0; i < quantity; i++) {
      let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      if (uppercase) uuid = uuid.toUpperCase();
      list.push(uuid);
    }
    setUuids(list);
    setCopied(false);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout icon="🆔" title="UUID Generator" category="Utilities" badgeColor="#60a5fa">
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>QUANTITY (1-100)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={quantity}
              onChange={e => setQuantity(Math.min(100, Math.max(1, Number(e.target.value))))}
              style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', cursor: 'pointer' }}>
              <input type="checkbox" checked={uppercase} onChange={e => setUppercase(e.target.checked)} style={{ width: '18px', height: '18px' }} />
              <span>UPPERCASE UUIDs</span>
            </label>
          </div>
        </div>

        <button onClick={generateUUIDs} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          🆔 Generate UUIDs
        </button>
      </div>

      {uuids.length > 0 && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', color: '#94a3b8' }}>Generated UUIDs ({uuids.length})</span>
            <button onClick={copyAll} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: copied ? '#10b981' : '#4b5563', color: '#fff', fontWeight: '700' }}>
              {copied ? '✓ Copied All' : '📋 Copy All'}
            </button>
          </div>
          <textarea
            readOnly
            value={uuids.join('\n')}
            rows={Math.min(15, uuids.length + 1)}
            style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px', color: '#a78bfa', fontFamily: 'monospace', fontSize: '14px', resize: 'none', outline: 'none' }}
          />
        </div>
      )}
    </ToolLayout>
  );
}
