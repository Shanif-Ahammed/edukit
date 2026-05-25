import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, LayoutDashboard, Sparkles, Users, 
  BarChart3, Grid, Layers, Sun, Moon, HelpCircle, Mail,
  Database, Lock, Unlock, CheckCircle2, AlertCircle, MessageSquare,
  BookOpen, ChevronLeft, ChevronRight
} from 'lucide-react';
import { DataProvider, useData } from './context/DataContext';
import HeaderNav from './components/HeaderNav';
import Dashboard from './tools/Dashboard';
import CommentGenerator from './tools/CommentGenerator';
import SeatingChart from './tools/SeatingChart';
import DataAnalysis from './tools/DataAnalysis';
import ATLTracker from './tools/ATLTracker';
import Utilities from './tools/Utilities';
import AiAssistant from './tools/AiAssistant';
import TeacherToolkit from './tools/TeacherToolkit';
import PortalHelp from './tools/PortalHelp';
import IntroScreen from './components/IntroScreen';
import LoadingScreen from './components/LoadingScreen';
import './App.css';

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}

function AppContent() {
  const [activeTool, setActiveTool] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [showIntro, setShowIntro] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const { fileConnected, students, classes, fileName } = useData();

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('edukit_theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Update theme helper
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('edukit_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  if (showIntro) {
    if (showLoading) {
      return <LoadingScreen theme={theme} onComplete={() => { setShowIntro(false); setShowLoading(false); }} />;
    }
    return <IntroScreen onEnter={() => setShowLoading(true)} theme={theme} toggleTheme={toggleTheme} />;
  }

  return (
    <div className="app-container">
      {/* ── AMBIENT FLOATING GLOW VECTORS ──────────────────────────────── */}
      <div 
        style={{
          position: 'absolute',
          top: '8%',
          right: '8%',
          width: '450px',
          height: '450px',
          background: 'radial-gradient(circle, rgba(225, 0, 49, 0.04) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0
        }} 
        className="float-bg" 
      />
      <div 
        style={{
          position: 'absolute',
          bottom: '12%',
          left: '25%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.03) 0%, transparent 75%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 0
        }} 
        className="float-bg" 
      />

      {/* ── 1. SIDEBAR NAVIGATION ───────────────────────────────────────── */}
      <aside 
        className="sidebar"
        style={{
          width: sidebarCollapsed ? '80px' : '290px',
          padding: sidebarCollapsed ? '2rem 0.75rem' : '2rem 1.35rem',
        }}
      >
        {/* Sidebar Collapse Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="sidebar-toggle-btn"
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Brand Header */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            gap: sidebarCollapsed ? '0' : '1rem', 
            marginBottom: '2.5rem',
            cursor: 'pointer',
            padding: sidebarCollapsed ? '0' : '0 0.25rem'
          }}
          onClick={() => setActiveTool('dashboard')}
        >
          <div style={{
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            flexShrink: 0
          }}>
            <svg 
              className="sisd-logo-svg logo-orb-active"
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="-110 -110 420 420" 
              style={{ 
                overflow: 'visible', 
                isolation: 'isolate', 
                width: '100%', 
                height: '100%',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))'
              }}
            >
              <circle className="sisd-ring sisd-ring-1" cx="100" cy="-8" r="90" style={{ strokeWidth: '16px' }} />
              <circle className="sisd-ring sisd-ring-2" cx="100" cy="208" r="90" style={{ strokeWidth: '16px' }} />
              <circle className="sisd-ring sisd-ring-3" cx="-8" cy="100" r="90" style={{ strokeWidth: '16px' }} />
              <circle className="sisd-ring sisd-ring-4" cx="208" cy="100" r="90" style={{ strokeWidth: '16px' }} />
            </svg>
          </div>
          {!sidebarCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '850', lineHeight: 1, letterSpacing: '-0.04em' }}>SISD EduKit</h2>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.12em', lineHeight: 1 }}>TEACHER PORTAL</span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav style={{ overflow: sidebarCollapsed ? 'visible' : 'auto' }}>
          {/* Standout AI Assistant Tab */}
          <button 
            className={`btn ${activeTool === 'ai-assistant' ? 'glass-panel-active' : ''}`}
            style={{ 
              position: 'relative',
              justifyContent: sidebarCollapsed ? 'center' : 'space-between', 
              border: activeTool === 'ai-assistant' ? '1px solid #fbbf24' : '1px solid rgba(245, 158, 11, 0.25)', 
              background: activeTool === 'ai-assistant' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'rgba(245, 158, 11, 0.04)',
              color: activeTool === 'ai-assistant' ? '#fff' : '#fbbf24',
              fontWeight: '800',
              padding: sidebarCollapsed ? '0.7rem 0' : '0.7rem 1.15rem',
              fontSize: '0.86rem',
              borderRadius: '12px',
              marginBottom: '0.75rem',
              boxShadow: activeTool === 'ai-assistant' ? '0 6px 16px rgba(245, 158, 11, 0.25)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
            onClick={() => setActiveTool('ai-assistant')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: sidebarCollapsed ? '0' : '0.6rem', justifyContent: 'center' }}>
              <MessageSquare size={16} />
              {!sidebarCollapsed && <span>AI Assistant</span>}
            </div>
            {!sidebarCollapsed && (
              <span style={{ 
                fontSize: '0.62rem', 
                background: activeTool === 'ai-assistant' ? 'rgba(0,0,0,0.2)' : 'rgba(245, 158, 11, 0.12)', 
                padding: '0.15rem 0.45rem', 
                borderRadius: '4px',
                color: activeTool === 'ai-assistant' ? '#fff' : '#fbbf24'
              }}>
                Core
              </span>
            )}
            {sidebarCollapsed && <span className="sidebar-tooltip">AI Assistant</span>}
          </button>
          
          {/* Dashboard Tab */}
          <button 
            className="btn"
            style={{ 
              position: 'relative',
              justifyContent: sidebarCollapsed ? 'center' : 'space-between', 
              background: activeTool === 'dashboard' ? 'var(--bg-card-hover)' : 'transparent',
              borderColor: activeTool === 'dashboard' ? 'var(--border-color-hover)' : 'transparent',
              color: activeTool === 'dashboard' ? 'var(--text-main)' : 'var(--text-muted)',
              borderRadius: '12px',
              padding: sidebarCollapsed ? '0.7rem 0' : '0.7rem 1.15rem',
              fontSize: '0.88rem'
            }}
            onClick={() => setActiveTool('dashboard')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: sidebarCollapsed ? '0' : '0.6rem', justifyContent: 'center' }}>
              <LayoutDashboard size={16} style={{ color: activeTool === 'dashboard' ? 'var(--primary)' : 'var(--text-muted)', transition: 'color 0.2s' }} />
              {!sidebarCollapsed && <span>Dashboard</span>}
            </div>
            {!sidebarCollapsed && activeTool === 'dashboard' && (
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }} />
            )}
            {sidebarCollapsed && <span className="sidebar-tooltip">Dashboard</span>}
          </button>

          {/* Comment Generator Tab */}
          <button 
            className="btn"
            style={{ 
              position: 'relative',
              justifyContent: sidebarCollapsed ? 'center' : 'space-between', 
              background: activeTool === 'comment' ? 'var(--bg-card-hover)' : 'transparent',
              borderColor: activeTool === 'comment' ? 'var(--border-color-hover)' : 'transparent',
              color: activeTool === 'comment' ? 'var(--text-main)' : 'var(--text-muted)',
              borderRadius: '12px',
              padding: sidebarCollapsed ? '0.7rem 0' : '0.7rem 1.15rem',
              fontSize: '0.88rem'
            }}
            onClick={() => setActiveTool('comment')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: sidebarCollapsed ? '0' : '0.6rem', justifyContent: 'center' }}>
              <Sparkles size={16} style={{ color: activeTool === 'comment' ? 'var(--primary)' : 'var(--text-muted)', transition: 'color 0.2s' }} />
              {!sidebarCollapsed && <span>Comment Gen</span>}
            </div>
            {!sidebarCollapsed && (
              fileConnected ? (
                <span style={{ fontSize: '0.68rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '6px', color: '#10b981', fontWeight: '800' }}>
                  {students.length}
                </span>
              ) : (
                <Lock size={12} style={{ opacity: 0.5 }} />
              )
            )}
            {sidebarCollapsed && <span className="sidebar-tooltip">Comment Gen</span>}
          </button>

          {/* Seating Planner Tab */}
          <button 
            className="btn"
            style={{ 
              position: 'relative',
              justifyContent: sidebarCollapsed ? 'center' : 'space-between', 
              background: activeTool === 'seating' ? 'var(--bg-card-hover)' : 'transparent',
              borderColor: activeTool === 'seating' ? 'var(--border-color-hover)' : 'transparent',
              color: activeTool === 'seating' ? 'var(--text-main)' : 'var(--text-muted)',
              borderRadius: '12px',
              padding: sidebarCollapsed ? '0.7rem 0' : '0.7rem 1.15rem',
              fontSize: '0.88rem'
            }}
            onClick={() => setActiveTool('seating')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: sidebarCollapsed ? '0' : '0.6rem', justifyContent: 'center' }}>
              <Users size={16} style={{ color: activeTool === 'seating' ? 'var(--accent)' : 'var(--text-muted)', transition: 'color 0.2s' }} />
              {!sidebarCollapsed && <span>Seating Chart</span>}
            </div>
            {!sidebarCollapsed && !fileConnected && <Lock size={12} style={{ opacity: 0.5 }} />}
            {sidebarCollapsed && <span className="sidebar-tooltip">Seating Chart</span>}
          </button>

          {/* Data Analysis Tab */}
          <button 
            className="btn"
            style={{ 
              position: 'relative',
              justifyContent: sidebarCollapsed ? 'center' : 'space-between', 
              background: activeTool === 'analysis' ? 'var(--bg-card-hover)' : 'transparent',
              borderColor: activeTool === 'analysis' ? 'var(--border-color-hover)' : 'transparent',
              color: activeTool === 'analysis' ? 'var(--text-main)' : 'var(--text-muted)',
              borderRadius: '12px',
              padding: sidebarCollapsed ? '0.7rem 0' : '0.7rem 1.15rem',
              fontSize: '0.88rem'
            }}
            onClick={() => setActiveTool('analysis')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: sidebarCollapsed ? '0' : '0.6rem', justifyContent: 'center' }}>
              <BarChart3 size={16} style={{ color: activeTool === 'analysis' ? 'var(--primary)' : 'var(--text-muted)', transition: 'color 0.2s' }} />
              {!sidebarCollapsed && <span>Cohort Analysis</span>}
            </div>
            {!sidebarCollapsed && !fileConnected && <Lock size={12} style={{ opacity: 0.5 }} />}
            {sidebarCollapsed && <span className="sidebar-tooltip">Cohort Analysis</span>}
          </button>

          {/* Gradebook Preview Tab */}
          <button 
            className="btn"
            style={{ 
              position: 'relative',
              justifyContent: sidebarCollapsed ? 'center' : 'space-between', 
              background: activeTool === 'atl' ? 'var(--bg-card-hover)' : 'transparent',
              borderColor: activeTool === 'atl' ? 'var(--border-color-hover)' : 'transparent',
              color: activeTool === 'atl' ? 'var(--text-main)' : 'var(--text-muted)',
              borderRadius: '12px',
              padding: sidebarCollapsed ? '0.7rem 0' : '0.7rem 1.15rem',
              fontSize: '0.88rem'
            }}
            onClick={() => setActiveTool('atl')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: sidebarCollapsed ? '0' : '0.6rem', justifyContent: 'center' }}>
              <Grid size={16} style={{ color: activeTool === 'atl' ? 'var(--accent)' : 'var(--text-muted)', transition: 'color 0.2s' }} />
              {!sidebarCollapsed && <span>Gradebook List</span>}
            </div>
            {!sidebarCollapsed && !fileConnected && <Lock size={12} style={{ opacity: 0.5 }} />}
            {sidebarCollapsed && <span className="sidebar-tooltip">Gradebook List</span>}
          </button>

          {/* Utilities Tab */}
          <button 
            className="btn"
            style={{ 
              position: 'relative',
              justifyContent: sidebarCollapsed ? 'center' : 'space-between', 
              background: activeTool === 'utilities' ? 'var(--bg-card-hover)' : 'transparent',
              borderColor: activeTool === 'utilities' ? 'var(--border-color-hover)' : 'transparent',
              color: activeTool === 'utilities' ? 'var(--text-main)' : 'var(--text-muted)',
              borderRadius: '12px',
              padding: sidebarCollapsed ? '0.7rem 0' : '0.7rem 1.15rem',
              fontSize: '0.88rem'
            }}
            onClick={() => setActiveTool('utilities')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: sidebarCollapsed ? '0' : '0.6rem', justifyContent: 'center' }}>
              <Layers size={16} style={{ color: activeTool === 'utilities' ? 'var(--primary)' : 'var(--text-muted)', transition: 'color 0.2s' }} />
              {!sidebarCollapsed && <span>Utilities</span>}
            </div>
            {sidebarCollapsed && <span className="sidebar-tooltip">Utilities</span>}
          </button>

          {/* Teacher Toolkit Tab */}
          <button 
            className="btn"
            style={{ 
              position: 'relative',
              justifyContent: sidebarCollapsed ? 'center' : 'space-between', 
              background: activeTool === 'toolkit' ? 'var(--bg-card-hover)' : 'transparent',
              borderColor: activeTool === 'toolkit' ? 'var(--border-color-hover)' : 'transparent',
              color: activeTool === 'toolkit' ? 'var(--text-main)' : 'var(--text-muted)',
              borderRadius: '12px',
              padding: sidebarCollapsed ? '0.7rem 0' : '0.7rem 1.15rem',
              fontSize: '0.88rem'
            }}
            onClick={() => setActiveTool('toolkit')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: sidebarCollapsed ? '0' : '0.6rem', justifyContent: 'center' }}>
              <BookOpen size={16} style={{ color: activeTool === 'toolkit' ? 'var(--primary)' : 'var(--text-muted)', transition: 'color 0.2s' }} />
              {!sidebarCollapsed && <span>Teacher Toolkit</span>}
            </div>
            {!sidebarCollapsed && activeTool === 'toolkit' && (
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }} />
            )}
            {sidebarCollapsed && <span className="sidebar-tooltip">Teacher Toolkit</span>}
          </button>
        </nav>

        {/* Sidebar Footer Controls & Connection Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          
          {/* Connection Status Card */}
          <div className="glass-panel" style={{
            position: 'relative',
            padding: sidebarCollapsed ? '0.75rem 0' : '0.75rem 0.85rem',
            borderRadius: '12px',
            background: fileConnected ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.01)',
            borderColor: fileConnected ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: sidebarCollapsed ? '0' : '0.6rem'
          }}
          >
            {fileConnected ? (
              <>
                <Unlock size={14} style={{ color: '#10b981' }} />
                {!sidebarCollapsed && (
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: '0.65rem', display: 'block', color: 'var(--text-muted)', fontWeight: '750', textTransform: 'uppercase' }}>Database</span>
                    <span style={{ fontSize: '0.75rem', display: 'block', fontWeight: '700', color: '#10b981', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {fileName}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <>
                <Lock size={14} style={{ color: 'var(--warning)', opacity: 0.8 }} />
                {!sidebarCollapsed && (
                  <div>
                    <span style={{ fontSize: '0.65rem', display: 'block', color: 'var(--text-muted)', fontWeight: '750', textTransform: 'uppercase' }}>Database</span>
                    <span style={{ fontSize: '0.75rem', display: 'block', fontWeight: '700', color: 'var(--text-muted)' }}>Disconnected</span>
                  </div>
                )}
              </>
            )}
            {sidebarCollapsed && (
              <span className="sidebar-tooltip">
                {fileConnected ? `Database Connected: ${fileName}` : "Database Disconnected"}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: sidebarCollapsed ? 'column' : 'row', gap: '0.5rem', width: '100%', alignItems: 'center' }}>
            {/* Theme Toggle Button */}
            <button 
              className="btn-icon" 
              style={{ position: 'relative', width: sidebarCollapsed ? '100%' : 'auto', flexGrow: 1, borderRadius: '10px' }}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              {sidebarCollapsed && <span className="sidebar-tooltip">{theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>}
            </button>
            {/* EduKit Help Button */}
            <button 
              className="btn-icon" 
              style={{ 
                position: 'relative',
                width: sidebarCollapsed ? '100%' : 'auto',
                flexGrow: 1, 
                borderRadius: '10px',
                background: activeTool === 'help' ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                borderColor: activeTool === 'help' ? 'var(--primary)' : 'var(--border-color)',
                boxShadow: activeTool === 'help' ? '0 0 10px var(--primary-glow)' : 'none'
              }}
              onClick={() => setActiveTool('help')}
            >
              <HelpCircle size={16} style={{ color: activeTool === 'help' ? 'var(--primary)' : 'var(--text-main)' }} />
              {sidebarCollapsed && <span className="sidebar-tooltip">EduKit Portal Help Guide</span>}
            </button>
            {/* Feedback Button */}
            <button 
              className="btn-icon" 
              style={{ 
                position: 'relative',
                width: sidebarCollapsed ? '100%' : 'auto',
                flexGrow: 1, 
                borderRadius: '10px',
                background: 'var(--bg-card)',
                borderColor: 'var(--border-color)'
              }}
              onClick={() => window.location.href = 'mailto:shanif.ahammed@sisd.ae?subject=FEEDBACK:EduKit'}
            >
              <Mail size={16} style={{ color: 'var(--text-main)' }} />
              {sidebarCollapsed && <span className="sidebar-tooltip">Send Feedback</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* ── 2. MAIN APPLICATION CONTENT AREA ────────────────────────────── */}
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Central Shared iSAMS Header Navigation */}
        <HeaderNav />

        {/* Conditionally Render Active Tool */}
        <div style={{ flexGrow: 1, position: 'relative', zIndex: 1 }}>
          {activeTool === 'dashboard' && <Dashboard setActiveTool={setActiveTool} />}
          {activeTool === 'comment' && <CommentGenerator />}
          {activeTool === 'seating' && <SeatingChart />}
          {activeTool === 'analysis' && <DataAnalysis />}
          {activeTool === 'atl' && <ATLTracker />}
          {activeTool === 'utilities' && <Utilities />}
          {activeTool === 'ai-assistant' && <AiAssistant />}
          {activeTool === 'toolkit' && <TeacherToolkit />}
          {activeTool === 'help' && <PortalHelp />}
        </div>
      </main>
    </div>
  );
}

