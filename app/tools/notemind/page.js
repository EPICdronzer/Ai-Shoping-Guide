'use client';
import { useState } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

function simpleMarkdown(text) {
  return text
    .replace(/^### (.+)$/gm, '<h3 style="color:#a78bfa;margin:16px 0 8px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color:#c084fc;margin:20px 0 10px;font-size:1.3rem">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="color:#e2e8f0;margin:24px 0 12px;font-size:1.6rem">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#f1f5f9">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em style="color:#94a3b8">$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(167,139,250,0.15);padding:2px 6px;border-radius:4px;color:#a78bfa;font-family:monospace">$1</code>')
    .replace(/^- (.+)$/gm, '<li style="color:#cbd5e1;margin:4px 0;list-style:none;padding-left:16px">• $1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li style="color:#cbd5e1;margin:4px 0;list-style:none;padding-left:16px">$1. $2</li>')
    .replace(/\n\n/g, '</p><p style="margin:12px 0;color:#94a3b8;line-height:1.7">')
    .replace(/\n/g, '<br/>');
}

export default function NoteMind() {
  const [note, setNote] = useState('# My Note\n\nStart writing your note here...\n\n## Section 1\n\nAdd your content...');
  const [tab, setTab] = useState('write'); // write | preview
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const wordCount = note.trim().split(/\s+/).filter(Boolean).length;
  const charCount = note.length;

  const summarize = async () => {
    if (!note.trim()) return;
    setAiLoading(true); setAiError('');
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'YOUR_KEY');
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `Summarize the following note concisely in 3-5 bullet points. Focus on key ideas:\n\n${note}`;
      const result = await model.generateContent(prompt);
      setAiResult(result.response.text());
    } catch (err) {
      setAiError('Gemini API error. Add NEXT_PUBLIC_GEMINI_API_KEY to .env.local');
    }
    setAiLoading(false);
  };

  const exportPdf = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const margin = 20;
    const maxW = doc.internal.pageSize.getWidth() - margin * 2;
    let y = 20;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    const lines = note.split('\n');
    for (const line of lines) {
      if (y > 270) { doc.addPage(); y = 20; }
      const isBig = line.startsWith('# ');
      const isMed = line.startsWith('## ');
      if (isBig) { doc.setFontSize(18); doc.setFont('helvetica', 'bold'); doc.setTextColor(60, 20, 120); }
      else if (isMed) { doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(80, 40, 160); }
      else { doc.setFontSize(11); doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30); }
      const clean = line.replace(/^#+\s*/, '').replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '');
      const wrapped = doc.splitTextToSize(clean || ' ', maxW);
      for (const wl of wrapped) { doc.text(wl, margin, y); y += isBig ? 10 : isMed ? 8 : 7; }
    }
    doc.save('note.pdf');
  };

  const exportTxt = () => {
    const blob = new Blob([note], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'note.md'; a.click();
    URL.revokeObjectURL(url);
  };

  const copyAll = () => navigator.clipboard.writeText(note);

  return (
    <ToolLayout icon="🧠" title="NoteMind AI" category="Smart Notepad" badgeColor="#a78bfa">
      {/* Stats + actions bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
          <span><span style={{ color: '#a78bfa' }}>{wordCount}</span> words</span>
          <span><span style={{ color: '#a78bfa' }}>{charCount}</span> chars</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[['📋 Copy', copyAll], ['💾 Export MD', exportTxt], ['📄 Export PDF', exportPdf]].map(([label, fn]) => (
            <button key={label} onClick={fn} style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', cursor: 'pointer', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Write / Preview tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '14px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
        {[['write', '✏️ Write'], ['preview', '👁 Preview']].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: tab === t ? 'rgba(167,139,250,0.2)' : 'transparent', color: tab === t ? '#a78bfa' : '#64748b', fontWeight: '700', fontSize: '13px', transition: 'all 0.2s' }}>{label}</button>
        ))}
      </div>

      {tab === 'write' ? (
        <div style={{ ...card, padding: '0', overflow: 'hidden' }}>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            spellCheck
            style={{ width: '100%', minHeight: '400px', background: 'transparent', border: 'none', outline: 'none', padding: '24px', color: '#e2e8f0', fontSize: '14px', lineHeight: '1.7', fontFamily: '"JetBrains Mono", "Courier New", monospace', resize: 'vertical' }}
            placeholder="# Title&#10;&#10;Start writing in Markdown..."
          />
        </div>
      ) : (
        <div style={{ ...card, minHeight: '400px' }}>
          <div
            style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.7' }}
            dangerouslySetInnerHTML={{ __html: simpleMarkdown(note) || '<p style="color:#475569">Nothing to preview yet...</p>' }}
          />
        </div>
      )}

      {/* AI Summarize */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: aiResult || aiLoading ? '16px' : '0' }}>
          <div>
            <p style={{ color: '#e2e8f0', fontWeight: '700', marginBottom: '2px' }}>✨ AI Summarize</p>
            <p style={{ color: '#64748b', fontSize: '12px' }}>Powered by Gemini</p>
          </div>
          <button onClick={summarize} disabled={aiLoading} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: aiLoading ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#6d28d9,#7c3aed)', color: '#fff', fontWeight: '700', fontSize: '13px', boxShadow: '0 4px 16px rgba(124,58,237,0.3)', whiteSpace: 'nowrap' }}>
            {aiLoading ? '⏳ Thinking…' : '✨ Summarize'}
          </button>
        </div>
        {aiError && <p style={{ color: '#f87171', fontSize: '12px', marginBottom: '8px' }}>⚠️ {aiError}</p>}
        {aiResult && (
          <div style={{ background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '10px', padding: '16px' }}>
            <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Summary</p>
            <div style={{ color: '#e2e8f0', fontSize: '13.5px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{aiResult}</div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
