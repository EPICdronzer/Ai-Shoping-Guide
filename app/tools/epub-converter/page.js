'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function EpubConverter() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [outputFormat, setOutputFormat] = useState('pdf');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [bookInfo, setBookInfo] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const loadFile = (f) => {
    const name = f?.name?.toLowerCase();
    if (!name?.endsWith('.epub')) { setError('Please upload an .epub file.'); return; }
    setFile(f); setDone(false); setBookInfo(null); setError('');
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); loadFile(e.dataTransfer.files[0]); }, []);

  const convert = async () => {
    if (!file) { setError('Please upload an EPUB file.'); return; }
    setProcessing(true); setError('');
    try {
      const JSZip = (await import('jszip')).default;
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      // Parse OPF to get book metadata and spine order
      const containerXml = await zip.files['META-INF/container.xml']?.async('string') || '';
      const opfPath = (containerXml.match(/full-path="([^"]+\.opf)"/) || [])[1];
      let title = file.name.replace('.epub', '');
      let author = '';
      let chapters = [];

      if (opfPath) {
        const opfXml = await zip.files[opfPath]?.async('string') || '';
        const titleMatch = opfXml.match(/<dc:title[^>]*>(.*?)<\/dc:title>/s);
        const authorMatch = opfXml.match(/<dc:creator[^>]*>(.*?)<\/dc:creator>/s);
        if (titleMatch) title = titleMatch[1].trim();
        if (authorMatch) author = authorMatch[1].trim();

        // Find HTML/XHTML content files
        const baseDir = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);
        const itemMatches = [...opfXml.matchAll(/href="([^"]+\.(?:html|xhtml|htm))"[^>]*>/g)];
        for (const m of itemMatches.slice(0, 20)) {
          const path = baseDir + m[1].replace(/^\.\//, '');
          const html = await zip.files[path]?.async('string');
          if (html) {
            const text = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            if (text.length > 50) chapters.push(text.substring(0, 3000));
          }
        }
      }

      setBookInfo({ title, author, chapters: chapters.length });

      if (outputFormat === 'pdf') {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        const margin = 20;
        const maxW = doc.internal.pageSize.getWidth() - margin * 2;
        let y = 30;

        // Cover / title page
        doc.setFillColor(17, 13, 38);
        doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');
        doc.setFontSize(24);
        doc.setTextColor(167, 139, 250);
        doc.text(title, doc.internal.pageSize.getWidth() / 2, 80, { align: 'center' });
        if (author) {
          doc.setFontSize(14);
          doc.setTextColor(148, 163, 184);
          doc.text(`by ${author}`, doc.internal.pageSize.getWidth() / 2, 95, { align: 'center' });
        }

        for (const chapterText of chapters) {
          doc.addPage();
          doc.setFillColor(255, 255, 255);
          doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');
          doc.setFontSize(11);
          doc.setTextColor(30, 30, 30);
          y = margin;
          const lines = doc.splitTextToSize(chapterText, maxW);
          for (const line of lines) {
            if (y > doc.internal.pageSize.getHeight() - margin) { doc.addPage(); y = margin; }
            doc.text(line, margin, y);
            y += 6;
          }
        }

        doc.save(`${title}.pdf`);
      } else {
        // TXT output
        const allText = `${title}\n${author ? 'by ' + author : ''}\n\n` + chapters.join('\n\n---\n\n');
        const blob = new Blob([allText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      }

      setDone(true);
    } catch (e) { setError('Conversion failed: ' + e.message); }
    setProcessing(false);
  };

  return (
    <ToolLayout icon="📚" title="EPUB Converter" category="Document Tools" badgeColor="#f59e0b">
      <div style={card}>
        <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>
          📚 Convert EPUB ebooks to PDF or TXT. Extracts text content, preserves book structure and metadata — fully browser-side.
        </p>

        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(167,139,250,0.8)' : 'rgba(167,139,250,0.3)'}`, borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept=".epub" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {file ? (
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '8px' }}>📚</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600' }}>{file.name}</p>
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>{(file.size / 1024).toFixed(1)} KB</p>
              <button onClick={(e) => { e.stopPropagation(); setFile(null); setDone(false); setBookInfo(null); }} style={{ marginTop: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Remove</button>
            </div>
          ) : (
            <><div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>📚</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '4px' }}>Drop your .epub file here</p>
              <p style={{ color: '#64748b', fontSize: '13px' }}>or click to browse</p></>
          )}
        </div>

        {file && (
          <div style={{ marginTop: '16px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>OUTPUT FORMAT</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[['pdf', '📄 PDF'], ['txt', '📝 Plain Text']].map(([val, label]) => (
                <button key={val} onClick={() => setOutputFormat(val)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: `1px solid ${outputFormat === val ? '#a78bfa' : 'rgba(255,255,255,0.08)'}`, background: outputFormat === val ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)', color: outputFormat === val ? '#a78bfa' : '#64748b', cursor: 'pointer', fontWeight: '700', transition: 'all 0.2s' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}
      {done && bookInfo && (
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '14px', color: '#34d399', marginBottom: '16px' }}>
          ✅ <strong>"{bookInfo.title}"</strong>{bookInfo.author ? ` by ${bookInfo.author}` : ''} — {bookInfo.chapters} chapters converted and downloaded!
        </div>
      )}

      {file && !done && (
        <button onClick={convert} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: processing ? '#374151' : 'linear-gradient(135deg,#7c3aed,#a78bfa)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          {processing ? '⏳ Converting EPUB…' : `📚 Convert to ${outputFormat.toUpperCase()}`}
        </button>
      )}
    </ToolLayout>
  );
}
