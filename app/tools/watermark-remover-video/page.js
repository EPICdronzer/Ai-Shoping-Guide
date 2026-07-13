'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const fmt = (b) => b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';

const card = {
  background: 'rgba(10, 8, 28, 0.65)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '20px'
};

const getSupportedMimeType = (format) => {
  const formats = {
    mp4: ['video/mp4;codecs=h264,aac', 'video/mp4;codecs=h264', 'video/mp4;codecs=avc1', 'video/mp4'],
    mov: ['video/quicktime;codecs=h264', 'video/quicktime;codecs=avc1', 'video/quicktime', 'video/mp4'],
    webm: ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
  };
  const list = formats[format] || [];
  for (const mime of list) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return 'video/webm';
};

export default function WatermarkRemoverVideo() {
  const [file, setFile] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [meta, setMeta] = useState({ duration: 0, w: 0, h: 0 });

  // Initialized to match your perfect Gemini Spark coordinates
  const [bx, setBx] = useState(80);
  const [by, setBy] = useState(86);
  const [bw, setBw] = useState(17);
  const [bh, setBh] = useState(8);

  // Advanced Processing Parameters updated to your specific defaults
  const [mode, setMode] = useState('inpaint');
  const [sampleOffset, setSampleOffset] = useState(20); // Default set to 20%
  const [sampleDirection, setSampleDirection] = useState('horizontal'); 
  const [edgeFeather, setEdgeFeather] = useState(10); // Default set to 10px

  // Presets & config
  const [presetWatermark, setPresetWatermark] = useState('gemini');
  const [exportFormat, setExportFormat] = useState('mp4');
  const [agreed, setAgreed] = useState(false);

  // Drag state
  const [activeDrag, setActiveDrag] = useState(null);
  const [dragStart, setDragStart] = useState({ cx: 0, cy: 0, x: 0, y: 0, w: 0, h: 0 });

  // UI state
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState(''); 
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const snapToWatermark = (presetName) => {
    setPresetWatermark(presetName);
    if (presetName === 'gemini') { 
      // Locked completely onto your precise custom manual calibrations
      setBx(80); setBy(86); setBw(17); setBh(8); 
      setSampleOffset(20); 
      setSampleDirection('horizontal'); 
      setEdgeFeather(10);
    }
    else if (presetName === 'veo')    { setBx(79); setBy(85); setBw(18); setBh(11); setSampleOffset(-15); setSampleDirection('horizontal'); setEdgeFeather(12); }
    else if (presetName === 'bl')     { setBx(3);  setBy(87); setBw(16); setBh(9);  setSampleOffset(18);  setSampleDirection('horizontal'); setEdgeFeather(12); }
    else if (presetName === 'tr')     { setBx(81); setBy(3);  setBw(16); setBh(9);  setSampleOffset(12);  setSampleDirection('vertical');   setEdgeFeather(12); }
  };

  const loadFile = (f) => {
    if (!f?.type.startsWith('video/')) { setError('Please select a video file.'); return; }
    setFile(f); setResult(null); setError(null);
    setVideoSrc(URL.createObjectURL(f));
  };
  const onDrop = useCallback((e) => { e.preventDefault(); setDragging(false); loadFile(e.dataTransfer.files[0]); }, []);
  const onMeta = () => {
    const v = videoRef.current;
    if (v) setMeta({ duration: v.duration, w: v.videoWidth, h: v.videoHeight });
  };

  const handlePointerDown = (e, mode) => {
    e.preventDefault(); e.stopPropagation();
    if (!containerRef.current) return;
    setDragStart({ cx: e.clientX, cy: e.clientY, x: bx, y: by, w: bw, h: bh });
    setActiveDrag(mode);
    e.target.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e) => {
    if (!activeDrag || !containerRef.current) return;
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragStart.cx) / rect.width) * 100;
    const dy = ((e.clientY - dragStart.cy) / rect.height) * 100;
    setPresetWatermark('custom');
    if (activeDrag === 'move') {
      setBx(Math.round(Math.max(0, Math.min(100 - dragStart.w, dragStart.x + dx))));
      setBy(Math.round(Math.max(0, Math.min(100 - dragStart.h, dragStart.y + dy))));
    } else if (activeDrag === 'br') {
      setBw(Math.round(Math.max(4, Math.min(100 - dragStart.x, dragStart.w + dx))));
      setBh(Math.round(Math.max(4, Math.min(100 - dragStart.y, dragStart.h + dy))));
    } else if (activeDrag === 'tl') {
      const nx = Math.max(0, Math.min(dragStart.x + dragStart.w - 4, dragStart.x + dx));
      const ny = Math.max(0, Math.min(dragStart.y + dragStart.h - 4, dragStart.y + dy));
      setBx(Math.round(nx)); setBy(Math.round(ny));
      setBw(Math.round(dragStart.w - (nx - dragStart.x)));
      setBh(Math.round(dragStart.h - (ny - dragStart.y)));
    } else if (activeDrag === 'tr') {
      const ny = Math.max(0, Math.min(dragStart.y + dragStart.h - 4, dragStart.y + dy));
      setBy(Math.round(ny));
      setBw(Math.round(Math.max(4, Math.min(100 - dragStart.x, dragStart.w + dx))));
      setBh(Math.round(dragStart.h - (ny - dragStart.y)));
    } else if (activeDrag === 'bl') {
      const nx = Math.max(0, Math.min(dragStart.x + dragStart.w - 4, dragStart.x + dx));
      setBx(Math.round(nx));
      setBw(Math.round(dragStart.w - (nx - dragStart.x)));
      setBh(Math.round(Math.max(4, Math.min(100 - dragStart.y, dragStart.h + dy))));
    }
  };
  const handlePointerUp = (e) => {
    if (activeDrag) { try { e.target.releasePointerCapture(e.pointerId); } catch {} setActiveDrag(null); }
  };

  const handleProcess = async () => {
    if (!file || !videoRef.current || !agreed) return;
    setPhase('rendering'); setError(null); setProgress(0);
    setStatus('Initializing spatial patch translation loop…');
    try {
      const video = videoRef.current;
      const cW = meta.w || 1280;
      const cH = meta.h || 720;
      
      const canvas = document.createElement('canvas');
      canvas.width = cW; canvas.height = cH;
      const ctx = canvas.getContext('2d');

      const patchCanvas = document.createElement('canvas');
      const boxX = Math.round(cW * (bx / 100));
      const boxY = Math.round(cH * (by / 100));
      const boxW = Math.max(4, Math.round(cW * (bw / 100)));
      const boxH = Math.max(4, Math.round(cH * (bh / 100)));
      patchCanvas.width = boxW;
      patchCanvas.height = boxH;
      const pCtx = patchCanvas.getContext('2d');

      const mime = getSupportedMimeType(exportFormat);
      const stream = canvas.captureStream(25);
      const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 14_000_000 });
      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      video.muted = true;
      video.pause();

      const totalDur = meta.duration || 10;
      const fps = 25;
      const frameDuration = 1 / fps;
      let currentTime = 0;

      recorder.start();
      setStatus('Compositing unwatermarked spatial patch matrix…');

      while (currentTime < totalDur) {
        setProgress(Math.min(99, Math.round((currentTime / totalDur) * 100)));

        await new Promise((resolve) => {
          if (Math.abs(video.currentTime - currentTime) < 0.01) { resolve(); return; }
          const onSeeked = () => { video.removeEventListener('seeked', onSeeked); resolve(); };
          const timeoutId = setTimeout(() => { video.removeEventListener('seeked', onSeeked); resolve(); }, 400);
          video.addEventListener('seeked', onSeeked);
          video.currentTime = currentTime;
        });

        ctx.drawImage(video, 0, 0, cW, cH);

        let srcX = boxX;
        let srcY = boxY;
        if (sampleDirection === 'horizontal') {
          srcX = Math.max(0, Math.min(cW - boxW, boxX + Math.round(cW * (sampleOffset / 100))));
        } else {
          srcY = Math.max(0, Math.min(cH - boxH, boxY + Math.round(cH * (sampleOffset / 100))));
        }

        pCtx.clearRect(0, 0, boxW, boxH);
        pCtx.drawImage(canvas, srcX, srcY, boxW, boxH, 0, 0, boxW, boxH);

        if (edgeFeather > 0) {
          const imgData = pCtx.getImageData(0, 0, boxW, boxH);
          const px = imgData.data;
          for (let y = 0; y < boxH; y++) {
            for (let x = 0; x < boxW; x++) {
              const idx = (y * boxW + x) * 4;
              const distY = Math.min(y, boxH - 1 - y);
              const distX = Math.min(x, boxW - 1 - x);
              const minDist = Math.min(distX, distY);

              if (minDist < edgeFeather) {
                const alphaWeight = minDist / edgeFeather;
                const canvasData = ctx.getImageData(boxX + x, boxY + y, 1, 1).data;
                
                px[idx]     = px[idx] * alphaWeight + canvasData[0] * (1 - alphaWeight);
                px[idx + 1] = px[idx + 1] * alphaWeight + canvasData[1] * (1 - alphaWeight);
                px[idx + 2] = px[idx + 2] * alphaWeight + canvasData[2] * (1 - alphaWeight);
              }
            }
          }
          pCtx.putImageData(imgData, 0, 0);
        }

        ctx.drawImage(patchCanvas, boxX, boxY);

        await new Promise((r) => setTimeout(r, 10));
        currentTime += frameDuration;
      }

      recorder.stop();
      await new Promise((r) => setTimeout(r, 500));

      const finalMime = exportFormat === 'mp4' ? 'video/mp4' : exportFormat === 'mov' ? 'video/quicktime' : mime;
      const blob = new Blob(chunks, { type: finalMime });
      setProgress(100);
      setStatus('');
      setResult({ blob, size: blob.size, name: file.name.replace(/\.[^.]+$/, `_flawless.${exportFormat}`) });
    } catch (err) {
      setError('Spatial processing pipeline failed: ' + err.message);
    }
    setPhase('');
  };

  const download = () => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a'); a.href = url; a.download = result.name; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout icon="🔬" title="Gemini Flawless Spatial Watermark Remover" category="Editing Tools" badgeColor="#f43f5e">

      <div style={{ ...card, background: 'linear-gradient(135deg,rgba(16,185,129,0.07),rgba(59,130,246,0.07))', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'start' }}>
          <span style={{ fontSize: '1.8rem' }}>💎</span>
          <div>
            <p style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '14px', margin: '0 0 6px' }}>Spatial Patch Reconstruction Engaged</p>
            <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: 0, lineHeight: '1.6' }}>
              Since residue outlines are still visible, simple mathematical subtraction is inadequate. This engine samples clean, adjacent textures dynamically from the video track and overlays them over the watermark coordinates to render the area <strong>completely invisible</strong>.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: file ? '1.3fr 1fr' : '1fr', gap: '20px', alignItems: 'start' }}>

        {/* ── Left Interactive Canvas Viewport ── */}
        <div style={card}>
          <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
            onClick={() => !file && inputRef.current?.click()}
            style={{ border: `2px dashed ${dragging ? 'rgba(244,63,94,0.8)' : 'rgba(244,63,94,0.25)'}`, borderRadius: '12px', padding: file ? '8px' : '60px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s', background: 'rgba(255,255,255,0.01)', position: 'relative' }}>
            <input ref={inputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />

            {file ? (
              <div ref={containerRef} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}
                style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', touchAction: 'none', overflow: 'hidden', borderRadius: '8px' }}>
                <video ref={videoRef} src={videoSrc} onLoadedMetadata={onMeta} muted loop autoPlay playsInline style={{ maxWidth: '100%', maxHeight: '400px', display: 'block' }} />

                {/* Target Mask bounding layout */}
                <div onPointerDown={e => handlePointerDown(e, 'move')}
                  style={{ position: 'absolute', left: `${bx}%`, top: `${by}%`, width: `${bw}%`, height: `${bh}%`, border: '2px solid #10b981', boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)', borderRadius: '3px', boxSizing: 'border-box', cursor: 'move', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {[['tl','nwse-resize','-5px','-5px','auto','auto'],['tr','nesw-resize','auto','-5px','-5px','auto'],['bl','nesw-resize','-5px','auto','auto','-5px'],['br','nwse-resize','auto','auto','-5px','-5px']].map(([id,cur,t,r,b,l]) => (
                    <div key={id} onPointerDown={e => handlePointerDown(e, id)}
                      style={{ position: 'absolute', top: t, right: r, bottom: b, left: l, width: '10px', height: '10px', background: '#10b981', borderRadius: '50%', cursor: cur, border: '1.5px solid #fff' }} />
                  ))}
                
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: '4rem', marginBottom: '14px' }}>🎬</div>
                <p style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '17px', marginBottom: '6px' }}>Upload Video File</p>
                <p style={{ color: '#64748b', fontSize: '13px' }}>MP4 · MOV · WEBM · Click to select file</p>
              </>
            )}
          </div>
        </div>

        {/* ── Right Calibration Controls Deck ── */}
        {file && !result && (
          <div>
            {/* Presets Component */}
            <div style={card}>
              <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '800', letterSpacing: '0.06em', marginBottom: '10px' }}>PRESETS DESIGNATIONS</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {[['gemini','Gemini Spark'],['veo','Veo Logo'],['bl','Bottom-Left'],['tr','Top-Right'],['custom','Manual Positioning']].map(([val, label]) => (
                  <button key={val} onClick={() => snapToWatermark(val)}
                    style={{ padding: '8px 4px', fontSize: '11px', borderRadius: '6px', cursor: 'pointer', border: `1px solid ${presetWatermark === val ? 'rgba(16,185,129,0.5)' : 'transparent'}`, background: presetWatermark === val ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)', color: presetWatermark === val ? '#34d399' : '#94a3b8', fontWeight: 'bold' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Spatial Context Optimization Deck */}
            <div style={card}>
              <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '800', letterSpacing: '0.06em', marginBottom: '12px' }}>TEXTURE RECONSTRUCTION CONTROLS</p>
              
              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Sampling Direction Axis</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[['horizontal', 'Horizontal Clean Strip'], ['vertical', 'Vertical Clean Strip']].map(([d, txt]) => (
                    <button key={d} onClick={() => setSampleDirection(d)}
                      style={{ flex: 1, padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', background: sampleDirection === d ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)', color: sampleDirection === d ? '#60a5fa' : '#94a3b8', border: sampleDirection === d ? '1px solid #3b82f6' : '1px solid transparent' }}>
                      {txt}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Clean Texture Scan Offset: <strong>{sampleOffset}%</strong></span>
                </div>
                <input type="range" min={-40} max={40} step={1} value={sampleOffset} onChange={e => setSampleOffset(+e.target.value)} style={{ width: '100%', accentColor: '#3b82f6' }} />
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginTop: '2px' }}>Adjust this value to choose a nearby background patch area that is clean.</span>
              </div>

              <div style={{ marginBottom: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Boundary Edge Feather Radius: <strong>{edgeFeather}px</strong></span>
                </div>
                <input type="range" min={0} max={30} step={1} value={edgeFeather} onChange={e => setEdgeFeather(+e.target.value)} style={{ width: '100%', accentColor: '#10b981' }} />
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginTop: '2px' }}>Smoothes out border transition boundaries into moving video backgrounds.</span>
              </div>
            </div>

            <div style={card}>
              <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '800', letterSpacing: '0.06em', marginBottom: '10px' }}>EXPORT CONFIGURATION</p>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
                {['mp4', 'mov', 'webm'].map(f => (
                  <button key={f} onClick={() => setExportFormat(f)}
                    style={{ flex: 1, padding: '9px 0', fontSize: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: exportFormat === f ? 'linear-gradient(135deg,#059669,#10b981)' : 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: 'bold' }}>
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>

              <label style={{ display: 'flex', gap: '10px', cursor: 'pointer', alignItems: 'start', marginBottom: '14px' }}>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: '2px', accentColor: '#10b981' }} />
                <span style={{ fontSize: '10px', color: '#94a3b8', lineHeight: '1.4' }}>
                  I confirm I hold valid legal rights to render modification repairs to this video file.
                </span>
              </label>

              <button onClick={handleProcess} disabled={phase === 'rendering' || !agreed}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: (phase === 'rendering' || !agreed) ? 'not-allowed' : 'pointer', background: (phase === 'rendering' || !agreed) ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
                {phase === 'rendering' ? `⚗️ Inpainting Patch Matrices… ${progress}%` : '🚀 Erase and Inpaint Watermark'}
              </button>
            </div>
          </div>
        )}
      </div>

      {phase === 'rendering' && (
        <div style={{ ...card, marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
            <span>{status}</span><span>{progress}%</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#10b981,#60a5fa)', borderRadius: '8px' }} />
          </div>
        </div>
      )}

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginTop: '20px' }}>⚠️ {error}</div>}

      {result && (
        <div style={{ ...card, border: '1px solid rgba(16,185,129,0.4)', marginTop: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '8px' }}>✨</div>
          <h3 style={{ color: '#34d399', fontWeight: '800', fontSize: '18px', margin: '0 0 4px' }}>Watermark Completely Replaced</h3>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 6px' }}>
            Spatial patch applied with <strong style={{ color: '#60a5fa' }}>{edgeFeather}px</strong> blending radius coverage.
          </p>
          <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 20px' }}>Format Target: <strong>{exportFormat.toUpperCase()}</strong> · File Size: {fmt(result.size)}</p>
          <div style={{ display: 'flex', gap: '10px', maxWidth: '420px', margin: '0 auto' }}>
            <button onClick={download} style={{ flex: 1.5, padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
              ⬇️ Save Clean Video (.{exportFormat})
            </button>
            <button onClick={() => { setResult(null); }} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>
              Reset Editor
            </button>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}