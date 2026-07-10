'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const fmt = (b) => b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function ExtractAudio() {
  const [file, setFile] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [meta, setMeta] = useState({ duration: 0, w: 0, h: 0 });
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

  const handleExtract = async () => {
    if (!file || !videoRef.current) return;
    setProcessing(true); setError(null); setProgress(0);
    try {
      const video = videoRef.current;
      // Create a hidden audio-only element connected to AudioContext
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const dest = audioCtx.createMediaStreamDestination();
      const source = audioCtx.createMediaElementSource(video);
      source.connect(dest);
      source.connect(audioCtx.destination);

      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
      const recorder = new MediaRecorder(dest.stream, { mimeType: mime });
      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      video.currentTime = 0;
      video.muted = false;
      video.volume = 1;
      await new Promise(r => setTimeout(r, 200));
      recorder.start(100);

      // Progress tracking
      const totalDur = meta.duration || 10;
      const progressInterval = setInterval(() => {
        setProgress(Math.min(99, Math.round((video.currentTime / totalDur) * 100)));
      }, 500);

      video.play();
      await new Promise((resolve) => {
        video.onended = () => { recorder.stop(); resolve(); };
        video.onerror = () => { recorder.stop(); resolve(); };
      });

      clearInterval(progressInterval);
      await new Promise(r => setTimeout(r, 500));
      const blob = new Blob(chunks, { type: mime });
      setProgress(100);
      setResult({ blob, size: blob.size, name: file.name.replace(/\.[^.]+$/, '_audio.webm'), previewUrl: URL.createObjectURL(blob) });
      audioCtx.close();
    } catch (err) {
      setError('Extraction failed: ' + err.message + '. Note: Some videos may not allow audio extraction due to browser restrictions.');
    }
    setProcessing(false);
  };

  const download = () => {
    const a = document.createElement('a'); a.href = result.previewUrl; a.download = result.name; a.click();
  };

  return (
    <ToolLayout icon="🎵" title="Extract Audio from Video" category="Audio Tools" badgeColor="#fb923c">
      <div style={{ ...card, background: 'rgba(251,146,60,0.04)', border: '1px solid rgba(251,146,60,0.15)' }}>
        <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: 0 }}>ℹ️ Extracts the audio track from your video. Output is WebM/Opus format — high quality, plays in all modern browsers and media players.</p>
      </div>
      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${dragging ? 'rgba(251,146,60,0.8)' : 'rgba(251,146,60,0.3)'}`, borderRadius: '12px', padding: file ? '16px' : '40px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {file ? (<div>
            <video ref={videoRef} src={videoSrc} onLoadedMetadata={onMeta} controls style={{ maxWidth: '100%', maxHeight: '160px', borderRadius: '8px', display: 'block', margin: '0 auto 12px' }} />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', fontSize: '12px', color: '#94a3b8' }}>
              <span>📁 <span style={{ color: '#fb923c' }}>{fmt(file.size)}</span></span>
              {meta.duration > 0 && <span>⏱ <span style={{ color: '#fb923c' }}>{meta.duration.toFixed(1)}s</span></span>}
            </div>
            <button onClick={() => { setFile(null); setVideoSrc(null); setResult(null); }} style={{ display: 'block', margin: '10px auto 0', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change Video</button>
          </div>) : (<><div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🎵</div>
            <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '6px' }}>Drop your video here</p>
            <p style={{ color: '#64748b', fontSize: '13px' }}>MP4 · MOV · WEBM · AVI · Click to browse</p></>)}
        </div>
      </div>
      {file && !result && (
        <button onClick={handleExtract} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: processing ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#c2410c,#fb923c)', color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 20px rgba(251,146,60,0.3)', marginBottom: '20px' }}>
          {processing ? `⏳ Extracting… ${progress}%` : '🎵 Extract Audio'}
        </button>
      )}
      {processing && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}><span>Playing and capturing audio…</span><span>{progress}%</span></div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#c2410c,#fb923c)', borderRadius: '8px', transition: 'width 0.5s' }} />
          </div>
          <p style={{ color: '#64748b', fontSize: '11px', marginTop: '6px', textAlign: 'center' }}>⚠️ Please keep this tab active while extracting</p>
        </div>
      )}
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}
      {result && (
        <div style={{ ...card, border: '1px solid rgba(251,146,60,0.3)' }}>
          <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>🎵 EXTRACTED AUDIO</p>
          <audio src={result.previewUrl} controls style={{ width: '100%', marginBottom: '16px' }} />
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>Size: <strong style={{ color: '#fb923c' }}>{fmt(result.size)}</strong></p>
          <button onClick={download} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>⬇️ Download Audio (.webm)</button>
          <button onClick={() => setResult(null)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>Extract Another</button>
        </div>
      )}
    </ToolLayout>
  );
}
