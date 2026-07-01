'use client';

export default function Dashboard() {
  const tools = [
    {
      id: 'shopping',
      title: 'ShopMind AI',
      category: 'Shopping Assistant',
      description: 'Find products, compare prices across stores, get budget recommendations, and analyze alternatives using AI.',
      icon: '🛍️',
      active: true,
      link: '/shopping',
      badge: 'Gemini Powered',
      features: ['Web Search Integration', 'Multi-Product Compare', 'Smart Budget Alerts']
    },
    {
      id: 'travel',
      title: 'RouteMind AI',
      category: 'Travel & Route Planner',
      description: 'Interactive map-based travel planner. Compare CNG, Petrol, & Diesel fuel costs, calculate toll plazas, and search car mileages with AI.',
      icon: '🚗',
      active: true,
      link: '/travel',
      badge: 'New Tool',
      features: ['Interactive Leaflet Maps', 'CNG vs Petrol vs Diesel Costing', 'Gemini Vehicle Search', 'Toll Tax Simulation']
    },
    {
      id: 'notemind',
      title: 'NoteMind AI',
      category: 'Smart Notepad',
      description: 'Organize your thoughts, write markdown logs, and automatically summarize notes using local LLM processing.',
      icon: '📝',
      active: false,
      badge: 'Coming Soon',
      features: ['Markdown Formatting', 'AI Quick Summaries', 'PDF & Doc Export']
    },
    {
      id: 'pdfmind',
      title: 'PDFMind AI',
      category: 'Document Utility',
      description: 'Fast, secure client-side document processing tool to split, merge, compress, and extract pages from PDFs.',
      icon: '📄',
      active: false,
      badge: 'Coming Soon',
      features: ['Private Client-Side', 'Meta Editing', 'PDF Compressing']
    }
  ];

  return (
    <>
      {/* Shared animated background elements */}
      <div className="bg-orbs" aria-hidden="true">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>
      <div className="bg-grid" aria-hidden="true" />

      <div className="app-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* HEADER */}
        <header className="header">
          <div className="header-brand">
            <div className="bot-avatar" aria-hidden="true">🌌</div>
            <div>
              <div className="header-title">MindSuite AI</div>
              <div className="header-subtitle">
                <span>✦</span> Your Intelligent Productivity Hub
              </div>
            </div>
          </div>
          <div className="header-right">
            <div className="status-badge" style={{ background: 'rgba(255,255,255,0.05)', color: '#a78bfa', borderColor: 'rgba(167,139,250,0.2)' }}>
              v1.1.0
            </div>
          </div>
        </header>

        {/* HERO SECTION */}
        <main className="chat-area" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
          <div style={{ textAlign: 'center', maxWidth: '800px', marginBottom: '40px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'linear-gradient(90deg, rgba(167,139,250,0.1), rgba(192,132,252,0.1))',
              border: '1px solid rgba(167,139,250,0.2)',
              color: '#c084fc',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '20px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              ✨ Unified Productivity Suite
            </div>
            
            <h1 className="welcome-title" style={{ fontSize: '3rem', lineHeight: '1.2', background: 'linear-gradient(135deg, #fff 30%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              One Workspace.<br />Infinite Utilities.
            </h1>
            
            <p className="welcome-subtitle" style={{ fontSize: '1.15rem', color: '#94a3b8', marginTop: '16px', lineHeight: '1.6' }}>
              Explore smart toolsets designed to save you time. Compare online purchases, estimate travel logistics and fuel dynamics, or organize project notes.
            </p>
          </div>

          {/* GRID OF TOOLS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            width: '100%',
            maxWidth: '1000px',
            padding: '20px 0'
          }}>
            {tools.map((tool) => (
              <div
                key={tool.id}
                style={{
                  position: 'relative',
                  borderRadius: '16px',
                  background: 'rgba(10, 8, 28, 0.55)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: tool.active ? 1 : 0.65,
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
                  overflow: 'hidden'
                }}
                className={tool.active ? 'dashboard-card-active' : ''}
              >
                {/* Visual Glow for Active Cards */}
                {tool.active && (
                  <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '150px',
                    height: '150px',
                    background: tool.id === 'shopping' 
                      ? 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(236,72,153,0) 70%)'
                      : 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0) 70%)',
                    pointerEvents: 'none'
                  }} />
                )}

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '2.5rem' }} role="img" aria-label={tool.title}>{tool.icon}</span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      background: tool.active ? 'rgba(167,139,250,0.12)' : 'rgba(255,255,255,0.05)',
                      border: tool.active ? '1px solid rgba(167,139,250,0.25)' : '1px solid rgba(255,255,255,0.05)',
                      color: tool.active ? '#a78bfa' : '#94a3b8'
                    }}>
                      {tool.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#f8fafc', marginBottom: '6px' }}>
                    {tool.title}
                  </h3>
                  
                  <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: '500', display: 'block', marginBottom: '12px' }}>
                    {tool.category}
                  </span>
                  
                  <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.5', marginBottom: '20px' }}>
                    {tool.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
                    {tool.features.map((feature, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#cbd5e1' }}>
                        <span style={{ color: tool.active ? '#34d399' : '#64748b' }}>✓</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {tool.active ? (
                  <a
                    href={tool.link}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: '600',
                      textDecoration: 'none',
                      transition: 'all 0.25s ease',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)';
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(124, 58, 237, 0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    Open Utility →
                  </a>
                ) : (
                  <button
                    disabled
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.03)',
                      color: '#475569',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'not-allowed',
                      width: '100%'
                    }}
                  >
                    🔒 Coming Soon
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Footer inside main */}
          <footer style={{ marginTop: '60px', color: '#64748b', fontSize: '13px', textAlign: 'center' }}>
            MindSuite AI · Local Intelligent Workspace · Designed for developers
          </footer>
        </main>
      </div>

      <style jsx global>{`
        .dashboard-card-active:hover {
          transform: translateY(-5px);
          border-color: rgba(167, 139, 250, 0.3) !important;
          box-shadow: 0 12px 40px 0 rgba(124, 58, 237, 0.15) !important;
        }
      `}</style>
    </>
  );
}
