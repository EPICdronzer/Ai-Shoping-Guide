'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function WatermarkRemover() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [brushSize, setBrushSize] = useState(30);
  const [isDragging, setIsDragging] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState('');
  const inputRef = useRef(null);

  // display canvas (shows image + red overlay)
  const canvasRef = useRef(null);
  // offscreen mask canvas (pure black/white — white = painted area)
  const maskCanvasRef = useRef(null);
  // original image reference
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

        // Set up display canvas
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Set up mask canvas (same size, all black = untouched)
        const mask = maskCanvasRef.current;
        mask.width = img.width;
        mask.height = img.height;
        const mCtx = mask.getContext('2d');
        mCtx.fillStyle = 'black';
        mCtx.fillRect(0, 0, img.width, img.height);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(f);
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); loadFile(e.dataTransfer.files[0]); }, []);

  const getCoordinates = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const paintBrush = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const mask = maskCanvasRef.current;
    const coords = getCoordinates(e, canvas);
    const r = (brushSize / 2) * (canvas.width / canvas.getBoundingClientRect().width);

    // Paint red highlight on display canvas
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
    ctx.fill();

    // Paint white circle on mask canvas (marks region to heal)
    const mCtx = mask.getContext('2d');
    mCtx.beginPath();
    mCtx.arc(coords.x, coords.y, r, 0, Math.PI * 2);
    mCtx.fillStyle = 'white';
    mCtx.fill();
  };

  const startDrawing = (e) => { setIsDrawing(true); paintBrush(e); };
  const stopDrawing = () => setIsDrawing(false);

  const handleInpaint = () => {
    const canvas = canvasRef.current;
    const mask = maskCanvasRef.current;
    const img = imgRef.current;
    if (!canvas || !mask || !img) return;
    setProcessing(true);

    setTimeout(() => {
      // Work on a fresh copy of the original image
      const offscreen = document.createElement('canvas');
      offscreen.width = img.width;
      offscreen.height = img.height;
      const octx = offscreen.getContext('2d');
      octx.drawImage(img, 0, 0);

      const imgData = octx.getImageData(0, 0, offscreen.width, offscreen.height);
      const pixels = imgData.data;
      const W = offscreen.width;
      const H = offscreen.height;

      // Get mask data
      const mCtx = mask.getContext('2d');
      const maskData = mCtx.getImageData(0, 0, W, H).data;

      // Build boolean mask array: true = needs healing
      const needsHeal = new Uint8Array(W * H);
      for (let i = 0; i < W * H; i++) {
        needsHeal[i] = maskData[i * 4] > 128 ? 1 : 0;
      }

      // Multi-pass inpainting: progressively fill from edges inward
      const NUM_PASSES = 12;
      const healed = new Uint8Array(pixels.length);
      healed.set(pixels);

      for (let pass = 0; pass < NUM_PASSES; pass++) {
        const radius = Math.max(4, Math.round(20 - pass * 1.5));
        const passHealed = new Uint8Array(healed);

        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            const i = y * W + x;
            if (!needsHeal[i]) continue;

            let rSum = 0, gSum = 0, bSum = 0, count = 0;
            let weight = 0;

            for (let ky = -radius; ky <= radius; ky++) {
              for (let kx = -radius; kx <= radius; kx++) {
                const nx = x + kx;
                const ny = y + ky;
                if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
                const ni = ny * W + nx;
                if (needsHeal[ni]) continue; // skip other masked pixels

                const dist = Math.sqrt(kx * kx + ky * ky);
                const w = 1 / (dist + 1);
                const nIdx = ni * 4;
                rSum += healed[nIdx] * w;
                gSum += healed[nIdx + 1] * w;
                bSum += healed[nIdx + 2] * w;
                weight += w;
                count++;
              }
            }

            if (count > 0) {
              const idx = i * 4;
              passHealed[idx]     = Math.round(rSum / weight);
              passHealed[idx + 1] = Math.round(gSum / weight);
              passHealed[idx + 2] = Math.round(bSum / weight);
              passHealed[idx + 3] = 255;
              needsHeal[i] = 0; // mark as healed for next pass
            }
          }
        }
        healed.set(passHealed);
      }

      // Write result back
      const resultData = new ImageData(new Uint8ClampedArray(healed), W, H);
      octx.putImageData(resultData, 0, 0);

      offscreen.toBlob((blob) => {
        setResultUrl(URL.createObjectURL(blob));

        // Update display canvas to show healed result
        const ctx = canvas.getContext('2d');
        ctx.drawImage(offscreen, 0, 0);

        // Reset mask
        const mCtx = mask.getContext('2d');
        mCtx.fillStyle = 'black';
        mCtx.fillRect(0, 0, W, H);

        setProcessing(false);
      }, 'image/png');
    }, 50);
  };

  const handleReset = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const mask = maskCanvasRef.current;
    if (!img || !canvas || !mask) return;
    // Restore original image on display canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    // Clear mask
    const mCtx = mask.getContext('2d');
    mCtx.fillStyle = 'black';
    mCtx.fillRect(0, 0, img.width, img.height);
    setResultUrl('');
  };

  return (
    <ToolLayout icon="🧹" title="Watermark Remover" category="Image Tools" badgeColor="#34d399">
      <div style={card}>
        <p style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '14px' }}>
          ℹ️ Paint over the watermark with the brush, then click <strong style={{color:'#34d399'}}>Remove Watermark</strong>.
        </p>

        {/* Hidden mask canvas (offscreen, not rendered) */}
        <canvas ref={maskCanvasRef} style={{ display: 'none' }} />

        <div
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(52,211,153,0.8)' : 'rgba(52,211,153,0.3)'}`, borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {preview ? (
            <div>
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={paintBrush}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{ maxWidth: '100%', maxHeight: '400px', cursor: 'crosshair', display: 'block', margin: '0 auto', borderRadius: '8px' }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
                <button onClick={handleReset} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>↩ Reset Canvas</button>
                <button onClick={() => { setFile(null); setPreview(null); setResultUrl(''); }} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change File</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🧹</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '4px' }}>Drop an image here to paint & heal watermark</p>
            </>
          )}
        </div>
      </div>

      {file && (
        <div style={card}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>BRUSH SIZE: {brushSize}px</label>
            <input type="range" min="5" max="80" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} style={{ width: '100%', accentColor: '#34d399' }} />
          </div>

          <button onClick={handleInpaint} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700', opacity: processing ? 0.7 : 1 }}>
            {processing ? '⏳ Healing region… please wait' : '🧹 Remove Watermark'}
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
