'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const fmt = (b) => b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
const fmtDur = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function VideoToGif() {
  const [file, setFile] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [meta, setMeta] = useState({ duration: 0, w: 0, h: 0 });
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [fps, setFps] = useState(12);
  const [scale, setScale] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [frames, setFrames] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const videoRef = useRef(null);

  const loadFile = (f) => {
    if (!f?.type.startsWith('video/')) { setError('Please select a video file.'); return; }
    setFile(f); setResult(null); setError(null); setFrames([]);
    setVideoSrc(URL.createObjectURL(f));
  };
  const onDrop = useCallback((e) => { e.preventDefault(); setDragging(false); loadFile(e.dataTransfer.files[0]); }, []);
  const onMeta = () => {
    const v = videoRef.current;
    if (v) {
      setMeta({ duration: v.duration, w: v.videoWidth, h: v.videoHeight });
      setEndTime(Math.min(v.duration, 10)); // Default max 10s
      setStartTime(0);
    }
  };

  const handleConvert = async () => {
    if (!file || !videoRef.current) return;
    const clipDur = Math.max(0.5, Math.min(endTime - startTime, 30)); // Max 30s for GIF
    setProcessing(true); setError(null); setProgress(0); setFrames([]);
    try {
      const video = videoRef.current;
      const outW = Math.round((meta.w || 640) * scale / 100);
      const outH = Math.round((meta.h || 480) * scale / 100);
      const frameCount = Math.round(clipDur * fps);
      const capturedFrames = [];

      const canvas = document.createElement('canvas');
      canvas.width = outW; canvas.height = outH;
      const ctx = canvas.getContext('2d');

      // Step 1: Capture frames
      setStatus('Capturing frames…');
      for (let i = 0; i < frameCount; i++) {
        const t = startTime + (i / frameCount) * clipDur;
        video.currentTime = t;
        await new Promise(r => setTimeout(r, Math.max(50, 1000 / fps)));
        ctx.drawImage(video, 0, 0, outW, outH);
        capturedFrames.push(canvas.toDataURL('image/jpeg', 0.7));
        setProgress(Math.round((i / frameCount) * 60));
      }
      setFrames(capturedFrames.slice(0, 6)); // Preview first 6 frames

      // Step 2: Encode as looping WebM
      setStatus('Encoding animated output…');
      const outCanvas = document.createElement('canvas');
      outCanvas.width = outW; outCanvas.height = outH;
      const outCtx = outCanvas.getContext('2d');
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
      const recorder = new MediaRecorder(outCanvas.captureStream(fps), { mimeType: mime, videoBitsPerSecond: 500_000 });
      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.start(100);
      const imgs = capturedFrames.map(src => { const img = new Image(); img.src = src; return img; });
      await Promise.all(imgs.map(img => new Promise(r => { img.onload = r; img.onerror = r; })));
      for (let i = 0; i < imgs.length; i++) {
        outCtx.drawImage(imgs[i], 0, 0, outW, outH);
        setProgress(60 + Math.round((i / imgs.length) * 39));
        await new Promise(r => setTimeout(r, 1000 / fps));
      }
      recorder.stop();
      await new Promise(r => setTimeout(r, 500));
      const blob = new Blob(chunks, { type: mime });
      setProgress(100); setStatus('');
      setResult({ blob, size: blob.size, name: file.name.replace(/\.[^.]+$/, '_animated.webm'), w: outW, h: outH });
    } catch (err) { setError('Conversion failed: ' + err.message); setStatus(''); }
    setProcessing(false);
  };

  const download = () => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a'); a.href = url; a.download = result.name; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout icon="🎞️" title="Video to GIF" category="GIF Tools" badgeColor="#4ade80">
      <div style={{ ...card, background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.15)' }}>
        <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: 0 }}>ℹ️ Converts a video clip into an animated loop. Output is WebM (universally supported in browsers). Select up to 30 seconds for best results.</p>
      </div>
      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${dragging ? 'rgba(74,222,128,0.8)' : 'rgba(74,222,128,0.3)'}`, borderRadius: '12px', padding: file ? '16px' : '40px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {file ? (<div>
            <video ref={videoRef} src={videoSrc} onLoadedMetadata={onMeta} controls style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px', display: 'block', margin: '0 auto 12px' }} />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', fontSize: '12px', color: '#94a3b8' }}>
              <span>📁 <span style={{ color: '#4ade80' }}>{fmt(file.size)}</span></span>
              {meta.duration > 0 && <span>⏱ <span style={{ color: '#4ade80' }}>{fmtDur(meta.duration)}</span></span>}
            </div>
            <button onClick={() => { setFile(null); setVideoSrc(null); setResult(null); setFrames([]); }} style={{ display: 'block', margin: '10px auto 0', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change Video</button>
          </div>) : (<><div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🎞️</div>
            <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '6px' }}>Drop your video here</p>
            <p style={{ color: '#64748b', fontSize: '13px' }}>MP4 · MOV · WEBM · AVI · Click to browse</p></>)}
        </div>
      </div>
      {file && meta.duration > 0 && !result && (
        <div style={card}>
          <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>GIF SETTINGS</p>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>START: <strong style={{ color: '#4ade80' }}>{fmtDur(startTime)}</strong></label>
            <input type="range" min={0} max={meta.duration} step={0.1} value={startTime} onChange={e => setStartTime(Math.min(Number(e.target.value), endTime - 0.5))} style={{ width: '100%', accentColor: '#4ade80' }} />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>END (max 30s clip): <strong style={{ color: '#4ade80' }}>{fmtDur(Math.min(endTime, startTime + 30))}</strong></label>
            <input type="range" min={0} max={meta.duration} step={0.1} value={endTime} onChange={e => setEndTime(Math.max(Number(e.target.value), startTime + 0.5))} style={{ width: '100%', accentColor: '#4ade80' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>FRAME RATE: {fps} fps</label>
              <input type="range" min={6} max={24} value={fps} onChange={e => setFps(Number(e.target.value))} style={{ width: '100%', accentColor: '#4ade80', marginTop: '8px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>SCALE: {scale}%</label>
              <input type="range" min={20} max={100} step={5} value={scale} onChange={e => setScale(Number(e.target.value))} style={{ width: '100%', accentColor: '#4ade80', marginTop: '8px' }} />
            </div>
          </div>
          <div style={{ padding: '10px', background: 'rgba(74,222,128,0.08)', borderRadius: '8px', textAlign: 'center', fontSize: '13px' }}>
            Output: <strong style={{ color: '#4ade80' }}>{Math.round((meta.w || 640) * scale / 100)}×{Math.round((meta.h || 480) * scale / 100)}</strong> · <strong style={{ color: '#4ade80' }}>{fps}fps</strong> · {Math.min(Math.round(endTime - startTime), 30).toFixed(1)}s
          </div>
        </div>
      )}
      {file && !result && (
        <button onClick={handleConvert} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: processing ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#15803d,#4ade80)', color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 20px rgba(74,222,128,0.3)', marginBottom: '20px' }}>
          {processing ? `⏳ ${status} ${progress}%` : '🎞️ Convert to Animated WebM'}
        </button>
      )}
      {processing && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}><span>{status}</span><span>{progress}%</span></div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#15803d,#4ade80)', borderRadius: '8px', transition: 'width 0.3s' }} />
          </div>
        </div>
      )}
      {frames.length > 0 && !result && (
        <div style={{ ...card, border: '1px solid rgba(74,222,128,0.2)' }}>
          <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '10px' }}>FRAME PREVIEW</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
            {frames.map((src, i) => <img key={i} src={src} alt="" style={{ width: '100%', borderRadius: '4px', aspectRatio: '16/9', objectFit: 'cover' }} />)}
          </div>
        </div>
      )}
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}
      {result && (
        <div style={{ ...card, border: '1px solid rgba(74,222,128,0.3)' }}>
          <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>ANIMATED OUTPUT</p>
          <video src={URL.createObjectURL(result.blob)} autoPlay loop muted style={{ width: '100%', borderRadius: '10px', marginBottom: '16px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            {[[`${result.w}×${result.h}`, 'Size', '#4ade80'], [fmt(result.size), 'File Size', '#a78bfa']].map(([v, l, c]) => (
              <div key={l} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: c }}>{v}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{l}</div>
              </div>
            ))}
          </div>
          <button onClick={download} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>⬇️ Download Animated WebM</button>
          <button onClick={() => { setResult(null); setFrames([]); }} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>Convert Another</button>
        </div>
      )}
    </ToolLayout>
  );
}
