'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const fmt = (b) => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

const PRESETS = [
  { label: 'Instagram Post', w: 1080, h: 1080 },
  { label: 'Instagram Story', w: 1080, h: 1920 },
  { label: 'Twitter Banner', w: 1500, h: 500 },
  { label: 'Facebook Cover', w: 851, h: 315 },
  { label: 'LinkedIn Banner', w: 1584, h: 396 },
  { label: 'YouTube Thumb', w: 1280, h: 720 },
  { label: 'WhatsApp DP', w: 640, h: 640 },
  { label: '4K', w: 3840, h: 2160 },
];

export default function ImageResize() {
  const [file, setFile] = useState(null);
  const [origDims, setOrigDims] = useState({ w: 0, h: 0 });
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [locked, setLocked] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);
  const imgRef = useRef(null);

  const loadFile = (f) => {
    if (!f || !f.type.startsWith('image/')) { setError('Please select a valid image.'); return; }
    setFile(f); setResult(null); setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      const img = new Image();
      img.onload = () => { setOrigDims({ w: img.width, h: img.height }); setWidth(img.width); setHeight(img.height); imgRef.current = img; };
      img.src = e.target.result;
    };
    reader.readAsDataURL(f);
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); loadFile(e.dataTransfer.files[0]); }, []);

  const handleWidthChange = (val) => {
    setWidth(val);
    if (locked && origDims.w) setHeight(Math.round((val / origDims.w) * origDims.h));
  };
  const handleHeightChange = (val) => {
    setHeight(val);
    if (locked && origDims.h) setWidth(Math.round((val / origDims.h) * origDims.w));
  };

  const applyPreset = (p) => { setWidth(p.w); setHeight(p.h); setLocked(false); };

  const handleResize = () => {
    if (!imgRef.current || !width || !height) return;
    setProcessing(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = +width; canvas.height = +height;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(imgRef.current, 0, 0, +width, +height);
      canvas.toBlob((blob) => {
        setResult({ blob, name: file.name.replace(/\.[^.]+$/, '') + `_${width}x${height}.png`, w: +width, h: +height });
        setProcessing(false);
      }, 'image/png');
    } catch (err) { setError(err.message); setProcessing(false); }
  };

  const download = () => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a'); a.href = url; a.download = result.name; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout icon="📐" title="Image Resizer" category="Image Tools" badgeColor="#a78bfa">
      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(167,139,250,0.8)' : 'rgba(167,139,250,0.3)'}`, borderRadius: '12px', padding: '28px', textAlign: 'center', cursor: file ? 'default' : 'pointer', background: isDragging ? 'rgba(167,139,250,0.08)' : 'transparent', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {preview ? (
            <div>
              <img src={preview} alt="prev" style={{ maxHeight: '160px', maxWidth: '100%', borderRadius: '8px', marginBottom: '10px', objectFit: 'contain' }} />
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>{file.name} · {origDims.w}×{origDims.h}px · <span style={{ color: '#a78bfa' }}>{fmt(file.size)}</span></div>
              <button onClick={() => { setFile(null); setPreview(null); setResult(null); }} style={{ marginTop: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change</button>
            </div>
          ) : (
            <> <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🖼️</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '4px' }}>Drop image here</p>
              <p style={{ color: '#64748b', fontSize: '13px' }}>or click to browse</p></>
          )}
        </div>
      </div>

      {file && (
        <>
          {/* Presets */}
          <div style={card}>
            <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>📱 PRESETS</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {PRESETS.map(p => (
                <button key={p.label} onClick={() => applyPreset(p)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(167,139,250,0.25)', background: 'rgba(167,139,250,0.06)', color: '#a78bfa', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                  {p.label} <span style={{ color: '#64748b' }}>{p.w}×{p.h}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dimensions */}
          <div style={{ ...card, display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>WIDTH (px)</label>
              <input type="number" value={width} onChange={e => handleWidthChange(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#f1f5f9', fontSize: '15px', fontWeight: '700', outline: 'none' }} />
            </div>
            <button onClick={() => setLocked(!locked)} style={{ marginTop: '18px', width: '40px', height: '40px', borderRadius: '10px', border: '1px solid rgba(167,139,250,0.3)', background: locked ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)', color: locked ? '#a78bfa' : '#64748b', cursor: 'pointer', fontSize: '16px', flexShrink: 0 }}>
              {locked ? '🔒' : '🔓'}
            </button>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>HEIGHT (px)</label>
              <input type="number" value={height} onChange={e => handleHeightChange(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#f1f5f9', fontSize: '15px', fontWeight: '700', outline: 'none' }} />
            </div>
          </div>

          {!result && (
            <button onClick={handleResize} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 20px rgba(124,58,237,0.3)', marginBottom: '20px' }}>
              {processing ? '⏳ Resizing…' : '📐 Resize Image'}
            </button>
          )}
        </>
      )}

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {result && (
        <div style={{ ...card, border: '1px solid rgba(52,211,153,0.3)' }}>
          <p style={{ color: '#34d399', fontWeight: '700', marginBottom: '12px' }}>✅ Resized to {result.w}×{result.h}px</p>
          <button onClick={download} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 20px rgba(16,185,129,0.3)', marginBottom: '10px' }}>⬇️ Download PNG</button>
          <button onClick={() => setResult(null)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>Try again</button>
        </div>
      )}
    </ToolLayout>
  );
}
