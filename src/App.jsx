import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, LayoutDashboard, Sparkles, Users, 
  BarChart3, Grid, Layers, Sun, Moon, HelpCircle, Mail,
  Database, Lock, Unlock, CheckCircle2, AlertCircle, MessageSquare,
  BookOpen, ChevronLeft, ChevronRight
} from 'lucide-react';
import { DataProvider, useData } from './context/DataContext';
import { FEATURES } from './config/features';
import HeaderNav from './components/HeaderNav';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './tools/Dashboard';
import CommentGenerator from './tools/CommentGenerator';
import SeatingChart from './tools/SeatingChart';
import DataAnalysis from './tools/DataAnalysis';
import GradebookList from './tools/GradebookList';
import Utilities from './tools/Utilities';
import AiAssistant from './tools/AiAssistant';
import TeacherToolkit from './tools/TeacherToolkit';
import PortalHelp from './tools/PortalHelp';
import IntroScreen from './components/IntroScreen';
import LoadingScreen from './components/LoadingScreen';
import './App.css';

export default function App() {
  return (
    <ErrorBoundary>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const [activeTool, setActiveTool] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [showIntro, setShowIntro] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const { fileConnected, students, classes, fileName } = useData();

  // Feedback Modal States
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState('');
  const [feedbackToolArea, setFeedbackToolArea] = useState('');
  const [feedbackGradeLevel, setFeedbackGradeLevel] = useState('');
  const [feedbackText, setFeedbackText] = useState('');

  // Draft email and open Outlook
  const handleSendFeedback = (e) => {
    e.preventDefault();
    if (!feedbackCategory || !feedbackToolArea || !feedbackGradeLevel || !feedbackText.trim()) return;

    const email = 'shanif.ahammed@sisd.ae';
    const subject = `[EduKit Feedback] ${feedbackCategory} - ${feedbackToolArea}`;
    const body = `Dear Developer,

Here is my structured feedback for SISD EduKit:

--------------------------------------------------
Feedback Category: ${feedbackCategory}
Target Tool/Area: ${feedbackToolArea}
Grade Level/Section: ${feedbackGradeLevel}
--------------------------------------------------

Message:
${feedbackText}

--------------------------------------------------
Sent from SISD EduKit Teacher Portal`;

    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Close modal & reset fields
    setShowFeedback(false);
    setFeedbackCategory('');
    setFeedbackToolArea('');
    setFeedbackGradeLevel('');
    setFeedbackText('');
  };

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
            className="btn"
            style={{
              position: 'relative',
              justifyContent: sidebarCollapsed ? 'center' : 'space-between',
              border: activeTool === 'ai-assistant' ? '1px solid var(--border-color-hover)' : '1px solid var(--border-color)',
              background: activeTool === 'ai-assistant' ? 'var(--bg-card-hover)' : 'transparent',
              color: activeTool === 'ai-assistant' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: '800',
              padding: sidebarCollapsed ? '0.7rem 0' : '0.7rem 1.15rem',
              fontSize: '0.86rem',
              borderRadius: '12px',
              marginBottom: '0.75rem',
              cursor: FEATURES.aiAssistant ? 'pointer' : 'not-allowed',
              opacity: FEATURES.aiAssistant ? 1 : 0.65,
              transition: 'all var(--transition-fast)'
            }}
            onClick={FEATURES.aiAssistant ? () => setActiveTool('ai-assistant') : undefined}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: sidebarCollapsed ? '0' : '0.6rem', justifyContent: 'center' }}>
              <MessageSquare size={16} style={{ color: activeTool === 'ai-assistant' ? 'var(--primary)' : undefined }} />
              {!sidebarCollapsed && <span>AI Assistant</span>}
            </div>
            {!sidebarCollapsed && !FEATURES.aiAssistant && (
              <span style={{
                fontSize: '0.62rem',
                background: 'rgba(245, 158, 11, 0.1)',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                color: '#fbbf24',
                border: '1px solid rgba(245, 158, 11, 0.25)'
              }}>
                Soon
              </span>
            )}
            {!sidebarCollapsed && FEATURES.aiAssistant && activeTool === 'ai-assistant' && (
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }} />
            )}
            {sidebarCollapsed && <span className="sidebar-tooltip">{FEATURES.aiAssistant ? 'AI Assistant' : 'AI Assistant (Coming Soon)'}</span>}
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
              fontSize: '0.88rem',
              cursor: FEATURES.seatingChart ? 'pointer' : 'not-allowed',
              opacity: FEATURES.seatingChart ? 1 : 0.65
            }}
            onClick={FEATURES.seatingChart ? () => setActiveTool('seating') : undefined}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: sidebarCollapsed ? '0' : '0.6rem', justifyContent: 'center' }}>
              <Users size={16} style={{ color: activeTool === 'seating' ? 'var(--primary)' : 'var(--text-muted)', transition: 'color 0.2s' }} />
              {!sidebarCollapsed && <span>Seating Chart</span>}
            </div>
            {!sidebarCollapsed && !FEATURES.seatingChart && (
              <span style={{
                fontSize: '0.62rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                color: 'var(--text-muted)'
              }}>
                Soon
              </span>
            )}
            {!sidebarCollapsed && FEATURES.seatingChart && activeTool === 'seating' && (
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }} />
            )}
            {sidebarCollapsed && <span className="sidebar-tooltip">{FEATURES.seatingChart ? 'Seating Chart' : 'Seating Chart (Coming Soon)'}</span>}
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
              fontSize: '0.88rem',
              cursor: FEATURES.cohortAnalysis ? 'pointer' : 'not-allowed',
              opacity: FEATURES.cohortAnalysis ? 1 : 0.65
            }}
            onClick={FEATURES.cohortAnalysis ? () => setActiveTool('analysis') : undefined}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: sidebarCollapsed ? '0' : '0.6rem', justifyContent: 'center' }}>
              <BarChart3 size={16} style={{ color: activeTool === 'analysis' ? 'var(--primary)' : 'var(--text-muted)', transition: 'color 0.2s' }} />
              {!sidebarCollapsed && <span>Cohort Analysis</span>}
            </div>
            {!sidebarCollapsed && !FEATURES.cohortAnalysis && (
              <span style={{
                fontSize: '0.62rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                color: 'var(--text-muted)'
              }}>
                Soon
              </span>
            )}
            {!sidebarCollapsed && FEATURES.cohortAnalysis && activeTool === 'analysis' && (
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }} />
            )}
            {sidebarCollapsed && <span className="sidebar-tooltip">{FEATURES.cohortAnalysis ? 'Cohort Analysis' : 'Cohort Analysis (Coming Soon)'}</span>}
          </button>

          {/* Gradebook Preview Tab */}
          <button
            className="btn"
            style={{
              position: 'relative',
              justifyContent: sidebarCollapsed ? 'center' : 'space-between',
              background: activeTool === 'gradebook' ? 'var(--bg-card-hover)' : 'transparent',
              borderColor: activeTool === 'gradebook' ? 'var(--border-color-hover)' : 'transparent',
              color: activeTool === 'gradebook' ? 'var(--text-main)' : 'var(--text-muted)',
              borderRadius: '12px',
              padding: sidebarCollapsed ? '0.7rem 0' : '0.7rem 1.15rem',
              fontSize: '0.88rem',
              cursor: FEATURES.gradebookList ? 'pointer' : 'not-allowed',
              opacity: FEATURES.gradebookList ? 1 : 0.65
            }}
            onClick={FEATURES.gradebookList ? () => setActiveTool('gradebook') : undefined}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: sidebarCollapsed ? '0' : '0.6rem', justifyContent: 'center' }}>
              <Grid size={16} style={{ color: activeTool === 'gradebook' ? 'var(--primary)' : 'var(--text-muted)', transition: 'color 0.2s' }} />
              {!sidebarCollapsed && <span>Gradebook List</span>}
            </div>
            {!sidebarCollapsed && !FEATURES.gradebookList && (
              <span style={{
                fontSize: '0.62rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                color: 'var(--text-muted)'
              }}>
                Soon
              </span>
            )}
            {!sidebarCollapsed && FEATURES.gradebookList && activeTool === 'gradebook' && (
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }} />
            )}
            {sidebarCollapsed && <span className="sidebar-tooltip">{FEATURES.gradebookList ? 'Gradebook List' : 'Gradebook List (Coming Soon)'}</span>}
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
              fontSize: '0.88rem',
              cursor: FEATURES.utilities ? 'pointer' : 'not-allowed',
              opacity: FEATURES.utilities ? 1 : 0.65
            }}
            onClick={FEATURES.utilities ? () => setActiveTool('utilities') : undefined}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: sidebarCollapsed ? '0' : '0.6rem', justifyContent: 'center' }}>
              <Layers size={16} style={{ color: activeTool === 'utilities' ? 'var(--primary)' : 'var(--text-muted)', transition: 'color 0.2s' }} />
              {!sidebarCollapsed && <span>Utilities</span>}
            </div>
            {!sidebarCollapsed && !FEATURES.utilities && (
              <span style={{
                fontSize: '0.62rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                color: 'var(--text-muted)'
              }}>
                Soon
              </span>
            )}
            {!sidebarCollapsed && FEATURES.utilities && activeTool === 'utilities' && (
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }} />
            )}
            {sidebarCollapsed && <span className="sidebar-tooltip">{FEATURES.utilities ? 'Utilities' : 'Utilities (Coming Soon)'}</span>}
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
              onClick={() => setShowFeedback(true)}
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
          {activeTool === 'gradebook' && <GradebookList />}
          {activeTool === 'utilities' && <Utilities />}
          {activeTool === 'ai-assistant' && <AiAssistant />}
          {activeTool === 'toolkit' && <TeacherToolkit />}
          {activeTool === 'help' && <PortalHelp />}
        </div>
      </main>

      {/* ── FEEDBACK MODAL OVERLAY ────────────────────────────────────── */}
      {showFeedback && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            animation: 'fade-in 0.25s ease-out'
          }}
          onClick={() => setShowFeedback(false)}
        >
          <div 
            className="glass-panel"
            style={{
              width: '520px',
              maxWidth: '95%',
              padding: '2rem',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
              border: '1px solid var(--border-primary)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Mail size={22} style={{ color: 'var(--primary)' }} />
                <h2 style={{ fontSize: '1.35rem', fontWeight: '850', letterSpacing: '-0.03em', margin: 0, color: 'var(--text-main)' }}>Send Feedback to Developer</h2>
              </div>
              <button 
                onClick={() => setShowFeedback(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  lineHeight: '1',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--text-main)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSendFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Category Dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: '750', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Feedback Category
                </label>
                <select
                  required
                  value={feedbackCategory}
                  onChange={(e) => setFeedbackCategory(e.target.value)}
                  style={{
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    fontSize: '0.88rem',
                    outline: 'none',
                    fontFamily: 'inherit',
                    cursor: 'pointer'
                  }}
                >
                  <option value="" disabled>Select a category...</option>
                  <option value="Bug Report / Issue">Bug Report / Technical Issue</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Comment Bank Suggestion">Comment Bank / Template Suggestion</option>
                  <option value="General Feedback">General Feedback</option>
                </select>
              </div>

              {/* Tool Area Dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: '750', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Target Tool / Feature
                </label>
                <select
                  required
                  value={feedbackToolArea}
                  onChange={(e) => setFeedbackToolArea(e.target.value)}
                  style={{
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    fontSize: '0.88rem',
                    outline: 'none',
                    fontFamily: 'inherit',
                    cursor: 'pointer'
                  }}
                >
                  <option value="" disabled>Select tool/area...</option>
                  <option value="Comment Generator">Comment Generator</option>
                  <option value="Roster & CSV Upload">Roster & CSV Upload</option>
                  <option value="Academic Reference Toolkit">Teacher Reference Toolkit</option>
                  <option value="Theme / Styling / UI">Theme / Styling / UI</option>
                  <option value="Other / General App">Other / General Portal</option>
                </select>
              </div>

              {/* Grade Level Dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: '750', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Grade Level / Section
                </label>
                <select
                  required
                  value={feedbackGradeLevel}
                  onChange={(e) => setFeedbackGradeLevel(e.target.value)}
                  style={{
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    fontSize: '0.88rem',
                    outline: 'none',
                    fontFamily: 'inherit',
                    cursor: 'pointer'
                  }}
                >
                  <option value="" disabled>Select grade level...</option>
                  <option value="Secondary (Grades 6-10)">Secondary (Grades 6-10)</option>
                  <option value="DP / CP (Grades 11-12)">DP / CP (Grades 11-12)</option>
                  <option value="Whole School / Multiple">Whole School / Multiple</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Description Textarea */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: '750', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Your Message
                </label>
                <textarea
                  required
                  rows="4"
                  placeholder="Describe your feedback, request, or issue in detail..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  style={{
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    padding: '0.75rem 0.85rem',
                    borderRadius: '10px',
                    fontSize: '0.88rem',
                    outline: 'none',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    lineHeight: '1.45'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowFeedback(false)}
                  className="btn"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-muted)',
                    padding: '0.65rem',
                    borderRadius: '10px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    justifyContent: 'center',
                    fontSize: '0.9rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!feedbackCategory || !feedbackToolArea || !feedbackGradeLevel || !feedbackText.trim()}
                  style={{
                    flex: 1,
                    background: 'var(--primary)',
                    border: 'none',
                    color: '#fff',
                    padding: '0.65rem',
                    borderRadius: '10px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    opacity: (!feedbackCategory || !feedbackToolArea || !feedbackGradeLevel || !feedbackText.trim()) ? 0.5 : 1,
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    gap: '0.5rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Mail size={16} />
                  Draft in Outlook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


