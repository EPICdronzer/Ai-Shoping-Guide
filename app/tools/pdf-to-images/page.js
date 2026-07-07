'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const fmt = (b) => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

async function loadPdfJs() {
  const pdfjs = await import('pdfjs-dist');
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }
  return pdfjs;
}

export default function PdfToImages() {
  const [file, setFile] = useState(null);
  const [dpi, setDpi] = useState(150);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [pages, setPages] = useState([]);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const bufRef = useRef(null);

  const loadFile = async (f) => {
    if (!f || (!f.type.includes('pdf') && !f.name.endsWith('.pdf'))) { setError('Please select a PDF.'); return; }
    setFile(f); setPages([]); setError(null);
    bufRef.current = await f.arrayBuffer();
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); loadFile(e.dataTransfer.files[0]); }, []);

  const handleConvert = async () => {
    if (!bufRef.current) return;
    setProcessing(true); setPages([]); setError(null);
    try {
      const pdfjs = await loadPdfJs();
      const pdf = await pdfjs.getDocument({ data: new Uint8Array(bufRef.current.slice(0)) }).promise;
      const total = pdf.numPages;
      setProgress({ current: 0, total });
      const scale = dpi / 72;
      const rendered = [];
      for (let i = 1; i <= total; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        rendered.push({ dataUrl: canvas.toDataURL('image/png'), page: i, w: Math.round(viewport.width), h: Math.round(viewport.height) });
        setProgress({ current: i, total });
      }
      setPages(rendered);
    } catch (err) { setError(err.message || 'Conversion failed. Try a different PDF.'); }
    setProcessing(false);
  };

  const downloadPage = (p) => {
    const a = document.createElement('a'); a.href = p.dataUrl;
    a.download = `${file.name.replace('.pdf', '')}_page_${p.page}.png`; a.click();
  };

  const downloadAll = () => { pages.forEach((p, i) => setTimeout(() => downloadPage(p), i * 300)); };

  return (
    <ToolLayout icon="🗂️" title="PDF to Images" category="PDF Converter" badgeColor="#fb923c">
      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(251,146,60,0.8)' : 'rgba(251,146,60,0.3)'}`, borderRadius: '12px', padding: '36px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept=".pdf,application/pdf" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {file ? (
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📄</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600' }}>{file.name}</p>
              <p style={{ color: '#fb923c', fontSize: '13px', marginTop: '4px' }}>{fmt(file.size)}</p>
              <button onClick={() => { setFile(null); setPages([]); bufRef.current = null; }} style={{ marginTop: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change</button>
            </div>
          ) : (
            <><div style={{ fontSize: '3rem', marginBottom: '10px' }}>🗂️</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '4px' }}>Drop PDF here</p>
              <p style={{ color: '#64748b', fontSize: '13px' }}>Each page becomes a PNG image</p></>
          )}
        </div>
      </div>

      {file && (
        <div style={card}>
          <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>RESOLUTION (DPI)</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[72, 150, 300].map(d => (
              <button key={d} onClick={() => setDpi(d)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: dpi === d ? 'linear-gradient(135deg,#c2410c,#f97316)' : 'rgba(255,255,255,0.05)', color: dpi === d ? '#fff' : '#94a3b8', fontWeight: '700' }}>
                {d} DPI <span style={{ fontSize: '11px', display: 'block', opacity: 0.7 }}>{d === 72 ? 'Screen' : d === 150 ? 'Balanced' : 'Print'}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {file && !pages.length && (
        <button onClick={handleConvert} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#c2410c,#f97316)', color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 20px rgba(249,115,22,0.3)', marginBottom: '20px' }}>
          {processing ? `⏳ Rendering page ${progress.current} / ${progress.total}…` : '🖼️ Convert to Images'}
        </button>
      )}

      {processing && progress.total > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', color: '#94a3b8' }}>
            <span>Converting pages…</span><span>{progress.current}/{progress.total}</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', height: '6px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(progress.current / progress.total) * 100}%`, background: 'linear-gradient(90deg,#f97316,#fb923c)', borderRadius: '8px', transition: 'width 0.3s' }} />
          </div>
        </div>
      )}

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {pages.length > 0 && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ color: '#34d399', fontWeight: '700' }}>✅ {pages.length} pages converted</p>
            <button onClick={downloadAll} style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontWeight: '700', fontSize: '13px' }}>⬇️ Download All</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
            {pages.map(p => (
              <div key={p.page} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', position: 'relative' }} onClick={() => downloadPage(p)}>
                <img src={p.dataUrl} alt={`Page ${p.page}`} style={{ width: '100%', display: 'block' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '6px 8px', background: 'rgba(0,0,0,0.7)', fontSize: '11px', color: '#e2e8f0', fontWeight: '600', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Pg {p.page}</span><span style={{ color: '#fb923c' }}>⬇️</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
