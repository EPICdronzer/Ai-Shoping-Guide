'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function RotatePdf() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState(90);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const bufRef = useRef(null);

  const loadFile = async (f) => {
    if (!f || !f.name.endsWith('.pdf')) { setError('Please select a PDF file.'); return; }
    setFile(f); setDone(false); setError(null);
    bufRef.current = await f.arrayBuffer();
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); loadFile(e.dataTransfer.files[0]); }, []);

  const handleRotate = async () => {
    if (!bufRef.current) return;
    setProcessing(true); setError(null);
    try {
      const { PDFDocument, degrees } = await import('pdf-lib');
      const doc = await PDFDocument.load(bufRef.current);
      const pages = doc.getPages();
      pages.forEach(page => {
        page.setRotation(degrees((page.getRotation().angle + rotation) % 360));
      });
      const bytes = await doc.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace('.pdf', '_rotated.pdf');
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) {
      setError(err.message || 'Rotation failed');
    }
    setProcessing(false);
  };

  return (
    <ToolLayout icon="🔄" title="Rotate PDF" category="PDF Tools" badgeColor="#60a5fa">
      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(96,165,250,0.8)' : 'rgba(96,165,250,0.3)'}`, borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {file ? (
            <div>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📄</div>
              <p style={{ color: '#f1f5f9', fontWeight: '700' }}>{file.name}</p>
              <button onClick={() => { setFile(null); setDone(false); bufRef.current = null; }} style={{ marginTop: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change file</button>
            </div>
          ) : (
            <><div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🔄</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '4px' }}>Drop your PDF here</p></>
          )}
        </div>
      </div>

      {file && (
        <div style={card}>
          <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '12px' }}>ROTATION VALUE</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[[90, 'Rotate 90° ➡️'], [180, 'Rotate 180° ⬇️'], [270, 'Rotate 270° ⬅️']].map(([val, label]) => (
              <button key={val} onClick={() => setRotation(val)} style={{
                flex: 1, padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: rotation === val ? 'linear-gradient(135deg,#1d4ed8,#3b82f6)' : 'rgba(255,255,255,0.05)',
                color: '#fff', fontWeight: '700'
              }}>{label}</button>
            ))}
          </div>
        </div>
      )}

      {file && !done && (
        <button onClick={handleRotate} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          {processing ? '⏳ Rotating…' : '🔄 Rotate & Download PDF'}
        </button>
      )}

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {done && (
        <div style={{ ...card, border: '1px solid rgba(52,211,153,0.3)', textAlign: 'center', background: 'rgba(16,185,129,0.05)' }}>
          <span style={{ fontSize: '2rem' }}>✅</span>
          <p style={{ color: '#34d399', fontWeight: '700', marginTop: '8px' }}>PDF pages successfully rotated and downloaded!</p>
        </div>
      )}
    </ToolLayout>
  );
}
