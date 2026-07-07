'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function WebpConverter() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [done, setDone] = useState(false);
  const [resultUrl, setResultUrl] = useState('');
  const [format, setFormat] = useState('image/webp');
  const inputRef = useRef(null);
  const imgRef = useRef(null);

  const loadFile = (f) => {
    if (!f) return;
    setFile(f);
    setDone(false);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); loadFile(e.dataTransfer.files[0]); }, []);

  const handleConvert = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        setResultUrl(url);
        setDone(true);
      }, format);
    };
    img.src = preview;
  };

  const getFormatLabel = () => {
    if (format === 'image/webp') return 'WebP';
    if (format === 'image/png') return 'PNG';
    return 'JPG';
  };

  const getFileExtension = () => {
    if (format === 'image/webp') return 'webp';
    if (format === 'image/png') return 'png';
    return 'jpg';
  };

  return (
    <ToolLayout icon="🌐" title="WebP Converter" category="Image Tools" badgeColor="#fb923c">
      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(251,146,60,0.8)' : 'rgba(251,146,60,0.3)'}`, borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {preview ? (
            <div>
              <img ref={imgRef} src={preview} alt="Target" style={{ maxHeight: '180px', maxWidth: '100%', borderRadius: '8px' }} />
              <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '10px' }}>{file.name}</p>
              <button onClick={() => { setFile(null); setPreview(null); setDone(false); }} style={{ marginTop: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change File</button>
            </div>
          ) : (
            <><div style={{ fontSize: '3rem', marginBottom: '10px' }}>🌐</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '4px' }}>Drop an image or WebP here</p></>
          )}
        </div>
      </div>

      {file && (
        <div style={card}>
          <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '12px' }}>CONVERT TO FORMAT</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[['image/webp', 'WebP'], ['image/png', 'PNG'], ['image/jpeg', 'JPG']].map(([f, label]) => (
              <button key={f} onClick={() => setFormat(f)} style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: format === f ? 'linear-gradient(135deg,#c2410c,#f97316)' : 'rgba(255,255,255,0.05)',
                color: '#fff', fontWeight: '700'
              }}>{label}</button>
            ))}
          </div>
        </div>
      )}

      {file && !done && (
        <button onClick={handleConvert} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#c2410c,#f97316)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          🔄 Convert to {getFormatLabel()}
        </button>
      )}

      {done && (
        <div style={{ ...card, textAlign: 'center' }}>
          <img src={resultUrl} alt="Converted Result" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', marginBottom: '16px' }} />
          <a href={resultUrl} download={`converted.${getFileExtension()}`} style={{ display: 'block', width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontSize: '15px', fontWeight: '700', textDecoration: 'none', textAlign: 'center' }}>
            ⬇️ Download Converted Image
          </a>
        </div>
      )}
    </ToolLayout>
  );
}
