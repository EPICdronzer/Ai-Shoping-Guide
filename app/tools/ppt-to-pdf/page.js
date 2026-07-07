'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function PptToPdf() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const loadFile = (f) => {
    const ext = f?.name?.toLowerCase();
    if (!ext?.endsWith('.pptx') && !ext?.endsWith('.ppt')) { setError('Please upload a .pptx or .ppt file.'); return; }
    setFile(f); setDone(false); setError('');
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); loadFile(e.dataTransfer.files[0]); }, []);

  const convert = async () => {
    if (!file) { setError('Please upload a PPTX file.'); return; }
    setProcessing(true); setError('');
    try {
      const JSZip = (await import('jszip')).default;
      const { jsPDF } = await import('jspdf');

      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      // Read slide XMLs to extract text content
      const slideKeys = Object.keys(zip.files).filter(k => k.match(/^ppt\/slides\/slide\d+\.xml$/)).sort();

      const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();
      let firstPage = true;

      for (let idx = 0; idx < slideKeys.length; idx++) {
        const xml = await zip.files[slideKeys[idx]].async('string');

        // Parse text nodes from XML
        const textMatches = [...xml.matchAll(/<a:t>(.*?)<\/a:t>/gs)];
        const slideTexts = textMatches.map(m => m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")); ;

        if (!firstPage) doc.addPage();
        firstPage = false;

        // Background
        doc.setFillColor(17, 13, 38);
        doc.rect(0, 0, W, H, 'F');

        // Slide number badge
        doc.setFillColor(124, 58, 237);
        doc.roundedRect(W - 28, 4, 22, 10, 2, 2, 'F');
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text(`${idx + 1}/${slideKeys.length}`, W - 24, 11);

        // Title (first text element)
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        const title = slideTexts[0] || `Slide ${idx + 1}`;
        const titleLines = doc.splitTextToSize(title, W - 30);
        doc.text(titleLines, 15, 25);

        // Body text
        doc.setFontSize(12);
        doc.setTextColor(200, 210, 230);
        let yPos = 25 + titleLines.length * 9 + 5;
        for (let t = 1; t < slideTexts.length && yPos < H - 15; t++) {
          if (!slideTexts[t].trim()) continue;
          const lines = doc.splitTextToSize('• ' + slideTexts[t], W - 30);
          if (yPos + lines.length * 6 > H - 10) break;
          doc.text(lines, 15, yPos);
          yPos += lines.length * 6 + 2;
        }
      }

      doc.save(file.name.replace(/\.pptx?$/, '.pdf'));
      setDone(true);
    } catch (e) { setError('Conversion failed: ' + e.message); }
    setProcessing(false);
  };

  return (
    <ToolLayout icon="📑" title="PPT to PDF" category="Document Tools" badgeColor="#f59e0b">
      <div style={card}>
        <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>
          📑 Convert PowerPoint (.pptx) files to PDF. Extracts slide content and generates a clean PDF document — no server upload required.
        </p>

        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(245,158,11,0.8)' : 'rgba(245,158,11,0.3)'}`, borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept=".pptx,.ppt" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {file ? (
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '8px' }}>📊</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600' }}>{file.name}</p>
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>{(file.size / 1024).toFixed(1)} KB</p>
              <button onClick={(e) => { e.stopPropagation(); setFile(null); setDone(false); }} style={{ marginTop: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Remove</button>
            </div>
          ) : (
            <><div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>📑</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '4px' }}>Drop your .pptx file here</p>
              <p style={{ color: '#64748b', fontSize: '13px' }}>or click to browse</p></>
          )}
        </div>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}
      {done && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '14px', color: '#34d399', marginBottom: '16px' }}>✅ PDF downloaded successfully!</div>}

      {file && !done && (
        <button onClick={convert} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: processing ? '#374151' : 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          {processing ? '⏳ Converting slides to PDF…' : '📄 Convert to PDF'}
        </button>
      )}
    </ToolLayout>
  );
}
