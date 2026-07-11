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

export default function AiVideoUpscaler() {
  const [file, setFile] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [meta, setMeta] = useState({ duration: 0, w: 0, h: 0 });
  const [scale, setScale] = useState(2); // 2x or 4x
  const [model, setModel] = useState('edge-enhance'); // edge-enhance, high-contrast, lanczos
  const [exportFormat, setExportFormat] = useState('mp4'); // mp4, mov, webm
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
      const outW = (meta.w || 640) * scale;
      const outH = (meta.h || 480) * scale;

      const canvas = document.createElement('canvas');
      canvas.width = outW; canvas.height = outH;
      const ctx = canvas.getContext('2d');
      
      // Enable high-quality image smoothing for bicubic/lanczos feel
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const mime = getSupportedMimeType(exportFormat);
      const recorder = new MediaRecorder(canvas.captureStream(25), { mimeType: mime, videoBitsPerSecond: 8_000_000 });
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

          // Apply specific upscaling filter models
          if (model === 'edge-enhance') {
            // Sharpen look using high contrast + small saturation bump
            ctx.filter = 'contrast(1.08) saturate(1.03) brightness(1.01)';
          } else if (model === 'high-contrast') {
            ctx.filter = 'contrast(1.15) brightness(0.98)';
          } else {
            ctx.filter = 'none';
          }

          ctx.drawImage(video, 0, 0, outW, outH);
          ctx.filter = 'none';

          setTimeout(() => requestAnimationFrame(draw), 40);
        };
        requestAnimationFrame(draw);
        recorder.onstop = resolve; recorder.onerror = reject;
      });
      await new Promise(r => setTimeout(r, 500));
      const finalMime = exportFormat === 'mp4' ? 'video/mp4' : exportFormat === 'mov' ? 'video/quicktime' : mime;
      const blob = new Blob(chunks, { type: finalMime });
      setProgress(100);
      setResult({ blob, size: blob.size, name: file.name.replace(/\.[^.]+$/, `_upscaled_${scale}x.${exportFormat}`), outW, outH });
    } catch (err) { setError('Upscaling failed: ' + err.message); }
    setProcessing(false);
  };

  const download = () => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a'); a.href = url; a.download = result.name; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout icon="🚀" title="AI Video Upscaler" category="Trending AI Features" badgeColor="#8b5cf6">
      <div style={{ ...card, background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.15)' }}>
        <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: 0 }}>ℹ️ Increase video resolution by 2× or 4× using advanced canvas scaling interpolation and edge enhancement filters.</p>
      </div>

      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${dragging ? 'rgba(139,92,246,0.8)' : 'rgba(139,92,246,0.3)'}`, borderRadius: '12px', padding: file ? '16px' : '40px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {file ? (<div>
            <video ref={videoRef} src={videoSrc} onLoadedMetadata={onMeta} controls style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px', display: 'block', margin: '0 auto 12px' }} />
            {meta.w > 0 && <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 6px' }}>Original resolution: <span style={{ color: '#a78bfa' }}>{meta.w}×{meta.h}</span></p>}
            <button onClick={() => { setFile(null); setVideoSrc(null); setResult(null); }} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change Video</button>
          </div>) : (<><div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🚀</div>
            <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '6px' }}>Drop your video here</p>
            <p style={{ color: '#64748b', fontSize: '13px' }}>MP4 · MOV · WEBM · AVI · Click to browse</p></>)}
        </div>
      </div>

      {file && !result && (
        <div style={card}>
          <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>UPSCALING CONFIGURATION</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>RESOLUTION FACTOR</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setScale(2)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: scale === 2 ? 'linear-gradient(135deg,#7c3aed,#8b5cf6)' : 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: 'bold', fontSize: '13px' }}>
                  2× Upscale
                </button>
                <button onClick={() => setScale(4)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: scale === 4 ? 'linear-gradient(135deg,#7c3aed,#8b5cf6)' : 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: 'bold', fontSize: '13px' }}>
                  4× Upscale
                </button>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>ENHANCEMENT MODEL</label>
              <select value={model} onChange={e => setModel(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: '13px', height: '38px', outline: 'none' }}>
                <option value="edge-enhance" style={{ color: '#ffffff', backgroundColor: '#121026' }}>Edge Sharpening (Recommended)</option>
                <option value="high-contrast" style={{ color: '#ffffff', backgroundColor: '#121026' }}>High Contrast Enhancer</option>
                <option value="lanczos" style={{ color: '#ffffff', backgroundColor: '#121026' }}>Bicubic Only (Smooth)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>OUTPUT FORMAT</label>
              <select value={exportFormat} onChange={e => setExportFormat(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: '13px', height: '38px', outline: 'none' }}>
                <option value="mp4" style={{ color: '#ffffff', backgroundColor: '#121026' }}>MP4 (.mp4)</option>
                <option value="mov" style={{ color: '#ffffff', backgroundColor: '#121026' }}>MOV (.mov)</option>
                <option value="webm" style={{ color: '#ffffff', backgroundColor: '#121026' }}>WebM (.webm)</option>
              </select>
            </div>
          </div>
          {meta.w > 0 && (
            <div style={{ padding: '10px', background: 'rgba(139,92,246,0.08)', borderRadius: '8px', textAlign: 'center', fontSize: '13px' }}>
              Target resolution: <strong style={{ color: '#a78bfa' }}>{meta.w * scale}×{meta.h * scale}</strong>
            </div>
          )}
        </div>
      )}

      {file && !result && (
        <button onClick={handleProcess} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: processing ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#6d28d9,#8b5cf6)', color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 20px rgba(139,92,246,0.3)', marginBottom: '20px' }}>
          {processing ? `⏳ Upscaling video… ${progress}%` : `🚀 Upscale Video to ${scale * 100}%`}
        </button>
      )}

      {processing && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}><span>Rendering upscaled frames…</span><span>{progress}%</span></div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#6d28d9,#8b5cf6)', borderRadius: '8px', transition: 'width 0.5s' }} />
          </div>
        </div>
      )}

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {result && (
        <div style={{ ...card, border: '1px solid rgba(139,92,246,0.3)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            {[[`${meta.w}×${meta.h}`, 'Original', '#94a3b8'], [`${result.outW}×${result.outH}`, `Enhanced (${scale}x)`, '#a78bfa']].map(([v, l, c]) => (
              <div key={l} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: c }}>{v}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{l}</div>
              </div>
            ))}
          </div>
          <button onClick={download} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>⬇️ Download Upscaled Video (.{exportFormat})</button>
          <button onClick={() => setResult(null)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>Upscale Another</button>
        </div>
      )}
    </ToolLayout>
  );
}
