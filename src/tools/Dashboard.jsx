import React, { useState, useRef } from 'react';
import { 
  Sparkles, Users, ArrowRight, GraduationCap,
  Upload, FileSpreadsheet, Check, AlertCircle, ShieldCheck, 
  Download, BarChart3, Grid, Layers, Database, ChevronRight,
  Flame, Lock, HelpCircle, X
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useData } from '../context/DataContext';
import { parseRosterFile, isSupportedRosterFile, ACCEPT_ATTRIBUTE } from '../utils/parseRosterFile';
import { FEATURES } from '../config/features';

// ── DEMO DATA: loaded from the public /sample_students.csv ─────────────
// loadDemoData() and downloadSampleExcel() are defined inside the component
// so they can call parseRosterFile and connectData directly.


// ── DYNAMIC WELCOME MESSAGE ────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 5) return 'Working late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

// One line per day of week (Sunday = index 0)
const WELCOME_LINES = [
  'Enjoy your Sunday — your workspace will be ready when you are.',
  'Fresh week, fresh start. Your cohort data is loaded and ready.',
  'Keep the momentum going — everything is set for your classes.',
  'Midweek check-in: your roster and gradebook are up to date.',
  'Almost there — your reports practically write themselves from here.',
  'Happy Friday! Wrap up the week with your cohort at a glance.',
  'Weekend mode — everything will be right here on Monday.'
];

const getTodayLabel = () =>
  new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

export default function Dashboard({ setActiveTool }) {
  // ── REACT HOOKS (GROUPED AT THE ABSOLUTE TOP) ────────────────────────
  const { 
    fileConnected, 
    fileName, 
    students, 
    classes, 
    selectedClass, 
    setSelectedClass, 
    subject, 
    subjects = [], 
    teacherName, 
    connectData, 
    changeFile 
  } = useData();

  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const [modalOpen, setModalOpen] = useState(false);

  const fileInputRef = useRef(null);

  // ── REUSABLE AI ASSISTANT PROMOTION BANNER ───────────────────────────
  const renderAiBanner = () => (
    <div
      className="bento-card animate-fade-in"
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1.1rem 1.5rem',
        marginBottom: '1.1rem'
      }}
    >
      <div style={{ flex: '1 1 420px', display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
        <div className="bento-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent)' }}>
          <Sparkles size={18} />
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5', margin: 0 }}>
          <strong style={{ color: 'var(--text-main)', fontWeight: '750' }}>EduKit AI Assistant</strong> — ask about data, exams, or portal features and save hours of administrative work.
        </p>
      </div>

      <button
        className="btn"
        style={{
          padding: '0.5rem 1.1rem',
          fontSize: '0.82rem',
          borderRadius: '10px',
          gap: '0.4rem',
          fontWeight: '750',
          background: FEATURES.aiAssistant ? 'var(--accent)' : 'transparent',
          border: FEATURES.aiAssistant ? '1px solid transparent' : '1px solid var(--border-color)',
          color: FEATURES.aiAssistant ? '#fff' : 'var(--text-muted)',
          cursor: FEATURES.aiAssistant ? 'pointer' : 'not-allowed',
          opacity: FEATURES.aiAssistant ? 1 : 0.7,
          transition: 'all var(--transition-fast)'
        }}
        disabled={!FEATURES.aiAssistant}
        onClick={FEATURES.aiAssistant ? () => setActiveTool('ai-assistant') : undefined}
      >
        {FEATURES.aiAssistant ? 'Open AI Assistant' : 'Coming Soon'}
      </button>
    </div>
  );

  // ── HANDLERS AND HELPERS ─────────────────────────────────────────────
  const triggerToast = (msg, type = 'success', duration = 4000) => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, duration);
  };

  const handleFile = async (file) => {
    if (!file) return;
    const name = file.name;

    if (!isSupportedRosterFile(name)) {
      setErrorMsg("Unsupported file format. Please upload a .xlsx, .xls, or .csv file.");
      triggerToast("Unsupported file format.", "error");
      return;
    }

    setErrorMsg(null);
    try {
      const rows = await parseRosterFile(file);
      const result = connectData(name, rows);
      if (result.success) {
        if (result.warning) {
          // Longer duration so the persistence warning is actually read
          triggerToast(result.warning, "warning", 10000);
        } else {
          triggerToast(`Successfully connected: ${name}`);
        }
        setModalOpen(false);
      } else {
        setErrorMsg(result.error);
        triggerToast(result.error, "error");
      }
    } catch (err) {
      console.error("Roster parsing error:", err);
      setErrorMsg("Failed to read the file. Make sure it is not corrupted.");
      triggerToast("Failed to parse the file.", "error");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Fetches /sample_students.csv, wraps it as a File, and loads it via the
  // standard parseRosterFile → connectData pipeline so every special-case
  // subject (Double/Triple Science, French, German, etc.) is exercised.
  const loadDemoData = async () => {
    try {
      const res = await fetch('sample_students.csv');
      if (!res.ok) throw new Error('Could not fetch sample_students.csv');
      const blob = await res.blob();
      const file = new File([blob], 'sample_students.csv', { type: 'text/csv' });
      const rows = await parseRosterFile(file);
      const result = connectData('sample_students.csv', rows);
      if (result.success) {
        triggerToast('Loaded EduKit Demo Roster — 33 classes, all subjects!', 'success');
        setModalOpen(false);
      } else {
        triggerToast(result.error || 'Failed to load demo data', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerToast('An error occurred loading demo data', 'error');
    }
  };

  // Downloads sample_students.csv converted to .xlsx for easy reference.
  const downloadSampleExcel = async () => {
    try {
      const res = await fetch('sample_students.csv');
      if (!res.ok) throw new Error('Could not fetch sample_students.csv');
      const text = await res.text();
      const wb = XLSX.read(text, { type: 'string' });
      XLSX.writeFile(wb, 'sisd_edukit_sample_roster.xlsx');
      triggerToast('Downloaded: sisd_edukit_sample_roster.xlsx');
    } catch (err) {
      console.error(err);
      triggerToast('Download failed', 'error');
    }
  };

  // Programmatic Calculations for Metrics
  const boys = students.filter(s => s.gender.toLowerCase() === 'male' || s.gender.toLowerCase() === 'm').length;
  const girls = students.filter(s => s.gender.toLowerCase() === 'female' || s.gender.toLowerCase() === 'f').length;
  
  const senCount = students.filter(s => s.sen).length;
  const ealCount = students.filter(s => s.eal).length;
  const giftedCount = students.filter(s => s.gifted).length;
  const emiratiCount = students.filter(s => s.emirati).length;

  const gradedStudents = students.filter(s => s.ibGrade !== null && s.ibGrade > 0);
  const avgIb = gradedStudents.length ? (gradedStudents.reduce((sum, s) => sum + s.ibGrade, 0) / gradedStudents.length).toFixed(1) : 'N/A';

  const getCohortDescriptor = (avg) => {
    if (avg === 'N/A') return 'No grades';
    const num = parseFloat(avg);
    if (num >= 6.0) return 'Outstanding';
    if (num >= 5.0) return 'Very Good';
    if (num >= 4.0) return 'Good';
    if (num >= 3.0) return 'Acceptable';
    return 'Weak';
  };

  const getCohortDescriptorColor = (avg) => {
    if (avg === 'N/A') return 'var(--text-muted)';
    const num = parseFloat(avg);
    if (num >= 5.0) return '#10b981'; // Green
    if (num >= 4.0) return '#3b82f6'; // Blue
    if (num >= 3.0) return '#fbbf24'; // Amber
    return '#ef4444'; // Red
  };

  return (
    <div className="animate-fade-in" style={{ position: 'relative' }}>
      
      {/* ── TOAST ALERTS ───────────────────────────────────────────────── */}
      {showToast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 1100,
          background: 'var(--bg-sidebar)',
          backdropFilter: 'blur(20px)',
          border: toastType === 'success' ? '1px solid rgba(16, 185, 129, 0.35)' : toastType === 'warning' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(239, 68, 68, 0.35)',
          maxWidth: '420px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          padding: '1rem 1.75rem',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: 'var(--text-main)',
          animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {toastType === 'success' ? (
            <Check size={18} style={{ color: '#10b981', filter: 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.4))' }} />
          ) : toastType === 'warning' ? (
            <AlertCircle size={18} style={{ color: '#fbbf24', filter: 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.4))', flexShrink: 0 }} />
          ) : (
            <AlertCircle size={18} style={{ color: '#ef4444', filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.4))' }} />
          )}
          <span style={{ fontSize: '0.92rem', fontWeight: '750', letterSpacing: '-0.01em' }}>{toastMsg}</span>
        </div>
      )}

      {/* ── BACKGROUND AMBIENT GLOW CIRCLES ───────────────────────────── */}
      <div className="float-bg" style={{
        position: 'absolute',
        top: '-10%',
        left: '15%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(225, 0, 49, 0.08) 0%, transparent 65%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      <div className="float-bg" style={{
        position: 'absolute',
        bottom: '5%',
        right: '-5%',
        width: '550px',
        height: '550px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)',
        filter: 'blur(55px)',
        pointerEvents: 'none',
        zIndex: 0,
        animationDelay: '-5s'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ==================================================================
            STATE A: DISCONNECTED (STUNNING LANDING HERO)
            ================================================================== */}
        {!fileConnected ? (
          <div>
            {/* Header Hero */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '3rem',
              marginBottom: '2.5rem',
              textAlign: 'left'
            }}>
              <div style={{ flex: '1 1 600px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                  <GraduationCap size={15} style={{ color: 'var(--primary)' }} />
                  <span className="bento-label">Swiss International Scientific School Dubai</span>
                </div>

                <h1 style={{
                  fontSize: '2.7rem',
                  marginBottom: '1.1rem',
                  lineHeight: '1.12',
                  fontWeight: '850',
                  fontFamily: 'var(--font-header)',
                  letterSpacing: '-0.04em',
                  color: 'var(--text-main)'
                }}>
                  Empower Your Classroom.<br />
                  <span style={{ color: 'var(--primary)' }}>Elevate Student Learning.</span>
                </h1>

                <p style={{
                  color: 'var(--text-muted)',
                  fontSize: '1.02rem',
                  lineHeight: '1.7',
                  marginBottom: '0',
                  maxWidth: '760px',
                  fontFamily: 'var(--font-body)',
                  fontWeight: '400'
                }}>
                  SISD EduKit is a secure suite of classroom productivity tools for IB educators. Generate criteria-aligned report comments, arrange seating plans, track cohort progression, and build learning groups in seconds — completely client-side and offline.
                </p>
              </div>

              {/* SISD logo rings */}
              <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', padding: '1rem' }}>
                <svg
                  className="sisd-logo-svg"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 200 200"
                  style={{ overflow: 'visible', isolation: 'isolate', width: '130px', height: '130px' }}
                >
                  <circle className="sisd-ring sisd-ring-1" cx="100" cy="-8" r="90" />
                  <circle className="sisd-ring sisd-ring-2" cx="100" cy="208" r="90" />
                  <circle className="sisd-ring sisd-ring-3" cx="-8" cy="100" r="90" />
                  <circle className="sisd-ring sisd-ring-4" cx="208" cy="100" r="90" />
                </svg>
              </div>
            </div>

            {/* ERROR ALERT BOX */}
            {errorMsg && (
              <div className="glass-panel" style={{
                background: 'rgba(239, 68, 68, 0.06)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                padding: '1.25rem 1.75rem',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                color: '#ef4444',
                fontSize: '0.94rem',
                fontWeight: '700',
                marginBottom: '2.5rem',
                maxWidth: '960px',
                boxShadow: '0 10px 25px rgba(239, 68, 68, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
              }}>
                <AlertCircle size={20} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* WORKSPACE CONTROL HUB */}
            <div
              className="bento-card"
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '2rem',
                padding: '2rem 2.25rem',
                marginBottom: '1.1rem'
              }}
            >
              <div style={{ flex: '1 1 480px', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div className="bento-icon" style={{ background: 'rgba(225, 0, 49, 0.09)', color: 'var(--primary)' }}>
                  <Flame size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '0.4rem', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                    Secure Educator Workspace
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '0.6rem' }}>
                    Import your pupil grades spreadsheet locally to unlock Comment Generation, Seating Planners, Data Analysis, and student grouping metrics. All processing runs offline in browser memory.
                  </p>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                    <ShieldCheck size={14} style={{ color: '#10b981' }} />
                    100% Client-Side Privacy: Pupil data never leaves your computer.
                  </span>
                </div>
              </div>

              {/* PRIMARY UPLOAD ACTION CALL */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-primary"
                    style={{
                      padding: '0.7rem 1.6rem',
                      fontSize: '0.9rem',
                      borderRadius: '12px',
                      gap: '0.5rem',
                      fontWeight: '800',
                      boxShadow: 'none'
                    }}
                    onClick={() => setModalOpen(true)}
                  >
                    ⚡ Connect Your Data
                  </button>

                  <button
                    className="btn"
                    style={{
                      padding: '0.7rem 1.5rem',
                      fontSize: '0.88rem',
                      borderRadius: '12px',
                      gap: '0.45rem',
                      fontWeight: '750',
                      background: 'transparent',
                      border: '1px solid var(--border-color-hover)',
                      color: 'var(--text-main)'
                    }}
                    onClick={loadDemoData}
                  >
                    Try with Demo Data
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', padding: '0 0.25rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>No database ready?</span>
                  <button
                    onClick={downloadSampleExcel}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--primary)',
                      fontWeight: '750',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Download Sample Excel
                  </button>
                </div>
              </div>
            </div>

            {renderAiBanner()}

            {/* DISCONNECTED PREVIEW GRID OF TOOLS */}
            <span className="bento-label" style={{ margin: '2.25rem 0 0.85rem 0.25rem' }}>EduKit Application Suite</span>
            <div className="bento-grid" style={{ marginBottom: '1.1rem' }}>

              {/* Featured: Comment Generator */}
              <div
                className="bento-card bento-col-7 is-clickable"
                style={{ gap: '1rem' }}
                onClick={() => setModalOpen(true)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="bento-icon" style={{ background: 'rgba(225, 0, 49, 0.09)', color: 'var(--primary)' }}>
                    <Sparkles size={18} />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '0.2rem 0.6rem', borderRadius: '30px', fontWeight: '750', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Lock size={10} style={{ opacity: 0.8 }} /> Locked
                  </span>
                </div>
                <div style={{ flexGrow: 1 }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.35rem', color: 'var(--text-main)' }}>Comment Generator</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.55', margin: 0 }}>
                    Generate comprehensive criterion-based comments instantly. Custom draft boundaries automatically alert low grades.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: '750', fontSize: '0.84rem' }}>
                  Connect Roster to Open <ChevronRight size={14} />
                </div>
              </div>

              {/* Locked preview modules */}
              {[
                { key: 'seating', span: 'bento-col-5', Icon: Users, tint: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent)', title: 'Seating Chart & Group Planner', desc: 'Arrange classroom desks in grids or clusters. Drag-and-drop live edit with premium layout controls.' },
                { key: 'analysis', span: 'bento-col-4', Icon: BarChart3, tint: 'rgba(245, 158, 11, 0.1)', color: '#d97706', title: 'Cohort Data Analysis', desc: 'Review global attainment, KHDA progress levels, target MEGs, and automated pedagogical instructions.' }
              ].map(({ key, span, Icon, tint, color, title, desc }) => (
                <div key={key} className={`bento-card ${span} is-locked`} style={{ gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="bento-icon" style={{ background: tint, color }}>
                      <Icon size={18} />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '0.2rem 0.6rem', borderRadius: '30px', fontWeight: '750' }}>
                      Coming Soon
                    </span>
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.35rem', color: 'var(--text-main)' }}>{title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: '1.55', margin: 0 }}>{desc}</p>
                  </div>
                </div>
              ))}

              {/* Feature highlights */}
              {[
                { key: 'privacy', Icon: ShieldCheck, tint: 'rgba(16, 185, 129, 0.1)', color: '#10b981', title: '100% Client-Side Privacy', desc: 'All parsing and data calculations run directly in browser memory. Student files are never transmitted to outside servers.' },
                { key: 'offline', Icon: Flame, tint: 'rgba(225, 0, 49, 0.08)', color: 'var(--primary)', title: 'Instant Offline Generation', desc: 'Process records and formulate massive comment exports in milliseconds, with offline workspace stability.' }
              ].map(({ key, Icon, tint, color, title, desc }) => (
                <div key={key} className="bento-card bento-col-4" style={{ gap: '0.85rem' }}>
                  <div className="bento-icon" style={{ background: tint, color }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: '800', letterSpacing: '-0.01em', marginBottom: '0.35rem', color: 'var(--text-main)' }}>{title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: '1.55', margin: 0 }}>{desc}</p>
                  </div>
                </div>
              ))}

              {/* IB compliance strip */}
              <div className="bento-card bento-col-12" style={{ flexDirection: 'row', alignItems: 'center', gap: '1rem', padding: '1.1rem 1.5rem' }}>
                <div className="bento-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent)' }}>
                  <Database size={18} />
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5', margin: 0 }}>
                  <strong style={{ color: 'var(--text-main)', fontWeight: '750' }}>IB MYP Criteria Compliant</strong> — specifically modeled to handle IB assessment criteria A, B, C, D, and CPT point structures out of 32 dynamically.
                </p>
              </div>
            </div>

          </div>
        ) : (
          
          /* ==================================================================
             STATE B: CONNECTED (PREMIUM WORKSPACE DASHBOARD)
             ================================================================== */
          <div>
            
            {/* Dynamic Welcome Card */}
            <div className="bento-card" style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.25rem',
              padding: '1.85rem 2rem',
              marginBottom: '1.1rem',
              background: 'linear-gradient(120deg, rgba(225, 0, 49, 0.07) 0%, var(--bg-card) 60%)',
              border: '1px solid rgba(225, 0, 49, 0.18)',
              borderLeft: '3px solid var(--primary)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.65rem' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                  <span className="bento-label" style={{ color: 'var(--primary)' }}>Active Workspace · {getTodayLabel()}</span>
                </div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '850', letterSpacing: '-0.03em', margin: 0, color: 'var(--text-main)' }}>
                  {getGreeting()}, <span style={{ color: 'var(--primary)' }}>{teacherName}</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', fontWeight: '600', marginTop: '0.45rem', marginBottom: 0 }}>
                  {WELCOME_LINES[new Date().getDay()]}
                </p>
                {subjects && subjects.length > 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: '600', marginTop: '0.45rem', marginBottom: 0 }}>
                    {subjects.length > 1 ? 'Subjects' : 'Subject'}: <span style={{ color: 'var(--text-main)', fontWeight: '700', textTransform: 'capitalize' }}>{subjects.join(', ')}</span>
                  </p>
                )}
              </div>

              {/* Data controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px'
                }}>
                  <FileSpreadsheet size={14} style={{ color: 'var(--primary)' }} />
                  {fileName.length > 25 ? `${fileName.substring(0, 22)}...` : fileName}
                </span>

                <button
                  onClick={changeFile}
                  className="btn"
                  style={{
                    padding: '0.5rem 1.1rem',
                    fontSize: '0.82rem',
                    borderRadius: '10px',
                    fontWeight: '700',
                    color: 'var(--error)',
                    background: 'transparent',
                    border: '1px solid var(--border-color)'
                  }}
                  onMouseEnter={(e) => e.target.style.borderColor = 'rgba(239, 68, 68, 0.35)'}
                  onMouseLeave={(e) => e.target.style.borderColor = 'var(--border-color)'}
                >
                  Disconnect
                </button>
              </div>
            </div>

            {renderAiBanner()}

            {/* COHORT OVERVIEW — BENTO STATS */}
            <span className="bento-label" style={{ margin: '2.25rem 0 0.85rem 0.25rem' }}>Cohort Overview</span>
            <div className="bento-grid" style={{ marginBottom: '2.5rem' }}>

              {/* Featured stat: IB attainment */}
              <div className="bento-card bento-col-4" style={{ flexDirection: 'row', alignItems: 'center', gap: '1.25rem' }}>
                <div className="bento-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }}>
                  <BarChart3 size={19} />
                </div>
                <div>
                  <span className="bento-label">IB Attainment Avg</span>
                  <strong style={{ fontSize: '2.5rem', fontWeight: '850', display: 'block', lineHeight: '1.05', margin: '2px 0', letterSpacing: '-0.03em', color: 'var(--text-main)' }}>{avgIb}</strong>
                  <span style={{ fontSize: '0.8rem', fontWeight: '750', color: getCohortDescriptorColor(avgIb) }}>KHDA: {getCohortDescriptor(avgIb)}</span>
                </div>
              </div>

              {/* Cohort size */}
              <div className="bento-card bento-col-3" style={{ justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="bento-label">Cohort Size</span>
                  <Users size={16} style={{ color: 'var(--primary)' }} />
                </div>
                <div>
                  <strong style={{ fontSize: '1.85rem', fontWeight: '850', display: 'block', lineHeight: '1.1', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>{students.length}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>{boys} Boys · {girls} Girls</span>
                </div>
              </div>

              {/* Classes */}
              <div className="bento-card bento-col-2" style={{ justifyContent: 'space-between', gap: '1rem', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="bento-label">Classes</span>
                  <Grid size={16} style={{ color: 'var(--accent)' }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <strong style={{ fontSize: '1.85rem', fontWeight: '850', display: 'block', lineHeight: '1.1', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>{classes.length}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', fontWeight: '600' }}>
                    {classes.join(', ')}
                  </span>
                </div>
              </div>

              {/* Demographics */}
              <div className="bento-card bento-col-3" style={{ justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="bento-label">Demographics</span>
                  <ShieldCheck size={16} style={{ color: '#0d9488' }} />
                </div>
                <div>
                  <strong style={{ fontSize: '1.85rem', fontWeight: '850', display: 'block', lineHeight: '1.1', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>{senCount + ealCount + giftedCount + emiratiCount}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    {senCount} Inclusion · {ealCount} EAL · {emiratiCount} Local
                  </span>
                </div>
              </div>

            </div>

            {/* ACTIVE WORKSPACE TOOL SELECTIONS */}
            <span className="bento-label" style={{ margin: '0 0 0.85rem 0.25rem' }}>Workspace Modules</span>
            <div className="bento-grid" style={{ marginBottom: '2.5rem' }}>

              {/* Featured module: Comment Generator */}
              <div
                className="bento-card bento-col-7 is-clickable"
                style={{ gap: '1rem' }}
                onClick={() => setActiveTool('comment')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="bento-icon" style={{ background: 'rgba(225, 0, 49, 0.09)', color: 'var(--primary)' }}>
                    <Sparkles size={18} />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.08)', padding: '0.2rem 0.6rem', borderRadius: '30px', fontWeight: '750' }}>
                    {students.length} Ranks Ready
                  </span>
                </div>
                <div style={{ flexGrow: 1 }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                    Comment Generator
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.55', margin: 0 }}>
                    Generate detailed, personalized criterion remarks based on student grades and ATL values. Safe manual drafting holds warnings for grades 1 or 2.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: '750', fontSize: '0.84rem' }}>
                  Open Comment Generator <ArrowRight size={14} />
                </div>
              </div>

              {/* Flag-gated workspace modules */}
              {[
                { flag: FEATURES.seatingChart, tool: 'seating', span: 'bento-col-5', Icon: Users, tint: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent)', title: 'Seating Chart Planner', desc: 'Design physical desk arrangements. Live drag-and-drop layout options (rows, clusters, circular) mapping student tags.', launch: 'Open Seating Planner' },
                { flag: FEATURES.cohortAnalysis, tool: 'analysis', span: 'bento-col-4', Icon: BarChart3, tint: 'rgba(245, 158, 11, 0.1)', color: '#d97706', title: 'Cohort Data Analysis', desc: 'Track criteria trends, KHDA progress descriptors, target MEGs comparison, and automated intervention remarks.', launch: 'Open Cohort Analysis' },
                { flag: FEATURES.gradebookList, tool: 'gradebook', span: 'bento-col-4', Icon: Grid, tint: 'rgba(13, 148, 136, 0.1)', color: '#0d9488', title: 'Gradebook List', desc: 'Preview class lists in grid format, inspect criteria A, B, C, D details, and safely edit individual records.', launch: 'Open Gradebook' },
                { flag: FEATURES.utilities, tool: 'utilities', span: 'bento-col-4', Icon: Layers, tint: 'rgba(225, 0, 49, 0.08)', color: 'var(--primary)', title: 'Teacher Utilities', desc: 'Cooperative learning structures, random student spin wheels, and multi-session classroom timers.', launch: 'Open Utilities' }
              ].map(({ flag, tool, span, Icon, tint, color, title, desc, launch }) => (
                <div
                  key={tool}
                  className={`bento-card ${span} ${flag ? 'is-clickable' : 'is-locked'}`}
                  style={{ gap: '1rem' }}
                  onClick={flag ? () => setActiveTool(tool) : undefined}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="bento-icon" style={{ background: tint, color }}>
                      <Icon size={18} />
                    </div>
                    {!flag && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '0.2rem 0.6rem', borderRadius: '30px', fontWeight: '750' }}>
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.35rem', color: 'var(--text-main)' }}>{title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: '1.55', margin: 0 }}>{desc}</p>
                  </div>
                  {flag && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: '750', fontSize: '0.84rem' }}>
                      {launch} <ArrowRight size={14} />
                    </div>
                  )}
                </div>
              ))}

            </div>

            {/* PEDAGOGICAL COHORT INSIGHT WIDGET */}
            <div className="glass-panel" style={{
              padding: '2.5rem',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,0.04)'
            }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '850', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.65rem', letterSpacing: '-0.02em' }}>
                <ShieldCheck style={{ color: '#10b981', filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.3))' }} size={24} />
                Real-Time Pedagogical Cohort Insights
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem',
                fontSize: '0.96rem',
                lineHeight: '1.6'
              }}>
                <div style={{ 
                  background: 'rgba(0,0,0,0.22)', 
                  padding: '1.5rem', 
                  borderRadius: '16px', 
                  border: '1px solid rgba(255,255,255,0.04)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)'
                }}>
                  <span style={{ fontWeight: '800', color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem', fontSize: '1.02rem' }}>🗣️ Language & EAL Provisioning</span>
                  We identified <strong style={{ color: 'var(--primary)' }}>{ealCount} EAL student(s)</strong> across all classes. When using Seating Chart desks, place EAL pupils alongside peers with 'Expert' or 'Practitioner' ATL communication ratings.
                </div>
                
                <div style={{ 
                  background: 'rgba(0,0,0,0.22)', 
                  padding: '1.5rem', 
                  borderRadius: '16px', 
                  border: '1px solid rgba(255,255,255,0.04)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)'
                }}>
                  <span style={{ fontWeight: '800', color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem', fontSize: '1.02rem' }}>🧠 Gifted & Talented Extension</span>
                  We identified <strong style={{ color: '#3b82f6' }}>{giftedCount} MAGT student(s)</strong> across all classes. Ensure they receive high-level conceptual prompts, and consider using Study Group Matcher's peer-mentoring settings.
                </div>
                
                <div style={{ 
                  background: 'rgba(0,0,0,0.22)', 
                  padding: '1.5rem', 
                  borderRadius: '16px', 
                  border: '1px solid rgba(255,255,255,0.04)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)'
                }}>
                  <span style={{ fontWeight: '800', color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem', fontSize: '1.02rem' }}>🤝 Learning Support Accommodation</span>
                  We identified <strong style={{ color: '#fbbf24' }}>{senCount} Inclusion student(s)</strong> across all classes. Ensure individual educational profiles (IEP) are reflected in classroom layout settings and collaborative groupings.
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* POPUP SLIDE-UP MODAL OVERLAY (FOR LOCAL DB UPLOADS) */}
      {modalOpen && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(3, 7, 18, 0.85)', 
            backdropFilter: 'blur(20px)',
            zIndex: 1000, 
            display: 'flex', 
            alignItems: 'flex-start', 
            justifyContent: 'center',
            padding: '2rem 1.5rem',
            overflowY: 'auto',
            animation: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onClick={() => setModalOpen(false)}
        >
          <div 
            className="glass-panel" 
            style={{ 
              width: '560px', 
              maxWidth: '100%', 
              background: 'var(--bg-app)', 
              boxShadow: 'var(--shadow-xl)', 
              padding: '2.5rem',
              position: 'relative',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              margin: 'auto 0',
              animation: 'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: '10px', 
                  background: 'var(--primary-gradient)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(225, 0, 49, 0.25)'
                }}>
                  <FileSpreadsheet size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '850', letterSpacing: '-0.02em' }}>Connect Student Database</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Swiss International Scientific School Dubai</span>
                </div>
              </div>
              
              <button 
                onClick={() => setModalOpen(false)}
                style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid var(--border-color)', 
                  color: 'var(--text-muted)', 
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(225,0,49,0.1)';
                  e.currentTarget.style.color = 'var(--primary)';
                  e.currentTarget.style.borderColor = 'rgba(225,0,49,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                <X size={16} />
              </button>
            </div>

                        {/* Static Data Disclaimer */}
            <div 
              style={{ 
                background: 'var(--warning-bg)', 
                border: '1px solid var(--warning-border)', 
                color: 'var(--warning-text)', 
                padding: '1rem 1.25rem', 
                borderRadius: '16px', 
                fontSize: '0.84rem', 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '0.75rem',
                marginBottom: '1.5rem',
                lineHeight: '1.5'
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--warning-text)' }} />
              <div>
                <strong style={{ fontWeight: '800', color: 'var(--warning-text)' }}>⚠️ Static Data Disclaimer:</strong> This connected database is static. You will need to re-upload the spreadsheet whenever there is a change in classes or student grades. We highly recommend uploading your data after the gradebook is fully complete.
              </div>
            </div>

            {/* ATL Default Hint */}
            <div 
              style={{ 
                background: 'rgba(59, 130, 246, 0.05)', 
                border: '1px solid rgba(59, 130, 246, 0.25)', 
                color: '#3b82f6', 
                padding: '1.1rem 1.25rem', 
                borderRadius: '16px', 
                fontSize: '0.84rem', 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '0.75rem',
                marginBottom: '1.5rem',
                lineHeight: '1.5'
              }}
            >
              <HelpCircle size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#3b82f6' }} />
              <div>
                <strong style={{ fontWeight: '800', color: '#3b82f6' }}>💡 Blank ATL Data Tip:</strong> If your spreadsheet contains blank cells in the <strong style={{ color: 'var(--text-main)', fontWeight: '750' }}>ATL Progress</strong> or <strong style={{ color: 'var(--text-main)', fontWeight: '750' }}>ATL Skill Attitude</strong> columns, they will automatically default to <strong style={{ color: 'var(--text-main)', fontWeight: '750' }}>"Practitioner"</strong> and <strong style={{ color: 'var(--text-main)', fontWeight: '750' }}>"ME"</strong> (Meets Expectations) respectively.
              </div>
            </div>

            {/* How to download instructions */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.04)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '16px',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              fontSize: '0.82rem',
              lineHeight: '1.5',
              color: 'var(--text-muted)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#3b82f6', fontWeight: '800' }}>
                <HelpCircle size={16} /> How to export from iSAMS:
              </div>
              <ol style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <li>Go to <strong>iSAMS</strong>.</li>
                <li>On the <strong>wizard bar</strong> at the top right, go to <strong>Analytics & Insights</strong> &gt; <strong>Create New Report</strong>.</li>
                <li>Choose <strong>Edukit Export</strong>.</li>
                <li>Once it opens, select your name in the <strong>Select User</strong> dropdown (this creates the Excel file with all your assigned classes and student data).</li>
              </ol>
              <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#3b82f6', fontWeight: '700', lineHeight: '1.4' }}>
                💡 If there is any update done in the gradebook, make sure to download the latest roster file. If a student score/grade is missing, please verify that your <strong>OAS (Online Assessment System) gradebook is complete, OAS IS SYNCED AND SAVED</strong> before downloading the Excel file. (Most teachers forget to resync the OAS after changing the gradebook, which results in incorrect or blank grades).
              </div>

            </div>

            {/* Drag & Drop Container inside Modal */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: dragActive 
                  ? '2px dashed var(--primary)' 
                  : '2px dashed var(--border-color-hover)',
                borderRadius: '20px',
                padding: '3.5rem 2rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragActive ? 'rgba(225, 0, 49, 0.05)' : 'rgba(255,255,255,0.01)',
                transition: 'all var(--transition-smooth)',
                marginBottom: '1.5rem',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = dragActive ? 'var(--primary)' : 'var(--border-color-hover)'}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => handleFile(e.target.files?.[0])}
                accept={ACCEPT_ATTRIBUTE}
                style={{ display: 'none' }} 
              />
              
              <Upload size={40} style={{ color: 'var(--primary)', marginBottom: '1.25rem', filter: 'drop-shadow(0 4px 10px var(--primary-glow))' }} />
              <h4 style={{ fontSize: '1.08rem', marginBottom: '0.5rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                Drag and drop your iSAMS Excel here
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: '1.5rem' }}>
                Accepted formats: <strong>.xlsx, .xls, or .csv</strong>. One row per student.
              </p>
              
              <button className="btn btn-secondary" style={{ pointerEvents: 'none', padding: '0.55rem 1.5rem', fontSize: '0.8rem', borderRadius: '10px' }}>
                Browse Files
              </button>
            </div>

            {/* Security Note & Sample Builder */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1.25rem', 
              borderTop: '1px solid var(--border-color)', 
              paddingTop: '1.5rem' 
            }}>
              
              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                <ShieldCheck size={18} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  <strong>🔒 100% Client-Side Privacy:</strong> All calculations and Excel parsing run within your browser. No pupil data is ever uploaded or transmitted to external servers.
                </span>
              </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color)', 
                borderRadius: '16px', 
                padding: '1rem 1.25rem' 
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0, paddingRight: '1rem' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: '800', color: 'var(--text-main)' }}>Need a spreadsheet to test?</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Generate a fully-loaded multi-class sample spreadsheet.</span>
                </div>
                <button 
                  onClick={downloadSampleExcel}
                  className="btn btn-secondary" 
                  style={{ 
                    padding: '0.45rem 1rem', 
                    fontSize: '0.78rem', 
                    borderRadius: '8px', 
                    gap: '0.35rem', 
                    fontWeight: '800',
                    borderColor: 'var(--border-primary)',
                    color: '#fff',
                    background: 'rgba(225, 0, 49, 0.05)',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(225, 0, 49, 0.15)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(225, 0, 49, 0.05)'}
                >
                  <Download size={12} /> Get Roster
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

