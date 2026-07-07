'use client';
import { useState } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

const UNITS = {
  length: {
    name: '📏 Length',
    rates: { meter: 1, kilometer: 1000, centimeter: 0.01, millimeter: 0.001, mile: 1609.34, yard: 0.9144, foot: 0.3048, inch: 0.0254 }
  },
  weight: {
    name: '⚖️ Weight/Mass',
    rates: { kilogram: 1, gram: 0.001, milligram: 0.000001, pound: 0.453592, ounce: 0.0283495 }
  },
  data: {
    name: '💾 Data Size',
    rates: { Byte: 1, Kilobyte: 1024, Megabyte: 1048576, Gigabyte: 1073741824, Terabyte: 1099511627776 }
  }
};

export default function UnitConverter() {
  const [category, setCategory] = useState('length');
  const [val, setVal] = useState('1');
  const [fromUnit, setFromUnit] = useState('meter');
  const [toUnit, setToUnit] = useState('kilometer');

  const keys = Object.keys(UNITS[category].rates);

  // Auto adjust standard to and from selectors when category changes
  const changeCategory = (cat) => {
    setCategory(cat);
    const rates = Object.keys(UNITS[cat].rates);
    setFromUnit(rates[0]);
    setToUnit(rates[1] || rates[0]);
  };

  const getResult = () => {
    const num = parseFloat(val);
    if (isNaN(num)) return '';
    const baseVal = num * UNITS[category].rates[fromUnit];
    return baseVal / UNITS[category].rates[toUnit];
  };

  return (
    <ToolLayout icon="📏" title="Unit Converter" category="Utilities" badgeColor="#60a5fa">
      <div style={card}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>CATEGORY</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.keys(UNITS).map(cat => (
              <button key={cat} onClick={() => changeCategory(cat)} style={{
                flex: 1, minWidth: '110px', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: category === cat ? 'linear-gradient(135deg,#1d4ed8,#3b82f6)' : 'rgba(255,255,255,0.05)',
                color: '#fff', fontWeight: '700', fontSize: '13px'
              }}>{UNITS[cat].name}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>VALUE</label>
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
              value={fromUnit}
              onChange={e => setFromUnit(e.target.value)}
              style={{ width: '100%', background: 'rgba(25,20,45,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '11px', color: '#fff', outline: 'none' }}
            >
              {keys.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>TO</label>
            <select
              value={toUnit}
              onChange={e => setToUnit(e.target.value)}
              style={{ width: '100%', background: 'rgba(25,20,45,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '11px', color: '#fff', outline: 'none' }}
            >
              {keys.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        </div>
      </div>

      {val && (
        <div style={{ ...card, textAlign: 'center', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>CONVERTED VALUE</span>
          <h2 style={{ fontSize: '2.2rem', color: '#60a5fa', margin: '8px 0 0' }}>
            {getResult()} <span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>{toUnit}</span>
          </h2>
        </div>
      )}
    </ToolLayout>
  );
}
