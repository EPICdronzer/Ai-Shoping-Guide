'use client';
import { useState, useEffect, useRef } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function BarcodeGenerator() {
  const [value, setValue] = useState('123456789012');
  const [format, setFormat] = useState('CODE128');
  const [lineColor, setLineColor] = useState('#000000');
  const [background, setBackground] = useState('#ffffff');
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [error, setError] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => {
    import('jsbarcode').then((JsBarcode) => {
      try {
        setError(null);
        JsBarcode.default(svgRef.current, value, {
          format: format,
          lineColor: lineColor,
          background: background,
          width: width,
          height: height,
          displayValue: true
        });
      } catch (err) {
        setError('Invalid value for select format.');
      }
    });
  }, [value, format, lineColor, background, width, height]);

  const downloadSVG = () => {
    const svgElement = svgRef.current;
    if (!svgElement) return;
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = 'barcode.svg';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  return (
    <ToolLayout icon="📊" title="Barcode Generator" category="Utilities" badgeColor="#a78bfa">
      <div style={card}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>BARCODE VALUE</label>
          <input
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>FORMAT</label>
            <select
              value={format}
              onChange={e => setFormat(e.target.value)}
              style={{ width: '100%', background: 'rgba(25,20,45,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#fff', outline: 'none' }}
            >
              <option value="CODE128">Code 128 (General)</option>
              <option value="EAN13">EAN 13 (Retail)</option>
              <option value="EAN8">EAN 8</option>
              <option value="UPC">UPC (US Retail)</option>
              <option value="CODE39">Code 39</option>
              <option value="ITF14">ITF 14</option>
              <option value="MSI">MSI</option>
              <option value="pharmacode">Pharmacode</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>BAR WIDTH (1-4)</label>
            <input
              type="number"
              min="1"
              max="4"
              value={width}
              onChange={e => setWidth(Number(e.target.value))}
              style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#fff', outline: 'none' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>BAR HEIGHT</label>
            <input
              type="number"
              value={height}
              onChange={e => setHeight(Number(e.target.value))}
              style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#fff', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>LINE COLOR</label>
            <input
              type="color"
              value={lineColor}
              onChange={e => setLineColor(e.target.value)}
              style={{ width: '100%', height: '40px', background: 'none', border: 'none', cursor: 'pointer' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>BACKGROUND</label>
            <input
              type="color"
              value={background}
              onChange={e => setBackground(e.target.value)}
              style={{ width: '100%', height: '40px', background: 'none', border: 'none', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      <div style={{ ...card, textAlign: 'center' }}>
        {error ? (
          <div style={{ color: '#ef4444', marginBottom: '16px' }}>⚠️ {error}</div>
        ) : (
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', display: 'inline-block', marginBottom: '16px' }}>
            <svg ref={svgRef}></svg>
          </div>
        )}
        <button onClick={downloadSVG} disabled={!!error} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: error ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          ⬇️ Download Barcode SVG
        </button>
      </div>
    </ToolLayout>
  );
}
