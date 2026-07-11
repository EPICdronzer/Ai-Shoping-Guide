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

export default function BrightnessContrast() {
  const [file, setFile] = useState(null);
  const [exportFormat, setExportFormat] = useState('mp4');
  const [videoSrc, setVideoSrc] = useState(null);
  const [meta, setMeta] = useState({ duration: 0, w: 0, h: 0 });
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [sharpness, setSharpness] = useState(0);
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

  const filterStr = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

  const handleProcess = async () => {
    if (!file || !videoRef.current) return;
    setProcessing(true); setError(null); setProgress(0);
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = meta.w || 1280; canvas.height = meta.h || 720;
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
          ctx.filter = filterStr;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          ctx.filter = 'none';
          setTimeout(() => requestAnimationFrame(draw), 40);
        };
        requestAnimationFrame(draw);
        recorder.onstop = resolve; recorder.onerror = reject;
      });
      await new Promise(r => setTimeout(r, 500));
      const blob = new Blob(chunks, { type: exportFormat === 'mp4' ? 'video/mp4' : exportFormat === 'mov' ? 'video/quicktime' : mime });
      setProgress(100);
      setResult({ blob, size: blob.size, name: file.name.replace(/\.[^.]+$/, `_adjusted.${exportFormat}`) });
    } catch (err) { setError('Processing failed: ' + err.message); }
    setProcessing(false);
  };

  const download = () => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a'); a.href = url; a.download = result.name; a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => { setBrightness(100); setContrast(100); setSaturation(100); };

  const SLIDER = ({ label, value, set, min = 0, max = 200, accent = '#fbbf24', icon }) => (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <label style={{ fontSize: '12px', color: '#94a3b8' }}>{icon} {label}</label>
        <span style={{ fontSize: '12px', color: accent, fontWeight: '700' }}>{value}%</span>
      </div>
      <input type="range" min={min} max={max} step={1} value={value} onChange={e => set(Number(e.target.value))} style={{ width: '100%', accentColor: accent }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#374151', marginTop: '2px' }}>
        <span>{min}%</span><span>100%</span><span>{max}%</span>
      </div>
    </div>
  );

  return (
    <ToolLayout icon="☀️" title="Brightness, Contrast & Saturation" category="Editing Tools" badgeColor="#fbbf24">
      <div style={{ ...card, background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.15)' }}>
        <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: 0 }}>ℹ️ Adjust brightness, contrast and saturation. Preview updates live on the video player.</p>
      </div>
      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${dragging ? 'rgba(251,191,36,0.8)' : 'rgba(251,191,36,0.3)'}`, borderRadius: '12px', padding: file ? '16px' : '40px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {file ? (<div>
            <video ref={videoRef} src={videoSrc} onLoadedMetadata={onMeta} controls style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', display: 'block', margin: '0 auto 12px', filter: filterStr }} />
            <p style={{ color: '#64748b', fontSize: '11px', marginBottom: '4px' }}>Live preview above</p>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>📁 <span style={{ color: '#fbbf24' }}>{fmt(file.size)}</span></span>
            <button onClick={() => { setFile(null); setVideoSrc(null); setResult(null); }} style={{ display: 'block', margin: '10px auto 0', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change Video</button>
          </div>) : (<><div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>☀️</div>
            <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '6px' }}>Drop your video here</p>
            <p style={{ color: '#64748b', fontSize: '13px' }}>MP4 · MOV · WEBM · AVI · Click to browse</p></>)}
        </div>
      </div>
      {file && !result && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', margin: 0 }}>ADJUSTMENTS</p>
            <button onClick={reset} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>↺ Reset All</button>
          </div>
          <SLIDER label="Brightness" value={brightness} set={setBrightness} min={0} max={200} accent="#fbbf24" icon="☀️" />
          <SLIDER label="Contrast" value={contrast} set={setContrast} min={0} max={200} accent="#f472b6" icon="◑" />
          <SLIDER label="Saturation" value={saturation} set={setSaturation} min={0} max={300} accent="#34d399" icon="🌈" />
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
        <button onClick={handleProcess} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: processing ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#b45309,#fbbf24)', color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 20px rgba(251,191,36,0.3)', marginBottom: '20px' }}>
          {processing ? `⏳ Processing… ${progress}%` : '☀️ Apply Adjustments'}
        </button>
      )}
      {processing && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}><span>Applying color adjustments…</span><span>{progress}%</span></div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#b45309,#fbbf24)', borderRadius: '8px', transition: 'width 0.5s' }} />
          </div>
        </div>
      )}
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}
      {result && (
        <div style={{ ...card, border: '1px solid rgba(251,191,36,0.3)' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '2rem' }}>✅</div>
            <p style={{ color: '#34d399', fontWeight: '700', marginTop: '8px' }}>Adjustments applied!</p>
            <p style={{ color: '#64748b', fontSize: '13px' }}>{fmt(result.size)}</p>
          </div>
          <button onClick={download} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>⬇️ Download Adjusted Video (.${exportFormat})</button>
          <button onClick={() => setResult(null)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>Adjust Another</button>
        </div>
      )}
    </ToolLayout>
  );
}
