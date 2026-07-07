'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const fmt = (b) => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function ImageCompress() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mode, setMode] = useState('compress'); // compress | upscale
  const [quality, setQuality] = useState(75);
  const [scale, setScale] = useState(2);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const loadFile = (f) => {
    if (!f || !f.type.startsWith('image/')) { setError('Please select a valid image file.'); return; }
    setFile(f); setResult(null); setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); loadFile(e.dataTransfer.files[0]); }, []);

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true); setError(null); setResult(null);
    try {
      if (mode === 'compress') {
        const { default: compress } = await import('browser-image-compression');
        const maxMB = quality < 30 ? 0.1 : quality < 60 ? 0.5 : quality < 85 ? 1 : 3;
        const compressed = await compress(file, {
          maxSizeMB: maxMB,
          maxWidthOrHeight: quality < 50 ? 1280 : 1920,
          useWebWorker: true,
          initialQuality: quality / 100,
        });
        setResult({ blob: compressed, size: compressed.size, name: file.name.replace(/\.[^.]+$/, '') + '_compressed.' + (file.type === 'image/png' ? 'png' : 'jpg') });
      } else {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            setResult({ blob, size: blob.size, name: file.name.replace(/\.[^.]+$/, '') + `_${scale}x_upscaled.png`, url: URL.createObjectURL(blob) });
            setProcessing(false);
          }, 'image/png');
        };
        img.src = preview;
        return;
      }
    } catch (err) { setError(err.message || 'Processing failed'); }
    setProcessing(false);
  };

  const download = () => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a'); a.href = url; a.download = result.name; a.click();
    URL.revokeObjectURL(url);
  };

  const saving = result ? Math.round((1 - result.size / file.size) * 100) : 0;

  return (
    <ToolLayout icon="📦" title="Image Compressor" category="Image Optimizer" badgeColor="#34d399">
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['compress', 'upscale'].map(m => (
          <button key={m} onClick={() => { setMode(m); setResult(null); }} style={{
            padding: '10px 24px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', border: 'none', cursor: 'pointer',
            background: mode === m ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'rgba(255,255,255,0.05)',
            color: mode === m ? '#fff' : '#94a3b8', transition: 'all 0.2s',
            boxShadow: mode === m ? '0 4px 16px rgba(124,58,237,0.3)' : 'none'
          }}>{m === 'compress' ? '📉 Compress' : '📈 Upscale'}</button>
        ))}
      </div>

      {/* Drop zone */}
      <div style={card}>
        <div
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? 'rgba(167,139,250,0.8)' : 'rgba(167,139,250,0.3)'}`,
            borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: file ? 'default' : 'pointer',
            background: isDragging ? 'rgba(167,139,250,0.08)' : 'transparent', transition: 'all 0.25s',
          }}
        >
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {preview ? (
            <div>
              <img src={preview} alt="preview" style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '8px', marginBottom: '12px', objectFit: 'contain' }} />
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>{file.name} · <span style={{ color: '#a78bfa' }}>{fmt(file.size)}</span></div>
              <button onClick={() => { setFile(null); setPreview(null); setResult(null); }} style={{ marginTop: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '12px' }}>Change Image</button>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🖼️</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '6px' }}>Drop an image here</p>
              <p style={{ color: '#64748b', fontSize: '13px' }}>or click to browse · JPG, PNG, WEBP, GIF</p>
            </>
          )}
        </div>
      </div>

      {/* Settings */}
      {file && (
        <div style={card}>
          {mode === 'compress' ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#e2e8f0', fontWeight: '600' }}>Quality</span>
                <span style={{ color: '#a78bfa', fontWeight: '700' }}>{quality}%</span>
              </div>
              <input type="range" min="5" max="100" value={quality} onChange={e => setQuality(+e.target.value)} style={{ width: '100%', accentColor: '#7c3aed' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                <span>Smallest file</span><span>Best quality</span>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#e2e8f0', fontWeight: '600' }}>Scale Factor</span>
                <span style={{ color: '#34d399', fontWeight: '700' }}>{scale}×</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1.5, 2, 3, 4].map(s => (
                  <button key={s} onClick={() => setScale(s)} style={{
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: scale === s ? 'linear-gradient(135deg,#059669,#10b981)' : 'rgba(255,255,255,0.05)',
                    color: scale === s ? '#fff' : '#94a3b8', fontWeight: '700', fontSize: '14px',
                  }}>{s}×</button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Action button */}
      {file && !result && (
        <button onClick={handleProcess} disabled={processing} style={{
          width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer',
          background: processing ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#7c3aed,#4f46e5)',
          color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
          transition: 'all 0.25s', marginBottom: '20px',
        }}>
          {processing ? '⏳ Processing…' : mode === 'compress' ? '📉 Compress Image' : '📈 Upscale Image'}
        </button>
      )}

      {/* Error */}
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {/* Result */}
      {result && (
        <div style={{ ...card, border: '1px solid rgba(52,211,153,0.3)', background: 'rgba(16,185,129,0.05)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            {[['Original', fmt(file.size), '#94a3b8'], ['Result', fmt(result.size), mode === 'compress' ? '#34d399' : '#f472b6'], [mode === 'compress' ? 'Saved' : 'Larger', mode === 'compress' ? `${Math.abs(saving)}%` : `${Math.abs(saving) || ((result.size / file.size * 100 - 100)).toFixed(0)}%`, '#a78bfa']].map(([label, val, color]) => (
              <div key={label} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color }}>{val}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{label}</div>
              </div>
            ))}
          </div>
          <button onClick={download} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 20px rgba(16,185,129,0.3)', marginBottom: '10px' }}>
            ⬇️ Download
          </button>
          <button onClick={() => setResult(null)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>
            Try different settings
          </button>
        </div>
      )}
    </ToolLayout>
  );
}
