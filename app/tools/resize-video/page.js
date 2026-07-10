'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const fmt = (b) => b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

const PRESETS = [
  { label: '16:9', w: 1920, h: 1080 },
  { label: '9:16 (Vertical)', w: 1080, h: 1920 },
  { label: '1:1 (Square)', w: 1080, h: 1080 },
  { label: '4:3', w: 1280, h: 960 },
  { label: '720p', w: 1280, h: 720 },
  { label: '480p', w: 854, h: 480 },
];

export default function ResizeVideo() {
  const [file, setFile] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [meta, setMeta] = useState({ duration: 0, w: 0, h: 0 });
  const [outW, setOutW] = useState(1280);
  const [outH, setOutH] = useState(720);
  const [keepRatio, setKeepRatio] = useState(true);
  const [bgColor, setBgColor] = useState('#000000');
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const videoRef = useRef(null);

  const loadFile = (f) => {
    if (!f?.type.startsWith('video/')) { setError('Please select a video file.'); return; }
    setFile(f); setResult(null); setError(null);
    setVideoSrc(URL.createObjectURL(f));
  };
  const onDrop = useCallback((e) => { e.preventDefault(); setDragging(false); loadFile(e.dataTransfer.files[0]); }, []);
  const onMeta = () => {
    const v = videoRef.current;
    if (v) { setMeta({ duration: v.duration, w: v.videoWidth, h: v.videoHeight }); setOutW(v.videoWidth); setOutH(v.videoHeight); }
  };

  const updateW = (val) => {
    setOutW(val);
    if (keepRatio && meta.w > 0) setOutH(Math.round(val * meta.h / meta.w));
  };
  const updateH = (val) => {
    setOutH(val);
    if (keepRatio && meta.h > 0) setOutW(Math.round(val * meta.w / meta.h));
  };

  const applyPreset = (p) => { setOutW(p.w); setOutH(p.h); setKeepRatio(false); };

  const handleProcess = async () => {
    if (!file || !videoRef.current) return;
    setProcessing(true); setError(null); setProgress(0);
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = outW; canvas.height = outH;
      const ctx = canvas.getContext('2d');
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
      const recorder = new MediaRecorder(canvas.captureStream(25), { mimeType: mime, videoBitsPerSecond: 3_000_000 });
      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      video.muted = true; video.currentTime = 0;
      await new Promise(r => setTimeout(r, 200));
      recorder.start(100);
      const totalDur = meta.duration || 10;
      // Compute letterbox / fit dimensions
      const ratio = Math.min(outW / meta.w, outH / meta.h);
      const dw = Math.round(meta.w * ratio);
      const dh = Math.round(meta.h * ratio);
      const dx = Math.round((outW - dw) / 2);
      const dy = Math.round((outH - dh) / 2);

      await new Promise((resolve, reject) => {
        let t0 = null;
        const draw = (ts) => {
          if (!t0) t0 = ts;
          const elapsed = (ts - t0) / 1000;
          setProgress(Math.min(99, Math.round((elapsed / totalDur) * 100)));
          if (elapsed >= totalDur) { recorder.stop(); resolve(); return; }
          video.currentTime = elapsed;
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, outW, outH);
          ctx.drawImage(video, dx, dy, dw, dh);
          setTimeout(() => requestAnimationFrame(draw), 40);
        };
        requestAnimationFrame(draw);
        recorder.onstop = resolve; recorder.onerror = reject;
      });
      await new Promise(r => setTimeout(r, 500));
      const blob = new Blob(chunks, { type: mime });
      setProgress(100);
      setResult({ blob, size: blob.size, name: file.name.replace(/\.[^.]+$/, `_${outW}x${outH}.webm`) });
    } catch (err) { setError('Processing failed: ' + err.message); }
    setProcessing(false);
  };

  const download = () => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a'); a.href = url; a.download = result.name; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout icon="📐" title="Resize Video" category="Basic Video Tools" badgeColor="#34d399">
      <div style={{ ...card, background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.15)' }}>
        <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: 0 }}>ℹ️ Resize video to any dimension or pick from common presets. Letterboxing is applied to maintain quality.</p>
      </div>
      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${dragging ? 'rgba(52,211,153,0.8)' : 'rgba(52,211,153,0.3)'}`, borderRadius: '12px', padding: file ? '16px' : '40px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {file ? (<div>
            <video ref={videoRef} src={videoSrc} onLoadedMetadata={onMeta} controls style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px', display: 'block', margin: '0 auto 12px' }} />
            {meta.w > 0 && <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 6px' }}>Original: <span style={{ color: '#34d399' }}>{meta.w}×{meta.h}</span></p>}
            <button onClick={() => { setFile(null); setVideoSrc(null); setResult(null); }} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change Video</button>
          </div>) : (<><div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>📐</div>
            <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '6px' }}>Drop your video here</p>
            <p style={{ color: '#64748b', fontSize: '13px' }}>MP4 · MOV · WEBM · AVI · Click to browse</p></>)}
        </div>
      </div>
      {file && !result && (
        <div style={card}>
          <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '14px' }}>PRESETS</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px' }}>
            {PRESETS.map(p => (
              <button key={p.label} onClick={() => applyPreset(p)} style={{ padding: '10px 6px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: outW === p.w && outH === p.h ? 'linear-gradient(135deg,#059669,#34d399)' : 'rgba(255,255,255,0.05)', color: outW === p.w && outH === p.h ? '#fff' : '#94a3b8', fontSize: '11px', fontWeight: '600', transition: 'all 0.2s' }}>
                {p.label}<br /><span style={{ fontSize: '10px', opacity: 0.7 }}>{p.w}×{p.h}</span>
              </button>
            ))}
          </div>
          <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '14px' }}>CUSTOM SIZE</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>WIDTH</label>
              <input type="number" value={outW} onChange={e => updateW(Number(e.target.value))} min={100} max={7680} style={{ width: '100%', padding: '9px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => setKeepRatio(!keepRatio)} title="Lock aspect ratio" style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: keepRatio ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.06)', color: keepRatio ? '#34d399' : '#64748b', fontSize: '14px' }}>
                {keepRatio ? '🔒' : '🔓'}
              </button>
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>HEIGHT</label>
              <input type="number" value={outH} onChange={e => updateH(Number(e.target.value))} min={100} max={7680} style={{ width: '100%', padding: '9px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>LETTERBOX COLOR</label>
            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: '100%', height: '36px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', cursor: 'pointer' }} />
          </div>
          <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(52,211,153,0.08)', borderRadius: '8px', textAlign: 'center', fontSize: '13px' }}>
            Output: <strong style={{ color: '#34d399' }}>{outW}×{outH}</strong>
            {meta.w > 0 && <span style={{ color: '#64748b' }}> (from {meta.w}×{meta.h})</span>}
          </div>
        </div>
      )}
      {file && !result && (
        <button onClick={handleProcess} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: processing ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#059669,#34d399)', color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 20px rgba(52,211,153,0.3)', marginBottom: '20px' }}>
          {processing ? `⏳ Resizing… ${progress}%` : `📐 Resize to ${outW}×${outH}`}
        </button>
      )}
      {processing && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}><span>Resizing frames…</span><span>{progress}%</span></div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#059669,#34d399)', borderRadius: '8px', transition: 'width 0.5s' }} />
          </div>
        </div>
      )}
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}
      {result && (
        <div style={{ ...card, border: '1px solid rgba(52,211,153,0.3)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            {[[`${meta.w}×${meta.h}`, 'Original', '#94a3b8'], [`${outW}×${outH}`, 'Output', '#34d399']].map(([v, l, c]) => (
              <div key={l} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: c }}>{v}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{l}</div>
              </div>
            ))}
          </div>
          <button onClick={download} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>⬇️ Download Resized Video (.webm)</button>
          <button onClick={() => setResult(null)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>Resize Another</button>
        </div>
      )}
    </ToolLayout>
  );
}
