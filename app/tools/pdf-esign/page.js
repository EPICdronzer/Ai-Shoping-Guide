'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function EsignPdf() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const inputRef = useRef(null);
  const canvasRef = useRef(null);
  const bufRef = useRef(null);

  const loadFile = async (f) => {
    if (!f || !f.name.endsWith('.pdf')) { setError('Please select a PDF file.'); return; }
    setFile(f); setDone(false); setError(null);
    bufRef.current = await f.arrayBuffer();
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); loadFile(e.dataTransfer.files[0]); }, []);

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const coords = getCanvasCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const coords = getCanvasCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSign = async () => {
    if (!bufRef.current) return;
    setProcessing(true); setError(null);
    try {
      const canvas = canvasRef.current;
      const signatureDataUrl = canvas.toDataURL('image/png');

      const { PDFDocument } = await import('pdf-lib');
      const doc = await PDFDocument.load(bufRef.current);
      const signatureImage = await doc.embedPng(signatureDataUrl);
      const pages = doc.getPages();
      const firstPage = pages[0];

      firstPage.drawImage(signatureImage, {
        x: 50,
        y: 50,
        width: 150,
        height: 50
      });

      const bytes = await doc.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace('.pdf', '_signed.pdf');
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) {
      setError(err.message || 'Signature overlay failed');
    }
    setProcessing(false);
  };

  return (
    <ToolLayout icon="✍️" title="eSign PDF" category="PDF Tools" badgeColor="#a78bfa">
      <div style={card}>
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(167,139,250,0.8)' : 'rgba(167,139,250,0.3)'}`, borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {file ? (
            <div>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📄</div>
              <p style={{ color: '#f1f5f9', fontWeight: '700' }}>{file.name}</p>
              <button onClick={() => { setFile(null); setDone(false); bufRef.current = null; }} style={{ marginTop: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change file</button>
            </div>
          ) : (
            <><div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>✍️</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '4px' }}>Drop your PDF here</p></>
          )}
        </div>
      </div>

      {file && (
        <div style={card}>
          <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>DRAW YOUR SIGNATURE</label>
          <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)', width: '300px', margin: '0 auto 12px' }}>
            <canvas
              ref={canvasRef}
              width={300}
              height={100}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              style={{ display: 'block', cursor: 'crosshair' }}
            />
          </div>
          <button onClick={clearCanvas} style={{ display: 'block', margin: '0 auto', padding: '6px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Clear Signature Canvas</button>
        </div>
      )}

      {file && !done && (
        <button onClick={handleSign} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', fontSize: '15px', fontWeight: '700', marginTop: '16px' }}>
          {processing ? '⏳ Signing…' : '✍️ Apply Signature & Download PDF'}
        </button>
      )}

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {done && (
        <div style={{ ...card, border: '1px solid rgba(52,211,153,0.3)', textAlign: 'center', background: 'rgba(16,185,129,0.05)' }}>
          <span style={{ fontSize: '2rem' }}>✅</span>
          <p style={{ color: '#34d399', fontWeight: '700', marginTop: '8px' }}>PDF signed and downloaded successfully!</p>
        </div>
      )}
    </ToolLayout>
  );
}
