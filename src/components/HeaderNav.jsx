import React, { useState, useRef } from 'react';
import { 
  Upload, FileSpreadsheet, X, Check, ArrowRight, ShieldCheck, 
  HelpCircle, ChevronDown, RefreshCw, AlertCircle, Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useData } from '../context/DataContext';

export default function HeaderNav() {
  const { 
    fileConnected, 
    fileName, 
    students, 
    classes, 
    selectedClass, 
    setSelectedClass, 
    subject, 
    schoolName, 
    connectData, 
    changeFile 
  } = useData();

  const [modalOpen, setModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  // Parse Excel file on upload
  const handleFile = (file) => {
    if (!file) return;
    const name = file.name;
    const ext = name.split('.').pop().toLowerCase();
    
    if (ext !== 'xlsx' && ext !== 'xls') {
      setErrorMsg("Unsupported file format. Please upload a .xlsx or .xls file.");
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
          setModalOpen(false);
        } else {
          setErrorMsg(result.error);
        }
      } catch (err) {
        console.error("SheetJS parsing error:", err);
        setErrorMsg("Failed to read the Excel file. Make sure it is not corrupted.");
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

  // SheetJS: Generate sample iSAMS Excel — 60 students, 3 classes, MEG out of 32
  const downloadSampleExcel = () => {
    const mkRow = (name, cls, teacher, gender, critA, critB, critC, critD, ibGrade, meg, atl, eal, sen, gifted, emirati) => ({
      'Student Name': name,
      'Class': cls,
      'Subject': 'Mathematics',
      'Teacher Name': teacher,
      'Gender': gender,
      'Crit A': critA,
      'Crit B': critB,
      'Crit C': critC,
      'Crit D': critD,
      'CPT': critA + critB + critC + critD,
      'IB Grade': ibGrade,
      'MEG': meg,
      'ATL Progress': atl,
      'EAL Status': eal ? 'Yes' : 'No',
      'SEN / Learning Support Flag': sen ? 'Yes' : 'No',
      'Gifted & Talented Flag': gifted ? 'Yes' : 'No',
      'Emirati': emirati ? 'Yes' : 'No',
    });

    const sampleRows = [
      // ── 7A Mathematics – Ms. Carter (20 students) ────────────────────────
      mkRow('Liam Henderson',   '7A Mathematics', 'Ms. Carter', 'Male',   7,6,7,6, 6,24, 'Excellent',        false,false,true, false),
      mkRow('Sophia Patel',     '7A Mathematics', 'Ms. Carter', 'Female', 5,5,6,5, 5,19, 'Good',             true, false,false,false),
      mkRow('Marcus Vance',     '7A Mathematics', 'Ms. Carter', 'Male',   4,3,4,3, 3,15, 'Needs Improvement',false,true, false,false),
      mkRow('Ji-Woo Park',      '7A Mathematics', 'Ms. Carter', 'Male',   8,7,8,7, 7,28, 'Excellent',        false,false,true, false),
      mkRow('Zara Ahmed',       '7A Mathematics', 'Ms. Carter', 'Female', 6,5,6,5, 5,24, 'Good',             false,false,false,true),
      mkRow('Fiona Gallagher',  '7A Mathematics', 'Ms. Carter', 'Female', 3,2,3,3, 3,15, 'Needs Improvement',false,true, false,false),
      mkRow('Ethan Caldwell',   '7A Mathematics', 'Ms. Carter', 'Male',   5,6,5,5, 5,19, 'Good',             false,false,false,false),
      mkRow('Maya Patel',       '7A Mathematics', 'Ms. Carter', 'Female', 7,7,8,6, 7,24, 'Excellent',        false,false,true, false),
      mkRow('Oscar Finch',      '7A Mathematics', 'Ms. Carter', 'Male',   4,4,4,4, 4,15, 'Developing',       false,false,false,false),
      mkRow('Nia Brooks',       '7A Mathematics', 'Ms. Carter', 'Female', 6,5,6,6, 5,19, 'Good',             true, false,false,false),
      mkRow('Lucas Thorne',     '7A Mathematics', 'Ms. Carter', 'Male',   5,5,5,4, 5,19, 'Good',             false,false,false,false),
      mkRow('Isabella Rossi',   '7A Mathematics', 'Ms. Carter', 'Female', 3,4,3,4, 3,19, 'Needs Improvement',true, false,false,false),
      mkRow('Dante Cruz',       '7A Mathematics', 'Ms. Carter', 'Male',   6,6,7,5, 6,19, 'Excellent',        false,false,false,false),
      mkRow('Emma Watson',      '7A Mathematics', 'Ms. Carter', 'Female', 5,5,5,5, 5,19, 'Good',             false,false,false,false),
      mkRow('Aisha Nasser',     '7A Mathematics', 'Ms. Carter', 'Female', 7,6,7,7, 6,24, 'Excellent',        false,false,false,true),
      mkRow('Ryan Kowalski',    '7A Mathematics', 'Ms. Carter', 'Male',   4,4,5,4, 4,15, 'Developing',       false,false,false,false),
      mkRow('Chloe Sterling',   '7A Mathematics', 'Ms. Carter', 'Female', 6,6,6,6, 6,24, 'Good',             false,false,true, false),
      mkRow('Ben Hargreaves',   '7A Mathematics', 'Ms. Carter', 'Male',   2,3,2,3, 3,15, 'Needs Improvement',false,true, false,false),
      mkRow('Priya Sharma',     '7A Mathematics', 'Ms. Carter', 'Female', 5,5,6,4, 5,19, 'Good',             true, false,false,false),
      mkRow('Tom\u00e1s Rivera',     '7A Mathematics', 'Ms. Carter', 'Male',   7,7,7,7, 7,28, 'Excellent',        false,false,true, false),
      // ── 8B Mathematics – Mr. Thompson (20 students) ──────────────────────
      mkRow('Alex Mercer',       '8B Mathematics', 'Mr. Thompson', 'Male',   6,5,6,6, 5,24, 'Good',             false,false,false,false),
      mkRow('Sofia Lin',         '8B Mathematics', 'Mr. Thompson', 'Female', 7,7,8,7, 7,28, 'Excellent',        false,false,true, false),
      mkRow('Elena Rostova',     '8B Mathematics', 'Mr. Thompson', 'Female', 4,4,4,3, 4,15, 'Developing',       true, false,false,false),
      mkRow('Tariq Al Mansouri', '8B Mathematics', 'Mr. Thompson', 'Male',   8,7,7,7, 7,24, 'Excellent',        false,false,false,true),
      mkRow('Chloe Bennett',     '8B Mathematics', 'Mr. Thompson', 'Female', 5,5,6,5, 5,19, 'Good',             false,false,false,false),
      mkRow('Jake Morrison',     '8B Mathematics', 'Mr. Thompson', 'Male',   3,3,4,3, 3,15, 'Needs Improvement',false,true, false,false),
      mkRow('Yuki Tanaka',       '8B Mathematics', 'Mr. Thompson', 'Female', 6,6,7,6, 6,24, 'Good',             true, false,false,false),
      mkRow('Daniel Osei',       '8B Mathematics', 'Mr. Thompson', 'Male',   4,5,4,4, 4,15, 'Developing',       false,false,false,false),
      mkRow('Amira Hassan',      '8B Mathematics', 'Mr. Thompson', 'Female', 7,6,7,7, 6,28, 'Excellent',        false,false,false,true),
      mkRow('Connor Walsh',      '8B Mathematics', 'Mr. Thompson', 'Male',   5,4,5,5, 5,19, 'Good',             false,false,false,false),
      mkRow('Lily Nakamura',     '8B Mathematics', 'Mr. Thompson', 'Female', 6,6,6,5, 5,24, 'Good',             false,false,true, false),
      mkRow('Samuel Adeyemi',    '8B Mathematics', 'Mr. Thompson', 'Male',   3,3,3,2, 3,15, 'Needs Improvement',false,true, false,false),
      mkRow('Hana Al Zaabi',     '8B Mathematics', 'Mr. Thompson', 'Female', 7,7,6,6, 6,24, 'Excellent',        false,false,false,true),
      mkRow('Ben Fitzgerald',    '8B Mathematics', 'Mr. Thompson', 'Male',   5,5,5,5, 5,19, 'Good',             false,false,false,false),
      mkRow('Nour Khalil',       '8B Mathematics', 'Mr. Thompson', 'Female', 4,3,4,4, 4,15, 'Developing',       true, false,false,false),
      mkRow('Matteo Ferrari',    '8B Mathematics', 'Mr. Thompson', 'Male',   6,7,6,6, 6,19, 'Excellent',        false,false,false,false),
      mkRow('Jessica Park',      '8B Mathematics', 'Mr. Thompson', 'Female', 7,6,7,6, 6,24, 'Good',             false,false,true, false),
      mkRow('Khalid Ibrahim',    '8B Mathematics', 'Mr. Thompson', 'Male',   2,3,2,2, 2,15, 'Needs Improvement',false,true, false,true),
      mkRow('Vivienne Dubois',   '8B Mathematics', 'Mr. Thompson', 'Female', 5,6,5,5, 5,19, 'Good',             true, false,false,false),
      mkRow('Hamza Qureshi',     '8B Mathematics', 'Mr. Thompson', 'Male',   8,8,7,7, 7,28, 'Excellent',        false,false,true, false),
      // ── 9C Mathematics – Ms. Williams (20 students) ──────────────────────
      mkRow('Charlotte Hughes',  '9C Mathematics', 'Ms. Williams', 'Female', 6,5,6,6, 5,24, 'Good',             false,false,false,false),
      mkRow('Ravi Menon',        '9C Mathematics', 'Ms. Williams', 'Male',   7,7,7,6, 6,24, 'Excellent',        false,false,false,false),
      mkRow('Isabelle Laurent',  '9C Mathematics', 'Ms. Williams', 'Female', 4,4,3,4, 4,15, 'Developing',       true, false,false,false),
      mkRow('Omar Siddiqui',     '9C Mathematics', 'Ms. Williams', 'Male',   5,5,5,5, 5,19, 'Good',             false,false,false,false),
      mkRow('Grace Kim',         '9C Mathematics', 'Ms. Williams', 'Female', 3,3,4,3, 3,15, 'Needs Improvement',false,true, false,false),
      mkRow('Noah Andersson',    '9C Mathematics', 'Ms. Williams', 'Male',   7,6,7,7, 6,28, 'Excellent',        false,false,true, false),
      mkRow('Fatima Al Rashidi', '9C Mathematics', 'Ms. Williams', 'Female', 6,6,7,6, 6,24, 'Good',             false,false,false,true),
      mkRow('Jack Sullivan',     '9C Mathematics', 'Ms. Williams', 'Male',   4,5,4,5, 4,19, 'Developing',       false,false,false,false),
      mkRow('Mei Chen',          '9C Mathematics', 'Ms. Williams', 'Female', 8,7,8,8, 7,28, 'Excellent',        false,false,true, false),
      mkRow('Aarav Nair',        '9C Mathematics', 'Ms. Williams', 'Male',   5,5,4,5, 5,19, 'Good',             true, false,false,false),
      mkRow('Leila Moradi',      '9C Mathematics', 'Ms. Williams', 'Female', 3,4,3,3, 3,15, 'Needs Improvement',false,true, false,false),
      mkRow('Tyler Evans',       '9C Mathematics', 'Ms. Williams', 'Male',   6,6,6,5, 5,19, 'Good',             false,false,false,false),
      mkRow('Amelia Scott',      '9C Mathematics', 'Ms. Williams', 'Female', 7,7,6,7, 6,24, 'Excellent',        false,false,false,false),
      mkRow('Kenji Watanabe',    '9C Mathematics', 'Ms. Williams', 'Male',   5,5,5,5, 5,24, 'Good',             false,false,false,false),
      mkRow('Layla Al Hammadi',  '9C Mathematics', 'Ms. Williams', 'Female', 6,5,6,6, 5,19, 'Good',             false,false,false,true),
      mkRow('Ethan Brooks',      '9C Mathematics', 'Ms. Williams', 'Male',   2,3,2,3, 3,15, 'Needs Improvement',false,true, false,false),
      mkRow('Sana Hussain',      '9C Mathematics', 'Ms. Williams', 'Female', 7,6,6,7, 6,24, 'Good',             true, false,false,false),
      mkRow('Luca Bianchi',      '9C Mathematics', 'Ms. Williams', 'Male',   5,5,6,5, 5,19, 'Excellent',        false,false,false,false),
      mkRow('Aisha Begum',       '9C Mathematics', 'Ms. Williams', 'Female', 4,4,4,4, 4,15, 'Developing',       true, false,false,false),
      mkRow("James O'Brien",     '9C Mathematics', 'Ms. Williams', 'Male',   6,7,6,6, 6,24, 'Good',             false,false,true, false),
    ];

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
                <span style={{ color: 'var(--border-color-hover)' }}>·</span>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: '750', letterSpacing: '-0.02em' }}>
                  {students.length} students
                </span>
                <span style={{ color: 'var(--border-color-hover)' }}>·</span>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: '750', letterSpacing: '-0.02em' }}>
                  {classes.length} classes
                </span>
                <span style={{ color: 'var(--border-color-hover)' }}>·</span>
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
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: 'var(--text-muted)', 
                    textDecoration: 'none', 
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: '750',
                    transition: 'all var(--transition-fast)',
                    padding: '0.2rem 0.4rem',
                    borderRadius: '6px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = 'var(--error)';
                    e.target.style.background = 'rgba(239, 68, 68, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'var(--text-muted)';
                    e.target.style.background = 'transparent';
                  }}
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
                onClick={() => setModalOpen(true)}
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
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
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
                accept=".xlsx,.xls" 
                style={{ display: 'none' }} 
              />
              
              <Upload size={40} style={{ color: 'var(--primary)', marginBottom: '1.15rem', filter: 'drop-shadow(0 4px 10px var(--primary-glow))' }} />
              <h4 style={{ fontSize: '1.05rem', marginBottom: '0.5rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                Drag and drop your iSAMS Excel here
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
                Accepted format: <strong>.xlsx only</strong>. One row per student.
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
