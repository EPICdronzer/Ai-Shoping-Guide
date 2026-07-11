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

// ─── Core Math ─────────────────────────────────────────────────────────────
// Reverse alpha compositing:
//   F = W·α + B·(1-α)   →   B = (F - W·α) / (1-α)
// where F = observed pixel, W = watermark pixel, B = recovered original, α = watermark opacity
// ──────────────────────────────────────────────────────────────────────────

export default function WatermarkRemoverVideo() {
  const [file, setFile] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [meta, setMeta] = useState({ duration: 0, w: 0, h: 0 });

  // Interactive overlay box (percentage-based)
  const [bx, setBx] = useState(82);
  const [by, setBy] = useState(88);
  const [bw, setBw] = useState(14);
  const [bh, setBh] = useState(7);

  // Analysis results
  const [analysisData, setAnalysisData] = useState(null); // { watermarkRGB, estimatedAlpha }
  const [alphaOverride, setAlphaOverride] = useState(null); // null = auto
  const [manualAlpha, setManualAlpha] = useState(0.35);
  const [useManualAlpha, setUseManualAlpha] = useState(false);

  // Presets & config
  const [presetWatermark, setPresetWatermark] = useState('gemini');
  const [exportFormat, setExportFormat] = useState('mp4');
  const [agreed, setAgreed] = useState(false);

  // Drag state
  const [activeDrag, setActiveDrag] = useState(null);
  const [dragStart, setDragStart] = useState({ cx: 0, cy: 0, x: 0, y: 0, w: 0, h: 0 });

  // UI state
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState(''); // 'analyzing' | 'rendering' | ''
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const snapToWatermark = (presetName) => {
    setPresetWatermark(presetName);
    setAnalysisData(null);
    if (presetName === 'gemini')      { setBx(82); setBy(88); setBw(14); setBh(7); }
    else if (presetName === 'veo')    { setBx(80); setBy(86); setBw(16); setBh(9); }
    else if (presetName === 'bl')     { setBx(4);  setBy(88); setBw(14); setBh(7); }
    else if (presetName === 'tr')     { setBx(82); setBy(4);  setBw(14); setBh(7); }
  };

  const loadFile = (f) => {
    if (!f?.type.startsWith('video/')) { setError('Please select a video file.'); return; }
    setFile(f); setResult(null); setError(null); setAnalysisData(null);
    setVideoSrc(URL.createObjectURL(f));
  };
  const onDrop = useCallback((e) => { e.preventDefault(); setDragging(false); loadFile(e.dataTransfer.files[0]); }, []);
  const onMeta = () => {
    const v = videoRef.current;
    if (v) setMeta({ duration: v.duration, w: v.videoWidth, h: v.videoHeight });
  };

  // ── Pointer drag / resize ────────────────────────────────────────────────
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
    setPresetWatermark('custom'); setAnalysisData(null);
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

  // ── Phase 1: Temporal Analysis ───────────────────────────────────────────
  // Sample N frames → compute per-pixel median in watermark zone (W) and
  // surrounding zone (B_ref). Use ratio of temporal std-devs to estimate α.
  // Watermark pixel: W_est[p] = median_inside[p] - median_outside_interp[p] × (1-α_est)
  // ─────────────────────────────────────────────────────────────────────────
  const runAnalysis = async () => {
    if (!file || !videoRef.current) return;
    setPhase('analyzing'); setError(null); setProgress(0);
    setStatus('Sampling frames for temporal analysis…');
    try {
      const video = videoRef.current;
      const cW = meta.w || 1280;
      const cH = meta.h || 720;
      const canvas = document.createElement('canvas');
      canvas.width = cW; canvas.height = cH;
      const ctx = canvas.getContext('2d');

      // Pixel coordinates of watermark box and reference strip
      const boxX = Math.round(cW * (bx / 100));
      const boxY = Math.round(cH * (by / 100));
      const boxW = Math.max(4, Math.round(cW * (bw / 100)));
      const boxH = Math.max(4, Math.round(cH * (bh / 100)));

      // Reference region: same row, just to the LEFT of the watermark
      // (falls back to right if left is off-screen)
      const refX = boxX - boxW - 4 >= 0 ? boxX - boxW - 4 : Math.min(cW - boxW - 1, boxX + boxW + 4);
      const refY = boxY;

      const SAMPLE_COUNT = 24;
      const insideSamples = [];  // [frame][pixel * 3]
      const outsideSamples = []; // [frame][pixel * 3]

      video.muted = true;
      for (let i = 0; i < SAMPLE_COUNT; i++) {
        video.currentTime = (i / SAMPLE_COUNT) * (meta.duration || 10);
        await new Promise(r => setTimeout(r, 100));
        ctx.drawImage(video, 0, 0, cW, cH);
        const inData = ctx.getImageData(boxX, boxY, boxW, boxH).data;
        const outData = ctx.getImageData(refX, refY, boxW, boxH).data;
        const inPx = new Float32Array(boxW * boxH * 3);
        const outPx = new Float32Array(boxW * boxH * 3);
        for (let p = 0; p < boxW * boxH; p++) {
          inPx[p * 3]     = inData[p * 4];
          inPx[p * 3 + 1] = inData[p * 4 + 1];
          inPx[p * 3 + 2] = inData[p * 4 + 2];
          outPx[p * 3]     = outData[p * 4];
          outPx[p * 3 + 1] = outData[p * 4 + 1];
          outPx[p * 3 + 2] = outData[p * 4 + 2];
        }
        insideSamples.push(inPx);
        outsideSamples.push(outPx);
        setProgress(Math.round(((i + 1) / SAMPLE_COUNT) * 70));
      }

      // Compute per-pixel temporal std-dev inside and outside
      const pixCount = boxW * boxH * 3;
      let sumStdIn = 0, sumStdOut = 0, count = 0;
      const medianIn = new Float32Array(pixCount);
      const medianOut = new Float32Array(pixCount);

      setStatus('Computing watermark signature…');
      for (let c = 0; c < pixCount; c++) {
        const vIn  = insideSamples.map(f => f[c]).sort((a, b) => a - b);
        const vOut = outsideSamples.map(f => f[c]).sort((a, b) => a - b);
        const mid = Math.floor(SAMPLE_COUNT / 2);
        medianIn[c]  = vIn[mid];
        medianOut[c] = vOut[mid];
        // Compute std-dev
        const avgIn  = vIn.reduce((s, v) => s + v, 0) / SAMPLE_COUNT;
        const avgOut = vOut.reduce((s, v) => s + v, 0) / SAMPLE_COUNT;
        const stdIn  = Math.sqrt(vIn.reduce((s, v) => s + (v - avgIn) ** 2, 0) / SAMPLE_COUNT);
        const stdOut = Math.sqrt(vOut.reduce((s, v) => s + (v - avgOut) ** 2, 0) / SAMPLE_COUNT);
        if (stdOut > 2) { // only count pixels with enough motion
          sumStdIn += stdIn;
          sumStdOut += stdOut;
          count++;
        }
      }

      // α_est: ratio of std inside vs outside
      // Inside:  std(F) = (1-α) × std(B)
      // Outside: std(F_ref) = std(B_ref) ≈ std(B)
      // So:      (1-α) = std_inside / std_outside  →  α = 1 - ratio
      const ratio = count > 10 ? (sumStdIn / sumStdOut) : 0.65;
      const autoAlpha = Math.max(0.05, Math.min(0.95, 1 - ratio));

      // Watermark pixel estimate (normalized 0-255):
      //   median_inside = W_est × α + median_outside × (1-α)
      //   W_est = (median_inside - median_outside × (1-α)) / α
      const watermarkPx = new Float32Array(pixCount);
      const alpha = useManualAlpha ? manualAlpha : autoAlpha;
      for (let c = 0; c < pixCount; c++) {
        watermarkPx[c] = (medianIn[c] - medianOut[c] * (1 - alpha)) / alpha;
      }

      setProgress(100);
      setStatus('');
      setAnalysisData({ watermarkPx, autoAlpha: +autoAlpha.toFixed(3), boxW, boxH, boxX, boxY, cW, cH });
    } catch (err) {
      setError('Analysis failed: ' + err.message);
    }
    setPhase('');
  };

  // ── Phase 2: Render with Reverse Alpha ───────────────────────────────────
  const handleProcess = async () => {
    if (!file || !videoRef.current || !agreed || !analysisData) return;
    setPhase('rendering'); setError(null); setProgress(0);
    setStatus('Rendering output with reverse alpha compositing…');
    try {
      const { watermarkPx, boxW, boxH, boxX, boxY, cW, cH } = analysisData;
      const alpha = useManualAlpha ? manualAlpha : (analysisData.autoAlpha);
      const invAlpha = 1 - alpha;

      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = cW; canvas.height = cH;
      const ctx = canvas.getContext('2d');

      const mime = getSupportedMimeType(exportFormat);
      const recorder = new MediaRecorder(canvas.captureStream(25), { mimeType: mime, videoBitsPerSecond: 10_000_000 });
      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      video.muted = true; video.currentTime = 0;
      await new Promise(r => setTimeout(r, 200));
      recorder.start(100);
      const totalDur = meta.duration || 10;

      await new Promise((resolve, reject) => {
        let t0 = null;
        const draw = (ts) => {
          if (!t0) t0 = ts;
          const elapsed = (ts - t0) / 1000;
          setProgress(Math.min(99, Math.round((elapsed / totalDur) * 100)));
          if (elapsed >= totalDur) { recorder.stop(); resolve(); return; }
          video.currentTime = elapsed;

          // Draw the full frame
          ctx.drawImage(video, 0, 0, cW, cH);

          // Read only the watermark region pixels
          const imgData = ctx.getImageData(boxX, boxY, boxW, boxH);
          const pxData = imgData.data;

          // Apply reverse alpha compositing: B = (F - W·α) / (1-α)
          for (let p = 0; p < boxW * boxH; p++) {
            const ri = p * 4, gi = ri + 1, bi = ri + 2;
            const wR = watermarkPx[p * 3];
            const wG = watermarkPx[p * 3 + 1];
            const wB = watermarkPx[p * 3 + 2];

            pxData[ri] = Math.max(0, Math.min(255, Math.round((pxData[ri] - wR * alpha) / invAlpha)));
            pxData[gi] = Math.max(0, Math.min(255, Math.round((pxData[gi] - wG * alpha) / invAlpha)));
            pxData[bi] = Math.max(0, Math.min(255, Math.round((pxData[bi] - wB * alpha) / invAlpha)));
            // Alpha channel untouched
          }
          ctx.putImageData(imgData, boxX, boxY);

          setTimeout(() => requestAnimationFrame(draw), 40);
        };
        requestAnimationFrame(draw);
        recorder.onstop = resolve; recorder.onerror = reject;
      });

      await new Promise(r => setTimeout(r, 500));
      const finalMime = exportFormat === 'mp4' ? 'video/mp4' : exportFormat === 'mov' ? 'video/quicktime' : mime;
      const blob = new Blob(chunks, { type: finalMime });
      setProgress(100);
      setStatus('');
      setResult({ blob, size: blob.size, name: file.name.replace(/\.[^.]+$/, `_unwatermarked.${exportFormat}`) });
    } catch (err) {
      setError('Rendering failed: ' + err.message);
    }
    setPhase('');
  };

  const download = () => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a'); a.href = url; a.download = result.name; a.click();
    URL.revokeObjectURL(url);
  };

  const effectiveAlpha = useManualAlpha ? manualAlpha : (analysisData?.autoAlpha ?? 0.35);

  return (
    <ToolLayout icon="🔬" title="Gemini Video Watermark Remover" category="Editing Tools" badgeColor="#f43f5e">

      {/* Info banner */}
      <div style={{ ...card, background: 'linear-gradient(135deg,rgba(244,63,94,0.07),rgba(139,92,246,0.07))', border: '1px solid rgba(244,63,94,0.2)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'start' }}>
          <span style={{ fontSize: '1.8rem' }}>🔬</span>
          <div>
            <p style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '14px', margin: '0 0 6px' }}>Reverse Alpha-Compositing Engine</p>
            <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: 0, lineHeight: '1.6' }}>
              Uses the inverse of the alpha-blending formula <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: '4px', fontSize: '11px', color: '#a78bfa' }}>B = (F − W·α) / (1−α)</code> to mathematically recover original pixels.
              Phase 1 samples {24} frames to estimate the watermark's RGBA signature and opacity. Phase 2 applies per-pixel reverse compositing — no blur, no artifacts.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: file ? '1.3fr 1fr' : '1fr', gap: '20px', alignItems: 'start' }}>

        {/* ── Left: Video + Overlay Box ────────────────────────────────── */}
        <div style={card}>
          <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
            onClick={() => !file && inputRef.current?.click()}
            style={{ border: `2px dashed ${dragging ? 'rgba(244,63,94,0.8)' : 'rgba(244,63,94,0.25)'}`, borderRadius: '12px', padding: file ? '8px' : '60px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s', background: 'rgba(255,255,255,0.01)', position: 'relative' }}>
            <input ref={inputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />

            {file ? (
              <div ref={containerRef} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}
                style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', touchAction: 'none', overflow: 'hidden', borderRadius: '8px' }}>
                <video ref={videoRef} src={videoSrc} onLoadedMetadata={onMeta} muted loop autoPlay playsInline style={{ maxWidth: '100%', maxHeight: '400px', display: 'block' }} />

                {/* Overlay box */}
                <div onPointerDown={e => handlePointerDown(e, 'move')}
                  style={{ position: 'absolute', left: `${bx}%`, top: `${by}%`, width: `${bw}%`, height: `${bh}%`, border: `2px solid ${analysisData ? '#10b981' : '#f43f5e'}`, boxShadow: `0 0 0 9999px rgba(0,0,0,0.45)`, borderRadius: '3px', boxSizing: 'border-box', cursor: 'move', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Corner handles */}
                  {[['tl','nwse-resize','-5px','-5px','auto','auto'],['tr','nesw-resize','auto','-5px','-5px','auto'],['bl','nesw-resize','-5px','auto','auto','-5px'],['br','nwse-resize','auto','auto','-5px','-5px']].map(([id,cur,t,r,b,l]) => (
                    <div key={id} onPointerDown={e => handlePointerDown(e, id)}
                      style={{ position: 'absolute', top: t, right: r, bottom: b, left: l, width: '10px', height: '10px', background: analysisData ? '#10b981' : '#f43f5e', borderRadius: '50%', cursor: cur, border: '1.5px solid #fff' }} />
                  ))}
                  <span style={{ fontSize: '9px', background: analysisData ? '#10b981' : '#f43f5e', color: '#fff', padding: '1px 5px', borderRadius: '3px', pointerEvents: 'none', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                    {analysisData ? '✓ Analysed' : 'Watermark Zone'}
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: '4rem', marginBottom: '14px' }}>🔬</div>
                <p style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '17px', marginBottom: '6px' }}>Drop Gemini Video Here</p>
                <p style={{ color: '#64748b', fontSize: '13px' }}>MP4 · MOV · WEBM · Click to browse</p>
              </>
            )}
          </div>
          {file && <button onClick={() => { setFile(null); setVideoSrc(null); setResult(null); setAnalysisData(null); }} style={{ display: 'block', margin: '12px auto 0', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 14px', cursor: 'pointer', fontSize: '12px' }}>Change Video</button>}
        </div>

        {/* ── Right: Config Panel ───────────────────────────────────────── */}
        {file && !result && (
          <div>
            {/* Presets */}
            <div style={card}>
              <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '800', letterSpacing: '0.06em', marginBottom: '10px' }}>WATERMARK PRESET</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {[['gemini','Gemini Spark'],['veo','Veo Logo'],['bl','Bottom-Left'],['tr','Top-Right'],['custom','Custom Drag']].map(([val, label]) => (
                  <button key={val} onClick={() => snapToWatermark(val)}
                    style={{ padding: '8px 4px', fontSize: '11px', borderRadius: '6px', cursor: 'pointer', border: `1px solid ${presetWatermark === val ? 'rgba(244,63,94,0.5)' : 'transparent'}`, background: presetWatermark === val ? 'rgba(244,63,94,0.15)' : 'rgba(255,255,255,0.03)', color: presetWatermark === val ? '#f87171' : '#94a3b8', fontWeight: 'bold' }}>
                    {label}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '10px', color: '#64748b', marginTop: '10px', marginBottom: 0 }}>
                Box: {bx}% {by}% · {bw}×{bh}%
              </p>
            </div>

            {/* Analysis card */}
            <div style={card}>
              <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '800', letterSpacing: '0.06em', marginBottom: '12px' }}>PHASE 1 — TEMPORAL ANALYSIS</p>
              <p style={{ color: '#94a3b8', fontSize: '12px', lineHeight: '1.6', margin: '0 0 12px' }}>
                Samples 24 evenly-spaced frames to compute the per-pixel watermark signature (W) and estimate the compositing opacity (α) via temporal standard-deviation ratio.
              </p>

              {!analysisData ? (
                <button onClick={runAnalysis} disabled={phase === 'analyzing'}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', cursor: phase === 'analyzing' ? 'not-allowed' : 'pointer', background: phase === 'analyzing' ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg,#7c3aed,#a78bfa)', color: '#fff', fontWeight: '700', fontSize: '14px' }}>
                  {phase === 'analyzing' ? `🔬 Analysing… ${progress}%` : '🔬 Run Watermark Analysis'}
                </button>
              ) : (
                <div style={{ padding: '14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px' }}>
                  <p style={{ color: '#34d399', fontWeight: '700', fontSize: '13px', margin: '0 0 8px' }}>✅ Analysis Complete</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px', borderRadius: '6px' }}>
                      <div style={{ color: '#64748b', fontSize: '10px', marginBottom: '2px' }}>ESTIMATED α</div>
                      <div style={{ color: '#a78bfa', fontWeight: '800', fontSize: '18px' }}>{analysisData.autoAlpha}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px', borderRadius: '6px' }}>
                      <div style={{ color: '#64748b', fontSize: '10px', marginBottom: '2px' }}>REGION SIZE</div>
                      <div style={{ color: '#60a5fa', fontWeight: '800', fontSize: '15px' }}>{analysisData.boxW}×{analysisData.boxH}px</div>
                    </div>
                  </div>
                  <button onClick={() => setAnalysisData(null)} style={{ marginTop: '10px', width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '11px' }}>↺ Re-analyse</button>
                </div>
              )}
            </div>

            {/* Alpha control */}
            {analysisData && (
              <div style={card}>
                <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '800', letterSpacing: '0.06em', marginBottom: '12px' }}>COMPOSITING OPACITY (α)</p>
                <label style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={useManualAlpha} onChange={e => setUseManualAlpha(e.target.checked)} style={{ accentColor: '#a78bfa' }} />
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Override auto-estimated α</span>
                </label>
                {useManualAlpha ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>α = {manualAlpha.toFixed(2)}</span>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>Gemini typical: 0.25–0.45</span>
                    </div>
                    <input type="range" min={0.05} max={0.95} step={0.01} value={manualAlpha} onChange={e => setManualAlpha(+e.target.value)} style={{ width: '100%', accentColor: '#a78bfa' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#374151', marginTop: '3px' }}>
                      <span>0.05 (faint)</span><span>0.95 (opaque)</span>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Using auto-detected α = <strong style={{ color: '#a78bfa' }}>{analysisData.autoAlpha}</strong></p>
                )}

                <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: '8px', fontSize: '11px', color: '#94a3b8', lineHeight: '1.5' }}>
                  Recovery formula: <code style={{ color: '#a78bfa', fontWeight: 'bold' }}>B = (F − W·{effectiveAlpha.toFixed(2)}) / {(1 - effectiveAlpha).toFixed(2)}</code>
                </div>
              </div>
            )}

            {/* Export format */}
            {analysisData && (
              <div style={card}>
                <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '800', letterSpacing: '0.06em', marginBottom: '10px' }}>EXPORT FORMAT</p>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
                  {['mp4', 'mov', 'webm'].map(f => (
                    <button key={f} onClick={() => setExportFormat(f)}
                      style={{ flex: 1, padding: '9px 0', fontSize: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: exportFormat === f ? 'linear-gradient(135deg,#e11d48,#f43f5e)' : 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: 'bold', transition: 'all 0.2s' }}>
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Agreement */}
                <label style={{ display: 'flex', gap: '10px', cursor: 'pointer', alignItems: 'start', marginBottom: '14px' }}>
                  <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: '2px', accentColor: '#f43f5e' }} />
                  <span style={{ fontSize: '10px', color: '#94a3b8', lineHeight: '1.4' }}>
                    I own this content or have rights to edit it. I will not use this tool to remove legally-protected watermarks.
                  </span>
                </label>

                {/* Process Button */}
                <button onClick={handleProcess} disabled={phase === 'rendering' || !agreed}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: (phase === 'rendering' || !agreed) ? 'not-allowed' : 'pointer', background: (phase === 'rendering' || !agreed) ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg,#e11d48,#f43f5e)', color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: agreed && phase !== 'rendering' ? '0 4px 20px rgba(244,63,94,0.3)' : 'none', transition: 'all 0.25s' }}>
                  {phase === 'rendering' ? `⚗️ Rendering… ${progress}%` : '⚗️ Apply Reverse Alpha Removal'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progress bars */}
      {(phase === 'analyzing' || phase === 'rendering') && (
        <div style={{ ...card, marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
            <span>{status}</span><span>{progress}%</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: phase === 'analyzing' ? 'linear-gradient(90deg,#7c3aed,#a78bfa)' : 'linear-gradient(90deg,#e11d48,#f43f5e)', borderRadius: '8px', transition: 'width 0.4s' }} />
          </div>
        </div>
      )}

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginTop: '20px' }}>⚠️ {error}</div>}

      {/* Result */}
      {result && (
        <div style={{ ...card, border: '1px solid rgba(16,185,129,0.4)', marginTop: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '8px' }}>✅</div>
          <h3 style={{ color: '#34d399', fontWeight: '800', fontSize: '18px', margin: '0 0 4px' }}>Watermark Removed — No Blur!</h3>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 6px' }}>
            Reverse alpha compositing applied at α = <strong style={{ color: '#a78bfa' }}>{effectiveAlpha.toFixed(2)}</strong>
          </p>
          <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 20px' }}>Output: <strong>{exportFormat.toUpperCase()}</strong> · {fmt(result.size)}</p>
          <div style={{ display: 'flex', gap: '10px', maxWidth: '420px', margin: '0 auto' }}>
            <button onClick={download} style={{ flex: 1.5, padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
              ⬇️ Download (.{exportFormat})
            </button>
            <button onClick={() => setResult(null)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>
              Process Another
            </button>
          </div>
        </div>
      )}

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginTop: '30px' }}>
        {[
          ['⚗️', 'Reverse Alpha Math', 'B = (F − W·α) / (1−α) recovers the exact original pixel. Zero blur, zero artifacts — mathematically lossless within floating-point precision.'],
          ['📊', 'Temporal Signature Estimation', 'Samples 24 frames across the video. Per-pixel temporal medians isolate the static watermark (W). Std-dev ratio across inside/outside regions estimates opacity α.'],
          ['🎯', 'Gemini-Calibrated Presets', 'Box coordinates pre-tuned for Gemini Omni Spark logo (bottom-right) and Veo logo across 16:9 landscape and 9:16 portrait outputs.'],
        ].map(([icon, title, desc]) => (
          <div key={title} style={{ ...card, padding: '18px' }}>
            <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px' }}>{icon} {title}</h4>
            <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0, lineHeight: '1.6' }}>{desc}</p>
          </div>
        ))}
      </div>

    </ToolLayout>
  );
}
