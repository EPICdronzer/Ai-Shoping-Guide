'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const fmt = (b) => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function ImageToPdf() {
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [pageSize, setPageSize] = useState('a4');
  const [orientation, setOrientation] = useState('portrait');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const addFiles = (files) => {
    const imgFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!imgFiles.length) { setError('No valid images found.'); return; }
    setError(null); setDone(false);
    const readers = imgFiles.map(f => new Promise(res => {
      const r = new FileReader();
      r.onload = e => res({ name: f.name, src: e.target.result, size: f.size });
      r.readAsDataURL(f);
    }));
    Promise.all(readers).then(loaded => setImages(prev => [...prev, ...loaded]));
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); }, []);
  const removeImage = (i) => setImages(prev => prev.filter((_, idx) => idx !== i));
  const moveUp = (i) => { if (i === 0) return; setImages(prev => { const a = [...prev]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return a; }); };
  const moveDown = (i) => { if (i === images.length - 1) return; setImages(prev => { const a = [...prev]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; return a; }); };

  const handleConvert = async () => {
    if (!images.length) return;
    setProcessing(true); setError(null);
    try {
      const { jsPDF } = await import('jspdf');
      const isLandscape = orientation === 'landscape';
      const doc = new jsPDF({ orientation, unit: 'mm', format: pageSize });
      const pw = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();

      for (let i = 0; i < images.length; i++) {
        if (i > 0) doc.addPage(pageSize, orientation);
        const imgData = images[i].src;
        const img = new Image();
        await new Promise(res => { img.onload = res; img.src = imgData; });
        const ratio = Math.min(pw / img.width, ph / img.height);
        const w = img.width * ratio;
        const h = img.height * ratio;
        const x = (pw - w) / 2;
        const y = (ph - h) / 2;
        const fmt = images[i].src.startsWith('data:image/png') ? 'PNG' : images[i].src.startsWith('data:image/webp') ? 'WEBP' : 'JPEG';
        doc.addImage(imgData, fmt, x, y, w, h);
      }
      doc.save('images_converted.pdf');
      setDone(true);
    } catch (err) { setError(err.message || 'Conversion failed'); }
    setProcessing(false);
  };

  return (
    <ToolLayout icon="🖼️" title="Image to PDF" category="Image Converter" badgeColor="#fb923c">
      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onClick={() => inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(251,146,60,0.8)' : 'rgba(251,146,60,0.3)'}`, borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.25s', background: isDragging ? 'rgba(251,146,60,0.06)' : 'transparent' }}>
          <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🖼️</div>
          <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '4px' }}>Drop images here (multiple allowed)</p>
          <p style={{ color: '#64748b', fontSize: '13px' }}>JPG, PNG, WEBP, GIF · Click to add more</p>
        </div>
      </div>

      {images.length > 0 && (
        <>
          {/* Image list */}
          <div style={card}>
            <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '14px' }}>PAGES ({images.length}) — drag to reorder</p>
            {images.map((img, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '8px' }}>
                <img src={img.src} alt={img.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Page {i + 1} · {fmt(img.size)}</div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[['↑', () => moveUp(i)], ['↓', () => moveDown(i)], ['✕', () => removeImage(i)]].map(([label, fn]) => (
                    <button key={label} onClick={fn} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: label === '✕' ? '#f87171' : '#94a3b8', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>{label}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Settings */}
          <div style={{ ...card, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>PAGE SIZE</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['a4', 'letter', 'a3'].map(s => (
                  <button key={s} onClick={() => setPageSize(s)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: pageSize === s ? 'rgba(251,146,60,0.2)' : 'rgba(255,255,255,0.05)', color: pageSize === s ? '#fb923c' : '#94a3b8', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase' }}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>ORIENTATION</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[['portrait', '↕'], ['landscape', '↔']].map(([o, ic]) => (
                  <button key={o} onClick={() => setOrientation(o)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: orientation === o ? 'rgba(251,146,60,0.2)' : 'rgba(255,255,255,0.05)', color: orientation === o ? '#fb923c' : '#94a3b8', fontWeight: '700', fontSize: '13px' }}>{ic} {o}</button>
                ))}
              </div>
            </div>
          </div>

          {!done && (
            <button onClick={handleConvert} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#c2410c,#f97316)', color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 20px rgba(249,115,22,0.3)', marginBottom: '20px' }}>
              {processing ? '⏳ Converting…' : `📄 Convert ${images.length} Image${images.length > 1 ? 's' : ''} to PDF`}
            </button>
          )}
        </>
      )}

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {done && (
        <div style={{ ...card, border: '1px solid rgba(52,211,153,0.3)', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>✅</div>
          <p style={{ color: '#34d399', fontWeight: '700', marginBottom: '6px' }}>PDF Downloaded!</p>
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>Check your downloads folder for <strong style={{ color: '#e2e8f0' }}>images_converted.pdf</strong></p>
          <button onClick={() => { setDone(false); setImages([]); }} style={{ padding: '10px 24px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>Start Over</button>
        </div>
      )}
    </ToolLayout>
  );
}
