'use client';

export default function ToolLayout({ icon, title, category, badgeColor = '#a78bfa', children }) {
  return (
    <>
      <div className="bg-orbs" aria-hidden="true">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>
      <div className="bg-grid" aria-hidden="true" />

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header className="header">
          <div className="header-brand">
            <a
              href="/"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                color: '#94a3b8', fontSize: '13px', fontWeight: '600',
                textDecoration: 'none', padding: '6px 14px', borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)',
                marginRight: '12px', transition: 'all 0.2s ease',
              }}
              onMouseOver={e => { e.currentTarget.style.color = '#f8fafc'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseOut={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            >
              ← Home
            </a>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }} role="img" aria-label={title}>{icon}</span>
            <div>
              <div className="header-title">{title}</div>
              <div style={{ fontSize: '11px', color: badgeColor, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {category}
              </div>
            </div>
          </div>
          <div className="header-right">
            <span style={{ color: '#475569', fontSize: '12px', fontWeight: '600' }}>MindSuite AI</span>
          </div>
        </header>

        <main style={{ flex: 1, padding: '32px 20px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          <div style={{ width: '100%', maxWidth: '900px' }}>
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
