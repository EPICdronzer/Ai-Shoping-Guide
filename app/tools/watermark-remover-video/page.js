'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const fmt = (b) => b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function WatermarkRemoverVideo() {
  const [file, setFile] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [meta, setMeta] = useState({ duration: 0, w: 0, h: 0 });
  const [x, setX] = useState(10); // in percent
  const [y, setY] = useState(10); // in percent
  const [width, setWidth] = useState(25); // in percent
  const [height, setHeight] = useState(15); // in percent
  const [blurRadius, setBlurRadius] = useState(16); // in px
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
      const recorder = new MediaRecorder(canvas.captureStream(25), { mimeType: mime, videoBitsPerSecond: 3_500_000 });
      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      video.muted = true; video.currentTime = 0;
      await new Promise(r => setTimeout(r, 200));
      recorder.start(100);
      const totalDur = meta.duration || 10;

      // Translate percentages to pixel coordinates
      const boxX = Math.round(canvas.width * (x / 100));
      const boxY = Math.round(canvas.height * (y / 100));
      const boxW = Math.round(canvas.width * (width / 100));
      const boxH = Math.round(canvas.height * (height / 100));

      await new Promise((resolve, reject) => {
        let t0 = null;
        const draw = (ts) => {
          if (!t0) t0 = ts;
          const elapsed = (ts - t0) / 1000;
          setProgress(Math.min(99, Math.round((elapsed / totalDur) * 100)));
          if (elapsed >= totalDur) { recorder.stop(); resolve(); return; }
          video.currentTime = elapsed;
          
          // Step 1: Draw full raw frame
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Step 2: Overlay blurred region
          ctx.save();
          // Create path for the crop box
          ctx.beginPath();
          ctx.rect(boxX, boxY, boxW, boxH);
          ctx.clip();
          
          // Apply blur and draw blurred portion
          ctx.filter = `blur(${blurRadius}px)`;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          ctx.restore();
          ctx.filter = 'none';

          setTimeout(() => requestAnimationFrame(draw), 40);
        };
        requestAnimationFrame(draw);
        recorder.onstop = resolve; recorder.onerror = reject;
      });
      await new Promise(r => setTimeout(r, 500));
      const blob = new Blob(chunks, { type: mime });
      setProgress(100);
      setResult({ blob, size: blob.size, name: file.name.replace(/\.[^.]+$/, '_unwatermarked.webm') });
    } catch (err) { setError('Watermark removal failed: ' + err.message); }
    setProcessing(false);
  };

  const download = () => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a'); a.href = url; a.download = result.name; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout icon="🧼" title="Video Watermark Remover" category="Editing Tools" badgeColor="#f43f5e">
      <div style={{ ...card, background: 'rgba(244,63,94,0.04)', border: '1px solid rgba(244,63,94,0.15)' }}>
        <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: 0 }}>ℹ️ Position the red dashed box over the watermark/logo. The tool will apply a smart spatial blur on this region across the entire video.</p>
      </div>

      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${dragging ? 'rgba(244,63,94,0.8)' : 'rgba(244,63,94,0.3)'}`, borderRadius: '12px', padding: file ? '16px' : '40px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s', position: 'relative' }}>
          <input ref={inputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {file ? (
            <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
              <video ref={videoRef} src={videoSrc} onLoadedMetadata={onMeta} controls={false} muted loop autoPlay playsInline style={{ maxWidth: '100%', maxHeight: '320px', borderRadius: '8px', display: 'block', margin: '0 auto' }} />
              
              {/* Box Overlay overlaying the playing video */}
              <div style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                width: `${width}%`,
                height: `${height}%`,
                border: '2px dashed #f43f5e',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)', // dim outside the box
                pointerEvents: 'none',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }} />
              <div style={{ position: 'absolute', left: `${x}%`, top: `calc(${y}% - 22px)`, background: '#f43f5e', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '3px', pointerEvents: 'none' }}>
                Watermark Area
              </div>
            </div>
          ) : (<><div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🧼</div>
            <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '6px' }}>Drop your video here</p>
            <p style={{ color: '#64748b', fontSize: '13px' }}>MP4 · MOV · WEBM · AVI · Click to browse</p></>)}
        </div>
        {file && (
          <button onClick={() => { setFile(null); setVideoSrc(null); setResult(null); }} style={{ display: 'block', margin: '12px auto 0', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change Video</button>
        )}
      </div>

      {file && meta.duration > 0 && !result && (
        <div style={card}>
          <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '20px' }}>ADJUST WATERMARK REGION</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>X POSITION: {x}%</label>
              <input type="range" min={0} max={100 - width} value={x} onChange={e => setX(Number(e.target.value))} style={{ width: '100%', accentColor: '#f43f5e' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Y POSITION: {y}%</label>
              <input type="range" min={0} max={100 - height} value={y} onChange={e => setY(Number(e.target.value))} style={{ width: '100%', accentColor: '#f43f5e' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>WIDTH: {width}%</label>
              <input type="range" min={5} max={100 - x} value={width} onChange={e => setWidth(Number(e.target.value))} style={{ width: '100%', accentColor: '#f43f5e' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>HEIGHT: {height}%</label>
              <input type="range" min={5} max={100 - y} value={height} onChange={e => setHeight(Number(e.target.value))} style={{ width: '100%', accentColor: '#f43f5e' }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>BLUR INTENSITY: {blurRadius}px</label>
            <input type="range" min={4} max={40} value={blurRadius} onChange={e => setBlurRadius(Number(e.target.value))} style={{ width: '100%', accentColor: '#f43f5e' }} />
          </div>
        </div>
      )}

      {file && !result && (
        <button onClick={handleProcess} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: processing ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#e11d48,#f43f5e)', color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 20px rgba(244,63,94,0.3)', marginBottom: '20px' }}>
          {processing ? `⏳ Removing watermark… ${progress}%` : '🧼 Process Watermark Removal'}
        </button>
      )}

      {processing && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}><span>Rendering blur layer...</span><span>{progress}%</span></div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#e11d48,#f43f5e)', borderRadius: '8px', transition: 'width 0.5s' }} />
          </div>
        </div>
      )}

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {result && (
        <div style={{ ...card, border: '1px solid rgba(244,63,94,0.3)' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '2rem' }}>🧼</div>
            <p style={{ color: '#34d399', fontWeight: '700', marginTop: '8px' }}>Watermark removed successfully!</p>
            <p style={{ color: '#64748b', fontSize: '13px' }}>Output: {fmt(result.size)}</p>
          </div>
          <button onClick={download} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>⬇️ Download Video (.webm)</button>
          <button onClick={() => setResult(null)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>Process Another</button>
        </div>
      )}
    </ToolLayout>
  );
}
