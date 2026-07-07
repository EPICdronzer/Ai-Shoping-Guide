'use client';
import { useState, useEffect } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function ColorPaletteGenerator() {
  const [colors, setColors] = useState([]);
  const [copiedColor, setCopiedColor] = useState(null);

  const generateRandomPalette = () => {
    const palette = [];
    for (let i = 0; i < 5; i++) {
      const hex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
      palette.push(hex);
    }
    setColors(palette);
  };

  useEffect(() => {
    generateRandomPalette();
  }, []);

  const copyColor = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  return (
    <ToolLayout icon="🎨" title="Color Palette Generator" category="Utilities" badgeColor="#f472b6">
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', minHeight: '200px', marginBottom: '20px' }}>
          {colors.map((color, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ flex: 1, backgroundColor: color, cursor: 'pointer' }} onClick={() => copyColor(color)} />
              <div style={{ background: '#0a081c', padding: '12px 6px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: '#fff', fontFamily: 'monospace', position: 'relative' }}>
                {color.toUpperCase()}
                {copiedColor === color && (
                  <div style={{ position: 'absolute', inset: 0, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0 0 12px 12px', fontSize: '10px' }}>
                    Copied!
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button onClick={generateRandomPalette} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#be185d,#ec4899)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          🔄 Generate New Color Palette
        </button>
      </div>
    </ToolLayout>
  );
}
