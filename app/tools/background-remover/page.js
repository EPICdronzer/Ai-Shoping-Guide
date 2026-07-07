'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function BackgroundRemover() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [keyColor, setKeyColor] = useState('#ffffff');
  const [tolerance, setTolerance] = useState(30);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState('');
  const inputRef = useRef(null);
  const imgRef = useRef(null);

  const loadFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    setResultUrl('');
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); loadFile(e.dataTransfer.files[0]); }, []);

  const handleRemoveBackground = () => {
    const img = imgRef.current;
    if (!img) return;
    setProcessing(true);

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Convert hex keyColor to RGB
    const rKey = parseInt(keyColor.slice(1, 3), 16);
    const gKey = parseInt(keyColor.slice(3, 5), 16);
    const bKey = parseInt(keyColor.slice(5, 7), 16);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Calculate Euclidean distance between pixel color and key color
      const diff = Math.sqrt((r - rKey) ** 2 + (g - gKey) ** 2 + (b - bKey) ** 2);

      if (diff < tolerance) {
        data[i + 3] = 0; // Set alpha to 0 (transparent)
      }
    }

    ctx.putImageData(imgData, 0, 0);
    canvas.toBlob((blob) => {
      setResultUrl(URL.createObjectURL(blob));
      setProcessing(false);
    }, 'image/png');
  };

  return (
    <ToolLayout icon="👤" title="Background Remover" category="Image Tools" badgeColor="#f472b6">
      <div style={card}>
        <p style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '14px' }}>
          ℹ️ Upload an image with a solid background color (e.g. white, green, black) to make it transparent.
        </p>

        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(244,114,182,0.8)' : 'rgba(244,114,182,0.3)'}`, borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {preview ? (
            <div>
              <img ref={imgRef} src={preview} alt="Target" style={{ maxHeight: '240px', maxWidth: '100%', borderRadius: '8px' }} />
              <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '10px' }}>{file.name}</p>
              <button onClick={() => { setFile(null); setPreview(null); setResultUrl(''); }} style={{ marginTop: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change File</button>
            </div>
          ) : (
            <><div style={{ fontSize: '3rem', marginBottom: '10px' }}>👤</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '4px' }}>Drop an image here to remove background</p></>
          )}
        </div>
      </div>

      {file && (
        <div style={card}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>KEY COLOR TO REMOVE</label>
              <input type="color" value={keyColor} onChange={e => setKeyColor(e.target.value)} style={{ width: '100%', height: '40px', background: 'none', border: 'none', cursor: 'pointer' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>MATCH TOLERANCE ({tolerance})</label>
              <input type="range" min="5" max="150" value={tolerance} onChange={e => setTolerance(Number(e.target.value))} style={{ width: '100%', accentColor: '#f472b6', marginTop: '10px' }} />
            </div>
          </div>

          <button onClick={handleRemoveBackground} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#be185d,#ec4899)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
            {processing ? '⏳ Processing…' : '👤 Remove Background Color'}
          </button>
        </div>
      )}

      {resultUrl && (
        <div style={{ ...card, textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
          <h4 style={{ color: '#fff', marginBottom: '12px' }}>OUTPUT PREVIEW</h4>
          <div style={{ background: 'repeating-conic-gradient(#333 0% 25%, #222 0% 50%) 50% / 20px 20px', padding: '16px', borderRadius: '8px', display: 'inline-block', marginBottom: '16px' }}>
            <img src={resultUrl} alt="Result" style={{ maxHeight: '240px', maxWidth: '100%' }} />
          </div>
          <a href={resultUrl} download="no-bg.png" style={{ display: 'block', width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontSize: '15px', fontWeight: '700', textDecoration: 'none', textAlign: 'center' }}>
            ⬇️ Download PNG
          </a>
        </div>
      )}
    </ToolLayout>
  );
}
