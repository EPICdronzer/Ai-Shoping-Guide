'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const fmt = (b) => b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function SlowMotionVideo() {
  const [file, setFile] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [meta, setMeta] = useState({ duration: 0, w: 0, h: 0 });
  const [speed, setSpeed] = useState(0.5);
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
  const onMeta = () => { const v = videoRef.current; if (v) setMeta({ duration: v.duration, w: v.videoWidth, h: v.videoHeight }); };

  const handleProcess = async () => {
    if (!file || !videoRef.current) return;
    setProcessing(true); setError(null); setProgress(0);
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = meta.w || 1280; canvas.height = meta.h || 720;
      const ctx = canvas.getContext('2d');
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
      const fps = Math.min(Math.round(25 / speed), 60);
      const recorder = new MediaRecorder(canvas.captureStream(fps), { mimeType: mime, videoBitsPerSecond: 4_000_000 });
      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      video.muted = true; video.currentTime = 0; video.playbackRate = speed;
      await new Promise(r => setTimeout(r, 200));
      recorder.start(100);
      const outputDur = (meta.duration || 10) / speed;
      await new Promise((resolve, reject) => {
        let t0 = null;
        const draw = (ts) => {
          if (!t0) t0 = ts;
          const elapsed = (ts - t0) / 1000;
          setProgress(Math.min(99, Math.round((elapsed / outputDur) * 100)));
          if (elapsed >= outputDur || video.ended) { recorder.stop(); resolve(); return; }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          setTimeout(() => requestAnimationFrame(draw), 1000 / fps);
        };
        requestAnimationFrame(draw);
        recorder.onstop = resolve; recorder.onerror = reject;
      });
      video.playbackRate = 1;
      await new Promise(r => setTimeout(r, 500));
      const blob = new Blob(chunks, { type: mime });
      setProgress(100);
      setResult({ blob, size: blob.size, name: file.name.replace(/\.[^.]+$/, `_slow_${speed}x.webm`) });
    } catch (err) { setError('Processing failed: ' + err.message); }
    setProcessing(false);
  };

  const download = () => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a'); a.href = url; a.download = result.name; a.click();
    URL.revokeObjectURL(url);
  };

  const SLOW_OPTS = [{ label: '1/8×', v: 0.125, icon: '🪨' }, { label: '1/4×', v: 0.25, icon: '🐢' }, { label: '1/2×', v: 0.5, icon: '🐌' }, { label: '3/4×', v: 0.75, icon: '🦥' }];

  return (
    <ToolLayout icon="🐌" title="Slow Motion Video" category="Basic Video Tools" badgeColor="#60a5fa">
      <div style={{ ...card, background: 'rgba(96,165,250,0.04)', border: '1px solid rgba(96,165,250,0.15)' }}>
        <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: 0 }}>ℹ️ Creates cinematic slow motion by reducing playback speed. The output video will be longer than the original.</p>
      </div>
      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${dragging ? 'rgba(96,165,250,0.8)' : 'rgba(96,165,250,0.3)'}`, borderRadius: '12px', padding: file ? '16px' : '40px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {file ? (<div>
            <video ref={videoRef} src={videoSrc} onLoadedMetadata={onMeta} controls style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', display: 'block', margin: '0 auto 12px' }} />
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>📁 <span style={{ color: '#60a5fa' }}>{fmt(file.size)}</span></span>
            <button onClick={() => { setFile(null); setVideoSrc(null); setResult(null); }} style={{ display: 'block', margin: '10px auto 0', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change Video</button>
          </div>) : (<><div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🐌</div>
            <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '6px' }}>Drop your video here</p>
            <p style={{ color: '#64748b', fontSize: '13px' }}>MP4 · MOV · WEBM · AVI · Click to browse</p></>)}
        </div>
      </div>
      {file && !result && (
        <div style={card}>
          <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>SLOW MOTION SPEED</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
            {SLOW_OPTS.map(s => (
              <button key={s.v} onClick={() => setSpeed(s.v)} style={{ padding: '14px 8px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: speed === s.v ? 'linear-gradient(135deg,#1d4ed8,#60a5fa)' : 'rgba(255,255,255,0.05)', color: speed === s.v ? '#fff' : '#94a3b8', fontWeight: '700', fontSize: '14px', transition: 'all 0.2s', textAlign: 'center', boxShadow: speed === s.v ? '0 4px 16px rgba(96,165,250,0.3)' : 'none' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{s.icon}</div>
                {s.label}
              </button>
            ))}
          </div>
          {meta.duration > 0 && (
            <div style={{ padding: '12px', background: 'rgba(96,165,250,0.08)', borderRadius: '10px', textAlign: 'center', fontSize: '13px' }}>
              <span style={{ color: '#94a3b8' }}>Original: </span><span style={{ color: '#60a5fa', fontWeight: '700' }}>{meta.duration.toFixed(1)}s</span>
              <span style={{ color: '#94a3b8' }}> → Slow Motion Output: </span><span style={{ color: '#34d399', fontWeight: '700' }}>{(meta.duration / speed).toFixed(1)}s</span>
            </div>
          )}
        </div>
      )}
      {file && !result && (
        <button onClick={handleProcess} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: processing ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#1d4ed8,#60a5fa)', color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 20px rgba(96,165,250,0.3)', marginBottom: '20px' }}>
          {processing ? `⏳ Processing… ${progress}%` : `🐌 Apply ${speed}× Slow Motion`}
        </button>
      )}
      {processing && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}><span>Creating slow motion…</span><span>{progress}%</span></div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#1d4ed8,#60a5fa)', borderRadius: '8px', transition: 'width 0.5s' }} />
          </div>
        </div>
      )}
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}
      {result && (
        <div style={{ ...card, border: '1px solid rgba(96,165,250,0.3)' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '2rem' }}>✅</div>
            <p style={{ color: '#34d399', fontWeight: '700', marginTop: '8px' }}>Slow motion created at {speed}×!</p>
            <p style={{ color: '#64748b', fontSize: '13px' }}>{fmt(result.size)}</p>
          </div>
          <button onClick={download} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>⬇️ Download Slow Motion Video (.webm)</button>
          <button onClick={() => setResult(null)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>Process Another</button>
        </div>
      )}
    </ToolLayout>
  );
}
