import React, { useState, useRef } from 'react';
import { 
  Sparkles, Users, ArrowRight, ClipboardCheck, GraduationCap,
  Upload, FileSpreadsheet, Check, AlertCircle, ShieldCheck, 
  Download, BarChart3, Grid, Layers, Database, ChevronRight,
  Flame, Lock, HelpCircle, X
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useData } from '../context/DataContext';

// ── PROGRAMMATIC REALISTIC SISD DEMO DATA GENERATOR ───────────────────
const generateDemoRoster = () => {
  const boysNames = [
    'Liam Henderson', 'Marcus Vance', 'Ji-Woo Park', 'Ethan Caldwell', 'Oscar Finch', 'Lucas Thorne',
    'Dante Cruz', 'Ryan Kowalski', 'Ben Hargreaves', 'Tomás Rivera', 'Alex Mercer', 'Tariq Al Mansouri',
    'Jake Morrison', 'Daniel Osei', 'Connor Walsh', 'Samuel Adeyemi', 'Ben Fitzgerald', 'Matteo Ferrari',
    'Khalid Ibrahim', 'Hamza Qureshi', 'Ravi Menon', 'Omar Siddiqui', 'Noah Andersson', 'Jack Sullivan',
    'Aarav Nair', 'Tyler Evans', 'Kenji Watanabe', 'Ethan Brooks', 'Luca Bianchi', "James O'Brien"
  ];
  
  const girlsNames = [
    'Sophia Patel', 'Zara Ahmed', 'Fiona Gallagher', 'Maya Patel', 'Nia Brooks', 'Isabella Rossi',
    'Emma Watson', 'Aisha Nasser', 'Chloe Sterling', 'Priya Sharma', 'Sofia Lin', 'Elena Rostova',
    'Chloe Bennett', 'Yuki Tanaka', 'Amira Hassan', 'Lily Nakamura', 'Hana Al Zaabi', 'Nour Khalil',
    'Jessica Park', 'Vivienne Dubois', 'Charlotte Hughes', 'Isabelle Laurent', 'Grace Kim', 'Fatima Al Rashidi',
    'Mei Chen', 'Leila Moradi', 'Amelia Scott', 'Layla Al Hammadi', 'Sana Hussain', 'Aisha Begum'
  ];
  
  const classesList = [
    { name: '7A Mathematics', teacher: 'Ms. Carter' },
    { name: '8B Mathematics', teacher: 'Mr. Thompson' },
    { name: '9C Mathematics', teacher: 'Ms. Williams' }
  ];
  
  const rows = [];
  
  for (let i = 0; i < 60; i++) {
    const classObj = classesList[i % 3];
    const isBoy = i % 2 === 0;
    const nameList = isBoy ? boysNames : girlsNames;
    const nameIndex = Math.floor(i / 2) % nameList.length;
    const name = nameList[nameIndex];
    const gender = isBoy ? 'Male' : 'Female';
    
    // Programmatic but realistic grade distribution
    const baseVal = (i * 7 + 13) % 6; // 0 to 5
    const critA = Math.min(8, Math.max(2, baseVal + 3));
    const critB = Math.min(8, Math.max(2, baseVal + 2));
    const critC = Math.min(8, Math.max(2, baseVal + 3));
    const critD = Math.min(8, Math.max(2, baseVal + 2));
    const cpt = critA + critB + critC + critD;
    
    // IB grade from 1 to 7 based on CPT
    let ibGrade = 4;
    if (cpt >= 28) ibGrade = 7;
    else if (cpt >= 24) ibGrade = 6;
    else if (cpt >= 19) ibGrade = 5;
    else if (cpt >= 15) ibGrade = 4;
    else if (cpt >= 10) ibGrade = 3;
    else if (cpt >= 6) ibGrade = 2;
    else ibGrade = 1;
    
    // MEG (expected CPT out of 32, typically close to cpt +/- 4)
    const megOffset = (i % 3) - 1; // -1, 0, 1
    const meg = Math.min(32, Math.max(8, cpt + megOffset * 3));
    
    const atlOptions = ['Excellent', 'Good', 'Developing', 'Needs Improvement'];
    const atl = atlOptions[(i % 4) === 0 ? 0 : (i % 4) === 1 || (i % 4) === 2 ? 1 : 2];
    
    const eal = i % 7 === 0;
    const sen = i % 9 === 0;
    const gifted = i % 8 === 0 && ibGrade >= 6;
    const emirati = i % 5 === 0;
    
    rows.push({
      'Student Name': name,
      'Class': classObj.name,
      'Subject': 'Mathematics',
      'Teacher Name': classObj.teacher,
      'Gender': gender,
      'Crit A': critA,
      'Crit B': critB,
      'Crit C': critC,
      'Crit D': critD,
      'CPT': cpt,
      'IB Grade': ibGrade,
      'MEG': meg,
      'ATL Progress': atl,
      'EAL Status': eal ? 'Yes' : 'No',
      'SEN / Learning Support Flag': sen ? 'Yes' : 'No',
      'Gifted & Talented Flag': gifted ? 'Yes' : 'No',
      'Emirati': emirati ? 'Yes' : 'No'
    });
  }
  
  return rows;
};

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
    teacherName, 
    connectData, 
    changeFile 
  } = useData();

  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fileInputRef = useRef(null);

  // ── HANDLERS AND HELPERS ─────────────────────────────────────────────
  const triggerToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const handleFile = (file) => {
    if (!file) return;
    const name = file.name;
    const ext = name.split('.').pop().toLowerCase();
    
    if (ext !== 'xlsx' && ext !== 'xls') {
      setErrorMsg("Unsupported file format. Please upload a .xlsx or .xls file.");
      triggerToast("Unsupported file format.", "error");
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);
        
        const result = connectData(name, rows);
        if (result.success) {
          triggerToast(`Successfully connected: ${name}`);
          setModalOpen(false);
        } else {
          setErrorMsg(result.error);
          triggerToast(result.error, "error");
        }
      } catch (err) {
        console.error("SheetJS parsing error:", err);
        setErrorMsg("Failed to read the Excel file. Make sure it is not corrupted.");
        triggerToast("Failed to parse the Excel file.", "error");
      }
    };
    reader.readAsBinaryString(file);
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

  const loadDemoData = () => {
    try {
      const demoData = generateDemoRoster();
      const result = connectData("SISD_Mathematics_Cohort_2026.xlsx", demoData);
      if (result.success) {
        triggerToast("Loaded Swiss International Scientific School Demo Data!", "success");
        setModalOpen(false);
      } else {
        triggerToast("Failed to load demo data", "error");
      }
    } catch (err) {
      console.error(err);
      triggerToast("An error occurred generating demo data", "error");
    }
  };

  const downloadSampleExcel = () => {
    try {
      const sampleRows = generateDemoRoster();
      const ws = XLSX.utils.json_to_sheet(sampleRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Roster');
      ws['!cols'] = [
        { wch: 22 }, { wch: 18 }, { wch: 14 }, { wch: 18 }, { wch: 8 },
        { wch: 7  }, { wch: 7  }, { wch: 7  }, { wch: 7  }, { wch: 7 },
        { wch: 10 }, { wch: 7  }, { wch: 16 }, { wch: 10 }, { wch: 28 },
        { wch: 22 }, { wch: 10 }
      ];
      XLSX.writeFile(wb, 'sisd_edukit_sample_roster.xlsx');
      triggerToast("Downloaded template: sisd_edukit_sample_roster.xlsx");
    } catch (err) {
      triggerToast("Download failed", "error");
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
          border: toastType === 'success' ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(239, 68, 68, 0.35)',
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
              gap: '4rem',
              marginBottom: '3.5rem', 
              textAlign: 'left' 
            }}>
              <div style={{ flex: '1 1 600px' }}>
                <div 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.65rem', 
                    background: 'rgba(225, 0, 49, 0.04)', 
                    border: '1px solid rgba(225, 0, 49, 0.15)', 
                    padding: '0.5rem 1.35rem', 
                    borderRadius: '50px', 
                    fontSize: '0.8rem', 
                    fontWeight: '800', 
                    color: 'var(--primary)', 
                    marginBottom: '1.75rem', 
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 12px rgba(225,0,49,0.05)',
                    transition: 'all var(--transition-fast)',
                    cursor: 'default'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(225,0,49,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(225,0,49,0.3)';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(225,0,49,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(225,0,49,0.04)';
                    e.currentTarget.style.borderColor = 'rgba(225,0,49,0.15)';
                    e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 12px rgba(225,0,49,0.05)';
                  }}
                >
                  <GraduationCap size={15} style={{ filter: 'drop-shadow(0 0 4px var(--primary-glow))' }} />
                  Swiss International Scientific School Dubai
                </div>
                
                <h1 style={{ 
                  fontSize: '3.8rem', 
                  marginBottom: '1.5rem', 
                  lineHeight: '1.1', 
                  fontWeight: '900', 
                  fontFamily: 'var(--font-header)', 
                  letterSpacing: '-0.045em',
                  color: 'var(--text-main)'
                }}>
                  Empower Your Classroom. <br/>
                  <span style={{ 
                    background: 'linear-gradient(135deg, hsl(347, 100%, 46%) 0%, hsl(340, 100%, 36%) 100%)', 
                    WebkitBackgroundClip: 'text', 
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 4px 12px rgba(225, 0, 49, 0.1))'
                  }}>
                    Elevate Student Learning.
                  </span>
                </h1>
                
                <p style={{ 
                  color: 'var(--text-muted)', 
                  fontSize: '1.25rem', 
                  lineHeight: '1.7', 
                  marginBottom: '0', 
                  maxWidth: '920px',
                  fontFamily: 'var(--font-body)',
                  fontWeight: '400' 
                }}>
                  SISD EduKit is a secure, state-of-the-art suite of classroom productivity tools engineered exclusively for IB educators. Generate personalized, criteria-aligned report card comments, arrange dynamic seating plans, track cohort progression, and create collaborative learning groups in seconds—completely client-side and offline.
                </p>
              </div>

              {/* STUNNING CONCENTRIC SISD LOGO RING CENTERPIECE */}
              <div style={{ 
                flex: '0 0 auto', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto',
                padding: '1rem'
              }}>
                <div style={{
                  position: 'relative',
                  width: '180px',
                  height: '180px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {/* Core Floating Logo Orb */}
                  <div 
                    className="logo-orb-active"
                    style={{
                      position: 'relative',
                      width: '110px',
                      height: '110px',
                      borderRadius: '50%',
                      background: 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                      padding: '0px',
                      transition: 'all var(--transition-smooth)'
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
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.12))'
                      }}
                    >
                      <circle className="sisd-ring sisd-ring-1" cx="100" cy="-8" r="90" />
                      <circle className="sisd-ring sisd-ring-2" cx="100" cy="208" r="90" />
                      <circle className="sisd-ring sisd-ring-3" cx="-8" cy="100" r="90" />
                      <circle className="sisd-ring sisd-ring-4" cx="208" cy="100" r="90" />
                    </svg>
                  </div>
                </div>
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

            {/* PREMIUM DYNAMIC CONTROL HUB (NO INLINE DRAG-AND-DROP) */}
            <div 
              className="glass-panel"
              style={{
                padding: '3rem',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--workspace-banner-bg)',
                border: '1px solid var(--workspace-banner-border)',
                boxShadow: 'var(--shadow-xl), inset 0 1px 0 var(--workspace-banner-inset)',
                marginBottom: '4rem',
                maxWidth: '1280px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '2.5rem',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Internal Accent Glow */}
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(225, 0, 49, 0.1) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />

              <div style={{ flex: '1 1 550px', zIndex: 1 }}>
                <h3 style={{ fontSize: '1.6rem', fontWeight: '850', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.65rem', letterSpacing: '-0.02em' }}>
                  <Flame size={22} style={{ color: 'var(--primary)', filter: 'drop-shadow(0 0 6px var(--primary-glow))' }} />
                  Secure Educator Workspace
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.02rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  Import your pupil grades spreadsheet locally to unlock Comment Generation, Seating Planners, Data Analysis, and student grouping metrics. All processing runs offline in browser memory.
                </p>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <ShieldCheck size={18} style={{ color: '#10b981', filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.3))' }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                    100% Client-Side Privacy: Pupil data never leaves your computer thread.
                  </span>
                </div>
              </div>

              {/* PRIMARY UPLOAD ACTION CALL */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0, zIndex: 1 }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button 
                    className="btn btn-primary"
                    style={{
                      padding: '1rem 2.25rem',
                      fontSize: '1.02rem',
                      borderRadius: '40px',
                      gap: '0.65rem',
                      fontWeight: '850',
                      boxShadow: '0 8px 30px rgba(225, 0, 49, 0.45)',
                      transition: 'all var(--transition-fast)'
                    }}
                    onClick={() => setModalOpen(true)}
                  >
                    ⚡ Connect Your Data
                  </button>

                  <button 
                    className="btn btn-accent" 
                    style={{
                      padding: '1rem 2rem',
                      fontSize: '0.98rem',
                      borderRadius: '40px',
                      gap: '0.55rem',
                      fontWeight: '800',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)'
                    }}
                    onClick={loadDemoData}
                  >
                    ✨ Try with Demo Data
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.86rem', padding: '0 0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>No database ready?</span>
                  <button 
                    onClick={downloadSampleExcel}
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      color: 'var(--primary)', 
                      fontWeight: '800', 
                      textDecoration: 'underline', 
                      cursor: 'pointer', 
                      padding: 0,
                      transition: 'color var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#ff3366'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--primary)'}
                  >
                    Download Sample Excel
                  </button>
                </div>
              </div>
            </div>

            {/* DISCONNECTED PREVIEW GRID OF TOOLS */}
            <h2 style={{ fontSize: '1.5rem', fontWeight: '850', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.65rem', letterSpacing: '-0.02em' }}>
              <ClipboardCheck style={{ color: 'var(--primary)' }} size={24} />
              EduKit Application Suite
            </h2>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', 
              gap: '1.75rem',
              marginBottom: '4rem'
            }}>
              {/* Card 1: Comment Generator */}
              <div 
                className="glass-panel" 
                style={{ 
                  padding: '2.25rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  position: 'relative', 
                  cursor: 'pointer',
                  borderRadius: '24px',
                  border: hoveredCard === 'tool-comment' ? '1px solid rgba(225, 0, 49, 0.35)' : '1px solid var(--border-color)',
                  transform: hoveredCard === 'tool-comment' ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
                  boxShadow: hoveredCard === 'tool-comment' ? 'var(--shadow-xl), 0 0 20px rgba(225, 0, 49, 0.05)' : 'var(--shadow-lg)'
                }}
                onMouseEnter={() => setHoveredCard('tool-comment')}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => setModalOpen(true)}
              >
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  background: 'radial-gradient(circle, rgba(225, 0, 49, 0.1) 0%, transparent 70%)',
                  opacity: hoveredCard === 'tool-comment' ? 0.3 : 0.1,
                  transition: 'opacity var(--transition-smooth)',
                  pointerEvents: 'none'
                }} />

                <span style={{ 
                  position: 'absolute', 
                  top: '20px', 
                  right: '20px', 
                  fontSize: '0.72rem', 
                  background: 'rgba(255,255,255,0.06)', 
                  border: '1px solid var(--border-color)',
                  padding: '0.3rem 0.65rem', 
                  borderRadius: '30px', 
                  color: 'var(--text-muted)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  fontWeight: '750',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
                }}>
                  <Lock size={11} style={{ opacity: 0.8 }} /> Locked
                </span>
                
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: 'rgba(225,0,49,0.08)', 
                  color: 'var(--primary)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginBottom: '1.5rem',
                  border: '1px solid rgba(225,0,49,0.15)',
                  boxShadow: hoveredCard === 'tool-comment' ? '0 8px 20px rgba(225, 0, 49, 0.2)' : 'none',
                  transition: 'all var(--transition-smooth)'
                }}>
                  <Sparkles size={24} />
                </div>
                
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.65rem', fontWeight: '850', letterSpacing: '-0.02em' }}>Comment Generator</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', lineHeight: '1.6', flexGrow: 1, marginBottom: '1.5rem' }}>
                  Generate comprehensive criterion-based comments instantly. Custom draft boundaries automatically alert low grades.
                </p>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.45rem', 
                  color: 'var(--primary)', 
                  fontWeight: '800', 
                  fontSize: '0.88rem',
                  transition: 'transform var(--transition-fast)',
                  transform: hoveredCard === 'tool-comment' ? 'translateX(4px)' : 'translateX(0)'
                }}>
                  Connect Roster to Open <ChevronRight size={14} />
                </div>
              </div>

              {/* Card 2: Seating Planner */}
              <div 
                className="glass-panel" 
                style={{ 
                  padding: '2.25rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  position: 'relative', 
                  cursor: 'pointer',
                  borderRadius: '24px',
                  border: hoveredCard === 'tool-seating' ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid var(--border-color)',
                  transform: hoveredCard === 'tool-seating' ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
                  boxShadow: hoveredCard === 'tool-seating' ? 'var(--shadow-xl), 0 0 20px rgba(59, 130, 246, 0.05)' : 'var(--shadow-lg)'
                }}
                onMouseEnter={() => setHoveredCard('tool-seating')}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => setModalOpen(true)}
              >
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
                  opacity: hoveredCard === 'tool-seating' ? 0.3 : 0.1,
                  transition: 'opacity var(--transition-smooth)',
                  pointerEvents: 'none'
                }} />

                <span style={{ 
                  position: 'absolute', 
                  top: '20px', 
                  right: '20px', 
                  fontSize: '0.72rem', 
                  background: 'rgba(255,255,255,0.06)', 
                  border: '1px solid var(--border-color)',
                  padding: '0.3rem 0.65rem', 
                  borderRadius: '30px', 
                  color: 'var(--text-muted)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  fontWeight: '750',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
                }}>
                  <Lock size={11} style={{ opacity: 0.8 }} /> Locked
                </span>

                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: 'rgba(59,130,246,0.08)', 
                  color: '#3b82f6', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginBottom: '1.5rem',
                  border: '1px solid rgba(59,130,246,0.15)',
                  boxShadow: hoveredCard === 'tool-seating' ? '0 8px 20px rgba(59, 130, 246, 0.2)' : 'none',
                  transition: 'all var(--transition-smooth)'
                }}>
                  <Users size={24} />
                </div>
                
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.65rem', fontWeight: '850', letterSpacing: '-0.02em' }}>Seating Chart & Group Planner</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', lineHeight: '1.6', flexGrow: 1, marginBottom: '1.5rem' }}>
                  Arrange classroom desks in grids or clusters. Drag-and-drop live edit with premium layout controls.
                </p>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.45rem', 
                  color: '#3b82f6', 
                  fontWeight: '800', 
                  fontSize: '0.88rem',
                  transition: 'transform var(--transition-fast)',
                  transform: hoveredCard === 'tool-seating' ? 'translateX(4px)' : 'translateX(0)'
                }}>
                  Connect Roster to Open <ChevronRight size={14} />
                </div>
              </div>

              {/* Card 3: Data Analysis */}
              <div 
                className="glass-panel" 
                style={{ 
                  padding: '2.25rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  position: 'relative', 
                  cursor: 'pointer',
                  borderRadius: '24px',
                  border: hoveredCard === 'tool-analysis' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border-color)',
                  transform: hoveredCard === 'tool-analysis' ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
                  boxShadow: hoveredCard === 'tool-analysis' ? 'var(--shadow-xl), 0 0 20px rgba(245, 158, 11, 0.05)' : 'var(--shadow-lg)'
                }}
                onMouseEnter={() => setHoveredCard('tool-analysis')}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => setModalOpen(true)}
              >
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)',
                  opacity: hoveredCard === 'tool-analysis' ? 0.3 : 0.1,
                  transition: 'opacity var(--transition-smooth)',
                  pointerEvents: 'none'
                }} />

                <span style={{ 
                  position: 'absolute', 
                  top: '20px', 
                  right: '20px', 
                  fontSize: '0.72rem', 
                  background: 'rgba(255,255,255,0.06)', 
                  border: '1px solid var(--border-color)',
                  padding: '0.3rem 0.65rem', 
                  borderRadius: '30px', 
                  color: 'var(--text-muted)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  fontWeight: '750',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
                }}>
                  <Lock size={11} style={{ opacity: 0.8 }} /> Locked
                </span>

                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: 'rgba(245,158,11,0.08)', 
                  color: '#f59e0b', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginBottom: '1.5rem',
                  border: '1px solid rgba(245,158,11,0.15)',
                  boxShadow: hoveredCard === 'tool-analysis' ? '0 8px 20px rgba(245, 158, 11, 0.2)' : 'none',
                  transition: 'all var(--transition-smooth)'
                }}>
                  <BarChart3 size={24} />
                </div>
                
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.65rem', fontWeight: '850', letterSpacing: '-0.02em' }}>Cohort Data Analysis</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', lineHeight: '1.6', flexGrow: 1, marginBottom: '1.5rem' }}>
                  Review global attainment, KHDA progress levels, target MEGs, and retrieve automated pedagogical instructions.
                </p>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.45rem', 
                  color: '#f59e0b', 
                  fontWeight: '800', 
                  fontSize: '0.88rem',
                  transition: 'transform var(--transition-fast)',
                  transform: hoveredCard === 'tool-analysis' ? 'translateX(4px)' : 'translateX(0)'
                }}>
                  Connect Roster to Open <ChevronRight size={14} />
                </div>
              </div>
            </div>

            {/* Features Highlights Banner */}
            <div 
              className="glass-panel" 
              style={{ 
                padding: '2.5rem', 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '2.5rem',
                textAlign: 'left',
                background: 'rgba(255, 255, 255, 0.01)',
                fontSize: '0.94rem',
                color: 'var(--text-muted)',
                borderRadius: '24px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,0.03)'
              }}
            >
              <div>
                <strong style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.65rem', fontSize: '1.05rem', fontWeight: '800' }}>
                  <ShieldCheck size={18} style={{ color: '#10b981' }} />
                  100% Client-Side Privacy
                </strong>
                All parsing and data calculations run directly in the memory thread. Your student files are never transmitted to outside servers.
              </div>
              <div style={{ borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', padding: '0 2rem' }}>
                <strong style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.65rem', fontSize: '1.05rem', fontWeight: '800' }}>
                  <Flame size={18} style={{ color: 'var(--primary)' }} />
                  Instant Offline Generation
                </strong>
                Process records and formulate massive comment exports in milliseconds. Offline capability ensures seamless workspace stability.
              </div>
              <div>
                <strong style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.65rem', fontSize: '1.05rem', fontWeight: '800' }}>
                  <Database size={18} style={{ color: 'var(--accent)' }} />
                  IB MYP Criteria Compliant
                </strong>
                Specifically modeled to handle IB assessment criteria A, B, C, D, and CPT point structures out of 32 dynamically.
              </div>
            </div>

          </div>
        ) : (
          
          /* ==================================================================
             STATE B: CONNECTED (PREMIUM WORKSPACE DASHBOARD)
             ================================================================== */
          <div>
            
            {/* Cohort Workspace Active Header */}
            <div className="glass-panel" style={{
              padding: '2.5rem 3rem',
              marginBottom: '3rem',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, rgba(225, 0, 49, 0.08) 0%, rgba(99, 102, 241, 0.02) 100%)',
              border: '1px solid rgba(225, 0, 49, 0.18)',
              boxShadow: 'var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '2rem'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <span style={{ 
                    fontSize: '0.8rem', 
                    color: '#10b981', 
                    background: 'rgba(16, 185, 129, 0.12)', 
                    padding: '0.3rem 0.85rem', 
                    borderRadius: '50px', 
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.1)'
                  }}>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#10b981',
                      animation: 'pulse 1.5s infinite',
                      display: 'inline-block'
                    }} />
                    Active Workspace Live
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>
                    Swiss International Scientific School Dubai
                  </span>
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.035em', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                  Educator Workspace Live
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.02rem', fontWeight: '500' }}>
                  Subject: <strong style={{ color: 'var(--text-main)', fontWeight: '750' }}>{subject}</strong> · Cohort Instructor: <strong style={{ color: 'var(--text-main)', fontWeight: '750' }}>{teacherName}</strong>
                </p>
              </div>

              {/* Data controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span className="glass-panel" style={{
                  padding: '0.65rem 1.35rem',
                  fontSize: '0.88rem',
                  fontWeight: '750',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(225, 0, 49, 0.25)',
                  borderRadius: '12px',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)'
                }}>
                  <FileSpreadsheet size={16} />
                  {fileName.length > 25 ? `${fileName.substring(0, 22)}...` : fileName}
                </span>
                
                <button 
                  onClick={changeFile}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.65rem 1.35rem',
                    fontSize: '0.85rem',
                    borderRadius: '12px',
                    fontWeight: '750',
                    color: 'var(--error)',
                    borderColor: 'rgba(239, 68, 68, 0.2)'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.08)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  Disconnect Data
                </button>
              </div>
            </div>

            {/* ACTIVE COHORT METRICS ROW */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
              gap: '1.75rem',
              marginBottom: '3.5rem'
            }}>
              
              {/* KPI CARD 1: Cohort size */}
              <div 
                className="glass-panel" 
                style={{ 
                  padding: '1.75rem', 
                  borderRadius: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.35rem',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'default',
                  border: hoveredCard === 'cohort' ? '1px solid rgba(225, 0, 49, 0.35)' : '1px solid var(--border-color)',
                  transform: hoveredCard === 'cohort' ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
                  boxShadow: hoveredCard === 'cohort' ? 'var(--shadow-xl), 0 8px 30px rgba(225, 0, 49, 0.06)' : 'var(--shadow-lg)'
                }}
                onMouseEnter={() => setHoveredCard('cohort')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Backing Ambient Glare */}
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  background: 'radial-gradient(circle, rgba(225, 0, 49, 0.15) 0%, transparent 70%)',
                  opacity: hoveredCard === 'cohort' ? 0.35 : 0.12,
                  transition: 'opacity var(--transition-smooth)',
                  pointerEvents: 'none',
                  zIndex: 0
                }} />

                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'var(--primary-gradient)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: hoveredCard === 'cohort' ? '0 8px 20px rgba(225, 0, 49, 0.3)' : 'none',
                  transform: hoveredCard === 'cohort' ? 'scale(1.08) rotate(3deg)' : 'scale(1) rotate(0deg)',
                  transition: 'all var(--transition-smooth)',
                  zIndex: 1
                }}>
                  <Users size={25} />
                </div>
                <div style={{ zIndex: 1 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.06em' }}>Cohort Size</span>
                  <strong style={{ fontSize: '2rem', fontWeight: '900', display: 'block', lineHeight: '1.1', margin: '3px 0', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>{students.length}</strong>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '600' }}>{boys} Boys · {girls} Girls</span>
                </div>

                {/* Bottom accent glow line */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '12%',
                  right: '12%',
                  height: '2px',
                  background: 'var(--primary-gradient)',
                  opacity: hoveredCard === 'cohort' ? 1 : 0.25,
                  borderRadius: '100px',
                  transition: 'all var(--transition-smooth)'
                }} />
              </div>

              {/* KPI CARD 2: Active Classes */}
              <div 
                className="glass-panel" 
                style={{ 
                  padding: '1.75rem', 
                  borderRadius: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.35rem',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'default',
                  border: hoveredCard === 'classes' ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid var(--border-color)',
                  transform: hoveredCard === 'classes' ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
                  boxShadow: hoveredCard === 'classes' ? 'var(--shadow-xl), 0 8px 30px rgba(99, 102, 241, 0.06)' : 'var(--shadow-lg)'
                }}
                onMouseEnter={() => setHoveredCard('classes')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Backing Ambient Glare */}
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                  opacity: hoveredCard === 'classes' ? 0.35 : 0.12,
                  transition: 'opacity var(--transition-smooth)',
                  pointerEvents: 'none',
                  zIndex: 0
                }} />

                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: hoveredCard === 'classes' ? '0 8px 20px rgba(99, 102, 241, 0.3)' : 'none',
                  transform: hoveredCard === 'classes' ? 'scale(1.08) rotate(3deg)' : 'scale(1) rotate(0deg)',
                  transition: 'all var(--transition-smooth)',
                  zIndex: 1
                }}>
                  <Grid size={25} />
                </div>
                <div style={{ zIndex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.06em' }}>Cohort Classes</span>
                  <strong style={{ fontSize: '2rem', fontWeight: '900', display: 'block', lineHeight: '1.1', margin: '3px 0', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>{classes.length}</strong>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', fontWeight: '600' }}>
                    {classes.join(', ')}
                  </span>
                </div>

                {/* Bottom accent glow line */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '12%',
                  right: '12%',
                  height: '2px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                  opacity: hoveredCard === 'classes' ? 1 : 0.25,
                  borderRadius: '100px',
                  transition: 'all var(--transition-smooth)'
                }} />
              </div>

              {/* KPI CARD 3: Inclusion Demographics */}
              <div 
                className="glass-panel" 
                style={{ 
                  padding: '1.75rem', 
                  borderRadius: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.35rem',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'default',
                  border: hoveredCard === 'inclusion' ? '1px solid rgba(13, 148, 136, 0.35)' : '1px solid var(--border-color)',
                  transform: hoveredCard === 'inclusion' ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
                  boxShadow: hoveredCard === 'inclusion' ? 'var(--shadow-xl), 0 8px 30px rgba(13, 148, 136, 0.06)' : 'var(--shadow-lg)'
                }}
                onMouseEnter={() => setHoveredCard('inclusion')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Backing Ambient Glare */}
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  background: 'radial-gradient(circle, rgba(13, 148, 136, 0.15) 0%, transparent 70%)',
                  opacity: hoveredCard === 'inclusion' ? 0.35 : 0.12,
                  transition: 'opacity var(--transition-smooth)',
                  pointerEvents: 'none',
                  zIndex: 0
                }} />

                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: hoveredCard === 'inclusion' ? '0 8px 20px rgba(13, 148, 136, 0.3)' : 'none',
                  transform: hoveredCard === 'inclusion' ? 'scale(1.08) rotate(3deg)' : 'scale(1) rotate(0deg)',
                  transition: 'all var(--transition-smooth)',
                  zIndex: 1
                }}>
                  <ShieldCheck size={25} />
                </div>
                <div style={{ zIndex: 1 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.06em' }}>Demographics</span>
                  <strong style={{ fontSize: '2rem', fontWeight: '900', display: 'block', lineHeight: '1.1', margin: '3px 0', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>{senCount + ealCount + giftedCount + emiratiCount}</strong>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    {senCount} Inclusion · {ealCount} EAL · {emiratiCount} Local
                  </span>
                </div>

                {/* Bottom accent glow line */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '12%',
                  right: '12%',
                  height: '2px',
                  background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                  opacity: hoveredCard === 'inclusion' ? 1 : 0.25,
                  borderRadius: '100px',
                  transition: 'all var(--transition-smooth)'
                }} />
              </div>

              {/* KPI CARD 4: Average IB Attainment */}
              <div 
                className="glass-panel" 
                style={{ 
                  padding: '1.75rem', 
                  borderRadius: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.35rem',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'default',
                  border: hoveredCard === 'attainment' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border-color)',
                  transform: hoveredCard === 'attainment' ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
                  boxShadow: hoveredCard === 'attainment' ? 'var(--shadow-xl), 0 8px 30px rgba(245, 158, 11, 0.06)' : 'var(--shadow-lg)'
                }}
                onMouseEnter={() => setHoveredCard('attainment')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Backing Ambient Glare */}
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
                  opacity: hoveredCard === 'attainment' ? 0.35 : 0.12,
                  transition: 'opacity var(--transition-smooth)',
                  pointerEvents: 'none',
                  zIndex: 0
                }} />

                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: hoveredCard === 'attainment' ? '0 8px 20px rgba(245, 158, 11, 0.3)' : 'none',
                  transform: hoveredCard === 'attainment' ? 'scale(1.08) rotate(3deg)' : 'scale(1) rotate(0deg)',
                  transition: 'all var(--transition-smooth)',
                  zIndex: 1
                }}>
                  <BarChart3 size={25} />
                </div>
                <div style={{ zIndex: 1 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.06em' }}>IB Attainment Avg</span>
                  <strong style={{ fontSize: '2rem', fontWeight: '900', display: 'block', lineHeight: '1.1', margin: '3px 0', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                    {avgIb}
                  </strong>
                  <span style={{ fontSize: '0.84rem', fontWeight: '800', color: getCohortDescriptorColor(avgIb), filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.1))' }}>
                    KHDA: {getCohortDescriptor(avgIb)}
                  </span>
                </div>

                {/* Bottom accent glow line */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '12%',
                  right: '12%',
                  height: '2px',
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  opacity: hoveredCard === 'attainment' ? 1 : 0.25,
                  borderRadius: '100px',
                  transition: 'all var(--transition-smooth)'
                }} />
              </div>

            </div>

            {/* ACTIVE WORKSPACE TOOL SELECTIONS */}
            <h2 style={{ fontSize: '1.5rem', fontWeight: '850', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.65rem', letterSpacing: '-0.02em' }}>
              <ClipboardCheck style={{ color: 'var(--primary)' }} size={24} />
              Class Workspace Modules
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '2rem',
              marginBottom: '4rem'
            }}>
              
              {/* Tool Card 1: Comment Generator */}
              <div 
                className="glass-panel glass-panel-hover"
                style={{ 
                  padding: '2.25rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '100%', 
                  cursor: 'pointer',
                  borderRadius: '24px',
                  border: hoveredCard === 'mod-comment' ? '1px solid rgba(225, 0, 49, 0.35)' : '1px solid var(--border-color)',
                  transform: hoveredCard === 'mod-comment' ? 'translateY(-4px)' : 'translateY(0)'
                }}
                onMouseEnter={() => setHoveredCard('mod-comment')}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => setActiveTool('comment')}
              >
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'var(--primary-gradient)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.75rem',
                  boxShadow: hoveredCard === 'mod-comment' ? '0 8px 24px rgba(225, 0, 49, 0.35)' : '0 4px 12px rgba(225, 0, 49, 0.15)',
                  transition: 'all var(--transition-smooth)'
                }}>
                  <Sparkles size={25} />
                </div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.85rem', fontWeight: '850', display: 'flex', alignItems: 'center', justifyContent: 'space-between', letterSpacing: '-0.02em' }}>
                  Comment Generator
                  <span style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16,185,129,0.18)', padding: '0.25rem 0.65rem', borderRadius: '30px', fontWeight: '800' }}>
                    {students.length} Ranks Ready
                  </span>
                </h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.65', fontSize: '0.94rem', flexGrow: 1, marginBottom: '1.75rem' }}>
                  Generate detailed, personalized criterion remarks based on Student grades and ATL values. Safe manual drafting holds warnings for grades 1 or 2.
                </p>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  color: 'var(--primary)', 
                  fontWeight: '800', 
                  fontSize: '0.92rem',
                  transition: 'transform var(--transition-fast)',
                  transform: hoveredCard === 'mod-comment' ? 'translateX(6px)' : 'translateX(0)'
                }}>
                  Launch Comment Generator <ArrowRight size={16} />
                </div>
              </div>

              {/* Tool Card 2: Seating Chart */}
              <div 
                className="glass-panel glass-panel-hover"
                style={{ 
                  padding: '2.25rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '100%', 
                  cursor: 'pointer',
                  borderRadius: '24px',
                  border: hoveredCard === 'mod-seating' ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid var(--border-color)',
                  transform: hoveredCard === 'mod-seating' ? 'translateY(-4px)' : 'translateY(0)'
                }}
                onMouseEnter={() => setHoveredCard('mod-seating')}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => setActiveTool('seating')}
              >
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.75rem',
                  boxShadow: hoveredCard === 'mod-seating' ? '0 8px 24px rgba(59, 130, 246, 0.35)' : '0 4px 12px rgba(59, 130, 246, 0.15)',
                  transition: 'all var(--transition-smooth)'
                }}>
                  <Users size={25} />
                </div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.85rem', fontWeight: '850', display: 'flex', alignItems: 'center', justifyContent: 'space-between', letterSpacing: '-0.02em' }}>
                  Seating Chart Planner
                  <span style={{ fontSize: '0.75rem', color: '#3b82f6', background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.18)', padding: '0.25rem 0.65rem', borderRadius: '30px', fontWeight: '800' }}>
                    Interactive Grid
                  </span>
                </h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.65', fontSize: '0.94rem', flexGrow: 1, marginBottom: '1.75rem' }}>
                  Design physical desk arrangements. Live drag-and-drop layout options (rows, clusters, circular configuration) mapping student tags.
                </p>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  color: '#3b82f6', 
                  fontWeight: '800', 
                  fontSize: '0.92rem',
                  transition: 'transform var(--transition-fast)',
                  transform: hoveredCard === 'mod-seating' ? 'translateX(6px)' : 'translateX(0)'
                }}>
                  Launch Seating Planner <ArrowRight size={16} />
                </div>
              </div>

              {/* Tool Card 3: Data Analysis */}
              <div 
                className="glass-panel glass-panel-hover"
                style={{ 
                  padding: '2.25rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '100%', 
                  cursor: 'pointer',
                  borderRadius: '24px',
                  border: hoveredCard === 'mod-analysis' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border-color)',
                  transform: hoveredCard === 'mod-analysis' ? 'translateY(-4px)' : 'translateY(0)'
                }}
                onMouseEnter={() => setHoveredCard('mod-analysis')}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => setActiveTool('analysis')}
              >
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.75rem',
                  boxShadow: hoveredCard === 'mod-analysis' ? '0 8px 24px rgba(217, 119, 6, 0.35)' : '0 4px 12px rgba(217, 119, 6, 0.15)',
                  transition: 'all var(--transition-smooth)'
                }}>
                  <BarChart3 size={25} />
                </div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.85rem', fontWeight: '850', display: 'flex', alignItems: 'center', justifyContent: 'space-between', letterSpacing: '-0.02em' }}>
                  Cohort Data Analysis
                  <span style={{ fontSize: '0.75rem', color: '#fbbf24', background: 'rgba(251, 191, 36, 0.12)', border: '1px solid rgba(251, 191, 36, 0.18)', padding: '0.25rem 0.65rem', borderRadius: '30px', fontWeight: '800' }}>
                    KHDA Descriptor
                  </span>
                </h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.65', fontSize: '0.94rem', flexGrow: 1, marginBottom: '1.75rem' }}>
                  Track criteria trends, KHDA progress descriptors, target MEGs comparison, and generate automated classroom intervention remarks.
                </p>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  color: '#fbbf24', 
                  fontWeight: '800', 
                  fontSize: '0.92rem',
                  transition: 'transform var(--transition-fast)',
                  transform: hoveredCard === 'mod-analysis' ? 'translateX(6px)' : 'translateX(0)'
                }}>
                  Launch Cohort Analysis <ArrowRight size={16} />
                </div>
              </div>

              {/* Tool Card 4: Gradebook Preview */}
              <div 
                className="glass-panel glass-panel-hover"
                style={{ 
                  padding: '2.25rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '100%', 
                  cursor: 'pointer',
                  borderRadius: '24px',
                  border: hoveredCard === 'mod-atl' ? '1px solid rgba(13, 148, 136, 0.35)' : '1px solid var(--border-color)',
                  transform: hoveredCard === 'mod-atl' ? 'translateY(-4px)' : 'translateY(0)'
                }}
                onMouseEnter={() => setHoveredCard('mod-atl')}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => setActiveTool('atl')}
              >
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.75rem',
                  boxShadow: hoveredCard === 'mod-atl' ? '0 8px 24px rgba(13, 148, 136, 0.35)' : '0 4px 12px rgba(13, 148, 136, 0.15)',
                  transition: 'all var(--transition-smooth)'
                }}>
                  <Grid size={25} />
                </div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.85rem', fontWeight: '850', display: 'flex', alignItems: 'center', justifyContent: 'space-between', letterSpacing: '-0.02em' }}>
                  Gradebook Preview
                  <span style={{ fontSize: '0.75rem', color: '#14b8a6', background: 'rgba(20, 184, 166, 0.12)', border: '1px solid rgba(20, 184, 166, 0.18)', padding: '0.25rem 0.65rem', borderRadius: '30px', fontWeight: '800' }}>
                    Quick Matrix
                  </span>
                </h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.65', fontSize: '0.94rem', flexGrow: 1, marginBottom: '1.75rem' }}>
                  Preview class lists in grid format, inspect criteria A, B, C, D details, tag assignments, and safely edit individual records.
                </p>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  color: '#14b8a6', 
                  fontWeight: '800', 
                  fontSize: '0.92rem',
                  transition: 'transform var(--transition-fast)',
                  transform: hoveredCard === 'mod-atl' ? 'translateX(6px)' : 'translateX(0)'
                }}>
                  Launch Gradebook Preview <ArrowRight size={16} />
                </div>
              </div>

              {/* Tool Card 5: Group Maker */}
              <div 
                className="glass-panel glass-panel-hover"
                style={{ 
                  padding: '2.25rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '100%', 
                  cursor: 'pointer',
                  borderRadius: '24px',
                  border: hoveredCard === 'mod-groups' ? '1px solid rgba(236, 72, 153, 0.35)' : '1px solid var(--border-color)',
                  transform: hoveredCard === 'mod-groups' ? 'translateY(-4px)' : 'translateY(0)'
                }}
                onMouseEnter={() => setHoveredCard('mod-groups')}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => setActiveTool('groups')}
              >
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.75rem',
                  boxShadow: hoveredCard === 'mod-groups' ? '0 8px 24px rgba(236, 72, 153, 0.35)' : '0 4px 12px rgba(236, 72, 153, 0.15)',
                  transition: 'all var(--transition-smooth)'
                }}>
                  <Layers size={25} />
                </div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.85rem', fontWeight: '850', display: 'flex', alignItems: 'center', justifyContent: 'space-between', letterSpacing: '-0.02em' }}>
                  Group Maker
                  <span style={{ fontSize: '0.75rem', color: '#ec4899', background: 'rgba(236, 72, 153, 0.12)', border: '1px solid rgba(236, 72, 153, 0.18)', padding: '0.25rem 0.65rem', borderRadius: '30px', fontWeight: '800' }}>
                    Dynamic Teams
                  </span>
                </h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.65', fontSize: '0.94rem', flexGrow: 1, marginBottom: '1.75rem' }}>
                  Create cooperative learning structures mathematically balanced by genders, attainment bands, inclusion requirements, or custom rules.
                </p>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  color: '#ec4899', 
                  fontWeight: '800', 
                  fontSize: '0.92rem',
                  transition: 'transform var(--transition-fast)',
                  transform: hoveredCard === 'mod-groups' ? 'translateX(6px)' : 'translateX(0)'
                }}>
                  Launch Group Creator <ArrowRight size={16} />
                </div>
              </div>

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
                  We identified <strong style={{ color: 'var(--primary)' }}>{ealCount} EAL student(s)</strong> in the class. When using Seating Chart desks, place EAL pupils alongside peers with 'Excellent' or 'Good' ATL communication ratings.
                </div>
                
                <div style={{ 
                  background: 'rgba(0,0,0,0.22)', 
                  padding: '1.5rem', 
                  borderRadius: '16px', 
                  border: '1px solid rgba(255,255,255,0.04)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)'
                }}>
                  <span style={{ fontWeight: '800', color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem', fontSize: '1.02rem' }}>🧠 Gifted & Talented Extension</span>
                  We identified <strong style={{ color: '#3b82f6' }}>{giftedCount} MAGT student(s)</strong>. Ensure they receive high-level conceptual prompts, and consider using Group Maker's peer-mentoring settings.
                </div>
                
                <div style={{ 
                  background: 'rgba(0,0,0,0.22)', 
                  padding: '1.5rem', 
                  borderRadius: '16px', 
                  border: '1px solid rgba(255,255,255,0.04)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)'
                }}>
                  <span style={{ fontWeight: '800', color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem', fontSize: '1.02rem' }}>🤝 Learning Support Accommodation</span>
                  We identified <strong style={{ color: '#fbbf24' }}>{senCount} Inclusion student(s)</strong>. Ensure individual educational profiles (IEP) are reflected in classroom layout settings and collaborative groupings.
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
              <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#3b82f6', fontWeight: '700' }}>
                💡 We recommend downloading this file after completing your gradebook and resyncing/saving the grades in OAS.
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
                accept=".xlsx,.xls" 
                style={{ display: 'none' }} 
              />
              
              <Upload size={40} style={{ color: 'var(--primary)', marginBottom: '1.25rem', filter: 'drop-shadow(0 4px 10px var(--primary-glow))' }} />
              <h4 style={{ fontSize: '1.08rem', marginBottom: '0.5rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                Drag and drop your iSAMS Excel here
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: '1.5rem' }}>
                Accepted format: <strong>.xlsx only</strong>. One row per student.
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

