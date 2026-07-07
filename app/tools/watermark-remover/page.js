'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function WatermarkRemover() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [brushSize, setBrushSize] = useState(20);
  const [isDragging, setIsDragging] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState('');
  const inputRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  const loadFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    setResultUrl('');
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
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

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    draw(e);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const coords = getCoordinates(e);

    // Draw red highlight mask to show brushed area
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.fill();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleInpaint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setProcessing(true);

    setTimeout(() => {
      const ctx = canvas.getContext('2d');
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Identify red masked pixels and apply custom box blur/cloning from neighbors
      for (let y = 1; y < canvas.height - 1; y++) {
        for (let x = 1; x < canvas.width - 1; x++) {
          const idx = (y * canvas.width + x) * 4;
          
          // Check if pixel is part of the red mask overlay
          if (data[idx] > 200 && data[idx + 3] > 0) {
            // Take average of neighbors that are NOT masked
            let rSum = 0, gSum = 0, bSum = 0, count = 0;
            for (let ky = -2; ky <= 2; ky++) {
              for (let kx = -2; kx <= 2; kx++) {
                const nIdx = ((y + ky) * canvas.width + (x + kx)) * 4;
                if (data[nIdx] < 200) {
                  rSum += data[nIdx];
                  gSum += data[nIdx + 1];
                  bSum += data[nIdx + 2];
                  count++;
                }
              }
            }
            if (count > 0) {
              data[idx] = rSum / count;
              data[idx + 1] = gSum / count;
              data[idx + 2] = bSum / count;
              data[idx + 3] = 255;
            }
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      canvas.toBlob((blob) => {
        setResultUrl(URL.createObjectURL(blob));
        setProcessing(false);
      }, 'image/png');
    }, 200);
  };

  return (
    <ToolLayout icon="🧹" title="Watermark Remover" category="Image Tools" badgeColor="#34d399">
      <div style={card}>
        <p style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '14px' }}>
          ℹ️ Paint over the watermark stamp/text with the brush, then click Remove.
        </p>

        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(52,211,153,0.8)' : 'rgba(52,211,153,0.3)'}`, borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {preview ? (
            <div>
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{ maxWidth: '100%', maxHeight: '400px', cursor: 'crosshair', display: 'block', margin: '0 auto' }}
              />
              <button onClick={() => { setFile(null); setPreview(null); setResultUrl(''); }} style={{ marginTop: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change File</button>
            </div>
          ) : (
            <><div style={{ fontSize: '3rem', marginBottom: '10px' }}>🧹</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '4px' }}>Drop an image here to paint & heal watermark</p></>
          )}
        </div>
      </div>

      {file && (
        <div style={card}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>BRUSH SIZE: {brushSize}px</label>
            <input type="range" min="5" max="50" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} style={{ width: '100%', accentColor: '#34d399' }} />
          </div>

          <button onClick={handleInpaint} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
            {processing ? '⏳ Healing watermarked region…' : '🧹 Remove Watermark'}
          </button>
        </div>
      )}

      {resultUrl && (
        <div style={{ ...card, textAlign: 'center' }}>
          <h4 style={{ color: '#fff', marginBottom: '12px' }}>HEALED OUTPUT PREVIEW</h4>
          <img src={resultUrl} alt="Result" style={{ maxHeight: '300px', maxWidth: '100%', borderRadius: '8px', marginBottom: '16px' }} />
          <a href={resultUrl} download="healed.png" style={{ display: 'block', width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontSize: '15px', fontWeight: '700', textDecoration: 'none', textAlign: 'center' }}>
            ⬇️ Download Healed Image
          </a>
        </div>
      )}
    </ToolLayout>
  );
}
