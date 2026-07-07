'use client';
import { useState } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

const RATES = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.45,
  JPY: 157.82,
  CAD: 1.37,
  AUD: 1.51,
  CNY: 7.24
};

export default function CurrencyConverter() {
  const [val, setVal] = useState('100');
  const [fromCurr, setFromCurr] = useState('USD');
  const [toCurr, setToCurr] = useState('INR');

  const keys = Object.keys(RATES);

  const getResult = () => {
    const num = parseFloat(val);
    if (isNaN(num)) return '';
    const baseVal = num / RATES[fromCurr];
    return (baseVal * RATES[toCurr]).toFixed(2);
  };

  const swap = () => {
    const temp = fromCurr;
    setFromCurr(toCurr);
    setToCurr(temp);
  };

  return (
    <ToolLayout icon="💱" title="Currency Converter" category="Utilities" badgeColor="#34d399">
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>AMOUNT</label>
            <input
              type="number"
              value={val}
              onChange={e => setVal(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '11px', color: '#fff', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>FROM</label>
            <select
              value={fromCurr}
              onChange={e => setFromCurr(e.target.value)}
              style={{ width: '100%', background: 'rgba(25,20,45,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '11px', color: '#fff', outline: 'none' }}
            >
              {keys.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>TO</label>
            <select
              value={toCurr}
              onChange={e => setToCurr(e.target.value)}
              style={{ width: '100%', background: 'rgba(25,20,45,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '11px', color: '#fff', outline: 'none' }}
            >
              {keys.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        </div>

        <button onClick={swap} style={{ marginTop: '16px', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', cursor: 'pointer', fontSize: '12px', display: 'block', width: 'fit-content' }}>
          🔄 Swap Currencies
        </button>
      </div>

      {val && (
        <div style={{ ...card, textAlign: 'center', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>CONVERTED AMOUNT</span>
          <h2 style={{ fontSize: '2.2rem', color: '#34d399', margin: '8px 0 0' }}>
            {getResult()} <span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>{toCurr}</span>
          </h2>
        </div>
      )}
    </ToolLayout>
  );
}
