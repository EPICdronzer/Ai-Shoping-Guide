'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function AiImageUpscaler() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scale, setScale] = useState(2);
  const [sharpness, setSharpness] = useState(1); // 0 to 5
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

  const handleUpscale = () => {
    const img = imgRef.current;
    if (!img) return;
    setProcessing(true);

    setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Perform a custom sharpen convolution kernel if sharpness is selected
      if (sharpness > 0) {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const width = canvas.width;
        const height = canvas.height;
        const copy = new Uint8ClampedArray(data);

        // Simple Laplacian Sharpening kernel
        const k = sharpness * 0.15;
        const weights = [
          0, -k, 0,
          -k, 1 + 4*k, -k,
          0, -k, 0
        ];

        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            for (let c = 0; c < 3; c++) {
              let val = 0;
              for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                  const pIdx = ((y + ky) * width + (x + kx)) * 4 + c;
                  const weight = weights[(ky + 1) * 3 + (kx + 1)];
                  val += copy[pIdx] * weight;
                }
              }
              data[idx + c] = Math.min(255, Math.max(0, val));
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      canvas.toBlob((blob) => {
        setResultUrl(URL.createObjectURL(blob));
        setProcessing(false);
      }, 'image/png');
    }, 200);
  };

  return (
    <ToolLayout icon="🚀" title="AI Image Upscaler" category="Image Tools" badgeColor="#60a5fa">
      <div style={card}>
        <p style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '14px' }}>
          ℹ️ Upscale photo resolution by 2x-4x with client-side edge reconstruction and sharpen filters.
        </p>

        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(96,165,250,0.8)' : 'rgba(96,165,250,0.3)'}`, borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {preview ? (
            <div>
              <img ref={imgRef} src={preview} alt="Target" style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '8px' }} />
              <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '10px' }}>{file.name}</p>
              <button onClick={() => { setFile(null); setPreview(null); setResultUrl(''); }} style={{ marginTop: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change File</button>
            </div>
          ) : (
            <><div style={{ fontSize: '3rem', marginBottom: '10px' }}>🚀</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '4px' }}>Drop an image here to upscale</p></>
          )}
        </div>
      </div>

      {file && (
        <div style={card}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>SCALE FACTOR</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[2, 3, 4].map(s => (
                  <button key={s} onClick={() => setScale(s)} style={{
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: scale === s ? 'linear-gradient(135deg,#1d4ed8,#3b82f6)' : 'rgba(255,255,255,0.05)',
                    color: '#fff', fontWeight: '700'
                  }}>{s}x</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>SHARPNESS ENHANCE ({sharpness})</label>
              <input type="range" min="0" max="5" value={sharpness} onChange={e => setSharpness(Number(e.target.value))} style={{ width: '100%', accentColor: '#3b82f6', marginTop: '10px' }} />
            </div>
          </div>

          <button onClick={handleUpscale} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
            {processing ? '⏳ Enhancing details…' : '🚀 Upscale Image'}
          </button>
        </div>
      )}

      {resultUrl && (
        <div style={{ ...card, textAlign: 'center' }}>
          <h4 style={{ color: '#fff', marginBottom: '12px' }}>UPSCALED PREVIEW</h4>
          <img src={resultUrl} alt="Result" style={{ maxHeight: '300px', maxWidth: '100%', borderRadius: '8px', marginBottom: '16px' }} />
          <a href={resultUrl} download="upscaled.png" style={{ display: 'block', width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontSize: '15px', fontWeight: '700', textDecoration: 'none', textAlign: 'center' }}>
            ⬇️ Download Enhanced Image
          </a>
        </div>
      )}
    </ToolLayout>
  );
}
