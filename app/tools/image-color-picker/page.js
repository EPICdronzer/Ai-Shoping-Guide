'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function ImageColorPicker() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pickedColor, setPickedColor] = useState({ hex: '#7c3aed', rgb: 'rgb(124, 58, 237)' });
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);
  const canvasRef = useRef(null);

  const loadFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(f);
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); loadFile(e.dataTransfer.files[0]); }, []);

  const handlePickColor = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    const ctx = canvas.getContext('2d');
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = '#' + ((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1);
    setPickedColor({
      hex: hex,
      rgb: `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`
    });
    setCopied(false);
  };

  const copyHex = () => {
    navigator.clipboard.writeText(pickedColor.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout icon="🎨" title="Image Color Picker" category="Image Tools" badgeColor="#f472b6">
      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(244,114,182,0.8)' : 'rgba(244,114,182,0.3)'}`, borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {preview ? (
            <div>
              <canvas ref={canvasRef} onClick={handlePickColor} style={{ maxWidth: '100%', maxHeight: '400px', cursor: 'crosshair', display: 'block', margin: '0 auto', border: '1px solid rgba(255,255,255,0.1)' }} />
              <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '10px' }}>🖱️ Click anywhere on the image above to pick a color.</p>
            </div>
          ) : (
            <><div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎨</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '4px' }}>Drop an image here to pick color</p></>
          )}
        </div>
      </div>

      {pickedColor && (
        <div style={{ ...card, display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: pickedColor.hex, border: '2px solid rgba(255,255,255,0.2)' }} />
          <div style={{ flex: 1 }}>
            <h4 style={{ color: '#fff', margin: '0 0 4px' }}>HEX: {pickedColor.hex.toUpperCase()}</h4>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>RGB: {pickedColor.rgb}</p>
          </div>
          <button onClick={copyHex} style={{ padding: '12px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: copied ? '#10b981' : '#4b5563', color: '#fff', fontWeight: '700' }}>
            {copied ? '✓ Copied' : '📋 Copy HEX'}
          </button>
        </div>
      )}
    </ToolLayout>
  );
}
