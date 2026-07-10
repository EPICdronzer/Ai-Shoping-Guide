'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function ThumbnailGenerator() {
  const [file, setFile] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [meta, setMeta] = useState({ duration: 0, w: 0, h: 0 });
  const [seekTime, setSeekTime] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [thumbnail, setThumbnail] = useState(null);
  const [format, setFormat] = useState('image/jpeg');
  const [quality, setQuality] = useState(0.92);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const videoRef = useRef(null);

  const fmtDur = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  const loadFile = (f) => {
    if (!f?.type.startsWith('video/')) { setError('Please select a video file.'); return; }
    setFile(f); setThumbnail(null); setError(null);
    setVideoSrc(URL.createObjectURL(f));
  };
  const onDrop = useCallback((e) => { e.preventDefault(); setDragging(false); loadFile(e.dataTransfer.files[0]); }, []);
  const onMeta = () => { const v = videoRef.current; if (v) { setMeta({ duration: v.duration, w: v.videoWidth, h: v.videoHeight }); setSeekTime(0); } };

  const captureThumbnail = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = seekTime;
    setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = meta.w || 1280; canvas.height = meta.h || 720;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL(format, quality);
      setThumbnail(dataUrl);
    }, 300);
  };

  const download = () => {
    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png';
    const name = file.name.replace(/\.[^.]+$/, `_thumb_${Math.round(seekTime)}s.${ext}`);
    const a = document.createElement('a'); a.href = thumbnail; a.download = name; a.click();
  };

  return (
    <ToolLayout icon="🖼️" title="Thumbnail Generator" category="Utility Tools" badgeColor="#fbbf24">
      <div style={{ ...card, background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.15)' }}>
        <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: 0 }}>ℹ️ Seek to any frame in your video and capture it as a high-quality image. Perfect for YouTube thumbnails.</p>
      </div>
      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${dragging ? 'rgba(251,191,36,0.8)' : 'rgba(251,191,36,0.3)'}`, borderRadius: '12px', padding: file ? '16px' : '40px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {file ? (<div>
            <video ref={videoRef} src={videoSrc} onLoadedMetadata={onMeta} controls style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', display: 'block', margin: '0 auto 12px' }} />
            {meta.w > 0 && <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 8px' }}>📐 {meta.w}×{meta.h} · ⏱ {fmtDur(meta.duration)}</p>}
            <button onClick={() => { setFile(null); setVideoSrc(null); setThumbnail(null); }} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change Video</button>
          </div>) : (<><div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🖼️</div>
            <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '6px' }}>Drop your video here</p>
            <p style={{ color: '#64748b', fontSize: '13px' }}>MP4 · MOV · WEBM · AVI · Click to browse</p></>)}
        </div>
      </div>
      {file && meta.duration > 0 && (
        <div style={card}>
          <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>FRAME SELECTION</p>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>TIME: <strong style={{ color: '#fbbf24' }}>{fmtDur(seekTime)}</strong></label>
            <input type="range" min={0} max={meta.duration} step={0.1} value={seekTime}
              onChange={e => { setSeekTime(Number(e.target.value)); if (videoRef.current) videoRef.current.currentTime = Number(e.target.value); }}
              style={{ width: '100%', accentColor: '#fbbf24' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>FORMAT</label>
              <select value={format} onChange={e => setFormat(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: '13px' }}>
                <option value="image/jpeg">JPEG (Smaller)</option>
                <option value="image/png">PNG (Lossless)</option>
                <option value="image/webp">WebP (Best)</option>
              </select>
            </div>
            {format !== 'image/png' && (
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>QUALITY: {Math.round(quality * 100)}%</label>
                <input type="range" min={0.5} max={1} step={0.01} value={quality} onChange={e => setQuality(Number(e.target.value))} style={{ width: '100%', accentColor: '#fbbf24', marginTop: '8px' }} />
              </div>
            )}
          </div>
          <button onClick={captureThumbnail} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#b45309,#fbbf24)', color: '#fff', fontSize: '14px', fontWeight: '700', boxShadow: '0 4px 16px rgba(251,191,36,0.3)' }}>
            📸 Capture Frame
          </button>
        </div>
      )}
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}
      {thumbnail && (
        <div style={{ ...card, border: '1px solid rgba(251,191,36,0.3)' }}>
          <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>CAPTURED THUMBNAIL</p>
          <img src={thumbnail} alt="Thumbnail" style={{ width: '100%', borderRadius: '10px', marginBottom: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }} />
          <button onClick={download} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>⬇️ Download Thumbnail</button>
          <button onClick={() => setThumbnail(null)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>Capture Another Frame</button>
        </div>
      )}
    </ToolLayout>
  );
}
