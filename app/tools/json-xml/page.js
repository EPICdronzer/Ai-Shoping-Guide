'use client';
import { useState } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };
const taStyle = { width: '100%', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#a78bfa', fontFamily: 'monospace', fontSize: '13px', outline: 'none', resize: 'vertical' };

function jsonToXml(obj, rootTag = 'root', indent = 0) {
  const pad = '  '.repeat(indent);
  if (Array.isArray(obj)) {
    return obj.map(item => `${pad}<item>\n${jsonToXml(item, 'item', indent + 1)}${pad}</item>`).join('\n');
  }
  if (typeof obj === 'object' && obj !== null) {
    const inner = Object.entries(obj).map(([k, v]) => {
      const safeKey = k.replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/^[^a-zA-Z_]/, '_');
      if (typeof v === 'object' && v !== null) {
        return `${pad}  <${safeKey}>\n${jsonToXml(v, safeKey, indent + 2)}${pad}  </${safeKey}>`;
      }
      return `${pad}  <${safeKey}>${String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</${safeKey}>`;
    }).join('\n');
    return inner + '\n';
  }
  return `${pad}${String(obj)}\n`;
}

function xmlToJson(xml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');
  const err = doc.querySelector('parsererror');
  if (err) throw new Error('Invalid XML: ' + err.textContent.slice(0, 100));
  function nodeToObj(node) {
    if (node.nodeType === 3) { const t = node.textContent.trim(); return t || undefined; }
    if (node.nodeType === 1) {
      const children = Array.from(node.childNodes).map(nodeToObj).filter(v => v !== undefined);
      const attrs = {};
      for (const attr of node.attributes) attrs['@' + attr.name] = attr.value;
      const hasAttrs = Object.keys(attrs).length > 0;
      if (children.length === 0) return hasAttrs ? attrs : '';
      if (children.length === 1 && typeof children[0] === 'string' && !hasAttrs) return children[0];
      const obj = hasAttrs ? { ...attrs } : {};
      const grouped = {};
      Array.from(node.children).forEach(c => {
        const key = c.tagName;
        if (grouped[key] === undefined) grouped[key] = [];
        grouped[key].push(nodeToObj(c));
      });
      for (const [k, v] of Object.entries(grouped)) {
        obj[k] = v.length === 1 ? v[0] : v;
      }
      return obj;
    }
  }
  return nodeToObj(doc.documentElement);
}

export default function JsonXml() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('json2xml');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const convert = () => {
    setError(''); setOutput('');
    try {
      if (mode === 'json2xml') {
        const obj = JSON.parse(input);
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n${jsonToXml(obj, 'root', 1)}</root>`;
        setOutput(xml);
      } else {
        const obj = xmlToJson(input);
        setOutput(JSON.stringify(obj, null, 2));
      }
    } catch (e) { setError(e.message); }
  };

  const EXAMPLES = {
    json2xml: `{
  "user": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "age": 28,
    "tags": ["admin", "editor"]
  }
}`,
    xml2json: `<?xml version="1.0"?>
<person>
  <name>John Smith</name>
  <email>john@example.com</email>
  <role>developer</role>
</person>`,
  };

  return (
    <ToolLayout icon="🔄" title="JSON ↔ XML Converter" category="Utilities" badgeColor="#a78bfa">
      <div style={card}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          {[['json2xml', '📋 JSON → XML'], ['xml2json', '📄 XML → JSON']].map(([val, label]) => (
            <button key={val} onClick={() => { setMode(val); setInput(''); setOutput(''); setError(''); }} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: `1px solid ${mode === val ? '#a78bfa' : 'rgba(255,255,255,0.08)'}`, background: mode === val ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)', color: mode === val ? '#c4b5fd' : '#64748b', cursor: 'pointer', fontWeight: '700', transition: 'all 0.2s' }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label style={{ fontSize: '12px', color: '#94a3b8' }}>{mode === 'json2xml' ? 'JSON INPUT' : 'XML INPUT'}</label>
          <button onClick={() => setInput(EXAMPLES[mode])} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '11px' }}>Load Example</button>
        </div>
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={10} placeholder={mode === 'json2xml' ? '{\n  "key": "value"\n}' : '<root><key>value</key></root>'} style={taStyle} />

        <button onClick={convert} style={{ width: '100%', marginTop: '12px', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
          🔄 Convert {mode === 'json2xml' ? 'JSON → XML' : 'XML → JSON'}
        </button>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>⚠️ {error}</div>}

      {output && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#a78bfa', fontWeight: '700' }}>✅ {mode === 'json2xml' ? 'XML Output' : 'JSON Output'}</span>
            <button onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: copied ? '#10b981' : '#4b5563', color: '#fff', fontWeight: '700' }}>
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
          </div>
          <textarea readOnly value={output} rows={14} style={taStyle} />
        </div>
      )}
    </ToolLayout>
  );
}
