'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function HtmlToPdf() {
  const [htmlContent, setHtmlContent] = useState(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    h1 { color: #1d4ed8; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
    p { line-height: 1.7; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background: #f1f5f9; font-weight: bold; }
  </style>
</head>
<body>
  <h1>My Document Title</h1>
  <p>This is a sample HTML document. Edit this content and click "Convert to PDF" to generate your PDF file.</p>
  <table>
    <tr><th>Name</th><th>Role</th><th>Score</th></tr>
    <tr><td>Alice</td><td>Engineer</td><td>95</td></tr>
    <tr><td>Bob</td><td>Designer</td><td>88</td></tr>
  </table>
  <p><strong>Footer note:</strong> Generated with MindSuite AI HTML to PDF converter.</p>
</body>
</html>`);
  const [tab, setTab] = useState('code');
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef(null);

  const convert = async () => {
    setLoading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      // Write content to iframe, then capture
      const iframe = iframeRef.current;
      if (iframe) {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(htmlContent);
        doc.close();

        await new Promise(r => setTimeout(r, 600));

        const canvas = await html2canvas(doc.body, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = (canvas.height * pdfW) / canvas.width;
        let yPos = 0;
        const pageH = pdf.internal.pageSize.getHeight();
        while (yPos < pdfH) {
          if (yPos > 0) pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, -yPos, pdfW, pdfH);
          yPos += pageH;
        }
        pdf.save('document.pdf');
      }
    } catch (err) {
      alert('Conversion failed: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <ToolLayout icon="🌐" title="HTML to PDF" category="Document Tools" badgeColor="#f59e0b">
      <div style={card}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {['code', 'preview'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 20px', borderRadius: '10px', border: `1px solid ${tab === t ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`, background: tab === t ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)', color: tab === t ? '#fbbf24' : '#64748b', cursor: 'pointer', fontWeight: '700', textTransform: 'capitalize' }}>
              {t === 'code' ? '💻 HTML Code' : '👁 Preview'}
            </button>
          ))}
        </div>

        {tab === 'code' ? (
          <textarea
            value={htmlContent}
            onChange={e => setHtmlContent(e.target.value)}
            rows={18}
            style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#a78bfa', fontFamily: 'monospace', fontSize: '13px', outline: 'none', resize: 'vertical' }}
          />
        ) : (
          <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden', height: '400px' }}>
            <iframe ref={iframeRef} title="preview" srcDoc={htmlContent} style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }} />
          </div>
        )}

        <button onClick={convert} disabled={loading} style={{ width: '100%', marginTop: '16px', padding: '14px', borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#374151' : 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          {loading ? '⏳ Converting…' : '📄 Convert HTML to PDF'}
        </button>
      </div>

      <div style={{ ...card, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
        <p style={{ color: '#fbbf24', fontWeight: '700', marginBottom: '8px' }}>💡 Tips</p>
        <ul style={{ color: '#94a3b8', fontSize: '13px', paddingLeft: '16px', lineHeight: '1.8' }}>
          <li>Write or paste HTML in the Code tab — inline CSS styling is fully supported</li>
          <li>Switch to Preview tab to see how it looks before converting</li>
          <li>For best results, keep content within A4 page width</li>
          <li>External fonts and images may not load due to browser security policies</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
