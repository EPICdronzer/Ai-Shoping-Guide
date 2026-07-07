'use client';
import { useState } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function MarkdownToPdf() {
  const [markdown, setMarkdown] = useState('# My Document\n\nThis is a clean markdown document.\n\n## Section 1\n- Item 1\n- Item 2\n\nFeel free to write anything.');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const convertToPdf = async () => {
    setProcessing(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const margin = 20;
      const maxW = doc.internal.pageSize.getWidth() - margin * 2;
      let y = 20;

      const lines = markdown.split('\n');
      for (const line of lines) {
        if (y > 270) { doc.addPage(); y = 20; }
        const isH1 = line.startsWith('# ');
        const isH2 = line.startsWith('## ');
        if (isH1) { doc.setFontSize(18); doc.setFont('helvetica', 'bold'); doc.setTextColor(40, 20, 120); }
        else if (isH2) { doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(80, 40, 160); }
        else { doc.setFontSize(11); doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30); }
        
        const cleanLine = line.replace(/^#+\s*/, '').replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '');
        const wrapped = doc.splitTextToSize(cleanLine || ' ', maxW);
        for (const wl of wrapped) {
          doc.text(wl, margin, y);
          y += isH1 ? 10 : isH2 ? 8 : 7;
        }
      }
      doc.save('markdown_document.pdf');
      setDone(true);
    } catch (_) {}
    setProcessing(false);
  };

  return (
    <ToolLayout icon="✍️" title="Markdown to PDF" category="Document Tools" badgeColor="#34d399">
      <div style={card}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>MARKDOWN CONTENT</label>
          <textarea
            value={markdown}
            onChange={e => setMarkdown(e.target.value)}
            style={{ width: '100%', height: '240px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', fontFamily: 'monospace', outline: 'none' }}
          />
        </div>

        <button onClick={convertToPdf} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          {processing ? '⏳ Converting…' : '📄 Convert to PDF'}
        </button>
      </div>

      {done && (
        <div style={{ ...card, border: '1px solid rgba(52,211,153,0.3)', textAlign: 'center', background: 'rgba(16,185,129,0.05)' }}>
          <span style={{ fontSize: '2rem' }}>✅</span>
          <p style={{ color: '#34d399', fontWeight: '700', marginTop: '8px' }}>Markdown file converted to PDF!</p>
          <button onClick={() => setDone(false)} style={{ marginTop: '12px', padding: '8px 18px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>Convert another</button>
        </div>
      )}
    </ToolLayout>
  );
}
