'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const fmt = (b) => b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

const getSupportedMimeType = (format) => {
  const formats = {
    mp4: [
      'video/mp4;codecs=h264,aac',
      'video/mp4;codecs=h264',
      'video/mp4;codecs=avc1',
      'video/mp4',
      'video/webm;codecs=h264'
    ],
    mov: [
      'video/quicktime;codecs=h264',
      'video/quicktime;codecs=avc1',
      'video/quicktime',
      'video/mp4'
    ],
    webm: [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm'
    ]
  };
  const list = formats[format] || [];
  for (const mime of list) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }
  return 'video/webm';
};

export default function CropVideo() {
  const [file, setFile] = useState(null);
  const [exportFormat, setExportFormat] = useState('mp4');
  const [videoSrc, setVideoSrc] = useState(null);
  const [meta, setMeta] = useState({ duration: 0, w: 0, h: 0 });
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropW, setCropW] = useState(100);
  const [cropH, setCropH] = useState(100);
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
  const onMeta = () => { const v = videoRef.current; if (v) { setMeta({ duration: v.duration, w: v.videoWidth, h: v.videoHeight }); setCropW(100); setCropH(100); setCropX(0); setCropY(0); } };

  const PRESETS = [
    { label: '16:9', x: 0, y: 0, w: 100, h: 100 },
    { label: '1:1 Square', x: 12.5, y: 0, w: 75, h: 100 },
    { label: '9:16 Vertical', x: 25, y: 0, w: 50, h: 100 },
    { label: 'Center 80%', x: 10, y: 10, w: 80, h: 80 },
  ];

  const handleProcess = async () => {
    if (!file || !videoRef.current) return;
    setProcessing(true); setError(null); setProgress(0);
    try {
      const video = videoRef.current;
      const srcX = Math.round(meta.w * cropX / 100);
      const srcY = Math.round(meta.h * cropY / 100);
      const srcW = Math.round(meta.w * cropW / 100);
      const srcH = Math.round(meta.h * cropH / 100);
      const canvas = document.createElement('canvas');
      canvas.width = srcW; canvas.height = srcH;
      const ctx = canvas.getContext('2d');
      const mime = getSupportedMimeType(exportFormat);
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
          ctx.drawImage(video, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);
          setTimeout(() => requestAnimationFrame(draw), 40);
        };
        requestAnimationFrame(draw);
        recorder.onstop = resolve; recorder.onerror = reject;
      });
      await new Promise(r => setTimeout(r, 500));
      const blob = new Blob(chunks, { type: exportFormat === 'mp4' ? 'video/mp4' : exportFormat === 'mov' ? 'video/quicktime' : mime });
      setProgress(100);
      setResult({ blob, size: blob.size, name: file.name.replace(/\.[^.]+$/, `_cropped_${srcW}x${srcH}.${exportFormat}`), outW: srcW, outH: srcH });
    } catch (err) { setError('Processing failed: ' + err.message); }
    setProcessing(false);
  };

  const download = () => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a'); a.href = url; a.download = result.name; a.click();
    URL.revokeObjectURL(url);
  };

  const outW = meta.w ? Math.round(meta.w * cropW / 100) : 0;
  const outH = meta.h ? Math.round(meta.h * cropH / 100) : 0;

  return (
    <ToolLayout icon="🖼️" title="Crop Video" category="Basic Video Tools" badgeColor="#f97316">
      <div style={{ ...card, background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.15)' }}>
        <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: 0 }}>ℹ️ Crop your video by specifying position and size as a percentage. Use presets for common aspect ratios.</p>
      </div>
      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${dragging ? 'rgba(249,115,22,0.8)' : 'rgba(249,115,22,0.3)'}`, borderRadius: '12px', padding: file ? '16px' : '40px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {file ? (<div>
            <video ref={videoRef} src={videoSrc} onLoadedMetadata={onMeta} controls style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px', display: 'block', margin: '0 auto 12px' }} />
            {meta.w > 0 && <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 6px' }}>Original: <span style={{ color: '#f97316' }}>{meta.w}×{meta.h}</span></p>}
            <button onClick={() => { setFile(null); setVideoSrc(null); setResult(null); }} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change Video</button>
          </div>) : (<><div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🖼️</div>
            <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '6px' }}>Drop your video here</p>
            <p style={{ color: '#64748b', fontSize: '13px' }}>MP4 · MOV · WEBM · AVI · Click to browse</p></>)}
        </div>
      </div>
      {file && !result && (
        <div style={card}>
          <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '14px' }}>CROP PRESETS</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
            {PRESETS.map(p => (
              <button key={p.label} onClick={() => { setCropX(p.x); setCropY(p.y); setCropW(p.w); setCropH(p.h); }} style={{ padding: '10px 4px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '11px', fontWeight: '600', transition: 'all 0.2s' }}>
                {p.label}
              </button>
            ))}
          </div>
          <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '14px' }}>CUSTOM CROP (%)</p>
          {[['X Offset (Left)', cropX, setCropX, 0, 90], ['Y Offset (Top)', cropY, setCropY, 0, 90], ['Width', cropW, setCropW, 10, 100], ['Height', cropH, setCropH, 10, 100]].map(([label, val, set, min, max]) => (
            <div key={label} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>{label}</label>
                <span style={{ fontSize: '12px', color: '#f97316', fontWeight: '700' }}>{val}%{meta.w > 0 ? ` (${Math.round(meta[label.includes('X') || label.includes('Width') ? 'w' : 'h'] * val / 100)}px)` : ''}</span>
              </div>
              <input type="range" min={min} max={max} step={1} value={val} onChange={e => set(Number(e.target.value))} style={{ width: '100%', accentColor: '#f97316' }} />
            </div>
          ))}
          {meta.w > 0 && (
            <div style={{ padding: '10px', background: 'rgba(249,115,22,0.08)', borderRadius: '8px', textAlign: 'center', fontSize: '13px' }}>
              Output size: <strong style={{ color: '#f97316' }}>{outW}×{outH}</strong>
            </div>
          )}
                  <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>OUTPUT FORMAT</label>
            <select value={exportFormat} onChange={e => setExportFormat(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: '13px', height: '38px', outline: 'none' }}>
              <option value="mp4" style={{ color: '#ffffff', backgroundColor: '#121026' }}>MP4 (.mp4)</option>
              <option value="mov" style={{ color: '#ffffff', backgroundColor: '#121026' }}>MOV (.mov)</option>
              <option value="webm" style={{ color: '#ffffff', backgroundColor: '#121026' }}>WebM (.webm)</option>
            </select>
          </div>
</div>
      )}
      {file && !result && (
        <button onClick={handleProcess} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: processing ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#c2410c,#f97316)', color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 20px rgba(249,115,22,0.3)', marginBottom: '20px' }}>
          {processing ? `⏳ Cropping… ${progress}%` : `🖼️ Crop to ${outW}×${outH}`}
        </button>
      )}
      {processing && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}><span>Cropping frames…</span><span>{progress}%</span></div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#c2410c,#f97316)', borderRadius: '8px', transition: 'width 0.5s' }} />
          </div>
        </div>
      )}
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}
      {result && (
        <div style={{ ...card, border: '1px solid rgba(249,115,22,0.3)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            {[[`${meta.w}×${meta.h}`, 'Original', '#94a3b8'], [`${result.outW}×${result.outH}`, 'Cropped', '#f97316']].map(([v, l, c]) => (
              <div key={l} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: c }}>{v}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{l}</div>
              </div>
            ))}
          </div>
          <button onClick={download} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>⬇️ Download Cropped Video (.${exportFormat})</button>
          <button onClick={() => setResult(null)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>Crop Another</button>
        </div>
      )}
    </ToolLayout>
  );
}
