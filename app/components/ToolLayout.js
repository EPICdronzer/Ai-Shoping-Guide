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

        {/* ─── CLEAN HEADER ─── */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px', height: '58px',
          background: 'rgba(5,3,14,0.82)',
          backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 1px 24px 0 rgba(0,0,0,0.4)',
        }}>

          {/* LEFT: back + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
            <a
              href="/"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                fontSize: '12px', fontWeight: '600', color: '#64748b',
                textDecoration: 'none', letterSpacing: '0.2px',
                transition: 'color 0.2s', flexShrink: 0,
              }}
              onMouseOver={e => e.currentTarget.style.color = '#a78bfa'}
              onMouseOut={e => e.currentTarget.style.color = '#64748b'}
            >
              &#8592;<span className="home-label"> Home</span>
            </a>

            {/* divider */}
            <span style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

            {/* title */}
            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '15px', fontWeight: '800',
              background: 'linear-gradient(135deg, #fff 40%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              letterSpacing: '-0.3px',
            }}>{title}</span>
          </div>

          {/* RIGHT: brand pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 14px', borderRadius: '100px',
            background: 'rgba(167,139,250,0.07)',
            border: '1px solid rgba(167,139,250,0.18)',
            fontSize: '12px', fontWeight: '700',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.08) 100%)',
            color: '#a78bfa', flexShrink: 0, letterSpacing: '0.2px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a78bfa', display: 'inline-block', boxShadow: '0 0 6px #a78bfa' }} />
            MindSuite AI
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
