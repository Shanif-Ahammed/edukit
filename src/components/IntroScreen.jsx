import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Sparkles, Users, BarChart3, 
  ArrowRight, ShieldCheck, Sun, Moon, Flame 
} from 'lucide-react';

export default function IntroScreen({ onEnter, theme, toggleTheme }) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [hoveredBadge, setHoveredBadge] = useState(null);

  // Animate elements in sequentially on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleEnterClick = () => {
    setExiting(true);
    setTimeout(() => {
      onEnter();
    }, 450); // Matches scale out animation time
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        background: 'var(--bg-app)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transition: 'background-color var(--transition-smooth), opacity 0.4s ease-out, transform 0.4s ease-out',
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'scale(1.05)' : 'scale(1)',
        padding: '2rem'
      }}
    >
      {/* ── INTERACTIVE MOUSE GRADIENT SPOTLIGHT ───────────────────────── */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle 500px at ${coords.x}px ${coords.y}px, rgba(225, 0, 49, 0.08) 0%, rgba(99, 102, 241, 0.04) 50%, transparent 100%)`,
          pointerEvents: 'none',
          zIndex: 1,
          transition: 'background 0.05s linear'
        }}
      />

      {/* Ambient background particles (glowing spots) */}
      <div 
        className="float-bg"
        style={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(225, 0, 49, 0.03) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <div 
        className="float-bg"
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.02) 0%, transparent 75%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0,
          animationDelay: '-7s'
        }}
      />

      {/* ── MAIN ENTRY CANVAS CARD ─────────────────────────────────────── */}
      <div 
        className="glass-panel"
        style={{
          width: '680px',
          maxWidth: '100%',
          padding: '4rem 3.5rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          background: theme === 'dark' 
            ? 'linear-gradient(135deg, rgba(8, 12, 26, 0.85) 0%, rgba(225, 0, 49, 0.03) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(225, 0, 49, 0.03) 100%)',
          boxShadow: 'var(--shadow-xl), inset 0 1px 0 var(--workspace-banner-inset)',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2.5rem',
          transform: mounted ? 'translateY(0)' : 'translateY(30px)',
          opacity: mounted ? 1 : 0,
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Ambient glare overlay inside the card */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(225, 0, 49, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        {/* Theme Toggle Top Corner Selector */}
        <div style={{ position: 'absolute', top: '1.75rem', right: '1.75rem', zIndex: 10 }}>
          <button 
            className="btn-icon" 
            style={{ width: '38px', height: '38px', borderRadius: '10px' }}
            onClick={toggleTheme}
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        {/* Swiss Brand Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem', zIndex: 1 }}>
          <div 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.55rem', 
              background: 'rgba(225, 0, 49, 0.04)', 
              border: '1px solid rgba(225, 0, 49, 0.15)', 
              padding: '0.45rem 1.25rem', 
              borderRadius: '50px', 
              fontSize: '0.75rem', 
              fontWeight: '800', 
              color: 'var(--primary)', 
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              boxShadow: '0 4px 10px rgba(225,0,49,0.03)'
            }}
          >
            <GraduationCap size={14} />
            Swiss International Scientific School Dubai
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', marginTop: '0.75rem', position: 'relative' }}>
            
            <div style={{
              position: 'relative',
              width: '100px',
              height: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.5rem'
            }}>
              {/* Core Floating Logo Orb */}
              <div 
                className="logo-orb-active"
                style={{
                  position: 'relative',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                  transition: 'all var(--transition-smooth)',
                  padding: '0px'
                }}
              >
                <svg 
                  className="sisd-logo-svg"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 200 200" 
                  style={{ 
                    overflow: 'visible', 
                    isolation: 'isolate', 
                    width: '100%', 
                    height: '100%',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'
                  }}
                >
                  <circle className="sisd-ring sisd-ring-1" cx="100" cy="-8" r="90" />
                  <circle className="sisd-ring sisd-ring-2" cx="100" cy="208" r="90" />
                  <circle className="sisd-ring sisd-ring-3" cx="-8" cy="100" r="90" />
                  <circle className="sisd-ring sisd-ring-4" cx="208" cy="100" r="90" />
                </svg>
              </div>
            </div>

            <h1 style={{ 
              fontSize: '3rem', 
              fontWeight: '900', 
              letterSpacing: '-0.04em',
              fontFamily: 'var(--font-header)',
              margin: 0
            }}>
              SISD <span style={{
                background: 'linear-gradient(135deg, hsl(347, 100%, 46%) 0%, hsl(340, 100%, 36%) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 8px rgba(225,0,49,0.08))'
              }}>EduKit</span>
            </h1>
          </div>

          <p style={{ 
            color: 'var(--text-muted)', 
            fontSize: '1.08rem', 
            lineHeight: '1.6', 
            maxWidth: '520px',
            margin: '0.5rem 0 0 0',
            fontWeight: '400'
          }}>
            Welcome to the premium classroom productivity dashboard. Seamlessly draft reports, design seating charts, and analyze cohort standards in one secure offline ecosystem.
          </p>
        </div>

        {/* ── INTERACTIVE FEATURE BADGES CLUSTER ───────────────────────── */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '1rem',
          width: '100%',
          zIndex: 1
        }}>
          {/* Badge 1: Comment Generator */}
          <div 
            className="glass-panel"
            onMouseEnter={() => setHoveredBadge('comment')}
            onMouseLeave={() => setHoveredBadge(null)}
            style={{
              padding: '1.5rem 1rem',
              borderRadius: '20px',
              border: hoveredBadge === 'comment' ? '1px solid rgba(225, 0, 49, 0.35)' : '1px solid var(--border-color)',
              background: hoveredBadge === 'comment' ? 'rgba(225, 0, 49, 0.03)' : 'rgba(255, 255, 255, 0.01)',
              transform: hoveredBadge === 'comment' ? 'scale(1.04) translateY(-4px)' : 'scale(1) translateY(0)',
              transition: 'all var(--transition-fast)',
              cursor: 'default'
            }}
          >
            <div style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '10px', 
              background: 'rgba(225, 0, 49, 0.08)', 
              color: 'var(--primary)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 0.85rem auto'
            }}>
              <Sparkles size={18} />
            </div>
            <h3 style={{ fontSize: '0.94rem', fontWeight: '800', marginBottom: '0.35rem' }}>Comment Gen</h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Criterion Report Drafts</span>
          </div>

          {/* Badge 2: Seating Chart */}
          <div 
            className="glass-panel"
            onMouseEnter={() => setHoveredBadge('seating')}
            onMouseLeave={() => setHoveredBadge(null)}
            style={{
              padding: '1.5rem 1rem',
              borderRadius: '20px',
              border: hoveredBadge === 'seating' ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid var(--border-color)',
              background: hoveredBadge === 'seating' ? 'rgba(99, 102, 241, 0.03)' : 'rgba(255, 255, 255, 0.01)',
              transform: hoveredBadge === 'seating' ? 'scale(1.04) translateY(-4px)' : 'scale(1) translateY(0)',
              transition: 'all var(--transition-fast)',
              cursor: 'default'
            }}
          >
            <div style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '10px', 
              background: 'rgba(99, 102, 241, 0.08)', 
              color: 'var(--accent)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 0.85rem auto'
            }}>
              <Users size={18} />
            </div>
            <h3 style={{ fontSize: '0.94rem', fontWeight: '800', marginBottom: '0.35rem' }}>Seating Chart</h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Behavioral Class Maps</span>
          </div>

          {/* Badge 3: Data Analysis */}
          <div 
            className="glass-panel"
            onMouseEnter={() => setHoveredBadge('analysis')}
            onMouseLeave={() => setHoveredBadge(null)}
            style={{
              padding: '1.5rem 1rem',
              borderRadius: '20px',
              border: hoveredBadge === 'analysis' ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid var(--border-color)',
              background: hoveredBadge === 'analysis' ? 'rgba(16, 185, 129, 0.03)' : 'rgba(255, 255, 255, 0.01)',
              transform: hoveredBadge === 'analysis' ? 'scale(1.04) translateY(-4px)' : 'scale(1) translateY(0)',
              transition: 'all var(--transition-fast)',
              cursor: 'default'
            }}
          >
            <div style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '10px', 
              background: 'rgba(16, 185, 129, 0.08)', 
              color: '#10b981', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 0.85rem auto'
            }}>
              <BarChart3 size={18} />
            </div>
            <h3 style={{ fontSize: '0.94rem', fontWeight: '800', marginBottom: '0.35rem' }}>Cohort Analytics</h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>KHDA Grade Metrics</span>
          </div>
        </div>

        {/* ── HIGH-IMPACT CTAs & ENTRY TRIGGER ──────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', alignItems: 'center', zIndex: 1 }}>
          <button 
            className="btn btn-primary"
            onClick={handleEnterClick}
            style={{
              padding: '1.15rem 3.5rem',
              fontSize: '1.1rem',
              borderRadius: '40px',
              gap: '0.75rem',
              fontWeight: '850',
              boxShadow: '0 8px 35px rgba(225, 0, 49, 0.45)',
              transition: 'all var(--transition-smooth)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 12px 45px rgba(225, 0, 49, 0.65)';
              e.currentTarget.style.transform = 'scale(1.04) translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 35px rgba(225, 0, 49, 0.45)';
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
            }}
          >
            ⚡ Enter Educator Workspace
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Client-Side Privacy Shield Guarantee */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.55rem', 
          borderTop: '1px solid var(--border-color)', 
          width: '100%', 
          paddingTop: '1.5rem', 
          zIndex: 1 
        }}>
          <ShieldCheck size={16} style={{ color: '#10b981' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            🔒 100% Client-Side Privacy: Pupil data never leaves your browser sandbox.
          </span>
        </div>
      </div>
    </div>
  );
}
