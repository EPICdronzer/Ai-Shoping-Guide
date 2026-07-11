'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const fmt = (b) => b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

const POSITIONS = [
  { id: 'top-left', label: '↖ Top Left', x: (cw, iw, pad) => pad, y: (ch, ih, pad) => pad },
  { id: 'top-right', label: '↗ Top Right', x: (cw, iw, pad) => cw - iw - pad, y: (ch, ih, pad) => pad },
  { id: 'center', label: '⊙ Center', x: (cw, iw) => (cw - iw) / 2, y: (ch, ih) => (ch - ih) / 2 },
  { id: 'bottom-left', label: '↙ Bottom Left', x: (cw, iw, pad) => pad, y: (ch, ih, pad) => ch - ih - pad },
  { id: 'bottom-right', label: '↘ Bottom Right', x: (cw, iw, pad) => cw - iw - pad, y: (ch, ih, pad) => ch - ih - pad },
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

export default function AddImageWatermark() {
  const [file, setFile] = useState(null);
  const [exportFormat, setExportFormat] = useState('mp4');
  const [videoSrc, setVideoSrc] = useState(null);
  const [meta, setMeta] = useState({ duration: 0, w: 0, h: 0 });
  const [watermark, setWatermark] = useState(null);
  const [watermarkSrc, setWatermarkSrc] = useState(null);
  const [position, setPosition] = useState(POSITIONS[4]);
  const [opacity, setOpacity] = useState(80);
  const [scale, setScale] = useState(20);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const videoInputRef = useRef(null);
  const watermarkInputRef = useRef(null);
  const videoRef = useRef(null);
  const wmImgRef = useRef(null);

  const loadVideo = (f) => {
    if (!f?.type.startsWith('video/')) { setError('Please select a video file.'); return; }
    setFile(f); setResult(null); setError(null);
    setVideoSrc(URL.createObjectURL(f));
  };
  const loadWatermark = (f) => {
    if (!f?.type.startsWith('image/')) { setError('Please select an image for the watermark.'); return; }
    setWatermark(f);
    setWatermarkSrc(URL.createObjectURL(f));
  };
  const onVideoDrop = useCallback((e) => { e.preventDefault(); setDragging(false); loadVideo(e.dataTransfer.files[0]); }, []);
  const onMeta = () => { const v = videoRef.current; if (v) setMeta({ duration: v.duration, w: v.videoWidth, h: v.videoHeight }); };

  const handleProcess = async () => {
    if (!file || !videoRef.current || !watermarkSrc || !wmImgRef.current) { setError('Please upload both a video and a watermark image.'); return; }
    setProcessing(true); setError(null); setProgress(0);
    try {
      const video = videoRef.current;
      const wmImg = wmImgRef.current;
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
      // Compute watermark dimensions
      const wmW = Math.round(canvas.width * (scale / 100));
      const wmH = Math.round((wmW / wmImg.naturalWidth) * wmImg.naturalHeight);
      const pad = 20;
      const wmX = position.x(canvas.width, wmW, pad);
      const wmY = position.y(canvas.height, wmH, pad);

      await new Promise((resolve, reject) => {
        let t0 = null;
        const draw = (ts) => {
          if (!t0) t0 = ts;
          const elapsed = (ts - t0) / 1000;
          setProgress(Math.min(99, Math.round((elapsed / totalDur) * 100)));
          if (elapsed >= totalDur) { recorder.stop(); resolve(); return; }
          video.currentTime = elapsed;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          ctx.globalAlpha = opacity / 100;
          ctx.drawImage(wmImg, wmX, wmY, wmW, wmH);
          ctx.globalAlpha = 1;
          setTimeout(() => requestAnimationFrame(draw), 40);
        };
        requestAnimationFrame(draw);
        recorder.onstop = resolve; recorder.onerror = reject;
      });
      await new Promise(r => setTimeout(r, 500));
      const blob = new Blob(chunks, { type: exportFormat === 'mp4' ? 'video/mp4' : exportFormat === 'mov' ? 'video/quicktime' : mime });
      setProgress(100);
      setResult({ blob, size: blob.size, name: file.name.replace(/\.[^.]+$/, `_watermarked.${exportFormat}`) });
    } catch (err) { setError('Processing failed: ' + err.message); }
    setProcessing(false);
  };

  const download = () => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a'); a.href = url; a.download = result.name; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout icon="🛡️" title="Add Image / Logo Watermark" category="Editing Tools" badgeColor="#a78bfa">
      <div style={{ ...card, background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.15)' }}>
        <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: 0 }}>ℹ️ Stamp your brand logo or watermark image onto any video. Supports PNG with transparency for best results.</p>
      </div>
      {/* Video Upload */}
      <div style={card}>
        <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>1. UPLOAD VIDEO</p>
        <div onDrop={onVideoDrop} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onClick={() => !file && videoInputRef.current?.click()}
          style={{ border: `2px dashed ${dragging ? 'rgba(167,139,250,0.8)' : 'rgba(167,139,250,0.3)'}`, borderRadius: '12px', padding: file ? '12px' : '30px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={videoInputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => loadVideo(e.target.files[0])} />
          {file ? (<div>
            <video ref={videoRef} src={videoSrc} onLoadedMetadata={onMeta} controls style={{ maxWidth: '100%', maxHeight: '160px', borderRadius: '8px', display: 'block', margin: '0 auto 8px' }} />
            <span style={{ fontSize: '11px', color: '#a78bfa' }}>{file.name} · {fmt(file.size)}</span>
          </div>) : (<><div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎬</div><p style={{ color: '#64748b', fontSize: '13px' }}>Drop video or click to browse</p></>)}
        </div>
      </div>
      {/* Watermark Upload */}
      <div style={card}>
        <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>2. UPLOAD WATERMARK IMAGE</p>
        <div onClick={() => watermarkInputRef.current?.click()} style={{ border: '2px dashed rgba(167,139,250,0.3)', borderRadius: '12px', padding: watermarkSrc ? '12px' : '30px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.25s' }}>
          <input ref={watermarkInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => loadWatermark(e.target.files[0])} />
          {watermarkSrc ? (<div>
            {/* Hidden img for reference */}
            <img ref={wmImgRef} src={watermarkSrc} alt="wm" style={{ display: 'none' }} />
            <img src={watermarkSrc} alt="Watermark" style={{ maxHeight: '80px', maxWidth: '200px', borderRadius: '8px', objectFit: 'contain', background: 'rgba(255,255,255,0.1)', padding: '8px' }} />
            <p style={{ fontSize: '11px', color: '#a78bfa', marginTop: '6px' }}>{watermark?.name}</p>
          </div>) : (<><div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🖼️</div><p style={{ color: '#64748b', fontSize: '13px' }}>PNG with transparency recommended</p></>)}
        </div>
      </div>
      {/* Settings */}
      {file && watermarkSrc && !result && (
        <div style={card}>
          <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>3. WATERMARK SETTINGS</p>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>SIZE: <strong style={{ color: '#a78bfa' }}>{scale}% of video width</strong></label>
            <input type="range" min={5} max={50} value={scale} onChange={e => setScale(Number(e.target.value))} style={{ width: '100%', accentColor: '#a78bfa' }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>OPACITY: <strong style={{ color: '#a78bfa' }}>{opacity}%</strong></label>
            <input type="range" min={10} max={100} value={opacity} onChange={e => setOpacity(Number(e.target.value))} style={{ width: '100%', accentColor: '#a78bfa' }} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>POSITION</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {POSITIONS.map(p => (
                <button key={p.id} onClick={() => setPosition(p)} style={{ padding: '8px 4px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: position.id === p.id ? 'linear-gradient(135deg,#7c3aed,#a78bfa)' : 'rgba(255,255,255,0.05)', color: position.id === p.id ? '#fff' : '#94a3b8', fontSize: '11px', fontWeight: '600', transition: 'all 0.2s' }}>
                  {p.label}
                </button>
              ))}
            </div>
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
      {file && watermarkSrc && !result && (
        <button onClick={handleProcess} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: processing ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#7c3aed,#a78bfa)', color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 20px rgba(124,58,237,0.3)', marginBottom: '20px' }}>
          {processing ? `⏳ Watermarking… ${progress}%` : '🛡️ Add Watermark'}
        </button>
      )}
      {processing && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}><span>Rendering watermark…</span><span>{progress}%</span></div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#7c3aed,#a78bfa)', borderRadius: '8px', transition: 'width 0.5s' }} />
          </div>
        </div>
      )}
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}
      {result && (
        <div style={{ ...card, border: '1px solid rgba(167,139,250,0.3)' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '2rem' }}>✅</div>
            <p style={{ color: '#34d399', fontWeight: '700', marginTop: '8px' }}>Watermark added!</p>
            <p style={{ color: '#64748b', fontSize: '13px' }}>{fmt(result.size)}</p>
          </div>
          <button onClick={download} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>⬇️ Download Watermarked Video (.${exportFormat})</button>
          <button onClick={() => setResult(null)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>Process Another</button>
        </div>
      )}
    </ToolLayout>
  );
}
