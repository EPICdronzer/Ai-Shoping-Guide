'use client';
import { useState, useRef } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };
const fmt = (b) => b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
const fmtTime = (s) => `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

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

export default function WebcamRecorder() {
  const [active, setActive] = useState(false);
  const [recording, setRecording] = useState(false);
  const [exportFormat, setExportFormat] = useState('mp4');
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const [resolution, setResolution] = useState('hd');
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  const previewRef = useRef(null);

  const resolutions = { sd: { width: 640, height: 480 }, hd: { width: 1280, height: 720 }, fhd: { width: 1920, height: 1080 } };

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { ...resolutions[resolution], facingMode },
        audio: true,
      });
      streamRef.current = stream;
      if (previewRef.current) { previewRef.current.srcObject = stream; previewRef.current.play(); }
      setActive(true);
    } catch (err) {
      setError('Camera access denied: ' + (err.message || 'Please allow camera access in browser settings.'));
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    const mime = getSupportedMimeType(exportFormat);
    const recorder = new MediaRecorder(streamRef.current, { mimeType: mime, videoBitsPerSecond: 2_500_000 });
    chunksRef.current = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      clearInterval(timerRef.current);
      const blob = new Blob(chunksRef.current, { type: exportFormat === 'mp4' ? 'video/mp4' : exportFormat === 'mov' ? 'video/quicktime' : mime });
      setResult({ blob, url: URL.createObjectURL(blob), size: blob.size });
      setRecording(false); setPaused(false); setElapsed(0);
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (previewRef.current) { previewRef.current.srcObject = null; }
      setActive(false);
    };
    recorderRef.current = recorder;
    recorder.start(1000);
    setRecording(true);
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
  };

  const pauseResume = () => {
    if (!recorderRef.current) return;
    if (paused) { recorderRef.current.resume(); timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000); setPaused(false); }
    else { recorderRef.current.pause(); clearInterval(timerRef.current); setPaused(true); }
  };

  const stopRecording = () => {
    if (recorderRef.current?.state !== 'inactive') recorderRef.current?.stop();
    clearInterval(timerRef.current);
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (previewRef.current) previewRef.current.srcObject = null;
    setActive(false);
  };

  const download = () => {
    const a = document.createElement('a');
    a.href = result.url; a.download = `webcam_${Date.now()}.${exportFormat}`; a.click();
  };

  return (
    <ToolLayout icon="📹" title="Webcam Recorder" category="Recording Tools" badgeColor="#34d399">
      <div style={{ ...card, background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.15)' }}>
        <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: 0 }}>ℹ️ Record directly from your webcam with audio. No software needed — all done in the browser.</p>
      </div>
      {!active && !result && (
        <div style={card}>
          <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>CAMERA SETTINGS</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>RESOLUTION</label>
              <select value={resolution} onChange={e => setResolution(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: '13px' }}>
                <option value="sd">SD (640×480)</option>
                <option value="hd">HD (1280×720)</option>
                <option value="fhd">FHD (1920×1080)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>CAMERA</label>
              <select value={facingMode} onChange={e => setFacingMode(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: '13px' }}>
                <option value="user">Front Camera</option>
                <option value="environment">Back Camera</option>
              </select>
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
      {!active && !result && (
        <button onClick={startCamera} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#34d399)', color: '#fff', fontSize: '16px', fontWeight: '800', boxShadow: '0 4px 24px rgba(52,211,153,0.4)', marginBottom: '20px' }}>
          📹 Start Camera
        </button>
      )}
      {active && (
        <div style={{ ...card, border: '1px solid rgba(52,211,153,0.3)' }}>
          <video ref={previewRef} muted autoPlay playsInline style={{ width: '100%', borderRadius: '10px', marginBottom: '16px', background: '#000', transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }} />
          {recording && (
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '4px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: paused ? '#f97316' : '#ef4444', animation: paused ? 'none' : 'pulse 1s infinite' }} />
                <span style={{ color: paused ? '#f97316' : '#ef4444', fontWeight: '700', fontSize: '13px' }}>{paused ? 'PAUSED' : 'REC'}</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#34d399', fontVariantNumeric: 'tabular-nums' }}>{fmtTime(elapsed)}</div>
            </div>
          )}
          <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }`}</style>
          {!recording && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button onClick={startRecording} style={{ padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#dc2626,#ef4444)', color: '#fff', fontSize: '14px', fontWeight: '700' }}>⏺ Record</button>
              <button onClick={stopCamera} style={{ padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '14px', fontWeight: '700' }}>✕ Close</button>
            </div>
          )}
          {recording && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button onClick={pauseResume} style={{ padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', color: '#f1f5f9', fontSize: '14px', fontWeight: '700' }}>
                {paused ? '▶️ Resume' : '⏸ Pause'}
              </button>
              <button onClick={stopRecording} style={{ padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#dc2626,#ef4444)', color: '#fff', fontSize: '14px', fontWeight: '700' }}>⏹ Stop</button>
            </div>
          )}
        </div>
      )}
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}
      {result && (
        <div style={{ ...card, border: '1px solid rgba(52,211,153,0.3)' }}>
          <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>RECORDING SAVED</p>
          <video src={result.url} controls style={{ width: '100%', borderRadius: '10px', marginBottom: '16px', background: '#000' }} />
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>Duration: <strong style={{ color: '#34d399' }}>{fmtTime(elapsed)}</strong> · Size: <strong style={{ color: '#a78bfa' }}>{fmt(result.size)}</strong></p>
          <button onClick={download} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>⬇️ Download Recording (.${exportFormat})</button>
          <button onClick={() => { setResult(null); }} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>Record Again</button>
        </div>
      )}
    </ToolLayout>
  );
}
