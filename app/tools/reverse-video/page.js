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

export default function ReverseVideo() {
  const [file, setFile] = useState(null);
  const [exportFormat, setExportFormat] = useState('mp4');
  const [videoSrc, setVideoSrc] = useState(null);
  const [meta, setMeta] = useState({ duration: 0, w: 0, h: 0 });
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
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

  const handleReverse = async () => {
    if (!file || !videoRef.current) return;
    setProcessing(true); setError(null); setProgress(0);
    try {
      const video = videoRef.current;
      const duration = meta.duration;
      const fps = 12; // Capture at 12fps to keep memory manageable
      const frameCount = Math.min(Math.floor(duration * fps), 600); // max 600 frames (~50s at 12fps)

      if (duration > 60) {
        setError('Reverse video is limited to 60 seconds due to browser memory. Please trim first.');
        setProcessing(false);
        return;
      }

      const w = meta.w || 1280;
      const h = meta.h || 720;
      const offscreen = document.createElement('canvas');
      offscreen.width = w; offscreen.height = h;
      const offCtx = offscreen.getContext('2d');

      // Step 1: Extract frames
      setStatus('Step 1/2: Extracting frames…');
      const frames = [];
      for (let i = 0; i < frameCount; i++) {
        const t = (i / frameCount) * duration;
        video.currentTime = t;
        await new Promise(r => setTimeout(r, 80));
        offCtx.drawImage(video, 0, 0, w, h);
        frames.push(offCtx.getImageData(0, 0, w, h));
        setProgress(Math.round((i / frameCount) * 50));
      }

      // Step 2: Encode reversed
      setStatus('Step 2/2: Encoding reversed video…');
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      const mime = getSupportedMimeType(exportFormat);
      const recorder = new MediaRecorder(canvas.captureStream(fps), { mimeType: mime, videoBitsPerSecond: 3_000_000 });
      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.start(100);

      for (let i = frames.length - 1; i >= 0; i--) {
        ctx.putImageData(frames[i], 0, 0);
        setProgress(50 + Math.round(((frames.length - i) / frames.length) * 49));
        await new Promise(r => setTimeout(r, 1000 / fps));
      }
      recorder.stop();
      await new Promise(r => setTimeout(r, 500));

      const blob = new Blob(chunks, { type: exportFormat === 'mp4' ? 'video/mp4' : exportFormat === 'mov' ? 'video/quicktime' : mime });
      setProgress(100);
      setStatus('');
      setResult({ blob, size: blob.size, name: file.name.replace(/\.[^.]+$/, `_reversed.${exportFormat}`) });
    } catch (err) { setError('Reverse failed: ' + err.message); setStatus(''); }
    setProcessing(false);
  };

  const download = () => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a'); a.href = url; a.download = result.name; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout icon="⏪" title="Reverse Video" category="Basic Video Tools" badgeColor="#fb7185">
      <div style={{ ...card, background: 'rgba(251,113,133,0.04)', border: '1px solid rgba(251,113,133,0.15)' }}>
        <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: 0 }}>ℹ️ Reverses your video by extracting frames and replaying them backwards. Works on videos up to 60 seconds. Trim long videos first.</p>
      </div>
      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${dragging ? 'rgba(251,113,133,0.8)' : 'rgba(251,113,133,0.3)'}`, borderRadius: '12px', padding: file ? '16px' : '40px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {file ? (<div>
            <video ref={videoRef} src={videoSrc} onLoadedMetadata={onMeta} controls style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px', display: 'block', margin: '0 auto 12px' }} />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', fontSize: '12px', color: '#94a3b8' }}>
              <span>📁 <span style={{ color: '#fb7185' }}>{fmt(file.size)}</span></span>
              {meta.duration > 0 && <span>⏱ <span style={{ color: meta.duration > 60 ? '#ef4444' : '#fb7185' }}>{fmtDur(meta.duration)}{meta.duration > 60 ? ' ⚠️ Too long' : ''}</span></span>}
            </div>
            <button onClick={() => { setFile(null); setVideoSrc(null); setResult(null); }} style={{ display: 'block', margin: '10px auto 0', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change Video</button>
          </div>) : (<><div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>⏪</div>
            <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '6px' }}>Drop your video here</p>
            <p style={{ color: '#64748b', fontSize: '13px' }}>MP4 · MOV · WEBM · Max 60 seconds</p></>)}
        </div>
      </div>
      {file && !result && (
        <button onClick={handleReverse} disabled={processing || meta.duration > 60} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: (processing || meta.duration > 60) ? 'not-allowed' : 'pointer', background: (processing || meta.duration > 60) ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#be123c,#fb7185)', color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 20px rgba(251,113,133,0.3)', marginBottom: '20px' }}>
          {processing ? `⏳ ${status} ${progress}%` : meta.duration > 60 ? '⚠️ Video too long — trim to under 60s first' : '⏪ Reverse Video'}
        </button>
      )}
      {processing && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}><span>{status}</span><span>{progress}%</span></div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#be123c,#fb7185)', borderRadius: '8px', transition: 'width 0.3s' }} />
          </div>
          <p style={{ color: '#64748b', fontSize: '11px', marginTop: '6px', textAlign: 'center' }}>Processing frames in memory — please wait…</p>
        </div>
      )}
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}
      {result && (
        <div style={{ ...card, border: '1px solid rgba(251,113,133,0.3)' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '2rem' }}>✅</div>
            <p style={{ color: '#34d399', fontWeight: '700', marginTop: '8px' }}>Video reversed!</p>
            <p style={{ color: '#64748b', fontSize: '13px' }}>{fmt(result.size)}</p>
          </div>
          <button onClick={download} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>⬇️ Download Reversed Video (.${exportFormat})</button>
          <button onClick={() => setResult(null)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>Reverse Another</button>
        </div>
      )}
    </ToolLayout>
  );
}
