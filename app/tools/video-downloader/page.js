'use client';
import { useState } from 'react';
import ToolLayout from '@/app/components/ToolLayout';

const card = { background: 'rgba(10,8,28,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };
const btn = (col) => ({ padding: '14px 28px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: `linear-gradient(135deg,${col})`, color: '#fff', fontSize: '15px', fontWeight: '700' });

const PLATFORMS = [
  { name: 'YouTube', icon: '📺', color: '#ff0000', domains: ['youtube.com', 'youtu.be'] },
  { name: 'Instagram', icon: '📸', color: '#e1306c', domains: ['instagram.com'] },
  { name: 'LinkedIn', icon: '💼', color: '#0077b5', domains: ['linkedin.com'] },
  { name: 'Facebook', icon: '👥', color: '#1877f2', domains: ['facebook.com', 'fb.watch'] },
  { name: 'TikTok', icon: '🎵', color: '#00f2fe', domains: ['tiktok.com'] },
  { name: 'Twitter / X', icon: '🐦', color: '#1da1f2', domains: ['twitter.com', 'x.com'] },
];

export default function VideoDownloader() {
  const [url, setUrl] = useState('');
  const [downloadMode, setDownloadMode] = useState('auto'); // auto, audio, mute
  const [videoQuality, setVideoQuality] = useState('1080'); // max, 1080, 720, 480
  const [audioFormat, setAudioFormat] = useState('mp3');
  const [filenameStyle, setFilenameStyle] = useState('basic'); // basic, classic, pretty, nerdy
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const getPlatformIcon = (link) => {
    try {
      const hostname = new URL(link).hostname.toLowerCase();
      const p = PLATFORMS.find(platform => platform.domains.some(d => hostname.includes(d)));
      return p ? p : null;
    } catch {
      return null;
    }
  };

  const handleFetch = async () => {
    if (!url.trim()) { setError('Please enter a video link.'); return; }
    setLoading(true); setError(null); setResult(null);

    const detected = getPlatformIcon(url);

    try {
      const payload = {
        url: url.trim(),
        downloadMode,
        videoQuality,
        audioFormat,
        filenameStyle,
      };

      const res = await fetch('https://api.cobalt.tools/', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        let errJson;
        try { errJson = JSON.parse(errText); } catch { errJson = null; }
        throw new Error(errJson?.error?.code || errJson?.text || 'Failed to parse video. Cobalt API might be experiencing rate limits or this URL is protected.');
      }

      const data = await res.json();

      if (data.status === 'error') {
        throw new Error(data.error?.code || 'Cobalt API was unable to fetch this video.');
      }

      setResult({
        ...data,
        platform: detected || { name: 'Unknown Video Source', icon: '🔗', color: '#10b981' }
      });
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout icon="📥" title="Universal Video Downloader" category="Creator Tools" badgeColor="#3b82f6">
      <div style={{ ...card, background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.15)' }}>
        <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: 0 }}>
          ℹ️ Direct, private media downloader. Just paste the link to download videos from **YouTube**, **LinkedIn**, **Instagram**, **Facebook**, **TikTok**, and more. 
        </p>
      </div>

      <div style={card}>
        <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '8px', fontWeight: '700' }}>PASTE VIDEO LINK</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="e.g., https://www.youtube.com/watch?v=... or Instagram Reel url"
            style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px', color: '#fff', fontSize: '14px', outline: 'none' }}
          />
          <button onClick={handleFetch} disabled={loading} style={{ ...btn('#3b82f6,#2563eb'), flexShrink: 0 }}>
            {loading ? '⏳ Fetching…' : '📥 Download'}
          </button>
        </div>
      </div>

      {/* Downloader Settings */}
      {!result && !loading && (
        <div style={card}>
          <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>DOWNLOAD OPTIONS</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>DOWNLOAD MODE</label>
              <select value={downloadMode} onChange={e => setDownloadMode(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: '13px' }}>
                <option value="auto">Video + Audio</option>
                <option value="audio">Audio Only</option>
                <option value="mute">Video Only (Mute)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>VIDEO QUALITY</label>
              <select value={videoQuality} onChange={e => setVideoQuality(e.target.value)} disabled={downloadMode === 'audio'} style={{ width: '100%', padding: '9px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: '13px', opacity: downloadMode === 'audio' ? 0.5 : 1 }}>
                <option value="max">Max Quality</option>
                <option value="1080">1080p Full HD</option>
                <option value="720">720p HD</option>
                <option value="480">480p SD</option>
                <option value="360">360p</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>AUDIO FORMAT</label>
              <select value={audioFormat} onChange={e => setAudioFormat(e.target.value)} disabled={downloadMode === 'mute'} style={{ width: '100%', padding: '9px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: '13px', opacity: downloadMode === 'mute' ? 0.5 : 1 }}>
                <option value="mp3">MP3 (Universal)</option>
                <option value="wav">WAV (Lossless)</option>
                <option value="opus">Opus (Optimized)</option>
                <option value="ogg">Ogg Vorbis</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>FILE NAME STYLE</label>
            <select value={filenameStyle} onChange={e => setFilenameStyle(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: '13px' }}>
              <option value="basic">Basic (Title only)</option>
              <option value="pretty">Pretty (Clean formatting)</option>
              <option value="classic">Classic (Original service name)</option>
              <option value="nerdy">Nerdy (Includes quality & codec)</option>
            </select>
          </div>
        </div>
      )}

      {/* Supported Platforms Info Grid */}
      {!result && !loading && (
        <div style={card}>
          <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>SUPPORTED NETWORKS</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {PLATFORMS.map(p => (
              <div key={p.name} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px', textAlign: 'center', transition: 'all 0.2s' }}>
                <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '6px' }}>{p.icon}</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px', color: '#f87171', marginBottom: '16px' }}>
          ⚠️ {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(59,130,246,0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Connecting to API and parsing streaming endpoints...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Downloader Result Screen */}
      {result && (
        <div style={{ ...card, border: `1px solid ${result.platform.color}55` }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '58px', height: '58px', borderRadius: '50%', background: `${result.platform.color}15`, border: `1px solid ${result.platform.color}33`, marginBottom: '12px', fontSize: '2rem' }}>
              {result.platform.icon}
            </div>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', margin: '0 0 4px' }}>Video Parsed Successfully!</h3>
            <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '6px', background: `${result.platform.color}18`, color: result.platform.color, fontWeight: '700', textTransform: 'uppercase' }}>
              {result.platform.name}
            </span>
          </div>

          {result.status === 'redirect' || result.status === 'tunnel' ? (
            <div style={{ marginTop: '16px' }}>
              <a
                href={result.url}
                download
                target="_blank"
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: `linear-gradient(135deg, ${result.platform.color}, #1e293b)`, color: '#fff', fontSize: '15px', fontWeight: '800', textDecoration: 'none', boxShadow: `0 4px 20px ${result.platform.color}33` }}
              >
                ⬇️ Download Media File
              </a>
            </div>
          ) : result.status === 'picker' ? (
            <div>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '12px' }}>Multiple media items detected (Slideshow/Album):</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {result.picker.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'block', padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', textDecoration: 'none', textAlign: 'center', fontSize: '12px', fontWeight: '600' }}
                  >
                    item #{idx + 1} ({item.type || 'Media'})
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          <button onClick={() => setResult(null)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px', marginTop: '14px' }}>
            Download Another Video
          </button>
        </div>
      )}
    </ToolLayout>
  );
}
