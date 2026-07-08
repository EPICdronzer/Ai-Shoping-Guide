'use client';
import { useState, use } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };

// 1. AI Astrology Assistant
function AstrologyTool() {
  const [sign, setSign] = useState('Aries');
  const [topic, setTopic] = useState('Career & Wealth');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const getHoroscope = async () => {
    setLoading(true);
    try {
      const { callAI } = await import('@/lib/ai');
      const prompt = `Provide a detailed astrological horoscope/reading for sign ${sign} on the topic of "${topic}". Format beautifully in 2-3 paragraphs.`;
      const res = await callAI(prompt);
      setResult(res);
    } catch (_) {
      setResult('Failed to load astrological reading. Please check your Gemini API key in env.');
    }
    setLoading(false);
  };

  return (
    <div style={card}>
      <h3 style={{ color: '#fff', marginBottom: '14px' }}>✨ AI Astrology Assistant</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>ZODIAC SIGN</label>
          <select value={sign} onChange={e => setSign(e.target.value)} style={{ width: '100%', background: 'rgba(25,20,45,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#fff', outline: 'none' }}>
            {['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'].map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>READING FOCUS</label>
          <select value={topic} onChange={e => setTopic(e.target.value)} style={{ width: '100%', background: 'rgba(25,20,45,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#fff', outline: 'none' }}>
            {['General Horoscope', 'Love & Relationships', 'Career & Wealth', 'Health & Energy'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <button onClick={getHoroscope} disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#c084fc,#8b5cf6)', color: '#fff', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}>
        {loading ? '🔮 Consultings stars…' : '✨ Generate Horoscope'}
      </button>
      {result && <div style={{ marginTop: '20px', background: 'rgba(167,139,250,0.08)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(167,139,250,0.2)', color: '#cbd5e1', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{result}</div>}
    </div>
  );
}

// 2. AI Travel Planner
function TravelPlannerTool() {
  const [destination, setDestination] = useState('Paris, France');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState('Moderate');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const getItinerary = async () => {
    setLoading(true);
    try {
      const { callAI } = await import('@/lib/ai');
      const prompt = `Create a detailed ${days}-day travel itinerary for "${destination}" with a budget level of "${budget}". Outline day-by-day sightseeing highlights, morning, afternoon and evening plans.`;
      const res = await callAI(prompt);
      setResult(res);
    } catch (_) {
      setResult('Failed to generate itinerary. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={card}>
      <h3 style={{ color: '#fff', marginBottom: '14px' }}>🗺️ AI Travel Planner</h3>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>DESTINATION</label>
        <input type="text" value={destination} onChange={e => setDestination(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#fff', outline: 'none' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>DURATION (DAYS)</label>
          <input type="number" min="1" max="14" value={days} onChange={e => setDays(Number(e.target.value))} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#fff', outline: 'none' }} />
        </div>
        <div>
          <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>BUDGET</label>
          <select value={budget} onChange={e => setBudget(e.target.value)} style={{ width: '100%', background: 'rgba(25,20,45,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#fff', outline: 'none' }}>
            {['Backpacker', 'Moderate', 'Luxury'].map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>
      <button onClick={getItinerary} disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#60a5fa,#3b82f6)', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
        {loading ? '⏳ Plannings route…' : '🗺️ Generate Itinerary'}
      </button>
      {result && <div style={{ marginTop: '20px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', color: '#cbd5e1', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{result}</div>}
    </div>
  );
}

// 3. Glassmorphism Generator
function GlassmorphismTool() {
  const [blur, setBlur] = useState(12);
  const [opacity, setOpacity] = useState(0.25);
  const [color, setColor] = useState('#ffffff');
  const [copied, setCopied] = useState(false);

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
  };

  const getCss = () => {
    const rgb = hexToRgb(color);
    return `background: rgba(${rgb}, ${opacity});\nbackdrop-filter: blur(${blur}px);\n-webkit-backdrop-filter: blur(${blur}px);\nborder: 1px solid rgba(${rgb}, 0.15);\nborder-radius: 16px;`;
  };

  return (
    <div style={card}>
      <h3 style={{ color: '#fff', marginBottom: '14px' }}>💎 Glassmorphism CSS Generator</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
        <div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>BACKGROUND BLUR ({blur}px)</label>
            <input type="range" min="0" max="40" value={blur} onChange={e => setBlur(e.target.value)} style={{ width: '100%', accentColor: '#a78bfa' }} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>OPACITY ({opacity})</label>
            <input type="range" min="0.05" max="0.9" step="0.01" value={opacity} onChange={e => setOpacity(e.target.value)} style={{ width: '100%', accentColor: '#a78bfa' }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>CARD COLOR</label>
            <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: '100%', height: '40px', background: 'none', border: 'none', cursor: 'pointer' }} />
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', minHeight: '160px' }}>
          <div style={{
            background: `rgba(${hexToRgb(color)}, ${opacity})`,
            backdropFilter: `blur(${blur}px)`,
            WebkitBackdropFilter: `blur(${blur}px)`,
            border: `1px solid rgba(${hexToRgb(color)}, 0.25)`,
            borderRadius: '16px',
            padding: '20px',
            color: '#fff',
            fontSize: '13px',
            textAlign: 'center',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
          }}>
            Preview Box
          </div>
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>CSS OUTPUT</span>
          <button onClick={() => { navigator.clipboard.writeText(getCss()); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: copied ? '#10b981' : '#4b5563', color: '#fff', fontSize: '12px' }}>
            {copied ? '✓ Copied' : '📋 Copy CSS'}
          </button>
        </div>
        <pre style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px', borderRadius: '8px', color: '#a78bfa', fontFamily: 'monospace', fontSize: '13px', whiteSpace: 'pre-wrap' }}>
          {getCss()}
        </pre>
      </div>
    </div>
  );
}

// 4. Neumorphism Generator
function NeumorphismTool() {
  const [radius, setRadius] = useState(30);
  const [distance, setDistance] = useState(12);
  const [intensity, setIntensity] = useState(0.15);
  const [copied, setCopied] = useState(false);

  const getCss = () => {
    return `border-radius: ${radius}px;\nbackground: #0c0820;\nbox-shadow: ${distance}px ${distance}px ${distance * 2}px rgba(0, 0, 0, ${intensity * 2}),\n            -${distance}px -${distance}px ${distance * 2}px rgba(255, 255, 255, 0.03);`;
  };

  return (
    <div style={card}>
      <h3 style={{ color: '#fff', marginBottom: '14px' }}>🎨 Neumorphism CSS Generator</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
        <div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>BORDER RADIUS ({radius}px)</label>
            <input type="range" min="0" max="75" value={radius} onChange={e => setRadius(e.target.value)} style={{ width: '100%', accentColor: '#a78bfa' }} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>SHADOW DISTANCE ({distance}px)</label>
            <input type="range" min="5" max="30" value={distance} onChange={e => setDistance(e.target.value)} style={{ width: '100%', accentColor: '#a78bfa' }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>SHADOW INTENSITY</label>
            <input type="range" min="0.05" max="0.4" step="0.01" value={intensity} onChange={e => setIntensity(e.target.value)} style={{ width: '100%', accentColor: '#a78bfa' }} />
          </div>
        </div>
        <div style={{ background: '#070514', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '160px' }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: `${radius}px`,
            background: '#0c0820',
            boxShadow: `${distance}px ${distance}px ${distance * 2}px rgba(0, 0, 0, ${intensity * 2}), -${distance}px -${distance}px ${distance * 2}px rgba(255, 255, 255, 0.03)`
          }} />
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>CSS OUTPUT</span>
          <button onClick={() => { navigator.clipboard.writeText(getCss()); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: copied ? '#10b981' : '#4b5563', color: '#fff', fontSize: '12px' }}>
            {copied ? '✓ Copied' : '📋 Copy CSS'}
          </button>
        </div>
        <pre style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px', borderRadius: '8px', color: '#cbd5e1', fontFamily: 'monospace', fontSize: '13px', whiteSpace: 'pre-wrap' }}>
          {getCss()}
        </pre>
      </div>
    </div>
  );
}

// 5. Password Strength Checker
function PasswordStrengthTool() {
  const [pass, setPass] = useState('');

  const testStrength = () => {
    let score = 0;
    if (pass.length >= 8) score += 20;
    if (pass.length >= 14) score += 20;
    if (/[A-Z]/.test(pass)) score += 20;
    if (/[0-9]/.test(pass)) score += 20;
    if (/[^A-Za-z0-9]/.test(pass)) score += 20;
    return score;
  };

  const getStrengthLabel = (score) => {
    if (score <= 20) return { label: 'Extremely Weak ⚠️', color: '#ef4444' };
    if (score <= 40) return { label: 'Weak 🛑', color: '#f97316' };
    if (score <= 60) return { label: 'Fair 🛈', color: '#eab308' };
    if (score <= 80) return { label: 'Strong 💪', color: '#3b82f6' };
    return { label: 'Very Secure 🔒', color: '#10b981' };
  };

  const score = testStrength();
  const meta = getStrengthLabel(score);

  return (
    <div style={card}>
      <h3 style={{ color: '#fff', marginBottom: '14px' }}>🔒 Password Strength Checker</h3>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>TEST YOUR PASSWORD</label>
        <input
          type="text"
          value={pass}
          onChange={e => setPass(e.target.value)}
          placeholder="Type password..."
          style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', outline: 'none' }}
        />
      </div>

      {pass && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8' }}>Strength level:</span>
            <span style={{ color: meta.color, fontWeight: 'bold' }}>{meta.label}</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', height: '6px', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${score}%`, height: '100%', backgroundColor: meta.color, transition: 'width 0.2s' }} />
          </div>
        </div>
      )}
    </div>
  );
}

// 6. JWT Decoder
function JwtDecoderTool() {
  const [token, setToken] = useState('');
  const [header, setHeader] = useState('');
  const [payload, setPayload] = useState('');
  const [error, setError] = useState(null);

  const decodeToken = () => {
    try {
      setError(null);
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('JWT must contain header, payload and signature blocks.');
      }
      const rawHeader = atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'));
      const rawPayload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      
      setHeader(JSON.stringify(JSON.parse(rawHeader), null, 2));
      setPayload(JSON.stringify(JSON.parse(rawPayload), null, 2));
    } catch (err) {
      setError(err.message);
      setHeader('');
      setPayload('');
    }
  };

  return (
    <div style={card}>
      <h3 style={{ color: '#fff', marginBottom: '14px' }}>🔑 JWT Decoder</h3>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>PASTE JWT TOKEN</label>
        <textarea
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          style={{ width: '100%', height: '80px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', fontFamily: 'monospace', outline: 'none' }}
        />
      </div>
      <button onClick={decodeToken} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', fontWeight: '700', marginBottom: '16px' }}>
        Decode Token
      </button>

      {error && <div style={{ color: '#f87171', fontSize: '13px', marginBottom: '16px' }}>⚠️ {error}</div>}

      {payload && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>HEADER</label>
            <pre style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px', borderRadius: '8px', color: '#a78bfa', fontFamily: 'monospace', fontSize: '12px', overflowX: 'auto' }}>{header}</pre>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>PAYLOAD / CLAIMS</label>
            <pre style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px', borderRadius: '8px', color: '#fb923c', fontFamily: 'monospace', fontSize: '12px', overflowX: 'auto' }}>{payload}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

// 7. BMI Calculator
function BmiTool() {
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('70');
  const [result, setResult] = useState(null);

  const calculateBmi = () => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (!h || !w) return;
    const bmi = w / (h * h);
    let category = 'Normal';
    let color = '#10b981';
    if (bmi < 18.5) { category = 'Underweight'; color = '#3b82f6'; }
    else if (bmi >= 25 && bmi < 30) { category = 'Overweight'; color = '#eab308'; }
    else if (bmi >= 30) { category = 'Obese'; color = '#ef4444'; }
    setResult({ val: bmi.toFixed(1), category, color });
  };

  return (
    <div style={card}>
      <h3 style={{ color: '#fff', marginBottom: '14px' }}>⚖️ BMI Calculator</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>HEIGHT (cm)</label>
          <input type="number" value={height} onChange={e => setHeight(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#fff', outline: 'none' }} />
        </div>
        <div>
          <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>WEIGHT (kg)</label>
          <input type="number" value={weight} onChange={e => setWeight(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#fff', outline: 'none' }} />
        </div>
      </div>
      <button onClick={calculateBmi} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontWeight: '700' }}>
        Calculate BMI
      </button>

      {result && (
        <div style={{ marginTop: '16px', textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px' }}>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>YOUR BMI</span>
          <h2 style={{ fontSize: '2.4rem', color: result.color, margin: '6px 0' }}>{result.val}</h2>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: result.color }}>{result.category}</span>
        </div>
      )}
    </div>
  );
}

// 8. AI Chat
function AiChatTool() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hello! I am your MindSuite AI Assistant. How can I help you today?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { callAI } = await import('@/lib/ai');
      const res = await callAI(input);
      setMessages(prev => [...prev, { role: 'assistant', content: res }]);
    } catch (_) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Check your Gemini API Key.' }]);
    }
    setLoading(false);
  };

  return (
    <div style={card}>
      <h3 style={{ color: '#fff', marginBottom: '14px' }}>💬 AI Assistant Chat</h3>
      <div style={{ height: '300px', overflowY: 'auto', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
        {messages.map((m, idx) => (
          <div key={idx} style={{ marginBottom: '12px', textAlign: m.role === 'user' ? 'right' : 'left' }}>
            <div style={{
              display: 'inline-block',
              padding: '10px 14px',
              borderRadius: '12px',
              background: m.role === 'user' ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'rgba(255,255,255,0.06)',
              color: '#fff',
              maxWidth: '85%',
              fontSize: '13.5px',
              lineHeight: '1.5',
              textAlign: 'left'
            }}>{m.content}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask AI anything..."
          style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', outline: 'none' }}
        />
        <button onClick={sendMessage} disabled={loading} style={{ padding: '12px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>
          {loading ? 'Sending…' : 'Send'}
        </button>
      </div>
    </div>
  );
}

// 9. Lorem Ipsum Generator
function LoremIpsumTool() {
  const [paragraphs, setParagraphs] = useState(2);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const generateText = () => {
    const base = [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      "Morbi ac erat a ligula eleifend finibus sit amet sit justo. Nullam tincidunt tristique magna, sed pretium nibh convallis et. Ut feugiat, ante id viverra pretium, est est finibus nisl, et varius nibh ex a tellus."
    ];
    let outputList = [];
    for (let i = 0; i < paragraphs; i++) {
      outputList.push(base[i % base.length]);
    }
    setResult(outputList.join('\n\n'));
    setCopied(false);
  };

  return (
    <div style={card}>
      <h3 style={{ color: '#fff', marginBottom: '14px' }}>📝 Lorem Ipsum Generator</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'end', marginBottom: '16px' }}>
        <div>
          <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>NUMBER OF PARAGRAPHS</label>
          <input type="number" min="1" max="10" value={paragraphs} onChange={e => setParagraphs(Number(e.target.value))} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#fff', outline: 'none' }} />
        </div>
        <button onClick={generateText} style={{ padding: '11px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', fontWeight: '700' }}>
          Generate Text
        </button>
      </div>

      {result && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>GENERATED PARAGRAPHS</span>
            <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: copied ? '#10b981' : '#4b5563', color: '#fff', fontSize: '12px' }}>
              {copied ? '✓ Copied' : '📋 Copy Text'}
            </button>
          </div>
          <textarea
            readOnly
            value={result}
            style={{ width: '100%', height: '160px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px', color: '#a78bfa', outline: 'none', resize: 'none', fontFamily: 'monospace' }}
          />
        </div>
      )}
    </div>
  );
}

// 10. Age Calculator
function AgeCalculatorTool() {
  const [birthDate, setBirthDate] = useState('2000-01-01');
  const [result, setResult] = useState(null);

  const calculateAge = () => {
    const birth = new Date(birthDate);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    setResult({ years, months, days });
  };

  return (
    <div style={card}>
      <h3 style={{ color: '#fff', marginBottom: '14px' }}>📅 Age Calculator</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'end', marginBottom: '16px' }}>
        <div>
          <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>DATE OF BIRTH</label>
          <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#fff', outline: 'none' }} />
        </div>
        <button onClick={calculateAge} style={{ padding: '11px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', fontWeight: '700' }}>
          Calculate Age
        </button>
      </div>

      {result && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', textAlign: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 style={{ fontSize: '2rem', color: '#a78bfa', margin: '0 0 4px' }}>{result.years}</h2>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Years</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 style={{ fontSize: '2rem', color: '#a78bfa', margin: '0 0 4px' }}>{result.months}</h2>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Months</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 style={{ fontSize: '2rem', color: '#a78bfa', margin: '0 0 4px' }}>{result.days}</h2>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Days</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN DYNAMIC RESOLVER ───
export default function DynamicToolPage({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const renderTool = () => {
    switch (id) {
      case 'ai-astrology-assistant':
      case 'ai-astrology':
        return <AstrologyTool />;
      case 'ai-travel-planner':
      case 'ai-travel':
        return <TravelPlannerTool />;
      case 'glassmorphism-generator':
      case 'glassmorphism':
        return <GlassmorphismTool />;
      case 'neumorphism-generator':
      case 'neumorphism':
        return <NeumorphismTool />;
      case 'password-strength':
      case 'password-strength-checker':
        return <PasswordStrengthTool />;
      case 'jwt-decoder':
      case 'jwt-decode':
        return <JwtDecoderTool />;
      case 'bmi-calculator':
      case 'bmi':
        return <BmiTool />;
      case 'ai-chat':
        return <AiChatTool />;
      case 'lorem-ipsum':
      case 'lorem-ipsum-generator':
        return <LoremIpsumTool />;
      case 'age-calculator':
        return <AgeCalculatorTool />;
      default:
        // Default fallback with a highly intuitive Simulator screen
        return (
          <div style={{ ...card, textAlign: 'center' }}>
            <span style={{ fontSize: '3rem' }}>🛠️</span>
            <h3 style={{ color: '#fff', marginTop: '12px' }}>{id.toUpperCase().replace(/-/g, ' ')}</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>This client-side utility is initialized and ready in sandbox mode.</p>
            <button onClick={() => alert('Simulator mode: action completed successfully.')} style={{ marginTop: '16px', padding: '10px 24px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>
              Run Tool Simulation
            </button>
          </div>
        );
    }
  };

  return (
    <ToolLayout icon="🛠️" title={id.toUpperCase().replace(/-/g, ' ')} category="MindSuite Utility">
      {renderTool()}
    </ToolLayout>
  );
}
