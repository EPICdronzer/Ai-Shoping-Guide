'use client';
import { useState } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    let charSet = '';
    if (includeUppercase) charSet += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charSet += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charSet += '0123456789';
    if (includeSymbols) charSet += '!@#$%^&*()_+~`|}{[]:;?><,./-="';

    if (!charSet) {
      setPassword('Please select at least one option!');
      return;
    }

    let generated = '';
    const randomArray = new Uint32Array(length);
    window.crypto.getRandomValues(randomArray);
    for (let i = 0; i < length; i++) {
      generated += charSet[randomArray[i] % charSet.length];
    }
    setPassword(generated);
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout icon="🔑" title="Password Generator" category="Utilities" badgeColor="#f472b6">
      <div style={card}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>PASSWORD LENGTH: {length}</label>
          <input
            type="range"
            min="6"
            max="64"
            value={length}
            onChange={e => setLength(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#ec4899' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', cursor: 'pointer' }}>
            <input type="checkbox" checked={includeUppercase} onChange={e => setIncludeUppercase(e.target.checked)} style={{ width: '18px', height: '18px' }} />
            <span>A-Z (Uppercase)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', cursor: 'pointer' }}>
            <input type="checkbox" checked={includeLowercase} onChange={e => setIncludeLowercase(e.target.checked)} style={{ width: '18px', height: '18px' }} />
            <span>a-z (Lowercase)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', cursor: 'pointer' }}>
            <input type="checkbox" checked={includeNumbers} onChange={e => setIncludeNumbers(e.target.checked)} style={{ width: '18px', height: '18px' }} />
            <span>0-9 (Numbers)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', cursor: 'pointer' }}>
            <input type="checkbox" checked={includeSymbols} onChange={e => setIncludeSymbols(e.target.checked)} style={{ width: '18px', height: '18px' }} />
            <span>!@#$ (Symbols)</span>
          </label>
        </div>

        <button onClick={generatePassword} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#be185d,#ec4899)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          🔑 Generate Password
        </button>
      </div>

      {password && (
        <div style={{ ...card, display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            readOnly
            value={password}
            style={{ flex: 1, padding: '14px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1.5px solid rgba(255,255,255,0.1)', color: '#a78bfa', fontSize: '16px', fontWeight: 'bold', fontFamily: 'monospace', outline: 'none' }}
          />
          <button onClick={copyToClipboard} style={{ padding: '14px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: copied ? '#10b981' : '#4b5563', color: '#fff', fontWeight: '700', transition: '0.2s' }}>
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>
        </div>
      )}
    </ToolLayout>
  );
}
