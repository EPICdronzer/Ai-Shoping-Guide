'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const fmt = (b) => b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
const fmtDur = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
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

export default function VideoTrimmer() {
  const [file, setFile] = useState(null);
  const [exportFormat, setExportFormat] = useState('mp4');
  const [videoSrc, setVideoSrc] = useState(null);
  const [meta, setMeta] = useState({ duration: 0, w: 0, h: 0 });
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
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
    if (v) { setMeta({ duration: v.duration, w: v.videoWidth, h: v.videoHeight }); setEndTime(v.duration); }
  };

  const handleTrim = async () => {
    if (!file || !videoRef.current) return;
    setProcessing(true); setError(null); setProgress(0);
    try {
      const video = videoRef.current;
      const duration = Math.max(0.5, endTime - startTime);
      const canvas = document.createElement('canvas');
      canvas.width = meta.w || 1280; canvas.height = meta.h || 720;
      const ctx = canvas.getContext('2d');
      const mime = getSupportedMimeType(exportFormat);
      const recorder = new MediaRecorder(canvas.captureStream(25), { mimeType: mime, videoBitsPerSecond: 3_000_000 });
      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      video.muted = true; video.currentTime = startTime;
      await new Promise(r => setTimeout(r, 300));
      recorder.start(100);
      await new Promise((resolve, reject) => {
        let t0 = null;
        const draw = (ts) => {
          if (!t0) t0 = ts;
          const elapsed = (ts - t0) / 1000;
          setProgress(Math.min(99, Math.round((elapsed / duration) * 100)));
          if (elapsed >= duration) { recorder.stop(); resolve(); return; }
          video.currentTime = startTime + elapsed;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          setTimeout(() => requestAnimationFrame(draw), 40);
        };
        requestAnimationFrame(draw);
        recorder.onstop = resolve; recorder.onerror = reject;
      });
      await new Promise(r => setTimeout(r, 500));
      const blob = new Blob(chunks, { type: exportFormat === 'mp4' ? 'video/mp4' : exportFormat === 'mov' ? 'video/quicktime' : mime });
      setProgress(100);
      setResult({ blob, size: blob.size, name: file.name.replace(/\.[^.]+$/, `_trimmed.${exportFormat}`) });
    } catch (err) { setError('Trim failed: ' + err.message); }
    setProcessing(false);
  };

  const download = () => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a'); a.href = url; a.download = result.name; a.click();
    URL.revokeObjectURL(url);
  };

  const dropStyle = { border: `2px dashed ${dragging ? 'rgba(52,211,153,0.8)' : 'rgba(52,211,153,0.3)'}`, borderRadius: '12px', padding: file ? '16px' : '40px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' };

  return (
    <ToolLayout icon="✂️" title="Video Trimmer" category="Basic Video Tools" badgeColor="#34d399">
      <div style={{ ...card, background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.15)' }}>
        <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: 0 }}>ℹ️ Set your start and end time using the sliders, then click Trim. Output is WebM format processed in your browser.</p>
      </div>
      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onClick={() => !file && inputRef.current?.click()} style={dropStyle}>
          <input ref={inputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {file ? (<div>
            <video ref={videoRef} src={videoSrc} onLoadedMetadata={onMeta} controls style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', display: 'block', margin: '0 auto 12px' }} />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', fontSize: '12px', color: '#94a3b8' }}>
              <span>📁 <span style={{ color: '#34d399' }}>{fmt(file.size)}</span></span>
              {meta.duration > 0 && <span>⏱ <span style={{ color: '#34d399' }}>{fmtDur(meta.duration)}</span></span>}
              {meta.w > 0 && <span>📐 <span style={{ color: '#34d399' }}>{meta.w}×{meta.h}</span></span>}
            </div>
            <button onClick={() => { setFile(null); setVideoSrc(null); setResult(null); }} style={{ marginTop: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change Video</button>
          </div>) : (<><div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>✂️</div>
            <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '6px' }}>Drop your video here</p>
            <p style={{ color: '#64748b', fontSize: '13px' }}>MP4 · MOV · WEBM · AVI · Click to browse</p></>)}
        </div>
      </div>

      {file && meta.duration > 0 && !result && (
        <div style={card}>
          <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '20px' }}>TRIM RANGE</p>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>START TIME: <strong style={{ color: '#34d399' }}>{fmtDur(startTime)}</strong></label>
            <input type="range" min={0} max={meta.duration} step={0.1} value={startTime} onChange={e => setStartTime(Math.min(Number(e.target.value), endTime - 0.5))} style={{ width: '100%', accentColor: '#34d399' }} />
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>END TIME: <strong style={{ color: '#34d399' }}>{fmtDur(endTime)}</strong></label>
            <input type="range" min={0} max={meta.duration} step={0.1} value={endTime} onChange={e => setEndTime(Math.max(Number(e.target.value), startTime + 0.5))} style={{ width: '100%', accentColor: '#34d399' }} />
          </div>
          <div style={{ padding: '12px', background: 'rgba(52,211,153,0.08)', borderRadius: '10px', textAlign: 'center', color: '#34d399', fontWeight: '600' }}>
            {fmtDur(startTime)} → {fmtDur(endTime)} &nbsp;·&nbsp; Clip duration: <strong>{fmtDur(endTime - startTime)}</strong>
          </div>
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
        <button onClick={handleTrim} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: processing ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#059669,#34d399)', color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 20px rgba(52,211,153,0.3)', marginBottom: '20px' }}>
          {processing ? `⏳ Trimming… ${progress}%` : '✂️ Trim Video'}
        </button>
      )}
      {processing && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}><span>Processing video frames…</span><span>{progress}%</span></div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#059669,#34d399)', borderRadius: '8px', transition: 'width 0.5s' }} />
          </div>
        </div>
      )}
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}
      {result && (
        <div style={{ ...card, border: '1px solid rgba(52,211,153,0.3)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            {[['Original', fmt(file.size), '#94a3b8'], ['Trimmed', fmt(result.size), '#34d399']].map(([l, v, c]) => (
              <div key={l} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: c }}>{v}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{l}</div>
              </div>
            ))}
          </div>
          <button onClick={download} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>⬇️ Download Trimmed Video (.${exportFormat})</button>
          <button onClick={() => setResult(null)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>Trim Again</button>
        </div>
      )}
    </ToolLayout>
  );
}
