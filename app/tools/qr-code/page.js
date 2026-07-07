'use client';
import { useState, useEffect, useRef } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function QrCodeGenerator() {
  const [text, setText] = useState('https://mindsuite.ai');
  const [size, setSize] = useState(256);
  const [color, setColor] = useState('#000000');
  const [bg, setBg] = useState('#ffffff');
  const [qrUrl, setQrUrl] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    import('qrcode').then((QRCode) => {
      QRCode.toDataURL(text, {
        width: size,
        margin: 2,
        color: {
          dark: color,
          light: bg
        }
      }, (err, url) => {
        if (!err) setQrUrl(url);
      });
    });
  }, [text, size, color, bg]);

  const download = () => {
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = 'qrcode.png';
    a.click();
  };

  return (
    <ToolLayout icon="📱" title="QR Code Generator" category="Utilities" badgeColor="#fb923c">
      <div style={card}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>TEXT OR URL</label>
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>SIZE (px)</label>
            <input
              type="number"
              value={size}
              onChange={e => setSize(Number(e.target.value))}
              style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#fff', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>FOREGROUND</label>
            <input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              style={{ width: '100%', height: '40px', background: 'none', border: 'none', cursor: 'pointer' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>BACKGROUND</label>
            <input
              type="color"
              value={bg}
              onChange={e => setBg(e.target.value)}
              style={{ width: '100%', height: '40px', background: 'none', border: 'none', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {qrUrl && (
        <div style={{ ...card, textAlign: 'center' }}>
          <img src={qrUrl} alt="QR Code" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', marginBottom: '16px', background: '#fff', padding: '8px' }} />
          <button onClick={download} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#c2410c,#f97316)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
            ⬇️ Download QR Code PNG
          </button>
        </div>
      )}
    </ToolLayout>
  );
}
