'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function AiPhotoEnhancer() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
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

  const handleEnhance = () => {
    const img = imgRef.current;
    if (!img) return;
    setProcessing(true);

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');

    // Apply filters directly to canvas context
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
    ctx.drawImage(img, 0, 0);

    canvas.toBlob((blob) => {
      setResultUrl(URL.createObjectURL(blob));
      setProcessing(false);
    }, 'image/png');
  };

  return (
    <ToolLayout icon="✨" title="AI Photo Enhancer" category="Image Tools" badgeColor="#a78bfa">
      <div style={card}>
        <p style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '14px' }}>
          ℹ️ Adjust sliders to enhance quality, contrast, saturation, and apply soft focus to your images.
        </p>

        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(167,139,250,0.8)' : 'rgba(167,139,250,0.3)'}`, borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {preview ? (
            <div>
              <img ref={imgRef} src={preview} alt="Target" style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '8px', filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)` }} />
              <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '10px' }}>{file.name}</p>
              <button onClick={() => { setFile(null); setPreview(null); setResultUrl(''); }} style={{ marginTop: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change File</button>
            </div>
          ) : (
            <><div style={{ fontSize: '3rem', marginBottom: '10px' }}>✨</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '4px' }}>Drop an image here to enhance</p></>
          )}
        </div>
      </div>

      {file && (
        <div style={card}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>BRIGHTNESS ({brightness}%)</label>
              <input type="range" min="50" max="200" value={brightness} onChange={e => setBrightness(Number(e.target.value))} style={{ width: '100%', accentColor: '#a78bfa' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>CONTRAST ({contrast}%)</label>
              <input type="range" min="50" max="200" value={contrast} onChange={e => setContrast(Number(e.target.value))} style={{ width: '100%', accentColor: '#a78bfa' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>SATURATION ({saturation}%)</label>
              <input type="range" min="0" max="200" value={saturation} onChange={e => setSaturation(Number(e.target.value))} style={{ width: '100%', accentColor: '#a78bfa' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>SOFT BLUR ({blur}px)</label>
              <input type="range" min="0" max="10" value={blur} onChange={e => setBlur(Number(e.target.value))} style={{ width: '100%', accentColor: '#a78bfa' }} />
            </div>
          </div>

          <button onClick={handleEnhance} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
            {processing ? '⏳ Enhancing photo filters…' : '✨ Apply & Export Image'}
          </button>
        </div>
      )}

      {resultUrl && (
        <div style={{ ...card, textAlign: 'center' }}>
          <h4 style={{ color: '#fff', marginBottom: '12px' }}>ENHANCED OUTPUT PREVIEW</h4>
          <img src={resultUrl} alt="Result" style={{ maxHeight: '300px', maxWidth: '100%', borderRadius: '8px', marginBottom: '16px' }} />
          <a href={resultUrl} download="enhanced.png" style={{ display: 'block', width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontSize: '15px', fontWeight: '700', textDecoration: 'none', textAlign: 'center' }}>
            ⬇️ Download Image
          </a>
        </div>
      )}
    </ToolLayout>
  );
}
