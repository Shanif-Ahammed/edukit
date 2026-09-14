import React from 'react';
import {
  BarChart3, Printer, GraduationCap, AlertCircle
} from 'lucide-react';
import { useData } from '../context/DataContext';

const TAG_CONFIG = {
  Emirati: { bg: '#e6f4ea', text: '#047857', border: '#10b981', classKey: 'emirati' },
  EAL: { bg: '#e8f0fe', text: '#1d4ed8', border: '#3b82f6', classKey: 'eal' },
  MAGT: { bg: '#f3e8ff', text: '#6d28d9', border: '#8b5cf6', classKey: 'magt' },
  Inclusion: { bg: '#fce8e6', text: '#b91c1c', border: '#ef4444', classKey: 'inclusion' },
  Boarding: { bg: '#fef7e0', text: '#b45309', border: '#f59e0b', classKey: 'boarding' }
};

export default function GradebookList() {
  const { fileConnected, students, selectedClass, subject, teacherName, schoolName } = useData();

  if (!fileConnected) {
    return (
      <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
        <div className="glass-panel" style={{ padding: '5rem 2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--primary-glow)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 0 20px rgba(225, 0, 49, 0.15)'
          }}>
            <BarChart3 size={38} className="animate-pulse" />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', fontWeight: '800' }}>Class Context Sheet</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '520px', margin: '0 auto 2rem', fontSize: '0.92rem' }}>
            Connect your Master Excel iSAMS database at the top of the portal to generate professional, print-optimized A4 Landscape Class Context Sheets.
          </p>
        </div>
      </div>
    );
  }

  // Filter students to active class
  const classStudents = students.filter(s => s.className === selectedClass);

  if (classStudents.length === 0) {
    return (
      <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
        <div className="glass-panel" style={{ padding: '4.5rem 2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <AlertCircle size={40} style={{ color: 'var(--warning)', marginBottom: '1rem', opacity: 0.8 }} />
          <h3>No students found in the active class</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            There are no student records matching class group <strong>"{selectedClass}"</strong> in your connected file.
          </p>
        </div>
      </div>
    );
  }

  const firstStudent = classStudents[0];
  const activeTeacher = teacherName || (firstStudent && firstStudent.teacherName) || 'Ms. Carter';
  const activeSubject = subject || (firstStudent && firstStudent.subject) || 'Mathematics';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      
      {/* HIGH-CONTRAST PRINT STYLES (SISD RED HEADER + COLOURED TAGS + BLACK STUDENT NAMES) */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 6mm 8mm;
          }
          body {
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print, nav, header, aside, .sidebar, button, .app-header, .btn {
            display: none !important;
          }
          .context-sheet-wrapper {
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            max-width: 100% !important;
          }
          .context-sheet-card {
            background: #ffffff !important;
            background-color: #ffffff !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-header-banner {
            border-bottom: 2px solid #e10031 !important;
            padding-bottom: 8px !important;
            margin-bottom: 10px !important;
          }
          .print-header-banner * {
            color: #000000 !important;
          }
          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 8.5px !important;
            line-height: 1.25 !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
          }
          .print-table tr, .print-table tbody tr {
            background: #ffffff !important;
            background-color: #ffffff !important;
          }
          /* SISD LOGO RED TABLE HEADER */
          .print-table th {
            background: #e10031 !important;
            background-color: #e10031 !important;
            color: #ffffff !important;
            border: 1px solid #c4002b !important;
            padding: 4px 6px !important;
            font-weight: 850 !important;
            text-transform: uppercase !important;
            font-size: 8.5px !important;
            letter-spacing: 0.04em !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-table td {
            background: #ffffff !important;
            background-color: #ffffff !important;
            border: 1px solid #cbd5e1 !important;
            padding: 4px 6px !important;
            vertical-align: middle !important;
            color: #000000 !important;
          }
          .print-student-name {
            color: #000000 !important;
            font-weight: 850 !important;
            font-size: 9px !important;
          }
          /* COLOURED DEMOGRAPHIC TAGS DURING PRINT */
          .print-tag {
            display: inline-block !important;
            font-size: 7.5px !important;
            font-weight: 800 !important;
            padding: 1px 4px !important;
            border-radius: 3px !important;
            margin-right: 2px !important;
            margin-top: 1.5px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-tag-emirati { background-color: #e6f4ea !important; color: #047857 !important; border: 1px solid #10b981 !important; }
          .print-tag-eal { background-color: #e8f0fe !important; color: #1d4ed8 !important; border: 1px solid #3b82f6 !important; }
          .print-tag-magt { background-color: #f3e8ff !important; color: #6d28d9 !important; border: 1px solid #8b5cf6 !important; }
          .print-tag-inclusion { background-color: #fce8e6 !important; color: #b91c1c !important; border: 1px solid #ef4444 !important; }
          .print-tag-boarding { background-color: #fef7e0 !important; color: #b45309 !important; border: 1px solid #f59e0b !important; }
          
          .print-cat4-comment {
            font-size: 8px !important;
            line-height: 1.25 !important;
            color: #000000 !important;
            background: #ffffff !important;
          }
        }
      `}</style>

      {/* Screen Control Bar */}
      <div className="glass-panel no-print" style={{
        padding: '1.25rem 2rem',
        marginBottom: '1.75rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        background: 'linear-gradient(135deg, rgba(225, 0, 49, 0.05) 0%, rgba(13, 20, 35, 0.45) 100%)',
        borderLeft: '4px solid #e10031'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.08em', color: '#e10031', textTransform: 'uppercase' }}>
              Classroom Pedagogical Overview
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Class Context Sheet</h2>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Classroom: <strong>{selectedClass}</strong> • Subject: <strong>{activeSubject}</strong> • Teacher: <strong>{activeTeacher}</strong> • Enrolled: <strong>{classStudents.length} Students</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={handlePrint}
            className="btn"
            style={{
              padding: '0.65rem 1.35rem',
              fontSize: '0.85rem',
              fontWeight: '800',
              borderRadius: '10px',
              background: '#e10031',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(225, 0, 49, 0.25)',
              transition: 'all 0.2s'
            }}
          >
            <Printer size={16} /> Print Context Sheet (A4 Landscape)
          </button>
        </div>
      </div>

      <div className="context-sheet-wrapper">
        <div className="glass-panel context-sheet-card" style={{ padding: '1.75rem 2rem' }}>
          
          {/* HEADER: School Logo Crest (Left) + Class Metadata (Right) */}
          <div 
            className="print-header-banner"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '1rem',
              marginBottom: '1.25rem',
              borderBottom: '2.5px solid #e10031',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            {/* LEFT SIDE: School Crest Logo & Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(225, 0, 49, 0.1)',
                border: '2px solid #e10031',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#e10031',
                boxShadow: '0 4px 12px rgba(225, 0, 49, 0.15)'
              }}>
                <GraduationCap size={28} />
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: '800', letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                  {schoolName || 'Swiss International Scientific School Dubai'}
                </span>
                <h1 style={{ fontSize: '1.45rem', fontWeight: '850', letterSpacing: '-0.03em', margin: 0, color: 'var(--text-main)' }}>
                  CLASS CONTEXT SHEET
                </h1>
              </div>
            </div>

            {/* RIGHT SIDE: Class & Teacher Details */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#e10031' }}>
                Class: {selectedClass}
              </div>
              <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#000000', marginTop: '2px' }}>
                Teacher: {activeTeacher}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Subject: {activeSubject} • Total: {classStudents.length} Students
              </div>
            </div>
          </div>

          {/* CLASS CONTEXT ROSTER TABLE (SISD LOGO RED HEADER) */}
          <div style={{ overflowX: 'auto' }}>
            <table className="print-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{
                  background: '#e10031',
                  color: '#ffffff',
                  fontSize: '0.73rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  <th style={{ padding: '0.65rem 0.4rem', fontWeight: '850', width: '28px', textAlign: 'center', background: '#e10031', color: '#ffffff' }}>#</th>
                  
                  {/* Student Name & Embedded Demographic Flags */}
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: '850', minWidth: '190px', background: '#e10031', color: '#ffffff' }}>
                    Student Name & Demographic Flags
                  </th>

                  <th style={{ padding: '0.65rem 0.35rem', fontWeight: '850', textAlign: 'center', width: '45px', background: '#e10031', color: '#ffffff' }}>Sex</th>
                  
                  {/* CAT4 SAS Scores */}
                  <th style={{ padding: '0.65rem 0.35rem', fontWeight: '850', textAlign: 'center', width: '50px', background: '#e10031', color: '#ffffff' }} title="Verbal SAS">Verb</th>
                  <th style={{ padding: '0.65rem 0.35rem', fontWeight: '850', textAlign: 'center', width: '50px', background: '#e10031', color: '#ffffff' }} title="Quantitative SAS">Quant</th>
                  <th style={{ padding: '0.65rem 0.35rem', fontWeight: '850', textAlign: 'center', width: '50px', background: '#e10031', color: '#ffffff' }} title="Spatial SAS">Spat</th>
                  <th style={{ padding: '0.65rem 0.35rem', fontWeight: '850', textAlign: 'center', width: '55px', background: '#e10031', color: '#ffffff' }} title="Non-Verbal SAS">N-Verb</th>
                  <th style={{ padding: '0.65rem 0.35rem', fontWeight: '850', textAlign: 'center', width: '52px', background: '#c4002b', color: '#ffffff' }} title="Mean SAS">Mean</th>

                  {/* CAT4 Remark / Summary (~200 chars legible) */}
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: '850', minWidth: '280px', background: '#e10031', color: '#ffffff' }}>
                    CAT4 Learning Profile & Pedagogical Remark
                  </th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((s, idx) => {
                  // Demographic Flags list
                  const flagsList = [];
                  if (s.emirati) flagsList.push('Emirati');
                  if (s.eal) flagsList.push('EAL');
                  if (s.gifted) flagsList.push('MAGT');
                  if (s.sen) flagsList.push('Inclusion');
                  if (s.boarding) flagsList.push('Boarding');

                  return (
                    <tr
                      key={s.id}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'
                      }}
                    >
                      {/* Index */}
                      <td style={{ padding: '0.55rem 0.35rem', fontSize: '0.78rem', color: '#000000', textAlign: 'center', fontWeight: '750' }}>
                        {idx + 1}
                      </td>

                      {/* Student Name (BLACK TEXT) & Coloured Demographic Flags embedded inside same column */}
                      <td style={{ padding: '0.55rem 0.65rem' }}>
                        <div className="print-student-name" style={{ fontSize: '0.88rem', fontWeight: '850', color: '#000000', lineHeight: '1.2' }}>
                          {s.forename} {s.surname}
                        </div>
                        
                        {/* Coloured Demographic Flags Chips */}
                        {flagsList.length > 0 && (
                          <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginTop: '3px' }}>
                            {flagsList.map(flag => {
                              const conf = TAG_CONFIG[flag] || { bg: '#e8f0fe', text: '#1d4ed8', border: '#3b82f6', classKey: 'eal' };
                              return (
                                <span
                                  key={flag}
                                  className={`print-tag print-tag-${conf.classKey}`}
                                  style={{
                                    fontSize: '0.62rem',
                                    fontWeight: '800',
                                    padding: '0.12rem 0.42rem',
                                    borderRadius: '4px',
                                    backgroundColor: conf.bg,
                                    color: conf.text,
                                    border: `1px solid ${conf.border}`,
                                    lineHeight: '1.1',
                                    letterSpacing: '0.02em'
                                  }}
                                >
                                  {flag}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      {/* Sex */}
                      <td style={{ padding: '0.55rem 0.35rem', textAlign: 'center', fontSize: '0.78rem', fontWeight: '700', color: '#000000' }}>
                        {s.gender === 'Male' ? 'M' : s.gender === 'Female' ? 'F' : (s.gender || '—')}
                      </td>

                      {/* CAT4 Verbal SAS */}
                      <td style={{ padding: '0.55rem 0.35rem', textAlign: 'center', fontSize: '0.82rem', fontWeight: '750', color: '#000000' }}>
                        {s.cat4Verbal !== null && s.cat4Verbal !== undefined ? s.cat4Verbal : <span style={{ color: '#64748b' }}>—</span>}
                      </td>

                      {/* CAT4 Quant SAS */}
                      <td style={{ padding: '0.55rem 0.35rem', textAlign: 'center', fontSize: '0.82rem', fontWeight: '750', color: '#000000' }}>
                        {s.cat4Quantitative !== null && s.cat4Quantitative !== undefined ? s.cat4Quantitative : <span style={{ color: '#64748b' }}>—</span>}
                      </td>

                      {/* CAT4 Spatial SAS */}
                      <td style={{ padding: '0.55rem 0.35rem', textAlign: 'center', fontSize: '0.82rem', fontWeight: '750', color: '#000000' }}>
                        {s.cat4Spatial !== null && s.cat4Spatial !== undefined ? s.cat4Spatial : <span style={{ color: '#64748b' }}>—</span>}
                      </td>

                      {/* CAT4 Non-Verbal SAS */}
                      <td style={{ padding: '0.55rem 0.35rem', textAlign: 'center', fontSize: '0.82rem', fontWeight: '750', color: '#000000' }}>
                        {s.cat4NonVerbal !== null && s.cat4NonVerbal !== undefined ? s.cat4NonVerbal : <span style={{ color: '#64748b' }}>—</span>}
                      </td>

                      {/* CAT4 Mean SAS */}
                      <td style={{ padding: '0.55rem 0.35rem', textAlign: 'center', fontSize: '0.82rem', fontWeight: '850', color: '#e10031' }}>
                        {s.cat4Mean !== null && s.cat4Mean !== undefined ? (
                          <span>{s.cat4Mean}</span>
                        ) : (
                          <span style={{ color: '#64748b' }}>—</span>
                        )}
                      </td>

                      {/* CAT4 Comment / Summary Remark (~200 chars legible) */}
                      <td className="print-cat4-comment" style={{ padding: '0.55rem 0.65rem', fontSize: '0.78rem', color: '#000000', lineHeight: '1.35' }}>
                        {s.cat4Comment ? (
                          <span>{s.cat4Comment}</span>
                        ) : (
                          <span style={{ fontStyle: 'italic', color: '#64748b' }}>No CAT4 remark recorded</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={{ marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <span>Class Context Sheet • Swiss International Scientific School Dubai</span>
            <span>Confidential • Internal Pedagogical Document</span>
          </div>
        </div>
      </div>
    </div>
  );
}
