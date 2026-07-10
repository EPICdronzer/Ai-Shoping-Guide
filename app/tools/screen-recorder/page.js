'use client';
import { useState, useRef } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };
const fmt = (b) => b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
const fmtTime = (s) => `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export default function ScreenRecorder() {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [includeAudio, setIncludeAudio] = useState(true);
  const [quality, setQuality] = useState('high');
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  const bitrates = { low: 1_000_000, medium: 2_500_000, high: 5_000_000 };

  const startRecording = async () => {
    try {
      setError(null); setResult(null);
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
        audio: includeAudio,
      });
      streamRef.current = displayStream;
      if (includeAudio) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const audioTracks = micStream.getAudioTracks();
          audioTracks.forEach(t => displayStream.addTrack(t));
        } catch { /* mic optional */ }
      }
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm';
      const recorder = new MediaRecorder(displayStream, { mimeType: mime, videoBitsPerSecond: bitrates[quality] });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        clearInterval(timerRef.current);
        const blob = new Blob(chunksRef.current, { type: mime });
        const url = URL.createObjectURL(blob);
        setResult({ blob, url, size: blob.size });
        setPreview(url);
        setRecording(false); setPaused(false); setElapsed(0);
      };
      displayStream.getVideoTracks()[0].addEventListener('ended', () => { if (recorderRef.current?.state !== 'inactive') recorderRef.current?.stop(); });
      recorderRef.current = recorder;
      recorder.start(1000);
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } catch (err) {
      setError(err.message || 'Failed to access screen. Please allow screen sharing.');
    }
  };

  const pauseResume = () => {
    if (!recorderRef.current) return;
    if (paused) {
      recorderRef.current.resume();
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
      setPaused(false);
    } else {
      recorderRef.current.pause();
      clearInterval(timerRef.current);
      setPaused(true);
    }
  };

  const stopRecording = () => {
    if (recorderRef.current?.state !== 'inactive') recorderRef.current?.stop();
    clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  const download = () => {
    const a = document.createElement('a');
    a.href = result.url; a.download = `screen_recording_${Date.now()}.webm`; a.click();
  };

  return (
    <ToolLayout icon="🖥️" title="Screen Recorder" category="Recording Tools" badgeColor="#f472b6">
      <div style={{ ...card, background: 'rgba(244,114,182,0.04)', border: '1px solid rgba(244,114,182,0.15)' }}>
        <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: 0 }}>ℹ️ Record your screen directly in the browser. Choose what to share: entire screen, a window, or a tab. No software needed.</p>
      </div>
      {!recording && !result && (
        <div style={card}>
          <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>RECORDING SETTINGS</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>QUALITY</label>
              <select value={quality} onChange={e => setQuality(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: '13px' }}>
                <option value="low">Low (1 Mbps)</option>
                <option value="medium">Medium (2.5 Mbps)</option>
                <option value="high">High (5 Mbps)</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '20px' }}>
              <button onClick={() => setIncludeAudio(!includeAudio)} style={{ padding: '9px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: includeAudio ? 'linear-gradient(135deg,#be185d,#f472b6)' : 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s', width: '100%' }}>
                {includeAudio ? '🔊 Audio ON' : '🔇 Audio OFF'}
              </button>
            </div>
          </div>
        </div>
      )}
      {!recording && !result && (
        <button onClick={startRecording} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#be185d,#f472b6)', color: '#fff', fontSize: '16px', fontWeight: '800', boxShadow: '0 4px 24px rgba(244,114,182,0.4)', marginBottom: '20px' }}>
          🖥️ Start Screen Recording
        </button>
      )}
      {recording && (
        <div style={{ ...card, border: '1px solid rgba(244,114,182,0.3)' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: paused ? '#f97316' : '#ef4444', animation: paused ? 'none' : 'pulse 1s infinite', boxShadow: paused ? 'none' : '0 0 12px rgba(239,68,68,0.8)' }} />
              <span style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '1.2rem' }}>{paused ? 'PAUSED' : 'RECORDING'}</span>
            </div>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: '#f472b6', fontVariantNumeric: 'tabular-nums' }}>{fmtTime(elapsed)}</div>
          </div>
          <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }`}</style>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button onClick={pauseResume} style={{ padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', color: '#f1f5f9', fontSize: '14px', fontWeight: '700' }}>
              {paused ? '▶️ Resume' : '⏸ Pause'}
            </button>
            <button onClick={stopRecording} style={{ padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#991b1b,#ef4444)', color: '#fff', fontSize: '14px', fontWeight: '700' }}>⏹ Stop & Save</button>
          </div>
        </div>
      )}
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}
      {result && (
        <div style={{ ...card, border: '1px solid rgba(34,211,238,0.3)' }}>
          <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>RECORDING COMPLETE</p>
          <video src={preview} controls style={{ width: '100%', borderRadius: '10px', marginBottom: '16px', background: '#000' }} />
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>Size: <strong style={{ color: '#34d399' }}>{fmt(result.size)}</strong></p>
          <button onClick={download} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>⬇️ Download Recording (.webm)</button>
          <button onClick={() => { setResult(null); setPreview(null); }} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>Record Again</button>
        </div>
      )}
    </ToolLayout>
  );
}
