'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function ExcelToPdf() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState([]);
  const inputRef = useRef(null);
  const bufRef = useRef(null);

  const loadFile = async (f) => {
    if (!f || (!f.name.endsWith('.xlsx') && !f.name.endsWith('.xls') && !f.name.endsWith('.csv'))) {
      setError('Please select an Excel (.xlsx/.xls) or CSV file.'); return;
    }
    setFile(f); setDone(false); setError(null); setPreview([]);
    bufRef.current = await f.arrayBuffer();
    // Preview
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.read(bufRef.current, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      setPreview(data.slice(0, 8));
    } catch (_) {}
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); loadFile(e.dataTransfer.files[0]); }, []);

  const handleConvert = async () => {
    if (!bufRef.current) return;
    setProcessing(true); setError(null); setDone(false);
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.read(bufRef.current, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 14;
      const colW = Math.max(20, (pageW - margin * 2) / Math.max(1, data[0]?.length || 1));
      let y = 18;

      doc.setFontSize(9);
      for (let r = 0; r < data.length; r++) {
        if (y > 195) { doc.addPage('a4', 'landscape'); y = 18; }
        const row = data[r];
        const isHeader = r === 0;
        if (isHeader) { doc.setFont('helvetica', 'bold'); doc.setFillColor(40, 30, 70); doc.rect(margin, y - 4, pageW - margin * 2, 8, 'F'); doc.setTextColor(200, 180, 255); }
        else { doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30); if (r % 2 === 0) { doc.setFillColor(245, 243, 255); doc.rect(margin, y - 4, pageW - margin * 2, 8, 'F'); } }
        row.forEach((cell, c) => {
          const cellText = String(cell ?? '').slice(0, 20);
          doc.text(cellText, margin + c * colW, y, { maxWidth: colW - 2 });
        });
        y += 8;
      }

      doc.save(file.name.replace(/\.(xlsx?|csv)$/, '.pdf'));
      setDone(true);
    } catch (err) { setError(err.message || 'Conversion failed'); }
    setProcessing(false);
  };

  return (
    <ToolLayout icon="🔢" title="Excel to PDF" category="Document Converter" badgeColor="#fb923c">
      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(251,146,60,0.8)' : 'rgba(251,146,60,0.3)'}`, borderRadius: '12px', padding: '40px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {file ? (
            <div>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📊</div>
              <p style={{ color: '#f1f5f9', fontWeight: '700' }}>{file.name}</p>
              <button onClick={() => { setFile(null); setDone(false); setPreview([]); bufRef.current = null; }} style={{ marginTop: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change file</button>
            </div>
          ) : (
            <><div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🔢</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '6px' }}>Drop your Excel or CSV file here</p>
              <p style={{ color: '#64748b', fontSize: '13px' }}>.xlsx · .xls · .csv</p></>
          )}
        </div>
      </div>

      {/* Preview table */}
      {preview.length > 0 && (
        <div style={{ ...card, overflowX: 'auto' }}>
          <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', marginBottom: '10px' }}>PREVIEW (first 8 rows)</p>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '12px' }}>
            <tbody>
              {preview.map((row, ri) => (
                <tr key={ri} style={{ background: ri === 0 ? 'rgba(167,139,250,0.1)' : ri % 2 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: '6px 10px', border: '1px solid rgba(255,255,255,0.06)', color: ri === 0 ? '#e2e8f0' : '#94a3b8', fontWeight: ri === 0 ? '700' : '400', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {String(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {file && !done && (
        <button onClick={handleConvert} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#c2410c,#f97316)', color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 20px rgba(249,115,22,0.3)', marginBottom: '20px' }}>
          {processing ? '⏳ Converting…' : '📄 Convert to PDF'}
        </button>
      )}

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {done && (
        <div style={{ ...card, border: '1px solid rgba(52,211,153,0.3)', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>✅</div>
          <p style={{ color: '#34d399', fontWeight: '700' }}>PDF Downloaded!</p>
          <button onClick={() => { setFile(null); setDone(false); setPreview([]); bufRef.current = null; }} style={{ marginTop: '14px', padding: '10px 24px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>Convert another</button>
        </div>
      )}
    </ToolLayout>
  );
}
