'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

function parseDiscardRanges(str, max) {
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
  return pages;
}

export default function RemovePdfPages() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [rangeStr, setRangeStr] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const bufRef = useRef(null);

  const loadFile = async (f) => {
    if (!f || !f.name.endsWith('.pdf')) { setError('Please select a PDF file.'); return; }
    setFile(f); setDone(false); setError(null);
    bufRef.current = await f.arrayBuffer();
    const { PDFDocument } = await import('pdf-lib');
    const doc = await PDFDocument.load(bufRef.current);
    setPageCount(doc.getPageCount());
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); loadFile(e.dataTransfer.files[0]); }, []);

  const handleRemove = async () => {
    if (!bufRef.current || !rangeStr) return;
    setProcessing(true); setError(null);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const doc = await PDFDocument.load(bufRef.current);
      const discardSet = parseDiscardRanges(rangeStr, pageCount);
      
      const newDoc = await PDFDocument.create();
      const keepIndices = [];
      for (let i = 0; i < pageCount; i++) {
        if (!discardSet.has(i)) keepIndices.push(i);
      }

      if (keepIndices.length === 0) {
        throw new Error('You cannot remove all pages of the PDF.');
      }

      const copiedPages = await newDoc.copyPages(doc, keepIndices);
      copiedPages.forEach(p => newDoc.addPage(p));

      const bytes = await newDoc.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace('.pdf', '_modified.pdf');
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
    setProcessing(false);
  };

  return (
    <ToolLayout icon="🗑️" title="Remove PDF Pages" category="PDF Tools" badgeColor="#f472b6">
      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(244,114,182,0.8)' : 'rgba(244,114,182,0.3)'}`, borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {file ? (
            <div>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📄</div>
              <p style={{ color: '#f1f5f9', fontWeight: '700' }}>{file.name}</p>
              <p style={{ color: '#cbd5e1', fontSize: '13px', marginTop: '4px' }}>Total Pages: {pageCount}</p>
              <button onClick={() => { setFile(null); setDone(false); bufRef.current = null; setPageCount(0); }} style={{ marginTop: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change file</button>
            </div>
          ) : (
            <><div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🗑️</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '4px' }}>Drop your PDF here</p></>
          )}
        </div>
      </div>

      {file && pageCount > 0 && (
        <div style={card}>
          <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
            PAGES TO DISCARD (e.g. <span style={{ color: '#f472b6' }}>2, 4-6</span>)
          </label>
          <input
            type="text"
            value={rangeStr}
            onChange={e => setRangeStr(e.target.value)}
            style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', outline: 'none' }}
            placeholder="Type page numbers..."
          />
        </div>
      )}

      {file && rangeStr && !done && (
        <button onClick={handleRemove} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#be185d,#ec4899)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          {processing ? '⏳ Removing…' : '🗑️ Remove Selected Pages'}
        </button>
      )}

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {done && (
        <div style={{ ...card, border: '1px solid rgba(52,211,153,0.3)', textAlign: 'center', background: 'rgba(16,185,129,0.05)' }}>
          <span style={{ fontSize: '2rem' }}>✅</span>
          <p style={{ color: '#34d399', fontWeight: '700', marginTop: '8px' }}>PDF pages successfully removed and downloaded!</p>
        </div>
      )}
    </ToolLayout>
  );
}
