'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const fmt = (b) => b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
const fmtDur = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function LoopVideo() {
  const [file, setFile] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [meta, setMeta] = useState({ duration: 0, w: 0, h: 0 });
  const [loops, setLoops] = useState(3);
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
      const recorder = new MediaRecorder(canvas.captureStream(25), { mimeType: mime, videoBitsPerSecond: 3_000_000 });
      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      const totalDur = meta.duration || 10;
      const outputDur = totalDur * loops;
      video.muted = true;
      await new Promise(r => setTimeout(r, 200));
      recorder.start(100);

      await new Promise((resolve, reject) => {
        let t0 = null;
        let loop = 0;
        const draw = (ts) => {
          if (!t0) t0 = ts;
          const elapsed = (ts - t0) / 1000;
          setProgress(Math.min(99, Math.round((elapsed / outputDur) * 100)));
          if (elapsed >= outputDur) { recorder.stop(); resolve(); return; }
          // Which loop are we in?
          const loopTime = elapsed % totalDur;
          video.currentTime = loopTime;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          setTimeout(() => requestAnimationFrame(draw), 40);
        };
        requestAnimationFrame(draw);
        recorder.onstop = resolve; recorder.onerror = reject;
      });
      await new Promise(r => setTimeout(r, 500));
      const blob = new Blob(chunks, { type: mime });
      setProgress(100);
      setResult({ blob, size: blob.size, name: file.name.replace(/\.[^.]+$/, `_loop${loops}x.webm`), outDur: outputDur });
    } catch (err) { setError('Processing failed: ' + err.message); }
    setProcessing(false);
  };

  const download = () => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a'); a.href = url; a.download = result.name; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout icon="🔁" title="Loop Video" category="Basic Video Tools" badgeColor="#818cf8">
      <div style={{ ...card, background: 'rgba(129,140,248,0.04)', border: '1px solid rgba(129,140,248,0.15)' }}>
        <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: 0 }}>ℹ️ Creates a seamlessly looped video by repeating the clip N times. Perfect for social media and animated backgrounds.</p>
      </div>
      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${dragging ? 'rgba(129,140,248,0.8)' : 'rgba(129,140,248,0.3)'}`, borderRadius: '12px', padding: file ? '16px' : '40px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {file ? (<div>
            <video ref={videoRef} src={videoSrc} onLoadedMetadata={onMeta} controls style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px', display: 'block', margin: '0 auto 12px' }} />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', fontSize: '12px', color: '#94a3b8' }}>
              <span>📁 <span style={{ color: '#818cf8' }}>{fmt(file.size)}</span></span>
              {meta.duration > 0 && <span>⏱ <span style={{ color: '#818cf8' }}>{fmtDur(meta.duration)}</span></span>}
            </div>
            <button onClick={() => { setFile(null); setVideoSrc(null); setResult(null); }} style={{ display: 'block', margin: '10px auto 0', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change Video</button>
          </div>) : (<><div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🔁</div>
            <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '6px' }}>Drop your video here</p>
            <p style={{ color: '#64748b', fontSize: '13px' }}>MP4 · MOV · WEBM · AVI · Click to browse</p></>)}
        </div>
      </div>
      {file && !result && (
        <div style={card}>
          <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>NUMBER OF LOOPS</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '20px' }}>
            {[2, 3, 5, 10, 20].map(n => (
              <button key={n} onClick={() => setLoops(n)} style={{ padding: '14px 6px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: loops === n ? 'linear-gradient(135deg,#4338ca,#818cf8)' : 'rgba(255,255,255,0.05)', color: loops === n ? '#fff' : '#94a3b8', fontWeight: '800', fontSize: '16px', transition: 'all 0.2s', boxShadow: loops === n ? '0 4px 16px rgba(129,140,248,0.3)' : 'none' }}>
                {n}×
              </button>
            ))}
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>CUSTOM: {loops}× loops</label>
            <input type="range" min={2} max={50} value={loops} onChange={e => setLoops(Number(e.target.value))} style={{ width: '100%', accentColor: '#818cf8' }} />
          </div>
          {meta.duration > 0 && (
            <div style={{ padding: '12px', background: 'rgba(129,140,248,0.08)', borderRadius: '10px', textAlign: 'center', fontSize: '13px' }}>
              <span style={{ color: '#94a3b8' }}>Original: </span><span style={{ color: '#818cf8', fontWeight: '700' }}>{fmtDur(meta.duration)}</span>
              <span style={{ color: '#94a3b8' }}> × {loops} = </span><span style={{ color: '#34d399', fontWeight: '700' }}>{fmtDur(meta.duration * loops)} output</span>
            </div>
          )}
        </div>
      )}
      {file && !result && (
        <button onClick={handleProcess} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: processing ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#4338ca,#818cf8)', color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 20px rgba(129,140,248,0.3)', marginBottom: '20px' }}>
          {processing ? `⏳ Looping… ${progress}%` : `🔁 Create ${loops}× Loop`}
        </button>
      )}
      {processing && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}><span>Rendering {loops} loops…</span><span>{progress}%</span></div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#4338ca,#818cf8)', borderRadius: '8px', transition: 'width 0.5s' }} />
          </div>
        </div>
      )}
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}
      {result && (
        <div style={{ ...card, border: '1px solid rgba(129,140,248,0.3)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            {[[fmtDur(meta.duration), 'Original', '#94a3b8'], [fmtDur(result.outDur), `${loops}× Loop`, '#818cf8']].map(([v, l, c]) => (
              <div key={l} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: c }}>{v}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{l}</div>
              </div>
            ))}
          </div>
          <button onClick={download} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>⬇️ Download Looped Video (.webm)</button>
          <button onClick={() => setResult(null)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>Create Another Loop</button>
        </div>
      )}
    </ToolLayout>
  );
}
