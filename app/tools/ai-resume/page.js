'use client';
import { useState } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };
const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', outline: 'none', fontFamily: 'inherit' };
const selectStyle = { width: '100%', background: 'rgba(25,20,45,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', outline: 'none' };

async function callGemini(prompt) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
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

Format the resume with clear sections: Summary, Work Experience, Skills, Education, and Achievements. Use professional language suitable for a job application. Make it compelling and ATS-friendly.`;
      setOutput(await callGemini(prompt));
    } catch (e) { setError('Generation failed: ' + e.message); }
    setLoading(false);
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
    const lines = doc.splitTextToSize(output, maxW);
    for (const line of lines) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(line, margin, y);
      y += 7;
    }
    doc.save('resume.pdf');
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
              <button onClick={exportPdf} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#7c3aed', color: '#fff', fontSize: '13px', fontWeight: '700' }}>📄 PDF</button>
            </div>
          </div>
          <pre style={{ color: '#e2e8f0', fontSize: '13px', lineHeight: '1.7', whiteSpace: 'pre-wrap', maxHeight: '500px', overflowY: 'auto', fontFamily: 'inherit' }}>{output}</pre>
        </div>
      )}
    </ToolLayout>
  );
}
