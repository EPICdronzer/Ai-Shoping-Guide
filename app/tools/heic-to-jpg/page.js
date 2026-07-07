'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function HeicToJpg() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [converted, setConverted] = useState([]);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const loadFiles = (list) => {
    const valid = Array.from(list).filter(f => {
      const name = f.name.toLowerCase();
      return name.endsWith('.heic') || name.endsWith('.heif') || f.type.startsWith('image/');
    });
    if (!valid.length) { setError('Please upload HEIC/HEIF or image files.'); return; }
    setFiles(prev => [...prev, ...valid]);
    setError('');
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); loadFiles(e.dataTransfer.files); }, []);

  const convertAll = async () => {
    setProcessing(true); setError(''); setConverted([]);
    const results = [];
    for (const file of files) {
      try {
        const url = URL.createObjectURL(file);
        const img = await new Promise((resolve, reject) => {
          const i = new Image();
          i.onload = () => resolve(i);
          i.onerror = reject;
          i.src = url;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.92);
        URL.revokeObjectURL(url);

        const name = file.name.replace(/\.(heic|heif)$/i, '.jpg').replace(/\.\w+$/, '.jpg');
        results.push({ name, url: jpgDataUrl, size: file.size, w: img.naturalWidth, h: img.naturalHeight });
      } catch (e) {
        results.push({ name: file.name, error: e.message });
      }
    }
    setConverted(results);
    setProcessing(false);
  };

  const download = (item) => {
    const a = document.createElement('a');
    a.href = item.url;
    a.download = item.name;
    a.click();
  };

  const downloadAll = () => converted.filter(c => !c.error).forEach(download);

  return (
    <ToolLayout icon="🖼️" title="HEIC / HEIF to JPG Converter" category="Image Tools" badgeColor="#60a5fa">
      <div style={card}>
        <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>
          📱 Convert HEIC and HEIF images (from iPhone/iPad) to JPG format. Supports batch conversion — all processing is client-side.
        </p>

        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onClick={() => inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(96,165,250,0.8)' : 'rgba(96,165,250,0.3)'}`, borderRadius: '12px', padding: '28px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept=".heic,.heif,image/*" multiple style={{ display: 'none' }} onChange={e => loadFiles(e.target.files)} />
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🖼️</div>
          <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '4px' }}>Drop HEIC / HEIF files here</p>
          <p style={{ color: '#64748b', fontSize: '13px' }}>or click to browse — multiple files supported</p>
        </div>

        {files.length > 0 && (
          <div style={{ marginTop: '14px' }}>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>{files.length} file{files.length !== 1 ? 's' : ''} queued:</p>
            {files.slice(0, 6).map((f, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '4px' }}>
                <span style={{ color: '#e2e8f0', fontSize: '13px' }}>{f.name}</span>
                <span style={{ color: '#64748b', fontSize: '12px' }}>{(f.size / 1024).toFixed(0)} KB</span>
              </div>
            ))}
            {files.length > 6 && <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>+{files.length - 6} more…</p>}
          </div>
        )}
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {files.length > 0 && !converted.length && (
        <button onClick={convertAll} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: processing ? '#374151' : 'linear-gradient(135deg,#1d4ed8,#3b82f6)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          {processing ? `⏳ Converting ${files.length} image${files.length > 1 ? 's' : ''}…` : `🖼️ Convert ${files.length} File${files.length > 1 ? 's' : ''} to JPG`}
        </button>
      )}

      {converted.length > 0 && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#60a5fa', fontWeight: '700' }}>✅ {converted.filter(c => !c.error).length} Converted</span>
            {converted.filter(c => !c.error).length > 1 && (
              <button onClick={downloadAll} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#1d4ed8', color: '#fff', fontWeight: '700' }}>⬇ Download All</button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
            {converted.map((c, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${c.error ? 'rgba(239,68,68,0.3)' : 'rgba(96,165,250,0.2)'}` }}>
                {!c.error && <img src={c.url} alt={c.name} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />}
                <div style={{ padding: '10px' }}>
                  <p style={{ color: '#e2e8f0', fontSize: '12px', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                  {c.error ? <p style={{ color: '#f87171', fontSize: '11px' }}>{c.error}</p> :
                    <p style={{ color: '#64748b', fontSize: '11px' }}>{c.w}×{c.h}px</p>}
                  {!c.error && <button onClick={() => download(c)} style={{ width: '100%', marginTop: '6px', padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: '#1d4ed8', color: '#fff', fontSize: '12px', fontWeight: '700' }}>⬇ Download</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
