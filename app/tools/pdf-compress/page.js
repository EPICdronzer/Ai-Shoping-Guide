'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const fmt = (b) => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function PdfCompress() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const bufRef = useRef(null);

  const loadFile = async (f) => {
    if (!f || (!f.type.includes('pdf') && !f.name.endsWith('.pdf'))) { setError('Please select a PDF.'); return; }
    setFile(f); setResult(null); setError(null);
    bufRef.current = await f.arrayBuffer();
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); loadFile(e.dataTransfer.files[0]); }, []);

  const handleCompress = async () => {
    if (!bufRef.current) return;
    setProcessing(true); setError(null);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const doc = await PDFDocument.load(bufRef.current);

      // Remove metadata to reduce size
      doc.setTitle('');
      doc.setAuthor('');
      doc.setSubject('');
      doc.setKeywords([]);
      doc.setProducer('');
      doc.setCreator('');

      const bytes = await doc.save({ useObjectStreams: true, addDefaultPage: false });
      const blob = new Blob([bytes], { type: 'application/pdf' });
      setResult({ blob, size: blob.size });
    } catch (err) { setError(err.message || 'Compression failed'); }
    setProcessing(false);
  };

  const download = () => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a'); a.href = url;
    a.download = file.name.replace('.pdf', '_compressed.pdf'); a.click();
    URL.revokeObjectURL(url);
  };

  const saved = result ? Math.max(0, Math.round((1 - result.size / file.size) * 100)) : 0;

  return (
    <ToolLayout icon="📄" title="PDF Compressor" category="PDF Tools" badgeColor="#a78bfa">
      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(167,139,250,0.8)' : 'rgba(167,139,250,0.3)'}`, borderRadius: '12px', padding: '40px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept=".pdf,application/pdf" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {file ? (
            <div>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📄</div>
              <p style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '1.05rem' }}>{file.name}</p>
              <p style={{ color: '#a78bfa', fontSize: '14px', marginTop: '6px', fontWeight: '600' }}>{fmt(file.size)}</p>
              <button onClick={() => { setFile(null); setResult(null); bufRef.current = null; }} style={{ marginTop: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '12px' }}>Change PDF</button>
            </div>
          ) : (
            <><div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>📄</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '6px' }}>Drop your PDF here</p>
              <p style={{ color: '#64748b', fontSize: '13px' }}>or click to browse · Client-side & private</p></>
          )}
        </div>
      </div>

      {file && !result && (
        <button onClick={handleCompress} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#6d28d9,#7c3aed)', color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 20px rgba(124,58,237,0.3)', marginBottom: '20px' }}>
          {processing ? '⏳ Compressing…' : '📦 Compress PDF'}
        </button>
      )}

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {result && (
        <div style={{ ...card, border: '1px solid rgba(52,211,153,0.3)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            {[['Original', fmt(file.size), '#94a3b8'], ['Compressed', fmt(result.size), '#34d399'], ['Saved', saved + '%', '#a78bfa']].map(([l, v, c]) => (
              <div key={l} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: c }}>{v}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{l}</div>
              </div>
            ))}
          </div>
          {saved === 0 && <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', marginBottom: '16px' }}>ℹ️ This PDF was already well-optimized — size change minimal.</p>}
          <button onClick={download} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>⬇️ Download Compressed PDF</button>
          <button onClick={() => { setFile(null); setResult(null); bufRef.current = null; }} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>Compress another</button>
        </div>
      )}
    </ToolLayout>
  );
}
