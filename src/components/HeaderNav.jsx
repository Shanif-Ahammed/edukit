import React, { useState, useRef } from 'react';
import { 
  Upload, FileSpreadsheet, X, Check, ArrowRight, ShieldCheck, 
  HelpCircle, ChevronDown, RefreshCw, AlertCircle, Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useData } from '../context/DataContext';
import { parseRosterFile, isSupportedRosterFile, ACCEPT_ATTRIBUTE } from '../utils/parseRosterFile';

export default function HeaderNav() {
  const {
    fileConnected,
    fileName,
    classes,
    selectedClass,
    setSelectedClass,
    schoolName,
    connectData,
    changeFile
  } = useData();

  const [modalOpen, setModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [warningMsg, setWarningMsg] = useState(null);
  const fileInputRef = useRef(null);

  // Parse roster file (.xlsx, .xls, or .csv) on upload
  const handleFile = async (file) => {
    if (!file) return;
    const name = file.name;

    if (!isSupportedRosterFile(name)) {
      setErrorMsg("Unsupported file format. Please upload a .xlsx, .xls, or .csv file.");
      return;
    }

    setErrorMsg(null);
    setWarningMsg(null);
    try {
      const rows = await parseRosterFile(file);
      const result = connectData(name, rows);
      if (result.success) {
        if (result.warning) {
          // Keep the modal open so the persistence warning is actually seen
          setWarningMsg(result.warning);
        } else {
          setModalOpen(false);
        }
      } else {
        setErrorMsg(result.error);
      }
    } catch (err) {
      console.error("Roster parsing error:", err);
      setErrorMsg("Failed to read the file. Make sure it is not corrupted.");
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

  // SheetJS: Generate sample iSAMS Excel — multi-subject, 6 classes, mixed demographics
  const downloadSampleExcel = () => {
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

      const cohorts = [
        {
          className: '7A Mathematics',
          subject: 'Mathematics',
          teacher: 'Ms. Carter',
          grade: 'Grade 7',
          attainmentProfile: 'high', // mostly 5, 6, 7
          atlProfile: 'high', // Expert / Practitioner
          demographics: { eal: 0.10, sen: 0.05, gifted: 0.20, emirati: 0.15 }
        },
        {
          className: '8B Mathematics',
          subject: 'Mathematics',
          teacher: 'Mr. Thompson',
          grade: 'Grade 8',
          attainmentProfile: 'mid-low', // mostly 2, 3, 4, 5
          atlProfile: 'low', // Beginner / Novice / Practitioner
          demographics: { eal: 0.25, sen: 0.20, gifted: 0.05, emirati: 0.25 }
        },
        {
          className: '7A Integrated Sciences - English',
          subject: 'Integrated Sciences - English',
          teacher: 'Dr. Aris',
          grade: 'Grade 7',
          attainmentProfile: 'extreme-high', // mostly 6, 7
          atlProfile: 'extreme-high', // Expert
          demographics: { eal: 0.05, sen: 0.05, gifted: 0.35, emirati: 0.10 }
        },
        {
          className: '8B Integrated Sciences - English',
          subject: 'Integrated Sciences - English',
          teacher: 'Mr. Faraday',
          grade: 'Grade 8',
          attainmentProfile: 'mixed', // 3, 4, 5, 6
          atlProfile: 'mixed', // Practitioner / Expert / Beginner
          demographics: { eal: 0.15, sen: 0.10, gifted: 0.15, emirati: 0.20 }
        },
        {
          className: '7A Language and Literature - English',
          subject: 'Language and Literature - English',
          teacher: 'Ms. Austen',
          grade: 'Grade 7',
          attainmentProfile: 'low', // mostly 3, 4
          atlProfile: 'low', // Beginner / Novice
          demographics: { eal: 0.30, sen: 0.25, gifted: 0.0, emirati: 0.30 }
        },
        {
          className: '8B Language and Literature - English',
          subject: 'Language and Literature - English',
          teacher: 'Mr. Shakespeare',
          grade: 'Grade 8',
          attainmentProfile: 'high-average', // mostly 4, 5, 6, 7
          atlProfile: 'high-average', // Practitioner / Expert
          demographics: { eal: 0.12, sen: 0.08, gifted: 0.18, emirati: 0.18 }
        }
      ];

      const rows = [];
      let studentGlobalIndex = 0;

      cohorts.forEach((cohort) => {
        // Generate exactly 22 students per cohort (total 132 students)
        const cohortSize = 22;
        for (let i = 0; i < cohortSize; i++) {
          const isBoy = i % 2 === 0;
          const nameList = isBoy ? boysNames : girlsNames;
          const name = nameList[studentGlobalIndex % nameList.length];
          const gender = isBoy ? 'Male' : 'Female';

          // Generate scores based on attainmentProfile
          let critA, critB, critC, critD;
          
          if (cohort.attainmentProfile === 'extreme-high') {
            critA = Math.min(8, Math.max(6, 6 + (studentGlobalIndex % 3))); // 6, 7, 8
            critB = Math.min(8, Math.max(6, 6 + ((studentGlobalIndex + 1) % 3)));
            critC = Math.min(8, Math.max(6, 5 + ((studentGlobalIndex + 2) % 4))); // 5, 6, 7, 8
            critD = Math.min(8, Math.max(6, 6 + (studentGlobalIndex % 3)));
          } else if (cohort.attainmentProfile === 'high') {
            critA = Math.min(8, Math.max(4, 5 + (studentGlobalIndex % 4))); // 5, 6, 7, 8
            critB = Math.min(8, Math.max(4, 4 + ((studentGlobalIndex + 1) % 4))); // 4, 5, 6, 7
            critC = Math.min(8, Math.max(4, 5 + ((studentGlobalIndex + 2) % 3))); // 5, 6, 7
            critD = Math.min(8, Math.max(4, 4 + (studentGlobalIndex % 4))); // 4, 5, 6, 7
          } else if (cohort.attainmentProfile === 'high-average') {
            critA = Math.min(8, Math.max(3, 4 + (studentGlobalIndex % 4))); // 4, 5, 6, 7
            critB = Math.min(8, Math.max(3, 3 + ((studentGlobalIndex + 1) % 5))); // 3, 4, 5, 6, 7
            critC = Math.min(8, Math.max(3, 4 + ((studentGlobalIndex + 2) % 3))); // 4, 5, 6
            critD = Math.min(8, Math.max(3, 4 + (studentGlobalIndex % 4))); // 4, 5, 6, 7
          } else if (cohort.attainmentProfile === 'mixed') {
            critA = Math.min(8, Math.max(3, 3 + (studentGlobalIndex % 5))); // 3, 4, 5, 6, 7
            critB = Math.min(8, Math.max(2, 3 + ((studentGlobalIndex + 2) % 4))); // 3, 4, 5, 6
            critC = Math.min(8, Math.max(3, 2 + ((studentGlobalIndex + 1) % 5))); // 2, 3, 4, 5, 6
            critD = Math.min(8, Math.max(3, 3 + (studentGlobalIndex % 4))); // 3, 4, 5, 6
          } else if (cohort.attainmentProfile === 'mid-low') {
            critA = Math.min(8, Math.max(1, 2 + (studentGlobalIndex % 4))); // 2, 3, 4, 5
            critB = Math.min(8, Math.max(1, 1 + ((studentGlobalIndex + 2) % 4))); // 1, 2, 3, 4
            critC = Math.min(8, Math.max(1, 2 + ((studentGlobalIndex + 1) % 3))); // 2, 3, 4
            critD = Math.min(8, Math.max(1, 2 + (studentGlobalIndex % 4))); // 2, 3, 4, 5
          } else { // 'low'
            critA = Math.min(8, Math.max(1, 2 + (studentGlobalIndex % 3))); // 2, 3, 4
            critB = Math.min(8, Math.max(1, 2 + ((studentGlobalIndex + 1) % 2))); // 2, 3
            critC = Math.min(8, Math.max(1, 1 + ((studentGlobalIndex + 2) % 4))); // 1, 2, 3, 4
            critD = Math.min(8, Math.max(1, 2 + (studentGlobalIndex % 3))); // 2, 3, 4
          }

          const cpt = critA + critB + critC + critD;

          // IB Grade mapping based on school boundaries
          let ibGrade = 4;
          if (cpt >= 28) ibGrade = 7;
          else if (cpt >= 24) ibGrade = 6;
          else if (cpt >= 19) ibGrade = 5;
          else if (cpt >= 15) ibGrade = 4;
          else if (cpt >= 10) ibGrade = 3;
          else if (cpt >= 6) ibGrade = 2;
          else ibGrade = 1;

          // MEG out of 32 (expected CPT)
          const megOffset = (studentGlobalIndex % 3) - 1; // -1, 0, 1
          const meg = Math.min(32, Math.max(8, cpt + megOffset * 3));

          // Generate ATL Progress based on profile
          let atl = 'Practitioner';
          const r = studentGlobalIndex % 10;
          if (cohort.atlProfile === 'extreme-high') {
            atl = r < 7 ? 'Expert' : 'Practitioner';
          } else if (cohort.atlProfile === 'high') {
            atl = r < 4 ? 'Expert' : r < 9 ? 'Practitioner' : 'Beginner';
          } else if (cohort.atlProfile === 'high-average') {
            atl = r < 2 ? 'Expert' : r < 7 ? 'Practitioner' : r < 9 ? 'Beginner' : 'Novice';
          } else if (cohort.atlProfile === 'mixed') {
            atl = r < 2 ? 'Expert' : r < 6 ? 'Practitioner' : r < 9 ? 'Beginner' : 'Novice';
          } else if (cohort.atlProfile === 'low') {
            atl = r < 1 ? 'Practitioner' : r < 6 ? 'Beginner' : 'Novice';
          }

          // Demographics deterministic thresholds
          const eal = (i / cohortSize) < cohort.demographics.eal;
          const sen = ((i + 3) / cohortSize) < cohort.demographics.sen;
          const gifted = ((i + 7) / cohortSize) < cohort.demographics.gifted && ibGrade >= 5;
          const emirati = ((i + 13) / cohortSize) < cohort.demographics.emirati;

          rows.push({
            'Student Name': name,
            'Class': cohort.className,
            'Grade': cohort.grade,
            'Subject': cohort.subject,
            'Teacher Name': cohort.teacher,
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

          studentGlobalIndex++;
        }
      });

      return rows;
    };

    const sampleRows = generateDemoRoster();
    const ws = XLSX.utils.json_to_sheet(sampleRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Roster');
    ws['!cols'] = [
      { wch: 22 }, { wch: 18 }, { wch: 10 }, { wch: 14 }, { wch: 18 },
      { wch: 8 },  { wch: 7  }, { wch: 7  }, { wch: 7  }, { wch: 7  },
      { wch: 7 },  { wch: 10 }, { wch: 7  }, { wch: 16 }, { wch: 10 },
      { wch: 28 }, { wch: 22 }, { wch: 10 }
    ];
    XLSX.writeFile(wb, 'sisd_edukit_sample_roster.xlsx');
  };

  return (
    <>
      <header 
        className="glass-panel" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem', 
          padding: '1.25rem 2rem', 
          marginBottom: '2rem', 
          borderRadius: '20px',
          border: fileConnected ? '1px solid rgba(16, 185, 129, 0.22)' : '1px solid var(--border-color)',
          background: fileConnected 
            ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.04) 0%, var(--bg-card) 100%)' 
            : 'var(--bg-card)',
          boxShadow: fileConnected ? '0 8px 30px rgba(16, 185, 129, 0.03), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)' : 'var(--shadow-lg)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* LEFT AREA: Title / Banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexGrow: 1 }}>
            {!fileConnected ? (
              // Bounded Intro Banner (Disconnected State)
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ 
                    width: '7px', 
                    height: '7px', 
                    borderRadius: '50%', 
                    background: 'var(--warning)', 
                    boxShadow: '0 0 10px var(--warning)',
                    display: 'inline-block',
                    animation: 'pulse 1.8s infinite'
                  }} />
                  <span style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '-0.01em' }}>
                    Workspace is empty.
                  </span>
                </div>
                <strong style={{ fontSize: '1.02rem', color: 'var(--text-main)', fontWeight: '800', letterSpacing: '-0.02em' }}>
                  Upload your student roster spreadsheet once to activate the portal.
                </strong>
              </div>
            ) : (
              // Slim Connected Status Bar
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {schoolName}
                </span>
                <span style={{
                  fontSize: '0.78rem',
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '30px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                  <Check size={12} /> Live
                </span>
              </div>
            )}
          </div>

          {/* RIGHT AREA: Buttons / Class Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            
            {/* Connected Filename Badge & Change Link */}
            {fileConnected && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.85rem' }}>
                <span style={{ 
                  color: 'var(--primary)', 
                  background: 'rgba(225, 0, 49, 0.05)', 
                  padding: '0.35rem 0.85rem', 
                  borderRadius: '10px', 
                  border: '1px solid rgba(225, 0, 49, 0.2)',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <FileSpreadsheet size={13} style={{ color: 'var(--primary)' }} /> 
                  {fileName.length > 20 ? `${fileName.substring(0, 17)}...` : fileName}
                </span>
                <button 
                  onClick={changeFile}
                  className="btn-change-file"
                >
                  Change file
                </button>
              </div>
            )}

            {/* Upload Activation Button */}
            {!fileConnected && (
              <button 
                className="btn btn-primary" 
                style={{ 
                  padding: '0.55rem 1.35rem', 
                  fontSize: '0.85rem', 
                  borderRadius: '30px', 
                  gap: '0.45rem',
                  boxShadow: '0 6px 18px rgba(225, 0, 49, 0.3)' 
                }}
                onClick={() => { setErrorMsg(null); setWarningMsg(null); setModalOpen(true); }}
              >
                ⚡ Connect Your Data
              </button>
            )}

            {/* Global Class Selector Dropdown */}
            {fileConnected && classes.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label 
                  htmlFor="global-class-select" 
                  style={{ 
                    fontSize: '0.82rem', 
                    fontWeight: '800', 
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em' 
                  }}
                >
                  Class:
                </label>
                <div style={{ position: 'relative' }}>
                  <select 
                    id="global-class-select"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    style={{ 
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      padding: '0.45rem 2.25rem 0.45rem 1rem', 
                      background: 'rgba(255,255,255,0.03)', 
                      border: '1px solid var(--border-color-hover)', 
                      borderRadius: '10px', 
                      color: 'var(--text-main)', 
                      fontSize: '0.86rem', 
                      fontWeight: '750',
                      outline: 'none', 
                      cursor: 'pointer',
                      minWidth: '135px',
                      transition: 'all var(--transition-fast)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--primary)';
                      e.target.style.boxShadow = '0 0 10px rgba(225,0,49,0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-color-hover)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    {classes.map(c => (
                      <option 
                        key={c} 
                        value={c} 
                        style={{ 
                          backgroundColor: 'var(--bg-app)', 
                          color: 'var(--text-main)' 
                        }}
                      >
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown 
                    size={13} 
                    style={{ 
                      position: 'absolute', 
                      right: '10px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      pointerEvents: 'none',
                      color: 'var(--text-muted)' 
                    }} 
                  />
                </div>
              </div>
            )}
            
            {/* If only single class, show class badge */}
            {fileConnected && classes.length === 1 && (
              <span style={{ 
                fontSize: '0.85rem', 
                background: 'rgba(255, 255, 255, 0.03)', 
                padding: '0.45rem 1.15rem', 
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                fontWeight: '750' 
              }}>
                Class: {selectedClass}
              </span>
            )}

          </div>
        </div>
      </header>

      {/* POPUP SLIDE-UP MODAL OVERLAY */}
      {modalOpen && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(3, 7, 18, 0.85)', 
            backdropFilter: 'blur(16px)',
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
              width: '540px', 
              maxWidth: '100%', 
              background: 'var(--bg-app)', 
              boxShadow: 'var(--shadow-xl)', 
              padding: '2.25rem',
              position: 'relative',
              borderRadius: '24px',
              border: '1px solid var(--border-color)',
              margin: 'auto 0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '10px', 
                  background: 'var(--primary-gradient)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#fff',
                  boxShadow: '0 4px 10px rgba(225, 0, 49, 0.2)'
                }}>
                  <FileSpreadsheet size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '850', letterSpacing: '-0.02em' }}>Connect Student Database</h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>Swiss International Scientific School Dubai</span>
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

            {/* Error Notification */}
            {errorMsg && (
              <div 
                style={{ 
                  background: 'rgba(239, 68, 68, 0.08)', 
                  border: '1px solid rgba(239, 68, 68, 0.25)', 
                  color: '#ef4444', 
                  padding: '0.75rem 1rem', 
                  borderRadius: '10px', 
                  fontSize: '0.85rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.6rem',
                  marginBottom: '1rem',
                  fontWeight: '600'
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Persistence Warning Notification */}
            {warningMsg && (
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  color: '#fbbf24',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  marginBottom: '1rem',
                  fontWeight: '600'
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{warningMsg}</span>
              </div>
            )}

            {/* Static Data Disclaimer */}
            <div 
              style={{ 
                background: 'rgba(245, 158, 11, 0.05)', 
                border: '1px solid rgba(245, 158, 11, 0.2)', 
                color: '#fbbf24', 
                padding: '0.85rem 1.15rem', 
                borderRadius: '12px', 
                fontSize: '0.82rem', 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '0.65rem',
                marginBottom: '1.5rem',
                lineHeight: '1.5'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#fbbf24' }} />
              <div>
                <strong style={{ fontWeight: '800' }}>⚠️ Static Data Disclaimer:</strong> This connected database is static. You will need to re-upload the spreadsheet whenever there is a change in classes or student grades. We highly recommend uploading your data after the gradebook is fully complete.
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
                💡 If there is any update done in the gradebook, make sure to download the latest roster file. If a student score is missing, make sure to download the latest file.
              </div>
            </div>

            {/* Drag & Drop Container */}
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
                borderRadius: '16px',
                padding: '3.5rem 2rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragActive ? 'rgba(225, 0, 49, 0.05)' : 'rgba(255,255,255,0.01)',
                transition: 'all var(--transition-fast)',
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
              
              <Upload size={40} style={{ color: 'var(--primary)', marginBottom: '1.15rem', filter: 'drop-shadow(0 4px 10px var(--primary-glow))' }} />
              <h4 style={{ fontSize: '1.05rem', marginBottom: '0.5rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                Drag and drop your iSAMS Excel here
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
                Accepted formats: <strong>.xlsx, .xls, or .csv</strong>. One row per student.
              </p>
              
              <button className="btn btn-secondary" style={{ pointerEvents: 'none', padding: '0.5rem 1.5rem', fontSize: '0.8rem', borderRadius: '8px' }}>
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
              
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <ShieldCheck size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
                  <strong>🔒 100% Client-Side Privacy:</strong> All calculations and Excel parsing run within your browser. No pupil data is ever uploaded or transmitted to external servers.
                </span>
              </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color)', 
                borderRadius: '12px', 
                padding: '0.85rem 1.15rem' 
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, paddingRight: '1rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-main)' }}>Need a spreadsheet to test?</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Generate a fully-loaded multi-class sample spreadsheet.</span>
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
    </>
  );
}
