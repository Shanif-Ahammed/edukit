import React from 'react';
import {
  Users, TrendingUp, Sparkles, AlertCircle, Award,
  Activity, Lightbulb, ChevronRight, BarChart3, BookOpen
} from 'lucide-react';
import { useData } from '../context/DataContext';

const ATL_LEVELS = [
  { value: 'Excellent', color: '#10b981', gradient: ['#10b981', '#059669'], bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.25)', text: '#10b981' },
  { value: 'Good', color: '#3b82f6', gradient: ['#3b82f6', '#2563eb'], bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.25)', text: '#3b82f6' },
  { value: 'Satisfactory', color: '#f59e0b', gradient: ['#f59e0b', '#d97706'], bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.25)', text: '#f59e0b' },
  { value: 'Needs Improvement', color: '#ef4444', gradient: ['#ef4444', '#dc2626'], bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.25)', text: '#ef4444' }
];

const GRADE_COLORS = {
  7: '#10b981', // Outstanding (Emerald)
  6: '#059669', // Excellent (Dark Emerald)
  5: '#3b82f6', // Strong (Blue)
  4: '#f59e0b', // Adequate (Amber)
  3: '#d97706', // Basic (Dark Amber)
  2: '#ef4444', // Limited (Red)
  1: '#dc2626'  // Very Limited (Crimson)
};

const TAG_STYLES = {
  EAL: { bg: 'rgba(59, 130, 246, 0.1)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.2)' },
  Inclusion: { bg: 'rgba(244, 63, 94, 0.1)', text: '#fca5a5', border: 'rgba(244, 63, 94, 0.2)' },
  MAGT: { bg: 'rgba(139, 92, 246, 0.1)', text: '#c084fc', border: 'rgba(139, 92, 246, 0.2)' },
  Emirati: { bg: 'rgba(16, 185, 129, 0.1)', text: '#34d399', border: 'rgba(16, 185, 129, 0.2)' }
};

// Strategic recommendations based on the class modal score
const STRATEGY_INSIGHTS = {
  Excellent: {
    title: 'Extending High Performance',
    description: 'The majority of this class is performing at an Excellent ATL level. Focus on developing leadership and student-led inquiry.',
    action: 'Implement student-facilitated group tasks and encourage self-designed rubrics.'
  },
  Good: {
    title: 'Consolidating Independent Study',
    description: 'A solid core of Good ATL performers. Transition from teacher-guided work to fully independent criterion reflections.',
    action: 'Incorporate self-assessment reflection milestones in major criterion tasks.'
  },
  Satisfactory: {
    title: 'Scaffolding ATL Competencies',
    description: 'Most students are Satisfactory. Introduce explicit checklists and step-by-step graphic organizers to build confidence.',
    action: 'Provide visual progress tracker sheets and hold short target-setting warmups.'
  },
  'Needs Improvement': {
    title: 'Urgent Structural Support',
    description: 'A significant volume of Needs Improvement ratings requires explicit skill instruction and close monitoring.',
    action: 'Dedicate 10 minutes per week to direct modeling of study habits and organizational strategies.'
  }
};

export default function ATLTracker() {
  const { fileConnected, students, selectedClass, subject, updateStudent } = useData();

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
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.15)'
          }}>
            <BarChart3 size={38} className="animate-pulse" />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', fontWeight: '800' }}>ATL Progress & Gradebook Studio</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto 2rem', fontSize: '0.92rem' }}>
            Connect your Master Excel iSAMS database at the top of the portal to activate your interactive class gradebook roster, live progress badge controls, and premium SVG distribution charts.
          </p>
        </div>
      </div>
    );
  }

  // Filter students to the active class
  const classStudents = students.filter(s => s.className === selectedClass);

  if (classStudents.length === 0) {
    return (
      <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
        <div className="glass-panel" style={{ padding: '4.5rem 2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <AlertCircle size={40} style={{ color: 'var(--warning)', marginBottom: '1rem', opacity: 0.8 }} />
          <h3>No students found in the active class</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            There are no student records matching class group <strong>"{selectedClass}"</strong> in your Excel sheet.
          </p>
        </div>
      </div>
    );
  }

  // Live ATL progress counts mapping
  const atlCounts = {
    Excellent: 0,
    Good: 0,
    Satisfactory: 0,
    'Needs Improvement': 0
  };

  let totalIbGrade = 0;
  let gradedCount = 0;

  classStudents.forEach(s => {
    const progress = s.atlProgress || 'Good';
    if (atlCounts[progress] !== undefined) {
      atlCounts[progress]++;
    } else {
      atlCounts.Good++;
    }

    if (s.ibGrade !== null && s.ibGrade !== undefined && !isNaN(Number(s.ibGrade))) {
      totalIbGrade += Number(s.ibGrade);
      gradedCount++;
    }
  });

  const classAvgGrade = gradedCount > 0 ? (totalIbGrade / gradedCount).toFixed(2) : 'N/A';

  // Find dominant ATL category
  const dominantCategory = Object.entries(atlCounts).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
  const activeStrategy = STRATEGY_INSIGHTS[dominantCategory] || STRATEGY_INSIGHTS.Good;

  // Cycle student's ATL Progress
  const cycleStudentATL = (studentId, currentScore) => {
    const levels = ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement'];
    const idx = levels.indexOf(currentScore || 'Good');
    const nextIdx = (idx + 1) % levels.length;
    const nextScore = levels[nextIdx];

    updateStudent(studentId, {
      atlProgress: nextScore
    });
  };

  // Determine dynamic graphic measurements for SVG progress distribution
  const chartHeight = 220;
  const chartWidth = 360;
  const maxCount = Math.max(...Object.values(atlCounts), 4); // avoid division by 0 and keep nice scale
  const barWidth = 45;
  const gap = 35;
  const leftOffset = 45;
  const bottomOffset = 180;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      
      {/* Top Glassmorphic Metrics Banner */}
      <div className="glass-panel animate-fade-in" style={{
        padding: '1.5rem 2rem',
        marginBottom: '2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(13, 20, 35, 0.45) 100%)',
        borderLeft: '4px solid var(--primary)',
        alignItems: 'center'
      }}>
        <div>
          <span style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Performance Dashboard</span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>Class Roster & ATL Analytics</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Classroom: <strong>{selectedClass}</strong> • Subject: <strong>{subject}</strong></span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1.25rem' }}>
          <Users size={24} style={{ color: 'var(--accent)', opacity: 0.8 }} />
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Active Enrollment</span>
            <strong style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>{classStudents.length} Students</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1.25rem' }}>
          <Award size={24} style={{ color: '#10b981', opacity: 0.8 }} />
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Class Avg IB Grade</span>
            <strong style={{ fontSize: '1.2rem', color: '#10b981' }}>{classAvgGrade} / 7.00</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1.25rem' }}>
          <Activity size={24} style={{ color: '#f59e0b', opacity: 0.8 }} />
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Dominant ATL Status</span>
            <strong style={{ fontSize: '1.15rem', color: '#f59e0b' }}>{dominantCategory}</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Gradebook Table on Left, ATL Graph on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem', alignItems: 'stretch' }}>
        
        {/* LEFT COLUMN: OVERALL CLASS GRADEBOOK PREVIEW */}
        <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} style={{ color: 'var(--primary)' }} />
              Overall Class Gradebook Preview
            </h3>
            <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.03)', padding: '0.3rem 0.6rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <Sparkles size={12} style={{ color: 'var(--warning)' }} />
              Interactive ATL badge cycles on click
            </span>
          </div>

          <div style={{ overflowX: 'auto', flexGrow: 1, maxHeight: '550px', overflowY: 'auto', paddingRight: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  <th style={{ padding: '0.8rem 0.5rem', fontWeight: '700' }}>Student Name</th>
                  <th style={{ padding: '0.8rem 0.5rem', fontWeight: '700', textAlign: 'center', width: '140px' }}>Demographics</th>
                  <th style={{ padding: '0.8rem 0.5rem', fontWeight: '700', textAlign: 'center', width: '80px' }}>IB Grade</th>
                  <th style={{ padding: '0.8rem 0.5rem', fontWeight: '700', textAlign: 'center', width: '60px' }}>Crit A</th>
                  <th style={{ padding: '0.8rem 0.5rem', fontWeight: '700', textAlign: 'center', width: '60px' }}>Crit B</th>
                  <th style={{ padding: '0.8rem 0.5rem', fontWeight: '700', textAlign: 'center', width: '60px' }}>Crit C</th>
                  <th style={{ padding: '0.8rem 0.5rem', fontWeight: '700', textAlign: 'center', width: '60px' }}>Crit D</th>
                  <th style={{ padding: '0.8rem 0.5rem', fontWeight: '700', textAlign: 'center', width: '125px' }}>ATL Focus</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((s, idx) => {
                  const sAtl = s.atlProgress || 'Good';
                  const levelInfo = ATL_LEVELS.find(l => l.value === sAtl) || ATL_LEVELS[1];
                  const gradeColor = GRADE_COLORS[s.ibGrade] || 'var(--text-muted)';

                  return (
                    <tr
                      key={s.id}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.02)',
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}
                    >
                      {/* Name & Surname */}
                      <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-main)' }}>
                        {s.forename} {s.surname}
                      </td>

                      {/* Demographics capsule-shaped bubbles */}
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                          {(s.tags || []).map(tag => {
                            const sty = TAG_STYLES[tag] || { bg: 'rgba(255,255,255,0.05)', text: 'var(--text-muted)', border: 'transparent' };
                            return (
                              <span
                                key={tag}
                                style={{
                                  fontSize: '0.62rem',
                                  fontWeight: '700',
                                  padding: '0.15rem 0.45rem',
                                  borderRadius: '12px',
                                  backgroundColor: sty.bg,
                                  color: sty.text,
                                  border: `1px solid ${sty.border}`,
                                  letterSpacing: '0.02em'
                                }}
                              >
                                {tag}
                              </span>
                            );
                          })}
                          {(!s.tags || s.tags.length === 0) && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>—</span>
                          )}
                        </div>
                      </td>

                      {/* Circular Colored IB Grade Badge */}
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                        {s.ibGrade !== null && s.ibGrade !== undefined ? (
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: `${gradeColor}12`,
                            border: `1.5px solid ${gradeColor}`,
                            color: gradeColor,
                            fontWeight: '800',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto',
                            boxShadow: `0 0 10px ${gradeColor}15`
                          }}>
                            {s.ibGrade}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>

                      {/* Criteria scores columns */}
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '600' }}>
                        {s.critA !== null ? s.critA : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '600' }}>
                        {s.critB !== null ? s.critB : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '600' }}>
                        {s.critC !== null ? s.critC : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '600' }}>
                        {s.critD !== null ? s.critD : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>

                      {/* Clickable ATL progress level badge */}
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                        <button
                          onClick={() => cycleStudentATL(s.id, sAtl)}
                          style={{
                            background: levelInfo.bg,
                            border: `1.5px solid ${levelInfo.border}`,
                            color: levelInfo.text,
                            fontSize: '0.73rem',
                            fontWeight: '700',
                            padding: '0.35rem 0.6rem',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            justifyContent: 'center',
                            margin: '0 auto',
                            width: '110px',
                            boxShadow: `0 2px 4px ${levelInfo.color}0a`
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.04)';
                            e.currentTarget.style.borderColor = levelInfo.color;
                            e.currentTarget.style.boxShadow = `0 0 10px ${levelInfo.color}25`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.borderColor = levelInfo.border;
                            e.currentTarget.style.boxShadow = `0 2px 4px ${levelInfo.color}0a`;
                          }}
                          title="Click to cycle through ATL levels"
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: levelInfo.color, display: 'inline-block' }} />
                          {sAtl}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: GRAPH & RECOMMENDATIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* PREMIUM SVG ATL PROGRESS DISTRIBUTION GRAPH */}
          <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
              ATL Progress Distribution
            </h3>

            {/* SVG Canvas Container */}
            <div style={{ display: 'flex', justifyContent: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1.25rem 0.5rem' }}>
              <svg width={chartWidth} height={chartHeight} style={{ fontFamily: 'inherit', overflow: 'visible' }}>
                <defs>
                  {/* Dynamic gradients for bars */}
                  {ATL_LEVELS.map(l => (
                    <linearGradient id={`grad-${l.value}`} x1="0" y1="0" x2="0" y2="1" key={l.value}>
                      <stop offset="0%" stopColor={l.gradient[0]} stopOpacity={1} />
                      <stop offset="100%" stopColor={l.gradient[1]} stopOpacity={0.8} />
                    </linearGradient>
                  ))}
                  {/* Grid pattern */}
                  <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                  </pattern>
                </defs>

                {/* Grid overlay */}
                <rect width={chartWidth - leftOffset} height={bottomOffset - 10} x={leftOffset} y="10" fill="url(#grid)" />

                {/* Horizontal Baseline */}
                <line x1={leftOffset} y1={bottomOffset} x2={chartWidth - 10} y2={bottomOffset} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                
                {/* Horizontal Grid Ticks / Y Axis helpers */}
                {[0.25, 0.5, 0.75, 1].map((val, idx) => {
                  const tickY = bottomOffset - val * (bottomOffset - 10);
                  const countLabel = Math.round(val * maxCount);
                  return (
                    <g key={idx}>
                      <line x1={leftOffset} y1={tickY} x2={chartWidth - 10} y2={tickY} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                      <text x={leftOffset - 10} y={tickY + 4} fill="var(--text-muted)" fontSize="10" fontWeight="600" textAnchor="end">{countLabel}</text>
                    </g>
                  );
                })}

                {/* Render Bars */}
                {ATL_LEVELS.map((l, idx) => {
                  const count = atlCounts[l.value];
                  // Calculate dynamic height based on scale
                  const barHeight = maxCount > 0 ? (count / maxCount) * (bottomOffset - 25) : 0;
                  const barX = leftOffset + gap + idx * (barWidth + gap) - 10;
                  const barY = bottomOffset - barHeight;

                  return (
                    <g key={l.value} style={{ transition: 'all 0.3s ease' }}>
                      {/* Interactive bar with vertical gradient */}
                      <rect
                        x={barX}
                        y={barY}
                        width={barWidth}
                        height={Math.max(barHeight, 2)}
                        rx="4"
                        ry="4"
                        fill={`url(#grad-${l.value})`}
                        style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                      />
                      
                      {/* Floating student count label above the bar */}
                      <text
                        x={barX + barWidth / 2}
                        y={barY - 7}
                        fill={l.color}
                        fontWeight="800"
                        fontSize="11"
                        textAnchor="middle"
                      >
                        {count}
                      </text>

                      {/* X Axis Labels abbreviated */}
                      <text
                        x={barX + barWidth / 2}
                        y={bottomOffset + 18}
                        fill="var(--text-muted)"
                        fontWeight="700"
                        fontSize="9.5"
                        textAnchor="middle"
                      >
                        {l.value === 'Needs Improvement' ? 'Needs Imp.' : l.value}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* CLASSROOM RECOMMENDATIONS & STRATEGY INSIGHT CARD */}
          <div className="glass-panel" style={{
            padding: '1.5rem 1.75rem',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(13, 20, 35, 0.45) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.12)'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
              <Lightbulb size={20} />
              Strategic ATL Insight
            </h3>

            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.04em' }}>
                  Dominant Pedagogical Focus
                </span>
                <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '2px' }}>
                  {activeStrategy.title}
                </h4>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: '1.55', margin: 0 }}>
                {activeStrategy.description}
              </p>

              <div style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem 1rem',
                marginTop: '0.5rem',
                display: 'flex',
                gap: '0.6rem',
                alignItems: 'flex-start'
              }}>
                <Sparkles size={16} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: '700', letterSpacing: '0.04em' }}>
                    Recommended Roster Action
                  </span>
                  <strong style={{ color: 'var(--text-main)', fontSize: '0.78rem', lineHeight: '1.4', display: 'block', marginTop: '1px' }}>
                    {activeStrategy.action}
                  </strong>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
