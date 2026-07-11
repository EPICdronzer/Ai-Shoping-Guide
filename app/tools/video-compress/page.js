'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const fmt = (b) => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
const fmtDur = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

const PRESETS = [
  { label: 'High Quality', bitsPerPx: 0.15, scale: 1.0, desc: 'Best quality, moderate compression' },
  { label: 'Balanced', bitsPerPx: 0.08, scale: 0.75, desc: 'Good quality, smaller size' },
  { label: 'Small Size', bitsPerPx: 0.04, scale: 0.5, desc: 'Lower quality, very small file' },
];

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

export default function VideoCompress() {
  const [file, setFile] = useState(null);
  const [exportFormat, setExportFormat] = useState('mp4');
  const [videoSrc, setVideoSrc] = useState(null);
  const [meta, setMeta] = useState({ duration: 0, w: 0, h: 0 });
  const [preset, setPreset] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const videoRef = useRef(null);

  const loadFile = (f) => {
    if (!f || !f.type.startsWith('video/')) { setError('Please select a video file (MP4, MOV, AVI, WEBM).'); return; }
    setFile(f); setResult(null); setError(null); setProgress(0);
    const url = URL.createObjectURL(f);
    setVideoSrc(url);
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); loadFile(e.dataTransfer.files[0]); }, []);

  const onVideoLoad = () => {
    const v = videoRef.current;
    if (v) setMeta({ duration: v.duration, w: v.videoWidth, h: v.videoHeight });
  };

  const handleCompress = async () => {
    if (!file || !videoRef.current) return;
    setProcessing(true); setError(null); setProgress(0);

    try {
      const cfg = PRESETS[preset];
      const srcW = meta.w || 1280;
      const srcH = meta.h || 720;
      const outW = Math.round(srcW * cfg.scale / 2) * 2;  // must be even
      const outH = Math.round(srcH * cfg.scale / 2) * 2;

      const canvas = document.createElement('canvas');
      canvas.width = outW; canvas.height = outH;
      const ctx = canvas.getContext('2d');

      // Pick supported codec
      const mimeType = getSupportedMimeType(exportFormat);


      const bps = Math.round(outW * outH * (meta.duration || 30) > 0
        ? (file.size * 8 * cfg.bitsPerPx) / Math.max(1, meta.duration)
        : 800_000);

      const recorder = new MediaRecorder(canvas.captureStream(25), {
        mimeType, videoBitsPerSecond: Math.max(100_000, bps),
      });
      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      const video = videoRef.current;
      video.muted = true;
      video.currentTime = 0;
      await new Promise(r => setTimeout(r, 200));

      recorder.start(100);

      const fps = 25;
      const frameDelay = 1000 / fps;
      const totalDur = meta.duration || 10;

      await new Promise((resolve, reject) => {
        let startTime = null;
        const draw = (ts) => {
          if (!startTime) startTime = ts;
          const elapsed = (ts - startTime) / 1000;
          setProgress(Math.min(99, Math.round((elapsed / totalDur) * 100)));

          if (elapsed >= totalDur) {
            recorder.stop();
            resolve();
            return;
          }
          video.currentTime = elapsed;
          ctx.drawImage(video, 0, 0, outW, outH);
          setTimeout(() => requestAnimationFrame(draw), frameDelay);
        };
        requestAnimationFrame(draw);
        recorder.onstop = resolve;
        recorder.onerror = reject;
      });

      await new Promise(r => setTimeout(r, 500));
      const blob = new Blob(chunks, { type: exportFormat === 'mp4' ? 'video/mp4' : exportFormat === 'mov' ? 'video/quicktime' : mimeType });
      setProgress(100);
      setResult({ blob, size: blob.size, name: file.name.replace(/\.[^.]+$/, `_compressed.${exportFormat}`) });
    } catch (err) {
      setError('Compression failed: ' + (err.message || 'Browser may not support MediaRecorder with this video.'));
    }
    setProcessing(false);
  };

  const download = () => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a'); a.href = url; a.download = result.name; a.click();
    URL.revokeObjectURL(url);
  };

  const saving = result ? Math.round((1 - result.size / file.size) * 100) : 0;

  return (
    <ToolLayout icon="🎬" title="Video Compressor" category="Media Tools" badgeColor="#f472b6">
      <div style={{ ...card, border: '1px solid rgba(244,114,182,0.15)', background: 'rgba(236,72,153,0.04)', padding: '14px', marginBottom: '16px' }}>
        <p style={{ color: '#94a3b8', fontSize: '12.5px' }}>ℹ️ Uses your browser's built-in MediaRecorder to re-encode the video. Output is .webm format. For best results use Chrome. Processing happens frame-by-frame and may take a while for long videos.</p>
      </div>

      {/* Drop zone */}
      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(244,114,182,0.8)' : 'rgba(244,114,182,0.3)'}`, borderRadius: '12px', padding: file ? '16px' : '40px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {file ? (
            <div>
              <video ref={videoRef} src={videoSrc} onLoadedMetadata={onVideoLoad} controls style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: '8px', display: 'block', margin: '0 auto 12px' }} />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '12px', color: '#94a3b8' }}>
                <span>📁 <span style={{ color: '#f472b6' }}>{fmt(file.size)}</span></span>
                {meta.duration > 0 && <span>⏱ <span style={{ color: '#f472b6' }}>{fmtDur(meta.duration)}</span></span>}
                {meta.w > 0 && <span>📐 <span style={{ color: '#f472b6' }}>{meta.w}×{meta.h}</span></span>}
              </div>
              <button onClick={() => { setFile(null); setVideoSrc(null); setResult(null); setMeta({ duration: 0, w: 0, h: 0 }); }} style={{ marginTop: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change Video</button>
            </div>
          ) : (
            <><div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🎬</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '6px' }}>Drop your video here</p>
              <p style={{ color: '#64748b', fontSize: '13px' }}>MP4 · MOV · WEBM · AVI · Click to browse</p></>
          )}
        </div>
      </div>

      {/* Preset selector */}
      {file && (
        <div style={card}>
          <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '14px' }}>COMPRESSION PRESET</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {PRESETS.map((p, i) => (
              <button key={p.label} onClick={() => setPreset(i)} style={{
                flex: 1, minWidth: '140px', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: preset === i ? 'linear-gradient(135deg,#be185d,#ec4899)' : 'rgba(255,255,255,0.05)',
                color: preset === i ? '#fff' : '#94a3b8', textAlign: 'left', transition: 'all 0.2s',
                boxShadow: preset === i ? '0 4px 16px rgba(236,72,153,0.3)' : 'none',
              }}>
                <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>{p.label}</div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>{p.desc}</div>
                {meta.w > 0 && <div style={{ fontSize: '11px', marginTop: '6px', color: preset === i ? 'rgba(255,255,255,0.7)' : '#475569' }}>
                  Output: {Math.round(meta.w * p.scale)}×{Math.round(meta.h * p.scale)}
                </div>}
              </button>
            ))}
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

      {/* Process button */}
      {file && !result && (
        <button onClick={handleCompress} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: processing ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#be185d,#ec4899)', color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 20px rgba(236,72,153,0.3)', marginBottom: '20px' }}>
          {processing ? `⏳ Compressing… ${progress}%` : '🎬 Compress Video'}
        </button>
      )}

      {/* Progress bar */}
      {processing && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
            <span>Processing video frame by frame…</span><span>{progress}%</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#be185d,#ec4899)', borderRadius: '8px', transition: 'width 0.5s' }} />
          </div>
        </div>
      )}

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {/* Result */}
      {result && (
        <div style={{ ...card, border: '1px solid rgba(52,211,153,0.3)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            {[['Original', fmt(file.size), '#94a3b8'], ['Compressed', fmt(result.size), '#34d399'], ['Saved', saving > 0 ? saving + '%' : '~', '#f472b6']].map(([l, v, c]) => (
              <div key={l} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: c }}>{v}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{l}</div>
              </div>
            ))}
          </div>
          <button onClick={download} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>⬇️ Download Compressed Video (.${exportFormat})</button>
          <button onClick={() => setResult(null)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>Try different preset</button>
        </div>
      )}
    </ToolLayout>
  );
}
