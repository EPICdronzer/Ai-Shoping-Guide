'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

async function loadPdfJs() {
  const pdfjs = await import('pdfjs-dist');
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }
  return pdfjs;
}

export default function PdfToWord() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const bufRef = useRef(null);

  const loadFile = async (f) => {
    if (!f || (!f.type.includes('pdf') && !f.name.endsWith('.pdf'))) { setError('Please select a PDF.'); return; }
    setFile(f); setDone(false); setError(null);
    bufRef.current = await f.arrayBuffer();
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); loadFile(e.dataTransfer.files[0]); }, []);

  const handleConvert = async () => {
    if (!bufRef.current) return;
    setProcessing(true); setError(null); setDone(false);
    try {
      setProgress('Reading PDF…');
      const pdfjs = await loadPdfJs();
      const pdf = await pdfjs.getDocument({ data: new Uint8Array(bufRef.current.slice(0)) }).promise;
      const total = pdf.numPages;
      const allParagraphs = [];

      for (let i = 1; i <= total; i++) {
        setProgress(`Extracting page ${i} of ${total}…`);
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const lines = [];
        let lastY = null;
        for (const item of content.items) {
          if (!item.str) continue;
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
            if (lines.length) allParagraphs.push(lines.join(' '));
            lines.length = 0;
          }
          lines.push(item.str);
          lastY = item.transform[5];
        }
        if (lines.length) allParagraphs.push(lines.join(' '));
        if (i < total) allParagraphs.push(''); // blank line between pages
      }

      setProgress('Building Word document…');
      const { Document, Paragraph, TextRun, HeadingLevel, Packer } = await import('docx');

      const children = allParagraphs.map((text, idx) => {
        if (!text.trim()) return new Paragraph({ text: '' });
        // Simple heuristic: all-caps short lines → heading
        if (text.trim().length < 60 && text.trim() === text.trim().toUpperCase() && /[A-Z]/.test(text)) {
          return new Paragraph({ text: text.trim(), heading: HeadingLevel.HEADING_2 });
        }
        return new Paragraph({ children: [new TextRun({ text, size: 24 })] });
      });

      const doc = new Document({
        sections: [{ properties: {}, children }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace('.pdf', '.docx');
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) { setError(err.message || 'Conversion failed'); }
    setProcessing(false);
    setProgress('');
  };

  return (
    <ToolLayout icon="📝" title="PDF to Word" category="PDF Converter" badgeColor="#60a5fa">
      <div style={{ ...card, border: '1px solid rgba(96,165,250,0.15)', background: 'rgba(59,130,246,0.05)', padding: '14px', marginBottom: '16px' }}>
        <p style={{ color: '#94a3b8', fontSize: '12.5px' }}>ℹ️ Extracts text content from your PDF and creates a Word document. Complex layouts and images are not preserved — this is the standard for client-side PDF→Word tools.</p>
      </div>

      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(96,165,250,0.8)' : 'rgba(96,165,250,0.3)'}`, borderRadius: '12px', padding: '40px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept=".pdf,application/pdf" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {file ? (
            <div>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📄</div>
              <p style={{ color: '#f1f5f9', fontWeight: '700' }}>{file.name}</p>
              <button onClick={() => { setFile(null); setDone(false); bufRef.current = null; }} style={{ marginTop: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change PDF</button>
            </div>
          ) : (
            <><div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>📝</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '6px' }}>Drop your PDF here</p>
              <p style={{ color: '#64748b', fontSize: '13px' }}>Outputs an editable .docx Word file</p></>
          )}
        </div>
      </div>

      {file && !done && (
        <button onClick={handleConvert} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 20px rgba(59,130,246,0.3)', marginBottom: '20px' }}>
          {processing ? `⏳ ${progress}` : '📝 Convert to Word (.docx)'}
        </button>
      )}

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {done && (
        <div style={{ ...card, border: '1px solid rgba(52,211,153,0.3)', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>✅</div>
          <p style={{ color: '#34d399', fontWeight: '700', marginBottom: '6px' }}>Word document downloaded!</p>
          <button onClick={() => { setFile(null); setDone(false); bufRef.current = null; }} style={{ marginTop: '10px', padding: '10px 24px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>Convert another PDF</button>
        </div>
      )}
    </ToolLayout>
  );
}
