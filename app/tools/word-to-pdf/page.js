'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function WordToPdf() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const bufRef = useRef(null);

  const loadFile = async (f) => {
    if (!f || (!f.name.endsWith('.docx') && !f.name.endsWith('.doc'))) { setError('Please select a Word document (.docx or .doc).'); return; }
    setFile(f); setDone(false); setError(null);
    bufRef.current = await f.arrayBuffer();
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); loadFile(e.dataTransfer.files[0]); }, []);

  const handleConvert = async () => {
    if (!bufRef.current) return;
    setProcessing(true); setError(null); setDone(false);
    try {
      setProgress('Parsing Word document…');
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ arrayBuffer: bufRef.current });
      const text = result.value;
      if (!text.trim()) throw new Error('No text content found in document.');

      setProgress('Building PDF…');
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageW - margin * 2;
      const lineHeight = 7;
      let y = 20;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);

      const paragraphs = text.split(/\n+/);
      for (const para of paragraphs) {
        if (!para.trim()) { y += lineHeight / 2; continue; }
        const lines = doc.splitTextToSize(para.trim(), maxWidth);
        for (const line of lines) {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.text(line, margin, y);
          y += lineHeight;
        }
        y += 3;
      }

      doc.save(file.name.replace(/\.docx?$/, '.pdf'));
      setDone(true);
    } catch (err) { setError(err.message || 'Conversion failed'); }
    setProcessing(false); setProgress('');
  };

  return (
    <ToolLayout icon="📃" title="Word to PDF" category="Document Converter" badgeColor="#34d399">
      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(52,211,153,0.8)' : 'rgba(52,211,153,0.3)'}`, borderRadius: '12px', padding: '40px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept=".docx,.doc" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {file ? (
            <div>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📃</div>
              <p style={{ color: '#f1f5f9', fontWeight: '700' }}>{file.name}</p>
              <button onClick={() => { setFile(null); setDone(false); bufRef.current = null; }} style={{ marginTop: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change file</button>
            </div>
          ) : (
            <><div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>📃</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '6px' }}>Drop your Word document here</p>
              <p style={{ color: '#64748b', fontSize: '13px' }}>Supports .docx and .doc files</p></>
          )}
        </div>
      </div>

      {file && !done && (
        <button onClick={handleConvert} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#065f46,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 20px rgba(16,185,129,0.3)', marginBottom: '20px' }}>
          {processing ? `⏳ ${progress}` : '📄 Convert to PDF'}
        </button>
      )}

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {done && (
        <div style={{ ...card, border: '1px solid rgba(52,211,153,0.3)', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>✅</div>
          <p style={{ color: '#34d399', fontWeight: '700' }}>PDF Downloaded!</p>
          <button onClick={() => { setFile(null); setDone(false); bufRef.current = null; }} style={{ marginTop: '14px', padding: '10px 24px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>Convert another</button>
        </div>
      )}
    </ToolLayout>
  );
}
