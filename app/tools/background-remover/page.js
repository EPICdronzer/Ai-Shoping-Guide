'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

// ---------- Color Math ----------
function colorDist(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
  return Math.sqrt(0.299 * dr * dr + 0.587 * dg * dg + 0.114 * db * db);
}
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

// ---------- Flood Fill ----------
function floodFillMask(pixels, W, H, sx, sy, seedR, seedG, seedB, tol) {
  const mask = new Uint8Array(W * H);
  const visited = new Uint8Array(W * H);
  const stack = [sy * W + sx];
  visited[sy * W + sx] = 1;

  while (stack.length > 0) {
    const pos = stack.pop();
    const x = pos % W, y = (pos / W) | 0;
    const ii = pos * 4;
    if (colorDist(pixels[ii], pixels[ii + 1], pixels[ii + 2], seedR, seedG, seedB) > tol) continue;
    mask[pos] = 1;
    if (x > 0     && !visited[pos - 1]) { visited[pos - 1] = 1; stack.push(pos - 1); }
    if (x < W - 1 && !visited[pos + 1]) { visited[pos + 1] = 1; stack.push(pos + 1); }
    if (y > 0     && !visited[pos - W]) { visited[pos - W] = 1; stack.push(pos - W); }
    if (y < H - 1 && !visited[pos + W]) { visited[pos + W] = 1; stack.push(pos + W); }
  }
  return mask;
}

// ---------- Morphological Ops ----------
function erodeMask(mask, W, H, n) {
  let cur = new Uint8Array(mask);
  for (let it = 0; it < n; it++) {
    const next = new Uint8Array(cur);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const p = y * W + x;
      if (!cur[p]) continue;
      if (!cur[p - 1] || !cur[p + 1] || !cur[p - W] || !cur[p + W]) next[p] = 0;
    }
    cur = next;
  }
  return cur;
}

function dilateMask(mask, W, H, n) {
  let cur = new Uint8Array(mask);
  for (let it = 0; it < n; it++) {
    const next = new Uint8Array(cur);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const p = y * W + x;
      if (cur[p]) continue;
      if (cur[p - 1] || cur[p + 1] || cur[p - W] || cur[p + W]) next[p] = 1;
    }
    cur = next;
  }
  return cur;
}

// ---------- Box Blur (for feathering) ----------
function boxBlur(arr, W, H, radius) {
  const tmp = new Float32Array(arr);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let s = 0, c = 0;
    for (let k = -radius; k <= radius; k++) {
      const nx = x + k;
      if (nx >= 0 && nx < W) { s += arr[y * W + nx]; c++; }
    }
    tmp[y * W + x] = s / c;
  }
  const out = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let s = 0, c = 0;
    for (let k = -radius; k <= radius; k++) {
      const ny = y + k;
      if (ny >= 0 && ny < H) { s += tmp[ny * W + x]; c++; }
    }
    out[y * W + x] = s / c;
  }
  return out;
}

// ---------- Build alpha from mask ----------
function buildAlpha(mask, W, H, featherR) {
  const alpha = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) alpha[i] = mask[i] ? 0 : 1;
  return featherR > 0 ? boxBlur(alpha, W, H, featherR) : alpha;
}

// ---------- Defringe ----------
function defringe(pixels, alpha, W, H, bgR, bgG, bgB) {
  const out = new Uint8ClampedArray(pixels);
  for (let i = 0; i < W * H; i++) {
    const a = alpha[i];
    if (a < 0.05 || a > 0.95) continue;
    const pi = i * 4;
    out[pi]     = Math.max(0, Math.min(255, Math.round((pixels[pi]     - bgR * (1 - a)) / a)));
    out[pi + 1] = Math.max(0, Math.min(255, Math.round((pixels[pi + 1] - bgG * (1 - a)) / a)));
    out[pi + 2] = Math.max(0, Math.min(255, Math.round((pixels[pi + 2] - bgB * (1 - a)) / a)));
  }
  return out;
}

// ---------- Remove small isolated transparent islands ----------
function fillIslands(mask, W, H, minSize) {
  // Connected-component analysis on TRANSPARENT areas not touching edges
  const visited = new Uint8Array(W * H);
  const result = new Uint8Array(mask);

  for (let startY = 1; startY < H - 1; startY++) for (let startX = 1; startX < W - 1; startX++) {
    const startPos = startY * W + startX;
    if (mask[startPos] || visited[startPos]) continue; // not transparent or visited

    // BFS to find this transparent component
    const component = [startPos];
    const queue = [startPos];
    visited[startPos] = 1;
    let touchesEdge = false;

    while (queue.length > 0) {
      const pos = queue.shift();
      const x = pos % W, y = (pos / W) | 0;
      if (x === 0 || x === W - 1 || y === 0 || y === H - 1) touchesEdge = true;

      const neighbors = [pos - 1, pos + 1, pos - W, pos + W];
      for (const n of neighbors) {
        if (n < 0 || n >= W * H || visited[n] || mask[n]) continue;
        visited[n] = 1;
        component.push(n);
        queue.push(n);
      }
    }

    // If this transparent region doesn't touch an edge and is small, fill it back (make opaque)
    if (!touchesEdge && component.length < minSize) {
      for (const pos of component) result[pos] = 1; // mark as foreground (opaque)
    }
  }

  return result;
}

// ---------- Edge seed collection ----------
function getEdgeSeeds(W, H, step = 8) {
  const seeds = [];
  for (let x = 0; x < W; x += step) { seeds.push([x, 0]); seeds.push([x, H - 1]); }
  for (let y = step; y < H - step; y += step) { seeds.push([0, y]); seeds.push([W - 1, y]); }
  return seeds;
}

// ---------- Component ----------
export default function BackgroundRemover() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [mode, setMode] = useState('auto');          // 'auto' | 'pick'
  const [pickedColors, setPickedColors] = useState([]); // [{r,g,b,x,y,hex}]
  const [tolerance, setTolerance] = useState(40);
  const [featherR, setFeatherR] = useState(2);
  const [erodeAmt, setErodeAmt] = useState(1);
  const [fillIslandsSize, setFillIslandsSize] = useState(500);
  const [doDefringe, setDoDefringe] = useState(true);

  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const inputRef = useRef(null);
  const previewImgRef = useRef(null);
  const workCanvasRef = useRef(null);
  const imgRef = useRef(null);

  const loadFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    setResultUrl('');
    setPickedColors([]);
    setStatusMsg('');
    const url = URL.createObjectURL(f);
    setPreview(url);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const c = workCanvasRef.current;
      c.width = img.width;
      c.height = img.height;
      c.getContext('2d').drawImage(img, 0, 0);
    };
    img.src = url;
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); loadFile(e.dataTransfer.files[0]); }, []);

  // Click-to-pick handler
  const handlePreviewClick = (e) => {
    if (mode !== 'pick') return;
    const img = previewImgRef.current;
    const canvas = workCanvasRef.current;
    if (!img || !canvas || !imgRef.current) return;

    const rect = img.getBoundingClientRect();
    const scaleX = imgRef.current.width / rect.width;
    const scaleY = imgRef.current.height / rect.height;
    const px = Math.round((e.clientX - rect.left) * scaleX);
    const py = Math.round((e.clientY - rect.top) * scaleY);

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const pixel = ctx.getImageData(px, py, 1, 1).data;
    const [r, g, b] = [pixel[0], pixel[1], pixel[2]];
    const hex = rgbToHex(r, g, b);
    setPickedColors(prev => [...prev, { r, g, b, x: px, y: py, hex }]);
    setStatusMsg(`🎨 Picked ${hex} — click more spots or click Remove Background`);
  };

  const handleRemove = () => {
    const img = imgRef.current;
    const canvas = workCanvasRef.current;
    if (!img || !canvas) return;
    setProcessing(true);
    setStatusMsg('⏳ Processing…');

    requestAnimationFrame(() => setTimeout(() => {
      try {
        const W = canvas.width, H = canvas.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, W, H);
        const pixels = imgData.data;

        const combinedMask = new Uint8Array(W * H);
        let bgR = 255, bgG = 255, bgB = 255;

        if (mode === 'pick' && pickedColors.length > 0) {
          // Use each picked color as a flood-fill seed
          for (const { r, g, b, x, y } of pickedColors) {
            bgR = r; bgG = g; bgB = b;
            const m = floodFillMask(pixels, W, H, x, y, r, g, b, tolerance);
            for (let i = 0; i < W * H; i++) if (m[i]) combinedMask[i] = 1;
          }
        } else {
          // Auto: edge seeds — detect dominant edge color
          const edgeSeeds = getEdgeSeeds(W, H, 6);
          // Tally most common edge color
          const colorMap = {};
          for (const [sx, sy] of edgeSeeds) {
            const si = (sy * W + sx) * 4;
            const rr = Math.round(pixels[si] / 12) * 12;
            const gg = Math.round(pixels[si+1] / 12) * 12;
            const bb = Math.round(pixels[si+2] / 12) * 12;
            const key = `${rr},${gg},${bb}`;
            if (!colorMap[key]) colorMap[key] = { r: pixels[si], g: pixels[si+1], b: pixels[si+2], n: 0 };
            colorMap[key].n++;
          }
          const dominant = Object.values(colorMap).sort((a, b) => b.n - a.n)[0];
          bgR = dominant.r; bgG = dominant.g; bgB = dominant.b;

          for (const [sx, sy] of edgeSeeds) {
            const si = (sy * W + sx) * 4;
            const sr = pixels[si], sg = pixels[si+1], sb = pixels[si+2];
            if (colorDist(sr, sg, sb, bgR, bgG, bgB) > tolerance * 1.4) continue;
            const m = floodFillMask(pixels, W, H, sx, sy, sr, sg, sb, tolerance);
            for (let i = 0; i < W * H; i++) if (m[i]) combinedMask[i] = 1;
          }
        }

        // Erode to avoid fringe
        let finalMask = erodeAmt > 0 ? erodeMask(combinedMask, W, H, erodeAmt) : combinedMask;

        // Fill small interior transparent islands (enclosed loops in letters etc.)
        if (fillIslandsSize > 0) {
          finalMask = fillIslands(finalMask, W, H, fillIslandsSize);
        }

        // Build feathered alpha
        const alpha = buildAlpha(finalMask, W, H, featherR);

        // Defringe
        let srcPixels = pixels;
        if (doDefringe) {
          srcPixels = defringe(pixels, alpha, W, H, bgR, bgG, bgB);
        }

        // Render output
        const outCanvas = document.createElement('canvas');
        outCanvas.width = W; outCanvas.height = H;
        const outCtx = outCanvas.getContext('2d');
        const outData = outCtx.createImageData(W, H);
        for (let i = 0; i < W * H; i++) {
          outData.data[i * 4]     = srcPixels[i * 4];
          outData.data[i * 4 + 1] = srcPixels[i * 4 + 1];
          outData.data[i * 4 + 2] = srcPixels[i * 4 + 2];
          outData.data[i * 4 + 3] = Math.round(alpha[i] * 255);
        }
        outCtx.putImageData(outData, 0, 0);
        outCanvas.toBlob(blob => {
          setResultUrl(URL.createObjectURL(blob));
          setStatusMsg('✅ Done! Scroll down to download.');
          setProcessing(false);
        }, 'image/png');
      } catch (err) {
        console.error(err);
        setStatusMsg('❌ Error: ' + err.message);
        setProcessing(false);
      }
    }, 30));
  };

  const btnBase = { border: 'none', cursor: 'pointer', borderRadius: '10px', padding: '9px 18px', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' };

  return (
    <ToolLayout icon="👤" title="Background Remover" category="Image Tools" badgeColor="#f472b6">
      <canvas ref={workCanvasRef} style={{ display: 'none' }} />

      {/* Upload */}
      <div style={card}>
        <div
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(244,114,182,0.8)' : 'rgba(244,114,182,0.3)'}`, borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {preview ? (
            <div>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  ref={previewImgRef}
                  src={preview}
                  alt="Source"
                  onClick={handlePreviewClick}
                  style={{ maxHeight: '280px', maxWidth: '100%', borderRadius: '8px', cursor: mode === 'pick' ? 'crosshair' : 'default', border: mode === 'pick' ? '2px solid #f472b6' : '2px solid transparent', transition: 'border 0.2s' }}
                />
                {mode === 'pick' && (
                  <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.75)', color: '#f472b6', fontSize: '11px', padding: '4px 8px', borderRadius: '6px', pointerEvents: 'none' }}>
                    🖱️ Click on background
                  </div>
                )}
              </div>

              {/* Picked color swatches */}
              {pickedColors.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginTop: '10px' }}>
                  {pickedColors.map((c, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '3px 10px 3px 6px' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: c.hex, border: '1px solid rgba(255,255,255,0.2)' }} />
                      <span style={{ color: '#94a3b8', fontSize: '11px' }}>{c.hex}</span>
                      <span style={{ color: '#ef4444', fontSize: '11px', cursor: 'pointer', marginLeft: '2px' }}
                        onClick={ev => { ev.stopPropagation(); setPickedColors(prev => prev.filter((_, i) => i !== idx)); }}>✕</span>
                    </div>
                  ))}
                </div>
              )}

              <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '8px' }}>{file?.name}</p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '6px' }}>
                <button onClick={e => { e.stopPropagation(); setFile(null); setPreview(null); setResultUrl(''); setPickedColors([]); imgRef.current = null; }}
                  style={{ ...btnBase, background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>Change File</button>
                {mode === 'pick' && pickedColors.length > 0 && (
                  <button onClick={e => { e.stopPropagation(); setPickedColors([]); setStatusMsg(''); }}
                    style={{ ...btnBase, background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>Clear Picks</button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>👤</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '4px' }}>Drop an image here</p>
              <p style={{ color: '#64748b', fontSize: '12px' }}>PNG, JPG, WEBP · Background will be made transparent</p>
            </>
          )}
        </div>
        {statusMsg && <p style={{ color: '#f472b6', fontSize: '12px', marginTop: '10px', textAlign: 'center' }}>{statusMsg}</p>}
      </div>

      {/* Controls */}
      {file && (
        <div style={card}>
          {/* Mode selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>REMOVAL MODE</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { id: 'auto', label: '⚡ Auto Detect', desc: 'Seeds from all edges automatically' },
                { id: 'pick', label: '🎨 Click to Pick', desc: 'Click on background areas to target them' },
              ].map(m => (
                <button key={m.id} onClick={() => setMode(m.id)}
                  style={{ ...btnBase, flex: 1, padding: '10px 12px', background: mode === m.id ? 'linear-gradient(135deg,#be185d,#ec4899)' : 'rgba(255,255,255,0.06)', color: mode === m.id ? '#fff' : '#94a3b8', border: mode === m.id ? 'none' : '1px solid rgba(255,255,255,0.1)' }}>
                  <div>{m.label}</div>
                  <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px' }}>{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>TOLERANCE: {tolerance}</label>
              <input type="range" min="5" max="130" value={tolerance} onChange={e => setTolerance(+e.target.value)} style={{ width: '100%', accentColor: '#f472b6' }} />
              <p style={{ color: '#475569', fontSize: '10px', marginTop: '3px' }}>How much bg color variation to include</p>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>EDGE SMOOTH: {featherR}px</label>
              <input type="range" min="0" max="8" value={featherR} onChange={e => setFeatherR(+e.target.value)} style={{ width: '100%', accentColor: '#f472b6' }} />
              <p style={{ color: '#475569', fontSize: '10px', marginTop: '3px' }}>Blur the cut edge for soft transitions</p>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>EDGE CONTRACT: {erodeAmt}px</label>
              <input type="range" min="0" max="6" value={erodeAmt} onChange={e => setErodeAmt(+e.target.value)} style={{ width: '100%', accentColor: '#f472b6' }} />
              <p style={{ color: '#475569', fontSize: '10px', marginTop: '3px' }}>Shrink cut by N pixels to remove fringe</p>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>FILL HOLES: {fillIslandsSize} px²</label>
              <input type="range" min="0" max="5000" step="100" value={fillIslandsSize} onChange={e => setFillIslandsSize(+e.target.value)} style={{ width: '100%', accentColor: '#f472b6' }} />
              <p style={{ color: '#475569', fontSize: '10px', marginTop: '3px' }}>Fill transparent blobs inside the subject</p>
            </div>
          </div>

          {/* Checkboxes */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '18px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#94a3b8' }}>
              <input type="checkbox" checked={doDefringe} onChange={e => setDoDefringe(e.target.checked)} style={{ accentColor: '#f472b6', width: '15px', height: '15px' }} />
              Defringe edges (remove bg color bleed)
            </label>
          </div>

          <button
            onClick={handleRemove}
            disabled={processing || (mode === 'pick' && pickedColors.length === 0)}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: (processing || (mode === 'pick' && pickedColors.length === 0)) ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#be185d,#ec4899)', color: '#fff', fontSize: '15px', fontWeight: '700', opacity: (processing || (mode === 'pick' && pickedColors.length === 0)) ? 0.6 : 1, transition: 'opacity 0.2s' }}>
            {processing ? '⏳ Removing background…' : mode === 'pick' && pickedColors.length === 0 ? '🎨 Click image to pick background colors first' : '👤 Remove Background'}
          </button>
        </div>
      )}

      {/* Result */}
      {resultUrl && (
        <div style={{ ...card, textAlign: 'center' }}>
          <h4 style={{ color: '#fff', marginBottom: '12px', letterSpacing: '1px' }}>OUTPUT PREVIEW</h4>
          <div style={{ background: 'repeating-conic-gradient(#2a2a3a 0% 25%,#1a1a2e 0% 50%) 50%/20px 20px', padding: '16px', borderRadius: '8px', display: 'inline-block', marginBottom: '16px' }}>
            <img src={resultUrl} alt="Result" style={{ maxHeight: '300px', maxWidth: '100%', display: 'block' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <a href={resultUrl} download="no-bg.png"
              style={{ flex: 1, display: 'block', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontSize: '15px', fontWeight: '700', textDecoration: 'none', textAlign: 'center' }}>
              ⬇️ Download PNG (Transparent)
            </a>
            <button onClick={() => { setResultUrl(''); setStatusMsg(''); }}
              style={{ ...btnBase, background: 'rgba(255,255,255,0.06)', color: '#94a3b8', padding: '14px 18px' }}>
              ↩ Retry
            </button>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
