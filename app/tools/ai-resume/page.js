'use client';
import { useState } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };
const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', outline: 'none', fontFamily: 'inherit' };
const selectStyle = { width: '100%', background: 'rgba(25,20,45,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', outline: 'none' };

async function callGemini(prompt) {
  const { callAI } = await import('@/lib/ai');
  return callAI(prompt);
}

function cleanUnicodeForPDF(text) {
  if (!text) return '';
  return text
    .replace(/[\u2018\u2019]/g, "'") // smart quotes
    .replace(/[\u201C\u201D]/g, '"') // double quotes
    .replace(/[\u2013\u2014]/g, '-') // dashes
    .replace(/₹/g, 'Rs. ')           // Rupee symbol compatibility
    .replace(/[^\x00-\xFF]/g, '')    // Remove emojis/non-Latin1 characters (keeps accented letters like é)
    .replace(/\brsum\b/gi, 'resume') // Safely map any broken rsum spelling back
    .replace(/\brsums\b/gi, 'resumes');
}

function parseBold(text) {
  const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i} style={{ color: '#fff', fontWeight: '700' }}>{part}</strong>;
    }
    return part;
  });
}

function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, index) => {
    if (line.trim() === '---' || line.trim() === '***') {
      return <hr key={index} style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '16px 0' }} />;
    }
    if (line.startsWith('# ')) {
      return <h1 key={index} style={{ color: '#fff', fontSize: '22px', fontWeight: '800', marginTop: '16px', marginBottom: '8px' }}>{parseBold(line.slice(2))}</h1>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={index} style={{ color: '#fff', fontSize: '18px', fontWeight: '700', marginTop: '14px', marginBottom: '8px' }}>{parseBold(line.slice(3))}</h2>;
    }
    if (line.startsWith('### ')) {
      return <h3 key={index} style={{ color: '#34d399', fontSize: '15px', fontWeight: '700', marginTop: '12px', marginBottom: '6px', letterSpacing: '0.5px' }}>{parseBold(line.slice(4))}</h3>;
    }
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      return (
        <li key={index} style={{ color: '#cbd5e1', fontSize: '13.5px', marginLeft: '16px', marginBottom: '4px', listStyleType: 'disc' }}>
          {parseBold(line.trim().slice(2))}
        </li>
      );
    }
    if (!line.trim()) {
      return <div key={index} style={{ height: '8px' }} />;
    }
    return (
      <p key={index} style={{ color: '#cbd5e1', fontSize: '13.5px', marginBottom: '6px', lineHeight: '1.6' }}>
        {parseBold(line)}
      </p>
    );
  });
}

export default function AiResume() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [education, setEducation] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!name || !role) { setError('Please fill in Name and Target Role at minimum.'); return; }
    setLoading(true); setError(''); setOutput('');
    try {
      const prompt = `Create a detailed, professional, ATS-optimized resume for the following person:
Name: ${name}
Target Role: ${role}
Work Experience: ${experience || 'Not specified'}
Skills: ${skills || 'Not specified'}
Education: ${education || 'Not specified'}

Format the resume with clear sections: Summary, Work Experience, Skills, Education, and Achievements. Use professional language suitable for a job application. Make it compelling and ATS-friendly.

CRITICAL INSTRUCTIONS:
- You must generate a COMPLETE, ready-to-use resume immediately.
- Do NOT refuse, do NOT ask the user for more information, and do NOT output a conversational response saying you need more details.
- Even if the provided inputs are minimal, generic, placeholder letters (like 'CSSC', 'SCSC'), or empty, use your imagination to expand them into standard, high-quality, professional, realistic resume achievements and descriptions for that target role.`;
      setOutput(await callGemini(prompt));
    } catch (e) { setError('Generation failed: ' + e.message); }
    setLoading(false);
  };

  const exportPdf = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxW = pageWidth - margin * 2;
    let y = 20;
    
    const rawLines = output.split('\n');
    
    const writeTextWithBold = (text, startX, startY, fontName, normalSize, isHeading = false, headingLevel = 3) => {
      let size = normalSize;
      if (isHeading) {
        size = headingLevel === 1 ? 18 : headingLevel === 2 ? 14 : 12;
        doc.setFont(fontName, 'bold');
      } else {
        doc.setFont(fontName, 'normal');
      }
      doc.setFontSize(size);
      
      const cleanText = cleanUnicodeForPDF(text);
      const parts = cleanText.split(/\*\*([\s\S]*?)\*\*/g);
      
      const words = [];
      parts.forEach((part, partIndex) => {
        const isBold = partIndex % 2 === 1;
        const partWords = part.split(/(\s+)/);
        partWords.forEach(w => {
          if (w) words.push({ text: w, isBold });
        });
      });
      
      let currentLineWords = [];
      let currentLineWidth = 0;
      const linesToDraw = [];
      
      words.forEach(w => {
        doc.setFont(fontName, w.isBold || isHeading ? 'bold' : 'normal');
        const wordWidth = doc.getTextWidth(w.text);
        
        if (currentLineWidth + wordWidth > maxW && currentLineWords.length > 0) {
          linesToDraw.push(currentLineWords);
          currentLineWords = [w];
          currentLineWidth = wordWidth;
        } else {
          currentLineWords.push(w);
          currentLineWidth += wordWidth;
        }
      });
      if (currentLineWords.length > 0) {
        linesToDraw.push(currentLineWords);
      }
      
      linesToDraw.forEach(lineWords => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        let curX = startX;
        lineWords.forEach(w => {
          doc.setFont(fontName, w.isBold || isHeading ? 'bold' : 'normal');
          doc.text(w.text, curX, y);
          curX += doc.getTextWidth(w.text);
        });
        y += isHeading ? 8 : 6.5;
      });
    };
    
    for (const rawLine of rawLines) {
      const line = rawLine.trim();
      if (line === '---' || line === '***') {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;
        continue;
      }
      if (!line) {
        y += 4;
        continue;
      }
      if (line.startsWith('# ')) {
        writeTextWithBold(line.slice(2), margin, y, 'helvetica', 11, true, 1);
        y += 2;
      } else if (line.startsWith('## ')) {
        writeTextWithBold(line.slice(3), margin, y, 'helvetica', 11, true, 2);
        y += 2;
      } else if (line.startsWith('### ')) {
        writeTextWithBold(line.slice(4), margin, y, 'helvetica', 11, true, 3);
        y += 1.5;
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('\u2022', margin, y);
        writeTextWithBold(line.slice(2), margin + 4, y, 'helvetica', 11, false);
      } else {
        writeTextWithBold(line, margin, y, 'helvetica', 11, false);
      }
    }
    
    doc.save('resume.pdf');
  };

  const exportDocx = async () => {
    try {
      const docx = await import('docx');
      const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx;

      const rawLines = output.split('\n');
      const docxParagraphs = [];

      const buildTextRuns = (text) => {
        const cleanText = cleanUnicodeForPDF(text);
        const parts = cleanText.split(/\*\*([\s\S]*?)\*\*/g);
        return parts.map((part, index) => {
          const isBold = index % 2 === 1;
          return new TextRun({
            text: part,
            bold: isBold,
            font: "Arial",
            size: 22,
          });
        });
      };

      for (const rawLine of rawLines) {
        const line = rawLine.trim();

        if (line === '---' || line === '***') {
          docxParagraphs.push(new Paragraph({
            border: {
              bottom: { color: "cccccc", space: 1, size: 6, style: "single" }
            },
            spacing: { before: 200, after: 200 }
          }));
          continue;
        }

        if (!line) {
          docxParagraphs.push(new Paragraph({
            spacing: { before: 100, after: 100 }
          }));
          continue;
        }

        if (line.startsWith('# ')) {
          docxParagraphs.push(new Paragraph({
            text: line.slice(2),
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 }
          }));
        } else if (line.startsWith('## ')) {
          docxParagraphs.push(new Paragraph({
            text: line.slice(3),
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }));
        } else if (line.startsWith('### ')) {
          docxParagraphs.push(new Paragraph({
            text: line.slice(4),
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 160, after: 80 }
          }));
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          docxParagraphs.push(new Paragraph({
            children: buildTextRuns(line.slice(2)),
            bullet: { level: 0 },
            spacing: { before: 80, after: 80 }
          }));
        } else {
          docxParagraphs.push(new Paragraph({
            children: buildTextRuns(line),
            spacing: { before: 100, after: 100 }
          }));
        }
      }

      const doc = new Document({
        sections: [{
          properties: {},
          children: docxParagraphs,
        }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name.replace(/\s+/g, '_') || 'Resume'}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Word export failed:', err);
      alert('Failed to export Word document.');
    }
  };

  return (
    <ToolLayout icon="📄" title="AI Resume Builder" category="AI Tools" badgeColor="#34d399">
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>FULL NAME *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>TARGET ROLE *</label>
            <input value={role} onChange={e => setRole(e.target.value)} placeholder="Senior Software Engineer" style={inputStyle} />
          </div>
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>WORK EXPERIENCE</label>
          <textarea value={experience} onChange={e => setExperience(e.target.value)} rows={4} placeholder="2021-2024: Software Engineer at TechCorp. Built React dashboards, REST APIs..." style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>SKILLS</label>
            <input value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, Node.js, Python, SQL..." style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>EDUCATION</label>
            <input value={education} onChange={e => setEducation(e.target.value)} placeholder="B.Tech CS, 2021" style={inputStyle} />
          </div>
        </div>
        <button onClick={generate} disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#374151' : 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          {loading ? '⏳ Generating Resume…' : '📄 Generate AI Resume'}
        </button>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {output && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#34d399', fontWeight: '700' }}>✅ Resume Generated</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: copied ? '#10b981' : '#4b5563', color: '#fff', fontSize: '13px', fontWeight: '700' }}>
                {copied ? '✓ Copied' : '📋 Copy'}
              </button>
              <button onClick={exportDocx} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#2563eb', color: '#fff', fontSize: '13px', fontWeight: '700' }}>📝 Word</button>
              <button onClick={exportPdf} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#7c3aed', color: '#fff', fontSize: '13px', fontWeight: '700' }}>📄 PDF</button>
            </div>
          </div>
          <div style={{ color: '#e2e8f0', fontSize: '13.5px', lineHeight: '1.7', maxHeight: '500px', overflowY: 'auto', padding: '18px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
            {renderMarkdown(output)}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
