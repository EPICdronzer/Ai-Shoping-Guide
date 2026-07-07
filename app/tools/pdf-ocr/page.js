'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function PdfOcr() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const loadFile = (f) => {
    if (!f?.name?.toLowerCase().endsWith('.pdf')) { setError('Please upload a PDF file.'); return; }
    setFile(f); setText(''); setError('');
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); loadFile(e.dataTransfer.files[0]); }, []);

  const runOcr = async () => {
    if (!file) { setError('Please upload a PDF first.'); return; }
    setProcessing(true); setError(''); setText(''); setProgress('Loading PDF…');

    try {
      const pdfjsLib = await import('pdfjs-dist/webpack.mjs').catch(() => import('pdfjs-dist'));
      if (pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdfDoc.numPages;
      let fullText = '';

      for (let i = 1; i <= numPages; i++) {
        setProgress(`Extracting text from page ${i} of ${numPages}…`);
        const page = await pdfDoc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        if (pageText.trim()) {
          fullText += `\n\n--- PAGE ${i} ---\n\n${pageText}`;
        } else {
          fullText += `\n\n--- PAGE ${i} (no extractable text - may be scanned) ---\n`;
        }
      }

      setText(fullText.trim() || 'No text could be extracted. The PDF may be a scanned image. Consider using an AI-powered OCR service for image-based PDFs.');
      setProgress('');
    } catch (e) { setError('OCR failed: ' + e.message); }
    setProcessing(false);
  };

  const downloadTxt = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (file?.name || 'document').replace('.pdf', '_text.txt');
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout icon="🔍" title="PDF OCR — Extract Text" category="PDF Tools" badgeColor="#ef4444">
      <div style={card}>
        <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>
          📃 Extract all text from PDF files instantly. Works best with text-based PDFs. Results are 100% processed in your browser.
        </p>

        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(96,165,250,0.8)' : 'rgba(96,165,250,0.3)'}`, borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {file ? (
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '8px' }}>📄</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600' }}>{file.name}</p>
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>{(file.size / 1024).toFixed(1)} KB</p>
              <button onClick={(e) => { e.stopPropagation(); setFile(null); setText(''); }} style={{ marginTop: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Remove</button>
            </div>
          ) : (
            <><div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>📋</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '4px' }}>Drop a PDF to extract text</p>
              <p style={{ color: '#64748b', fontSize: '13px' }}>or click to browse</p></>
          )}
        </div>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {file && !text && (
        <button onClick={runOcr} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: processing ? '#374151' : 'linear-gradient(135deg,#1d4ed8,#3b82f6)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          {processing ? `⏳ ${progress}` : '🔍 Extract Text from PDF'}
        </button>
      )}

      {text && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#60a5fa', fontWeight: '700' }}>✅ Text Extracted</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: copied ? '#10b981' : '#4b5563', color: '#fff', fontWeight: '700' }}>
                {copied ? '✓ Copied' : '📋 Copy'}
              </button>
              <button onClick={downloadTxt} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#7c3aed', color: '#fff', fontWeight: '700' }}>⬇ .TXT</button>
            </div>
          </div>
          <textarea readOnly value={text} style={{ width: '100%', height: '300px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#cbd5e1', fontFamily: 'monospace', fontSize: '13px', outline: 'none', resize: 'vertical' }} />
        </div>
      )}
    </ToolLayout>
  );
}
