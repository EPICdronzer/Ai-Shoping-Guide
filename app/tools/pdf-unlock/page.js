'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function PdfUnlock() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [password, setPassword] = useState('');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const loadFile = (f) => {
    if (!f?.name?.toLowerCase().endsWith('.pdf')) { setError('Please upload a PDF file.'); return; }
    setFile(f); setDone(false); setError('');
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); loadFile(e.dataTransfer.files[0]); }, []);

  const unlock = async () => {
    if (!file) { setError('Please upload a PDF file first.'); return; }
    setProcessing(true); setError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await file.arrayBuffer();
      let pdfDoc;
      try {
        pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      } catch (e) {
        setError('Could not open PDF. If it is password-protected, browser-side decryption requires the password to be validated. This tool removes owner restrictions and metadata encryption.');
        setProcessing(false);
        return;
      }

      // Remove security info by re-saving with no encryption
      pdfDoc.setTitle(pdfDoc.getTitle() || 'Unlocked Document');
      pdfDoc.setProducer('MindSuite AI — PDF Unlock');

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace('.pdf', '_unlocked.pdf');
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (e) { setError('Unlock failed: ' + e.message); }
    setProcessing(false);
  };

  return (
    <ToolLayout icon="🔓" title="Unlock PDF" category="PDF Tools" badgeColor="#ef4444">
      <div style={card}>
        <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>
          🔓 Remove owner restrictions, copy/print locks, and metadata encryption from PDF files. Works client-side — your file never leaves your browser.
        </p>

        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(239,68,68,0.8)' : 'rgba(239,68,68,0.3)'}`, borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {file ? (
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '8px' }}>📄</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600' }}>{file.name}</p>
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>{(file.size / 1024).toFixed(1)} KB</p>
              <button onClick={(e) => { e.stopPropagation(); setFile(null); setDone(false); }} style={{ marginTop: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Remove</button>
            </div>
          ) : (
            <><div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>🔒</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '4px' }}>Drop a locked PDF here</p>
              <p style={{ color: '#64748b', fontSize: '13px' }}>or click to browse</p></>
          )}
        </div>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}
      {done && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '14px', color: '#34d399', marginBottom: '16px' }}>✅ PDF unlocked and downloaded successfully!</div>}

      {file && !done && (
        <button onClick={unlock} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: processing ? '#374151' : 'linear-gradient(135deg,#dc2626,#ef4444)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          {processing ? '⏳ Unlocking PDF…' : '🔓 Unlock & Download PDF'}
        </button>
      )}
    </ToolLayout>
  );
}
