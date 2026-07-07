'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const fmt = (b) => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function PdfMerge() {
  const [pdfs, setPdfs] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const addFiles = (files) => {
    const pdfFiles = Array.from(files).filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    if (!pdfFiles.length) { setError('Please select PDF files.'); return; }
    setError(null); setDone(false);
    setPdfs(prev => [...prev, ...pdfFiles]);
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); }, []);
  const remove = (i) => setPdfs(prev => prev.filter((_, idx) => idx !== i));
  const moveUp = (i) => { if (i === 0) return; setPdfs(prev => { const a = [...prev]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return a; }); };
  const moveDown = (i) => { if (i === pdfs.length - 1) return; setPdfs(prev => { const a = [...prev]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; return a; }); };

  const handleMerge = async () => {
    if (pdfs.length < 2) { setError('Add at least 2 PDFs to merge.'); return; }
    setProcessing(true); setError(null);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const merged = await PDFDocument.create();
      for (const pdfFile of pdfs) {
        const buf = await pdfFile.arrayBuffer();
        const doc = await PDFDocument.load(buf);
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach(p => merged.addPage(p));
      }
      const bytes = await merged.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'merged.pdf'; a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) { setError(err.message || 'Merge failed'); }
    setProcessing(false);
  };

  return (
    <ToolLayout icon="🔗" title="PDF Merger" category="PDF Tools" badgeColor="#f472b6">
      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onClick={() => inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(244,114,182,0.8)' : 'rgba(244,114,182,0.3)'}`, borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.25s', background: isDragging ? 'rgba(244,114,182,0.06)' : 'transparent' }}>
          <input ref={inputRef} type="file" accept=".pdf,application/pdf" multiple style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📎</div>
          <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '4px' }}>Drop PDF files here</p>
          <p style={{ color: '#64748b', fontSize: '13px' }}>Select multiple PDFs to merge — Click to add more</p>
        </div>
      </div>

      {pdfs.length > 0 && (
        <>
          <div style={card}>
            <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '14px' }}>PDF FILES ({pdfs.length}) — will be merged in this order</p>
            {pdfs.map((pdf, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>📄</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pdf.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{fmt(pdf.size)}</div>
                </div>
                <span style={{ color: '#475569', fontSize: '11px', marginRight: '8px' }}>#{i + 1}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[['↑', () => moveUp(i)], ['↓', () => moveDown(i)], ['✕', () => remove(i)]].map(([l, fn]) => (
                    <button key={l} onClick={fn} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: l === '✕' ? '#f87171' : '#94a3b8', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>{l}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {!done && (
            <button onClick={handleMerge} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#be185d,#ec4899)', color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 20px rgba(236,72,153,0.3)', marginBottom: '20px' }}>
              {processing ? '⏳ Merging…' : `🔗 Merge ${pdfs.length} PDFs`}
            </button>
          )}
        </>
      )}

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {done && (
        <div style={{ ...card, border: '1px solid rgba(52,211,153,0.3)', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>✅</div>
          <p style={{ color: '#34d399', fontWeight: '700', marginBottom: '6px' }}>merged.pdf Downloaded!</p>
          <button onClick={() => { setDone(false); setPdfs([]); }} style={{ marginTop: '10px', padding: '10px 24px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>Merge more PDFs</button>
        </div>
      )}
    </ToolLayout>
  );
}
