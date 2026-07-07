'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const fmt = (b) => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

const FORMATS = [
  { id: 'image/jpeg', label: 'JPG', ext: 'jpg', hasQuality: true },
  { id: 'image/png', label: 'PNG', ext: 'png', hasQuality: false },
  { id: 'image/webp', label: 'WEBP', ext: 'webp', hasQuality: true },
  { id: 'image/bmp', label: 'BMP', ext: 'bmp', hasQuality: false },
];

export default function ImageConvert() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [format, setFormat] = useState(FORMATS[0]);
  const [quality, setQuality] = useState(90);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const imgRef = useRef(null);

  const loadFile = (f) => {
    if (!f || !f.type.startsWith('image/')) { setError('Please select a valid image.'); return; }
    setFile(f); setResult(null); setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      const img = new Image();
      img.onload = () => imgRef.current = img;
      img.src = e.target.result;
    };
    reader.readAsDataURL(f);
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); loadFile(e.dataTransfer.files[0]); }, []);

  const handleConvert = () => {
    if (!imgRef.current) return;
    setProcessing(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = imgRef.current.width;
      canvas.height = imgRef.current.height;
      const ctx = canvas.getContext('2d');
      // Fill white background for JPG (no transparency)
      if (format.id === 'image/jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      ctx.drawImage(imgRef.current, 0, 0);
      canvas.toBlob((blob) => {
        setResult({ blob, size: blob.size, name: file.name.replace(/\.[^.]+$/, '') + '.' + format.ext });
        setProcessing(false);
      }, format.id, format.hasQuality ? quality / 100 : undefined);
    } catch (err) { setError(err.message); setProcessing(false); }
  };

  const download = () => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a'); a.href = url; a.download = result.name; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout icon="🔄" title="Image Converter" category="Format Converter" badgeColor="#f472b6">
      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(244,114,182,0.8)' : 'rgba(244,114,182,0.3)'}`, borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {preview ? (
            <div>
              <img src={preview} alt="prev" style={{ maxHeight: '180px', maxWidth: '100%', borderRadius: '8px', marginBottom: '10px', objectFit: 'contain' }} />
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>{file.name} · <span style={{ color: '#f472b6' }}>{fmt(file.size)}</span></div>
              <button onClick={() => { setFile(null); setPreview(null); setResult(null); }} style={{ marginTop: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change</button>
            </div>
          ) : (
            <><div style={{ fontSize: '3rem', marginBottom: '10px' }}>🔄</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '4px' }}>Drop image here</p>
              <p style={{ color: '#64748b', fontSize: '13px' }}>Supports JPG, PNG, WEBP, GIF, BMP</p></>
          )}
        </div>
      </div>

      {file && (
        <>
          <div style={card}>
            <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>OUTPUT FORMAT</p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: format.hasQuality ? '20px' : '0' }}>
              {FORMATS.map(f => (
                <button key={f.id} onClick={() => { setFormat(f); setResult(null); }} style={{
                  flex: 1, padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  background: format.id === f.id ? 'linear-gradient(135deg,#be185d,#ec4899)' : 'rgba(255,255,255,0.05)',
                  color: format.id === f.id ? '#fff' : '#94a3b8', fontWeight: '800', fontSize: '14px',
                  boxShadow: format.id === f.id ? '0 4px 16px rgba(236,72,153,0.3)' : 'none',
                }}>{f.label}</button>
              ))}
            </div>
            {format.hasQuality && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '600' }}>Quality</span>
                  <span style={{ color: '#f472b6', fontWeight: '700' }}>{quality}%</span>
                </div>
                <input type="range" min="10" max="100" value={quality} onChange={e => setQuality(+e.target.value)} style={{ width: '100%', accentColor: '#ec4899' }} />
              </div>
            )}
          </div>

          {!result && (
            <button onClick={handleConvert} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#be185d,#ec4899)', color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 20px rgba(236,72,153,0.3)', marginBottom: '20px' }}>
              {processing ? '⏳ Converting…' : `🔄 Convert to ${format.label}`}
            </button>
          )}
        </>
      )}

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {result && (
        <div style={{ ...card, border: '1px solid rgba(52,211,153,0.3)' }}>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
            {[['Original', fmt(file.size), '#94a3b8'], ['Converted', fmt(result.size), '#34d399'], ['Format', format.label, '#f472b6']].map(([l, v, c]) => (
              <div key={l} style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: c }}>{v}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{l}</div>
              </div>
            ))}
          </div>
          <button onClick={download} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>⬇️ Download {format.label}</button>
          <button onClick={() => setResult(null)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>Try different format</button>
        </div>
      )}
    </ToolLayout>
  );
}
