'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const fmt = (b) => b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
const fmtDur = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function VideoMetadata() {
  const [file, setFile] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [meta, setMeta] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const videoRef = useRef(null);

  const loadFile = (f) => {
    if (!f?.type.startsWith('video/')) { setError('Please select a video file.'); return; }
    setFile(f); setMeta(null); setError(null);
    setVideoSrc(URL.createObjectURL(f));
  };
  const onDrop = useCallback((e) => { e.preventDefault(); setDragging(false); loadFile(e.dataTransfer.files[0]); }, []);
  const onMeta = () => {
    const v = videoRef.current;
    if (!v) return;
    const fps = v.webkitDecodedFrameCount ? 'Variable' : '~25';
    setMeta({
      filename: file.name,
      filesize: fmt(file.size),
      rawSize: file.size,
      mimeType: file.type || 'video/unknown',
      duration: fmtDur(v.duration),
      durationSec: v.duration.toFixed(2) + 's',
      width: v.videoWidth + 'px',
      height: v.videoHeight + 'px',
      resolution: `${v.videoWidth}×${v.videoHeight}`,
      aspectRatio: gcd(v.videoWidth, v.videoHeight),
      hasAudio: v.mozHasAudio !== undefined ? (v.mozHasAudio ? 'Yes' : 'No') : 'Unknown',
      modified: new Date(file.lastModified).toLocaleString(),
    });
  };

  const gcd = (a, b) => {
    if (!b) { const r = a; return r; }
    const g = (x, y) => y ? g(y, x % y) : x;
    const d = g(a, b);
    return `${a / d}:${b / d}`;
  };

  const copyAll = () => {
    if (!meta) return;
    const text = Object.entries(meta).map(([k, v]) => `${k}: ${v}`).join('\n');
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const ROW = ({ label, value, accent }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ color: '#64748b', fontSize: '13px' }}>{label}</span>
      <span style={{ color: accent || '#f1f5f9', fontSize: '13px', fontWeight: '600', textAlign: 'right' }}>{value}</span>
    </div>
  );

  return (
    <ToolLayout icon="📋" title="Video Metadata Viewer" category="Utility Tools" badgeColor="#22d3ee">
      <div style={{ ...card, background: 'rgba(34,211,238,0.04)', border: '1px solid rgba(34,211,238,0.15)' }}>
        <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: 0 }}>ℹ️ Instantly view detailed metadata for any video file — resolution, duration, size, format, and more.</p>
      </div>
      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${dragging ? 'rgba(34,211,238,0.8)' : 'rgba(34,211,238,0.3)'}`, borderRadius: '12px', padding: file ? '16px' : '40px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {file ? (<div>
            <video ref={videoRef} src={videoSrc} onLoadedMetadata={onMeta} style={{ display: 'none' }} />
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>📋</div>
            <p style={{ color: '#22d3ee', fontWeight: '700', marginBottom: '4px' }}>{file.name}</p>
            <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '10px' }}>{fmt(file.size)}</p>
            <button onClick={() => { setFile(null); setVideoSrc(null); setMeta(null); }} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change Video</button>
          </div>) : (<><div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>📋</div>
            <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '6px' }}>Drop your video to inspect</p>
            <p style={{ color: '#64748b', fontSize: '13px' }}>MP4 · MOV · WEBM · AVI · MKV · Click to browse</p></>)}
        </div>
      </div>
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}
      {meta && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', margin: 0 }}>VIDEO METADATA</p>
            <button onClick={copyAll} style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)', color: '#22d3ee', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>📋 Copy All</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {[['Resolution', meta.resolution, '#22d3ee'], ['Duration', meta.durationSec, '#34d399'], ['File Size', meta.filesize, '#a78bfa']].map(([l, v, c]) => (
              <div key={l} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: c }}>{v}</div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>{l}</div>
              </div>
            ))}
          </div>
          <ROW label="File Name" value={meta.filename} accent="#22d3ee" />
          <ROW label="MIME Type" value={meta.mimeType} />
          <ROW label="Resolution" value={meta.resolution} accent="#34d399" />
          <ROW label="Aspect Ratio" value={meta.aspectRatio} />
          <ROW label="Duration" value={meta.duration} accent="#34d399" />
          <ROW label="File Size" value={meta.filesize} accent="#a78bfa" />
          <ROW label="Audio" value={meta.hasAudio} />
          <ROW label="Last Modified" value={meta.modified} />
        </div>
      )}
    </ToolLayout>
  );
}
