'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const fmt = (b) => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

function parseRanges(str, max) {
  const parts = str.split(',').map(s => s.trim()).filter(Boolean);
  const pages = new Set();
  for (const part of parts) {
    if (part.includes('-')) {
      const [a, b] = part.split('-').map(Number);
      if (isNaN(a) || isNaN(b)) throw new Error(`Invalid range: ${part}`);
      for (let i = a; i <= b; i++) { if (i >= 1 && i <= max) pages.add(i - 1); }
    } else {
      const n = Number(part);
      if (isNaN(n)) throw new Error(`Invalid page: ${part}`);
      if (n >= 1 && n <= max) pages.add(n - 1);
    }
  }
  return [...pages].sort((a, b) => a - b);
}

export default function PdfSplit() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState('all'); // all | range
  const [rangeStr, setRangeStr] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const bufRef = useRef(null);

  const loadFile = async (f) => {
    if (!f || (!f.type.includes('pdf') && !f.name.endsWith('.pdf'))) { setError('Please select a PDF file.'); return; }
    setFile(f); setDone(false); setError(null);
    const buf = await f.arrayBuffer();
    bufRef.current = buf;
    const { PDFDocument } = await import('pdf-lib');
    const doc = await PDFDocument.load(buf);
    setPageCount(doc.getPageCount());
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); loadFile(e.dataTransfer.files[0]); }, []);

  const downloadBlob = (blob, name) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };

  const handleSplit = async () => {
    if (!bufRef.current) return;
    setProcessing(true); setError(null);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const srcDoc = await PDFDocument.load(bufRef.current);
      let indices;
      if (mode === 'all') {
        indices = Array.from({ length: pageCount }, (_, i) => i);
      } else {
        indices = parseRanges(rangeStr, pageCount);
        if (!indices.length) throw new Error('No valid pages in that range.');
      }

      if (mode === 'all') {
        // Download each page as separate PDF
        for (const idx of indices) {
          const newDoc = await PDFDocument.create();
          const [page] = await newDoc.copyPages(srcDoc, [idx]);
          newDoc.addPage(page);
          const bytes = await newDoc.save();
          downloadBlob(new Blob([bytes], { type: 'application/pdf' }), `page_${idx + 1}.pdf`);
          await new Promise(r => setTimeout(r, 200));
        }
      } else {
        // Download selected pages as single PDF
        const newDoc = await PDFDocument.create();
        const pages = await newDoc.copyPages(srcDoc, indices);
        pages.forEach(p => newDoc.addPage(p));
        const bytes = await newDoc.save();
        downloadBlob(new Blob([bytes], { type: 'application/pdf' }), 'split_pages.pdf');
      }
      setDone(true);
    } catch (err) { setError(err.message); }
    setProcessing(false);
  };

  return (
    <ToolLayout icon="✂️" title="PDF Splitter" category="PDF Tools" badgeColor="#60a5fa">
      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(96,165,250,0.8)' : 'rgba(96,165,250,0.3)'}`, borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept=".pdf,application/pdf" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {file ? (
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📄</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600' }}>{file.name}</p>
              <p style={{ color: '#60a5fa', fontSize: '13px', marginTop: '4px' }}>{fmt(file.size)} · {pageCount} pages</p>
              <button onClick={() => { setFile(null); setPageCount(0); setDone(false); bufRef.current = null; }} style={{ marginTop: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change PDF</button>
            </div>
          ) : (
            <><div style={{ fontSize: '3rem', marginBottom: '10px' }}>✂️</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '4px' }}>Drop your PDF here</p>
              <p style={{ color: '#64748b', fontSize: '13px' }}>or click to browse</p></>
          )}
        </div>
      </div>

      {file && pageCount > 0 && (
        <>
          <div style={card}>
            <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>SPLIT MODE</p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: mode === 'range' ? '16px' : '0' }}>
              {[['all', '📋 All Pages (separate PDFs)'], ['range', '📌 Custom Range']].map(([m, label]) => (
                <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: mode === m ? 'linear-gradient(135deg,#1d4ed8,#3b82f6)' : 'rgba(255,255,255,0.05)', color: mode === m ? '#fff' : '#94a3b8', fontWeight: '600', fontSize: '13px' }}>{label}</button>
              ))}
            </div>
            {mode === 'range' && (
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                  PAGE RANGE — e.g. <span style={{ color: '#60a5fa' }}>1-3, 5, 7-9</span> (total: {pageCount} pages)
                </label>
                <input value={rangeStr} onChange={e => setRangeStr(e.target.value)} placeholder={`1-${Math.min(3, pageCount)}, ${Math.min(5, pageCount)}`}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#f1f5f9', fontSize: '14px', outline: 'none' }} />
              </div>
            )}
          </div>

          {!done && (
            <button onClick={handleSplit} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 20px rgba(59,130,246,0.3)', marginBottom: '20px' }}>
              {processing ? '⏳ Splitting…' : mode === 'all' ? `✂️ Split into ${pageCount} PDFs` : '✂️ Extract Selected Pages'}
            </button>
          )}
        </>
      )}

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {done && (
        <div style={{ ...card, border: '1px solid rgba(52,211,153,0.3)', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>✅</div>
          <p style={{ color: '#34d399', fontWeight: '700' }}>PDF{mode === 'all' ? 's' : ''} Downloaded!</p>
          <button onClick={() => { setDone(false); }} style={{ marginTop: '14px', padding: '10px 24px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>Split again</button>
        </div>
      )}
    </ToolLayout>
  );
}
