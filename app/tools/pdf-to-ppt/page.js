'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function PdfToPpt() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const loadFile = (f) => {
    if (!f?.name?.toLowerCase().endsWith('.pdf')) { setError('Please upload a PDF file.'); return; }
    setFile(f); setDone(false); setError('');
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); loadFile(e.dataTransfer.files[0]); }, []);

  const convert = async () => {
    if (!file) { setError('Please upload a PDF first.'); return; }
    setProcessing(true); setError(''); setDone(false);
    try {
      setProgress('Loading PDF…');
      const pdfjsLib = await import('pdfjs-dist/webpack.mjs').catch(() => import('pdfjs-dist'));
      if (pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdfDoc.numPages;

      const PptxGenJS = (await import('pptxgenjs')).default;
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_WIDE';

      for (let i = 1; i <= numPages; i++) {
        setProgress(`Rendering page ${i} of ${numPages}…`);
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;

        const imgData = canvas.toDataURL('image/jpeg', 0.85);
        const slide = pptx.addSlide();
        slide.addImage({ data: imgData, x: 0, y: 0, w: '100%', h: '100%' });
      }

      setProgress('Generating PPTX file…');
      await pptx.writeFile({ fileName: file.name.replace('.pdf', '.pptx') });
      setDone(true);
    } catch (e) { setError('Conversion failed: ' + e.message); }
    setProgress('');
    setProcessing(false);
  };

  return (
    <ToolLayout icon="📊" title="PDF to PowerPoint" category="PDF Tools" badgeColor="#ef4444">
      <div style={card}>
        <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>
          📊 Convert PDF pages to editable PowerPoint slides. Each PDF page becomes a separate slide with the page rendered as an image.
        </p>

        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(239,68,68,0.8)' : 'rgba(239,68,68,0.3)'}`, borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {file ? (
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '8px' }}>📄</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600' }}>{file.name}</p>
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>{(file.size / 1024).toFixed(1)} KB</p>
              <button onClick={(e) => { e.stopPropagation(); setFile(null); setDone(false); }} style={{ marginTop: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Remove</button>
            </div>
          ) : (
            <><div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>📊</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '4px' }}>Drop your PDF here</p>
              <p style={{ color: '#64748b', fontSize: '13px' }}>or click to browse</p></>
          )}
        </div>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}
      {done && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '14px', color: '#34d399', marginBottom: '16px' }}>✅ PowerPoint file downloaded successfully!</div>}

      {file && !done && (
        <button onClick={convert} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: processing ? '#374151' : 'linear-gradient(135deg,#dc2626,#ef4444)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          {processing ? `⏳ ${progress}` : '📊 Convert to PowerPoint (.PPTX)'}
        </button>
      )}
    </ToolLayout>
  );
}
