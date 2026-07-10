'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const fmt = (b) => b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

const FILTERS = [
  { id: 'none', label: 'Original', icon: '🎬', filter: '' },
  { id: 'grayscale', label: 'Grayscale', icon: '⚫', filter: 'grayscale(100%)' },
  { id: 'sepia', label: 'Sepia', icon: '🟤', filter: 'sepia(100%)' },
  { id: 'invert', label: 'Invert', icon: '🔁', filter: 'invert(100%)' },
  { id: 'warm', label: 'Warm', icon: '🔥', filter: 'sepia(40%) saturate(1.4) hue-rotate(-10deg)' },
  { id: 'cool', label: 'Cool', icon: '🧊', filter: 'saturate(0.8) hue-rotate(180deg) brightness(1.1)' },
  { id: 'vivid', label: 'Vivid', icon: '🌈', filter: 'saturate(2) contrast(1.1)' },
  { id: 'fade', label: 'Fade', icon: '🌫️', filter: 'opacity(0.75) brightness(1.15) saturate(0.7)' },
  { id: 'cinematic', label: 'Cinematic', icon: '🎥', filter: 'contrast(1.2) brightness(0.9) saturate(1.1)' },
  { id: 'blur', label: 'Blur', icon: '💨', filter: 'blur(2px)' },
  { id: 'vintage', label: 'Vintage', icon: '📷', filter: 'sepia(50%) contrast(0.85) brightness(1.05) saturate(0.9)' },
  { id: 'cold', label: 'Cold', icon: '❄️', filter: 'brightness(0.95) saturate(0.9) hue-rotate(200deg) contrast(1.05)' },
];

export default function VideoFilters() {
  const [file, setFile] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [meta, setMeta] = useState({ duration: 0, w: 0, h: 0 });
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
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
    if (!file || !videoRef.current || !selectedFilter.filter) { setError('Please select a filter (not Original).'); return; }
    setProcessing(true); setError(null); setProgress(0);
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = meta.w || 1280; canvas.height = meta.h || 720;
      const ctx = canvas.getContext('2d');
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
      const recorder = new MediaRecorder(canvas.captureStream(25), { mimeType: mime, videoBitsPerSecond: 3_000_000 });
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
          ctx.filter = selectedFilter.filter;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          ctx.filter = 'none';
          setTimeout(() => requestAnimationFrame(draw), 40);
        };
        requestAnimationFrame(draw);
        recorder.onstop = resolve; recorder.onerror = reject;
      });
      await new Promise(r => setTimeout(r, 500));
      const blob = new Blob(chunks, { type: mime });
      setProgress(100);
      setResult({ blob, size: blob.size, name: file.name.replace(/\.[^.]+$/, `_${selectedFilter.id}.webm`) });
    } catch (err) { setError('Processing failed: ' + err.message); }
    setProcessing(false);
  };

  const download = () => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a'); a.href = url; a.download = result.name; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout icon="🎨" title="Video Filters" category="Editing Tools" badgeColor="#e879f9">
      <div style={{ ...card, background: 'rgba(232,121,249,0.04)', border: '1px solid rgba(232,121,249,0.15)' }}>
        <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: 0 }}>ℹ️ Apply cinematic color filters to your video. Processed entirely in your browser with no upload required.</p>
      </div>
      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${dragging ? 'rgba(232,121,249,0.8)' : 'rgba(232,121,249,0.3)'}`, borderRadius: '12px', padding: file ? '16px' : '40px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {file ? (<div>
            <video ref={videoRef} src={videoSrc} onLoadedMetadata={onMeta} controls style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', display: 'block', margin: '0 auto 12px', filter: selectedFilter.filter }} />
            <p style={{ color: '#64748b', fontSize: '11px', marginBottom: '4px' }}>Preview shows filter applied</p>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>📁 <span style={{ color: '#e879f9' }}>{fmt(file.size)}</span></span>
            <button onClick={() => { setFile(null); setVideoSrc(null); setResult(null); }} style={{ display: 'block', margin: '10px auto 0', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change Video</button>
          </div>) : (<><div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🎨</div>
            <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '6px' }}>Drop your video here</p>
            <p style={{ color: '#64748b', fontSize: '13px' }}>MP4 · MOV · WEBM · AVI · Click to browse</p></>)}
        </div>
      </div>
      {file && !result && (
        <div style={card}>
          <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>SELECT FILTER</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {FILTERS.map(f => (
              <button key={f.id} onClick={() => setSelectedFilter(f)} style={{ padding: '12px 6px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: selectedFilter.id === f.id ? 'linear-gradient(135deg,#a21caf,#e879f9)' : 'rgba(255,255,255,0.05)', color: selectedFilter.id === f.id ? '#fff' : '#94a3b8', fontWeight: '600', fontSize: '12px', transition: 'all 0.2s', textAlign: 'center', boxShadow: selectedFilter.id === f.id ? '0 4px 16px rgba(232,121,249,0.3)' : 'none' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{f.icon}</div>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {file && !result && (
        <button onClick={handleProcess} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: processing ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#a21caf,#e879f9)', color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 20px rgba(232,121,249,0.3)', marginBottom: '20px' }}>
          {processing ? `⏳ Applying filter… ${progress}%` : `${selectedFilter.icon} Apply "${selectedFilter.label}" Filter`}
        </button>
      )}
      {processing && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}><span>Processing frames…</span><span>{progress}%</span></div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#a21caf,#e879f9)', borderRadius: '8px', transition: 'width 0.5s' }} />
          </div>
        </div>
      )}
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}
      {result && (
        <div style={{ ...card, border: '1px solid rgba(232,121,249,0.3)' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '2rem' }}>{selectedFilter.icon}</div>
            <p style={{ color: '#34d399', fontWeight: '700', marginTop: '8px' }}>"{selectedFilter.label}" filter applied!</p>
            <p style={{ color: '#64748b', fontSize: '13px' }}>{fmt(result.size)}</p>
          </div>
          <button onClick={download} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>⬇️ Download Filtered Video (.webm)</button>
          <button onClick={() => setResult(null)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>Apply Different Filter</button>
        </div>
      )}
    </ToolLayout>
  );
}
