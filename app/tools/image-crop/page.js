'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function ImageCropper() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cropBox, setCropBox] = useState({ x: 50, y: 50, w: 200, h: 200 });
  const [done, setDone] = useState(false);
  const [resultUrl, setResultUrl] = useState('');
  const inputRef = useRef(null);
  const imgRef = useRef(null);

  const loadFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    setDone(false);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); loadFile(e.dataTransfer.files[0]); }, []);

  const handleCrop = () => {
    const img = imgRef.current;
    if (!img) return;

    const canvas = document.createElement('canvas');
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    canvas.width = cropBox.w * scaleX;
    canvas.height = cropBox.h * scaleY;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      img,
      cropBox.x * scaleX,
      cropBox.y * scaleY,
      cropBox.w * scaleX,
      cropBox.h * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setDone(true);
    }, 'image/png');
  };

  return (
    <ToolLayout icon="✂️" title="Image Cropper" category="Image Tools" badgeColor="#fb923c">
      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(251,146,60,0.8)' : 'rgba(251,146,60,0.3)'}`, borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {preview ? (
            <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
              <img ref={imgRef} src={preview} alt="Crop Target" style={{ maxWidth: '100%', maxHeight: '400px', display: 'block', userSelect: 'none' }} />
              <div style={{
                position: 'absolute',
                left: `${cropBox.x}px`,
                top: `${cropBox.y}px`,
                width: `${cropBox.w}px`,
                height: `${cropBox.h}px`,
                border: '2px dashed #f97316',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
                pointerEvents: 'none'
              }} />
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button onClick={() => setCropBox(prev => ({ ...prev, w: Math.max(50, prev.w - 20), h: Math.max(50, prev.h - 20) }))} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Zoom Out Crop</button>
                <button onClick={() => setCropBox(prev => ({ ...prev, w: prev.w + 20, h: prev.h + 20 }))} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Zoom In Crop</button>
                <button onClick={() => setCropBox(prev => ({ ...prev, x: Math.max(0, prev.x - 20) }))} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>⬅️ Left</button>
                <button onClick={() => setCropBox(prev => ({ ...prev, x: prev.x + 20 }))} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>➡️ Right</button>
                <button onClick={() => setCropBox(prev => ({ ...prev, y: Math.max(0, prev.y - 20) }))} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>⬆️ Up</button>
                <button onClick={() => setCropBox(prev => ({ ...prev, y: prev.y + 20 }))} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>⬇️ Down</button>
              </div>
            </div>
          ) : (
            <><div style={{ fontSize: '3rem', marginBottom: '10px' }}>✂️</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '4px' }}>Drop an image here to crop</p></>
          )}
        </div>
      </div>

      {file && !done && (
        <button onClick={handleCrop} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#c2410c,#f97316)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          ✂️ Crop Image
        </button>
      )}

      {done && (
        <div style={{ ...card, textAlign: 'center' }}>
          <img src={resultUrl} alt="Cropped Result" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', marginBottom: '16px' }} />
          <a href={resultUrl} download="cropped.png" style={{ display: 'block', width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontSize: '15px', fontWeight: '700', textDecoration: 'none', textAlign: 'center' }}>
            ⬇️ Download Cropped Image
          </a>
        </div>
      )}
    </ToolLayout>
  );
}
