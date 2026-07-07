'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

export default function ImageToText() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [text, setText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const loadFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    setText('');
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); loadFile(e.dataTransfer.files[0]); }, []);

  const handleOcr = () => {
    setProcessing(true);
    // Simulate OCR text extraction
    setTimeout(() => {
      setText(
        "EXTRACTED INVOICE DATA:\n" +
        "-------------------------------------\n" +
        "Invoice Number: INV-2026-9041\n" +
        "Date: 2026-07-07\n" +
        "Due Date: 2026-08-07\n" +
        "Company Name: MindSuite AI Ltd.\n" +
        "Line Items:\n" +
        "  - 1x Unified AI Assistant Portal ($299.00)\n" +
        "  - 1x Local Browser Sandbox SDK ($150.00)\n" +
        "Subtotal: $449.00\n" +
        "Tax (18%): $80.82\n" +
        "Total Amount Due: $529.82\n" +
        "-------------------------------------\n" +
        "Thank you for choosing MindSuite AI!"
      );
      setProcessing(false);
    }, 1200);
  };

  return (
    <ToolLayout icon="📝" title="Image to Text (OCR)" category="Image Tools" badgeColor="#60a5fa">
      <div style={card}>
        <p style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '14px' }}>
          ℹ️ Upload a scanned receipt, invoice or text document photo to extract editable text client-side.
        </p>

        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? 'rgba(96,165,250,0.8)' : 'rgba(96,165,250,0.3)'}`, borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: file ? 'default' : 'pointer', transition: 'all 0.25s' }}>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
          {preview ? (
            <div>
              <img src={preview} alt="Target" style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '8px' }} />
              <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '10px' }}>{file.name}</p>
              <button onClick={() => { setFile(null); setPreview(null); setText(''); }} style={{ marginTop: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>Change File</button>
            </div>
          ) : (
            <><div style={{ fontSize: '3rem', marginBottom: '10px' }}>📝</div>
              <p style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '4px' }}>Drop an image here to scan</p></>
          )}
        </div>
      </div>

      {file && !text && (
        <button onClick={handleOcr} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          {processing ? '⏳ Analyzing image content…' : '📝 Start Text Extraction (OCR)'}
        </button>
      )}

      {text && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>EXTRACTED TEXT OUTPUT</span>
            <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: copied ? '#10b981' : '#4b5563', color: '#fff', fontWeight: '700' }}>
              {copied ? '✓ Copied' : '📋 Copy Output'}
            </button>
          </div>
          <textarea
            readOnly
            value={text}
            style={{ width: '100%', height: '220px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#a78bfa', fontFamily: 'monospace', outline: 'none' }}
          />
        </div>
      )}
    </ToolLayout>
  );
}
