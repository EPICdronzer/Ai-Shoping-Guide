'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function ImageRotator() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [done, setDone] = useState(false);
  const [resultUrl, setResultUrl] = useState('');
  const inputRef = useRef(null);
  const imgRef = useRef(null);

  const loadFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    setDone(false);
    setRotation(0);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); loadFile(e.dataTransfer.files[0]); }, []);

  const handleRotate = () => {
    const img = imgRef.current;
    if (!img) return;

    const canvas = document.createElement('canvas');
    const angle = (rotation * Math.PI) / 180;
    const sin = Math.abs(Math.sin(angle));
    const cos = Math.abs(Math.cos(angle));

    canvas.width = img.naturalWidth * cos + img.naturalHeight * sin;
    canvas.height = img.naturalWidth * sin + img.naturalHeight * cos;

    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angle);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setDone(true);
    }, 'image/png');
  };

  return (
    <ToolLayout icon="🔄" title="Image Rotator" category="Image Tools" badgeColor="#a78bfa">
      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(167,139,250,0.8)' : 'rgba(167,139,250,0.3)'}`, borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {preview ? (
            <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
              <img ref={imgRef} src={preview} alt="Rotation Target" style={{ maxWidth: '100%', maxHeight: '360px', display: 'block', transform: `rotate(${rotation}deg)`, transition: 'transform 0.2s' }} />
            </div>
          ) : (
            <><div style={{ fontSize: '3rem', marginBottom: '10px' }}>🔄</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '4px' }}>Drop an image here to rotate</p></>
          )}
        </div>
      </div>

      {file && (
        <div style={card}>
          <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '12px' }}>ROTATION ANGLE: {rotation}°</label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button onClick={() => setRotation(prev => (prev - 90) % 360)} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>Rotate Left -90°</button>
            <button onClick={() => setRotation(prev => (prev + 90) % 360)} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>Rotate Right +90°</button>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={rotation}
            onChange={e => setRotation(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#a78bfa' }}
          />
        </div>
      )}

      {file && !done && (
        <button onClick={handleRotate} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          🔄 Apply & Export Image
        </button>
      )}

      {done && (
        <div style={{ ...card, textAlign: 'center' }}>
          <img src={resultUrl} alt="Rotated Result" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', marginBottom: '16px' }} />
          <a href={resultUrl} download="rotated.png" style={{ display: 'block', width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontSize: '15px', fontWeight: '700', textDecoration: 'none', textAlign: 'center' }}>
            ⬇️ Download Rotated Image
          </a>
        </div>
      )}
    </ToolLayout>
  );
}
