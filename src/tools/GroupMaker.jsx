import React, { useState, useEffect, useRef } from 'react';
import { 
  Layers, Users, RefreshCw, Copy, CheckCircle2, 
  Settings2, UserCheck, AlertCircle
} from 'lucide-react';
import { useData } from '../context/DataContext';

export default function GroupMaker() {
  const { fileConnected, students, selectedClass, subject } = useData();
  const [activeSubTab, setActiveSubTab] = useState('maker'); // 'maker' | 'picker'
  const [groupSize, setGroupSize] = useState(4);
  const [groupingCriteria, setGroupingCriteria] = useState('random'); // 'random' | 'mixed_attainment' | 'similar_attainment' | 'atl_strengths' | 'support_balance' | 'gender_balance'
  const [groups, setGroups] = useState([]);
  const [copiedStatus, setCopiedStatus] = useState(false);

  // Filter students to the active class
  const classStudents = students.filter(s => s.className === selectedClass);

  // Helpers to resolve grades
  const getEffectiveGrade = (s) => {
    if (s.ibGrade !== null && s.ibGrade !== undefined && s.ibGrade !== '') {
      return Number(s.ibGrade);
    }
    // Fallback to CPT boundary mapping (0-32 points)
    if (s.cpt !== null && s.cpt !== undefined && s.cpt !== '') {
      const cpt = Number(s.cpt);
      if (cpt >= 28) return 7;
      if (cpt >= 24) return 6;
      if (cpt >= 19) return 5;
      if (cpt >= 15) return 4;
      if (cpt >= 10) return 3;
      if (cpt >= 6) return 2;
      return 1;
    }
    return 4; // fallback expected grade
  };

  const getATLPoints = (s) => {
    // Look at primary override first
    const primaryATL = s.atlProgress || 'Good';
    // Look at overrides across five skills and average them
    let overrideSum = 0;
    let count = 0;
    const skills = ['Communication', 'Social', 'SelfManagement', 'Research', 'Thinking'];
    
    skills.forEach(sk => {
      const overrideKey = `atl_${sk}`;
      if (s[overrideKey]) {
        count++;
        if (s[overrideKey] === 'Excellent') overrideSum += 4;
        else if (s[overrideKey] === 'Good') overrideSum += 3;
        else if (s[overrideKey] === 'Satisfactory') overrideSum += 2;
        else if (s[overrideKey] === 'Needs Improvement') overrideSum += 1;
      }
    });

    if (count > 0) return overrideSum / count;

    if (primaryATL === 'Excellent') return 4;
    if (primaryATL === 'Good') return 3;
    if (primaryATL === 'Satisfactory') return 2;
    return 1;
  };

  // Run grouping algorithm
  const generateGroups = () => {
    if (classStudents.length === 0) return;

    const totalStudents = classStudents.length;
    const numGroups = Math.max(1, Math.ceil(totalStudents / groupSize));
    
    // Initialize empty groups array
    const formedGroups = Array.from({ length: numGroups }, (_, i) => ({
      id: i + 1,
      members: []
    }));

    // Copy roster for mutation
    let pool = [...classStudents];

    if (groupingCriteria === 'random') {
      // Shuffle pool
      pool.sort(() => Math.random() - 0.5);
      pool.forEach((student, idx) => {
        formedGroups[idx % numGroups].members.push(student);
      });

    } else if (groupingCriteria === 'mixed_attainment') {
      // Sort academic grade descending
      pool.sort((a, b) => getEffectiveGrade(b) - getEffectiveGrade(a));
      
      // Distribute in serpentine / snake pattern to balance average grades
      let ascending = true;
      pool.forEach((student) => {
        // Find group with smallest size that fits serpentine logic
        let targetGroupIdx = 0;
        if (ascending) {
          // Find first group with space
          for (let i = 0; i < numGroups; i++) {
            if (formedGroups[i].members.length < groupSize) {
              targetGroupIdx = i;
              break;
            }
          }
        } else {
          // Find last group with space
          for (let i = numGroups - 1; i >= 0; i--) {
            if (formedGroups[i].members.length < groupSize) {
              targetGroupIdx = i;
              break;
            }
          }
        }
        
        formedGroups[targetGroupIdx].members.push(student);
        
        // Reverse direction at boundaries
        if (ascending && formedGroups[numGroups - 1].members.length > formedGroups[0].members.length) {
          ascending = false;
        } else if (!ascending && formedGroups[0].members.length > formedGroups[numGroups - 1].members.length) {
          ascending = true;
        }
      });

    } else if (groupingCriteria === 'similar_attainment') {
      // Sort academic grade descending
      pool.sort((a, b) => getEffectiveGrade(b) - getEffectiveGrade(a));
      
      // Partition strictly sequentially: Group 1 gets highest, Group N gets lowest
      pool.forEach((student, idx) => {
        const targetGroupIdx = Math.floor(idx / groupSize);
        if (formedGroups[targetGroupIdx]) {
          formedGroups[targetGroupIdx].members.push(student);
        } else {
          // Fallback if index overflows
          formedGroups[numGroups - 1].members.push(student);
        }
      });

    } else if (groupingCriteria === 'atl_strengths') {
      // Sort by ATL competency points descending
      pool.sort((a, b) => getATLPoints(b) - getATLPoints(a));
      
      // Serpentine distribution to ensure ATL leaders are spread out
      pool.forEach((student, idx) => {
        const groupIdx = idx % numGroups;
        // Distribute normally to spread leaders
        formedGroups[groupIdx].members.push(student);
      });

    } else if (groupingCriteria === 'support_balance') {
      // Split into support requirements (SEN or EAL boolean true) and standard
      const supportPool = pool.filter(s => s.sen || s.eal);
      const standardPool = pool.filter(s => !s.sen && !s.eal);

      // Shuffle both to maintain diversity
      supportPool.sort(() => Math.random() - 0.5);
      standardPool.sort(() => Math.random() - 0.5);

      // Distribute support students first evenly
      let groupIdx = 0;
      supportPool.forEach(student => {
        formedGroups[groupIdx % numGroups].members.push(student);
        groupIdx++;
      });

      // Distribute standard students to fill groups
      standardPool.forEach(student => {
        // Find group with smallest size that has room
        let smallestGroupIdx = 0;
        let smallestSize = 999;
        
        for (let i = 0; i < numGroups; i++) {
          if (formedGroups[i].members.length < smallestSize && formedGroups[i].members.length < groupSize) {
            smallestSize = formedGroups[i].members.length;
            smallestGroupIdx = i;
          }
        }
        
        formedGroups[smallestGroupIdx].members.push(student);
      });

    } else if (groupingCriteria === 'gender_balance') {
      // Split by gender
      const males = pool.filter(s => s.gender.toLowerCase().trim() === 'male' || s.gender.toLowerCase().trim() === 'm');
      const females = pool.filter(s => s.gender.toLowerCase().trim() === 'female' || s.gender.toLowerCase().trim() === 'f');
      const others = pool.filter(s => s.gender.toLowerCase().trim() !== 'male' && s.gender.toLowerCase().trim() !== 'm' && s.gender.toLowerCase().trim() !== 'female' && s.gender.toLowerCase().trim() !== 'f');

      // Shuffle
      males.sort(() => Math.random() - 0.5);
      females.sort(() => Math.random() - 0.5);
      others.sort(() => Math.random() - 0.5);

      const sortedPool = [];
      const maxLength = Math.max(males.length, females.length, others.length);
      
      // Alternate male / female in the queue
      for (let i = 0; i < maxLength; i++) {
        if (i < males.length) sortedPool.push(males[i]);
        if (i < females.length) sortedPool.push(females[i]);
        if (i < others.length) sortedPool.push(others[i]);
      }

      // Distribute alternative stream
      sortedPool.forEach((student, idx) => {
        formedGroups[idx % numGroups].members.push(student);
      });
    }

    setGroups(formedGroups);
  };

  // Re-run grouping automatically when class or size changes
  useEffect(() => {
    if (classStudents.length > 0) {
      generateGroups();
    }
  }, [selectedClass, groupSize, groupingCriteria, students]);

  // Export Groups to plain text clipboard helper
  const copyGroupsToClipboard = () => {
    if (groups.length === 0) return;
    
    let text = `SISD TEAMS - ${selectedClass.toUpperCase()} - ${subject.toUpperCase()}\n`;
    text += `Grouping Criteria: ${groupingCriteria.replace('_', ' ').toUpperCase()} &middot; Target Group Size: ${groupSize}\n`;
    text += `==================================================\n\n`;

    groups.forEach(g => {
      text += `TEAM ${g.id} (Average Grade: ${Math.round(g.members.reduce((acc, m) => acc + getEffectiveGrade(m), 0) / g.members.length * 10) / 10})\n`;
      text += `--------------------------------------------------\n`;
      g.members.forEach((m, idx) => {
        const role = idx === 0 && groupingCriteria === 'atl_strengths' ? ' [Team Leader]' : '';
        const tags = m.tags.length > 0 ? ` (${m.tags.join(', ')})` : '';
        text += `- ${m.name} &middot; Grade ${getEffectiveGrade(m)} &middot; ATL: ${m.atlProgress}${role}${tags}\n`;
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 3000);
  };

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
            border: '1px solid var(--border-primary)'
          }}>
            <Layers size={38} className="animate-pulse" />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Visual Group Maker</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto 2rem' }}>
            Connect your Master Excel iSAMS file at the top of the portal to activate automated collaborative grouping algorithms, visual group card decks, and quick copy/print rosters.
          </p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      
      {/* Sleek Sub-Tab Segmented Selector */}
      <div className="no-print" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '2.5rem'
      }}>
        <div style={{
          display: 'inline-flex',
          background: 'var(--bg-sidebar)',
          backdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--border-color)',
          borderRadius: '14px',
          padding: '0.35rem',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <button
            onClick={() => setActiveSubTab('maker')}
            className="btn"
            style={{
              padding: '0.6rem 1.6rem',
              fontSize: '0.88rem',
              borderRadius: '9px',
              background: activeSubTab === 'maker' ? 'var(--primary-gradient)' : 'transparent',
              color: activeSubTab === 'maker' ? '#fff' : 'var(--text-muted)',
              borderColor: 'transparent',
              boxShadow: activeSubTab === 'maker' ? '0 4px 15px var(--primary-glow)' : 'none',
              transition: 'all 0.25s'
            }}
          >
            <Layers size={15} />
            Group Generator
          </button>
          <button
            onClick={() => setActiveSubTab('picker')}
            className="btn"
            style={{
              padding: '0.6rem 1.6rem',
              fontSize: '0.88rem',
              borderRadius: '9px',
              background: activeSubTab === 'picker' ? 'var(--primary-gradient)' : 'transparent',
              color: activeSubTab === 'picker' ? '#fff' : 'var(--text-muted)',
              borderColor: 'transparent',
              boxShadow: activeSubTab === 'picker' ? '0 4px 15px var(--primary-glow)' : 'none',
              transition: 'all 0.25s'
            }}
          >
            <RefreshCw size={15} />
            Student Picker Wheel
          </button>
        </div>
      </div>

      {activeSubTab === 'maker' ? (
        <>
          {/* Printable page stylesheet */}
          <style>{`
            @media print {
              body {
                background: #fff !important;
                color: #000 !important;
              }
              .sidebar, header, .app-container > aside, .main-content > header, .main-content > div:first-of-type, .no-print {
                display: none !important;
              }
              .main-content {
                padding: 0 !important;
                margin: 0 !important;
                max-width: 100% !important;
              }
              .print-area {
                display: grid !important;
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 1.5cm !important;
                width: 100% !important;
              }
              .glass-panel {
                background: #fff !important;
                border: 1.5px solid #ccc !important;
                box-shadow: none !important;
                color: #000 !important;
                break-inside: avoid !important;
                padding: 1rem !important;
              }
              .print-badge {
                border: 1px solid #333 !important;
                color: #000 !important;
                background: transparent !important;
              }
              .print-header {
                display: block !important;
                margin-bottom: 2rem !important;
                border-bottom: 2px solid #000 !important;
                padding-bottom: 0.5rem !important;
              }
            }
            .print-header {
              display: none;
            }
          `}</style>

          {/* Physical Print Roster Header */}
          <div className="print-header">
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>SISD Roster Teams - {selectedClass}</h1>
            <p style={{ fontSize: '0.9rem', color: '#555', marginTop: '0.2rem' }}>
              Subject: {subject} &middot; Grouping Rule: {groupingCriteria.replace('_', ' ').toUpperCase()} &middot; Group Size: {groupSize} students
            </p>
          </div>

          {/* Control Configuration Bar */}
          <div className="glass-panel no-print" style={{ padding: '1.5rem 2rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings2 size={18} style={{ color: 'var(--primary)' }} />
                Grouping Rule Setup
              </h3>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  className={`btn btn-secondary ${copiedStatus ? 'glass-panel-active' : ''}`}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: copiedStatus ? '#10b981' : 'var(--text-main)', borderColor: copiedStatus ? '#10b981' : 'var(--border-color)' }}
                  onClick={copyGroupsToClipboard}
                  disabled={groups.length === 0}
                >
                  {copiedStatus ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                  {copiedStatus ? 'Copied to Clipboard!' : 'Copy Teams'}
                </button>
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  onClick={generateGroups}
                >
                  <RefreshCw size={16} />
                  Reshuffle
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              
              {/* Target Group Size */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                  Target Group Size
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[2, 3, 4, 5, 6].map(size => (
                    <button
                      key={size}
                      onClick={() => setGroupSize(size)}
                      style={{
                        flexGrow: 1,
                        padding: '0.5rem 0',
                        border: '1px solid',
                        borderColor: groupSize === size ? 'var(--primary)' : 'var(--border-color)',
                        background: groupSize === size ? 'var(--primary-glow)' : 'transparent',
                        color: groupSize === size ? 'var(--primary)' : 'var(--text-muted)',
                        borderRadius: '6px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grouping Strategy */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                  Grouping Criteria
                </label>
                <select
                  value={groupingCriteria}
                  onChange={(e) => setGroupingCriteria(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.52rem 1rem',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    borderRadius: '6px',
                    outline: 'none',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <option value="random">🔀 Random Roster Shuffling</option>
                  <option value="mixed_attainment">📊 Mixed Attainment (Heterogeneous)</option>
                  <option value="similar_attainment">📈 Similar Attainment (Homogeneous)</option>
                  <option value="atl_strengths">🧠 ATL Strengths (Balanced Leaders)</option>
                  <option value="support_balance">🤝 Inclusion & EAL Support Balancing</option>
                  <option value="gender_balance">🚻 Alternating Gender Balance</option>
                </select>
              </div>

            </div>

          </div>

          {/* Visual Group Cards Deck */}
          <div className="print-area" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.75rem' }}>
            {groups.map((group) => {
              const avgGrade = Math.round((group.members.reduce((acc, m) => acc + getEffectiveGrade(m), 0) / group.members.length) * 10) / 10;
              
              return (
                <div 
                  key={group.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '1.5rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    minHeight: '220px',
                    background: 'var(--bg-card)'
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
                      <Users size={16} style={{ color: 'var(--primary)' }} />
                      Team {group.id}
                    </h4>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <span className="print-badge" style={{ fontSize: '0.62rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                        {group.members.length} members
                      </span>
                      <span className="print-badge" style={{ fontSize: '0.62rem', background: 'var(--primary-glow)', border: '1px solid var(--border-primary)', color: 'var(--primary)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>
                        AVG Grade: {avgGrade}
                      </span>
                    </div>
                  </div>

                  {/* Roster list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flexGrow: 1 }}>
                    {group.members.map((member, idx) => {
                      const grade = getEffectiveGrade(member);
                      const isLeader = idx === 0 && groupingCriteria === 'atl_strengths';

                      let gradeColor = '#f59e0b'; // amber Acceptable
                      let gradeBg = 'rgba(245, 158, 11, 0.08)';
                      let gradeBorder = 'rgba(245, 158, 11, 0.25)';

                      if (grade >= 6) {
                        gradeColor = '#10b981'; // green Outstanding/Very Good
                        gradeBg = 'rgba(16, 185, 129, 0.08)';
                        gradeBorder = 'rgba(16, 185, 129, 0.25)';
                      } else if (grade === 5) {
                        gradeColor = '#3b82f6'; // blue Good
                        gradeBg = 'rgba(59, 130, 246, 0.08)';
                        gradeBorder = 'rgba(59, 130, 246, 0.25)';
                      } else if (grade < 4) {
                        gradeColor = '#ef4444'; // red Weak
                        gradeBg = 'rgba(239, 68, 68, 0.08)';
                        gradeBorder = 'rgba(239, 68, 68, 0.25)';
                      }

                      return (
                        <div 
                          key={member.id} 
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            padding: '0.4rem 0.6rem',
                            borderRadius: '6px',
                            background: isLeader ? 'rgba(99, 102, 241, 0.03)' : 'transparent',
                            border: isLeader ? '1px dashed rgba(99,102,241,0.2)' : '1px solid transparent'
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                              {member.name}
                              {isLeader && (
                                <span style={{ fontSize: '0.55rem', background: 'rgba(99, 102, 241, 0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)', padding: '0.02rem 0.25rem', borderRadius: '3px' }}>Leader</span>
                              )}
                            </span>
                            
                            {/* Demographic Pills (Dubai inspect-friendly) */}
                            {member.tags.length > 0 && (
                              <div style={{ display: 'flex', gap: '0.2rem', marginTop: '0.1rem' }}>
                                {member.tags.map(tag => {
                                  let tagColor = 'var(--text-muted)';
                                  let tagBg = 'rgba(255,255,255,0.02)';
                                  
                                  if (tag === 'Inclusion') { tagColor = '#fda4af'; tagBg = 'rgba(244, 63, 94, 0.08)'; }
                                  else if (tag === 'EAL') { tagColor = '#93c5fd'; tagBg = 'rgba(59, 130, 246, 0.08)'; }
                                  else if (tag === 'MAGT') { tagColor = '#c7d2fe'; tagBg = 'rgba(99, 102, 241, 0.08)'; }
                                  else if (tag === 'Emirati') { tagColor = '#86efac'; tagBg = 'rgba(34, 197, 94, 0.08)'; }

                                  return (
                                    <span 
                                      key={tag} 
                                      className="print-badge"
                                      style={{ 
                                        fontSize: '0.55rem', 
                                        padding: '0.02rem 0.25rem', 
                                        borderRadius: '3px',
                                        color: tagColor,
                                        background: tagBg,
                                        border: '1px solid rgba(255,255,255,0.04)'
                                      }}
                                    >
                                      {tag}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Right Grade Badge */}
                          <div className="print-badge" style={{
                            background: gradeBg,
                            border: `1px solid ${gradeBorder}`,
                            color: gradeColor,
                            fontSize: '0.73rem',
                            fontWeight: '800',
                            padding: '0.2rem 0.45rem',
                            borderRadius: '4px',
                            flexShrink: 0
                          }}>
                            G{grade}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <StudentPickerWheel 
          classStudents={classStudents}
          selectedClass={selectedClass}
          subject={subject}
          theme={document.documentElement.getAttribute('data-theme') || 'dark'}
        />
      )}

    </div>
  );
}

/* ==========================================================================
   STUDENT PICKER SPIN WHEEL SUB-COMPONENT
   ========================================================================== */
function StudentPickerWheel({ classStudents, selectedClass, subject, theme }) {
  const [excludedStudents, setExcludedStudents] = useState([]);
  const [pickedStudents, setPickedStudents] = useState([]);
  const [autoEliminate, setAutoEliminate] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [pointerBumped, setPointerBumped] = useState(false);
  
  const canvasRef = useRef(null);
  const angleRef = useRef(0);
  const speedRef = useRef(0);
  const lastActiveIndexRef = useRef(-1);
  const bumpTimeoutRef = useRef(null);
  
  const activeWheelStudents = classStudents.filter(
    s => !excludedStudents.includes(s.id) && !pickedStudents.includes(s.id)
  );

  // Redraw when dataset changes
  useEffect(() => {
    drawWheel();
  }, [classStudents, excludedStudents, pickedStudents, theme]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 390;
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);
    
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 12;
    
    ctx.clearRect(0, 0, size, size);
    
    if (activeWheelStudents.length === 0) {
      // Empty Roster State
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.fillStyle = theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';
      ctx.strokeStyle = 'var(--border-color)';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = 'var(--text-muted)';
      ctx.font = '700 13px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Roster empty! Select active students on the right.', cx, cy);
      return;
    }
    
    const arc = (2 * Math.PI) / activeWheelStudents.length;
    const colors = [
      '#e10031', // SISD Red
      '#6366f1', // Royal Indigo
      '#10b981', // Emerald
      '#f59e0b', // Amber
      '#8b5cf6', // Violet
      '#06b6d4', // Cyan
      '#ec4899', // Pink
      '#14b8a6', // Teal
      '#f97316'  // Orange
    ];
    
    // Sectors
    activeWheelStudents.forEach((student, i) => {
      const startAngle = angleRef.current + i * arc;
      const endAngle = startAngle + arc;
      
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.lineTo(cx, cy);
      
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      
      ctx.strokeStyle = theme === 'dark' ? 'rgba(3, 7, 18, 0.45)' : 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      
      // Draw text
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + arc / 2);
      
      ctx.fillStyle = '#ffffff'; 
      ctx.font = '700 11px Outfit, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      
      let name = student.name;
      if (name.length > 14) {
        name = name.substring(0, 12) + '...';
      }
      
      ctx.fillText(name, radius - 15, 0);
      ctx.restore();
    });
    
    // Outer border ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'var(--border-color-hover)';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Center cap (hub)
    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, 2 * Math.PI);
    ctx.fillStyle = theme === 'dark' ? '#0f172a' : '#ffffff';
    ctx.strokeStyle = 'var(--border-color)';
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#e10031';
    ctx.fill();
  };

  const startSpin = () => {
    if (isSpinning || activeWheelStudents.length === 0) return;
    
    setIsSpinning(true);
    setWinner(null);
    setShowWinnerModal(false);
    
    // Speed range
    speedRef.current = Math.random() * 0.18 + 0.32; 
    const friction = 0.984; // Smooth gradual stop
    
    const animate = () => {
      if (speedRef.current > 0.0012) {
        angleRef.current = (angleRef.current + speedRef.current) % (2 * Math.PI);
        speedRef.current *= friction;
        
        // Click visual pointer tracking
        const arc = (2 * Math.PI) / activeWheelStudents.length;
        const currentAngleNormalized = (1.5 * Math.PI - angleRef.current) % (2 * Math.PI);
        const positiveNormalized = currentAngleNormalized < 0 ? currentAngleNormalized + 2 * Math.PI : currentAngleNormalized;
        const activeIndex = Math.floor(positiveNormalized / arc);
        
        if (activeIndex !== lastActiveIndexRef.current) {
          lastActiveIndexRef.current = activeIndex;
          
          if (bumpTimeoutRef.current) clearTimeout(bumpTimeoutRef.current);
          setPointerBumped(true);
          bumpTimeoutRef.current = setTimeout(() => {
            setPointerBumped(false);
          }, 60);
        }
        
        drawWheel();
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        
        const arc = (2 * Math.PI) / activeWheelStudents.length;
        const currentAngleNormalized = (1.5 * Math.PI - angleRef.current) % (2 * Math.PI);
        const positiveNormalized = currentAngleNormalized < 0 ? currentAngleNormalized + 2 * Math.PI : currentAngleNormalized;
        const winnerIndex = Math.floor(positiveNormalized / arc);
        
        const selected = activeWheelStudents[winnerIndex];
        setWinner(selected);
        setShowWinnerModal(true);
        
        if (autoEliminate) {
          setPickedStudents(prev => [...prev, selected.id]);
        }
      }
    };
    
    animate();
  };

  const toggleExclude = (id) => {
    if (excludedStudents.includes(id)) {
      setExcludedStudents(prev => prev.filter(x => x !== id));
    } else {
      setExcludedStudents(prev => [...prev, id]);
    }
  };

  const togglePicked = (id) => {
    if (pickedStudents.includes(id)) {
      setPickedStudents(prev => prev.filter(x => x !== id));
    } else {
      setPickedStudents(prev => [...prev, id]);
    }
  };

  const resetPickedSession = () => {
    setPickedStudents([]);
    setWinner(null);
    setShowWinnerModal(false);
  };

  const selectRandomInstantly = () => {
    if (activeWheelStudents.length === 0) return;
    const randomIdx = Math.floor(Math.random() * activeWheelStudents.length);
    const selected = activeWheelStudents[randomIdx];
    setWinner(selected);
    setShowWinnerModal(true);
    if (autoEliminate) {
      setPickedStudents(prev => [...prev, selected.id]);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
      
      {/* Visual Canvas Spin Wheel panel */}
      <div className="glass-panel" style={{
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '520px',
        background: 'var(--bg-card)'
      }}>
        <div style={{ position: 'relative', width: '390px', height: '390px', marginBottom: '2.5rem' }}>
          {/* Neon pointer overlay pointing down at 12 o'clock */}
          <div style={{
            position: 'absolute',
            top: '-6px',
            left: 'calc(50% - 15px)',
            width: '30px',
            height: '30px',
            zIndex: 10,
            transform: pointerBumped ? 'rotate(-16deg) scale(1.15)' : 'rotate(0deg) scale(1)',
            transformOrigin: '50% 0%',
            transition: 'transform 0.05s ease-out',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))'
          }}>
            <svg viewBox="0 0 30 30" width="30" height="30">
              <polygon points="5,3 25,3 15,25" fill="#e10031" stroke="#ffffff" strokeWidth="2.5" />
            </svg>
          </div>
          
          <canvas ref={canvasRef} style={{ borderRadius: '50%', boxShadow: '0 0 30px rgba(0,0,0,0.15)' }} />
        </div>
        
        <button
          className="btn btn-primary"
          style={{
            padding: '0.95rem 2.8rem',
            fontSize: '1.05rem',
            borderRadius: '50px',
            boxShadow: isSpinning ? 'none' : '0 8px 25px var(--primary-glow)',
            minWidth: '220px',
            background: isSpinning ? 'var(--bg-card-hover)' : 'var(--primary-gradient)',
            borderColor: isSpinning ? 'var(--border-color)' : 'transparent',
            cursor: isSpinning ? 'not-allowed' : 'pointer'
          }}
          onClick={startSpin}
          disabled={isSpinning || activeWheelStudents.length === 0}
        >
          <RefreshCw size={18} className={isSpinning ? "animate-spin" : ""} />
          {isSpinning ? 'Spinning...' : 'SPIN WHEEL'}
        </button>
      </div>

      {/* Control Roster and Excludes Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Settings options Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-card)' }}>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings2 size={16} style={{ color: 'var(--primary)' }} />
            Wheel Settings
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>Eliminate Picked Students</span>
              
              {/* Apple Inspired dynamic toggle Switch */}
              <div 
                onClick={() => setAutoEliminate(!autoEliminate)}
                style={{
                  width: '40px',
                  height: '22px',
                  background: autoEliminate ? 'var(--primary)' : 'var(--border-color-hover)',
                  borderRadius: '11px',
                  padding: '2px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: autoEliminate ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  transition: 'all 0.2s'
                }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.5rem', fontSize: '0.8rem', borderRadius: '6px' }}
                onClick={resetPickedSession}
              >
                Reset Session
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.5rem', fontSize: '0.8rem', borderRadius: '6px' }}
                onClick={selectRandomInstantly}
                disabled={isSpinning || activeWheelStudents.length === 0}
              >
                Instant Pick
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Checkbox Roster list */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: '340px', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h4 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={16} style={{ color: 'var(--primary)' }} />
              Active Roster List
            </h4>
            <span style={{ fontSize: '0.75rem', background: 'var(--primary-glow)', color: 'var(--primary)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '700' }}>
              Active: {activeWheelStudents.length} / {classStudents.length}
            </span>
          </div>

          <div style={{ overflowY: 'auto', flexGrow: 1, maxHeight: '270px', paddingRight: '4px' }}>
            {classStudents.map(student => {
              const isExcluded = excludedStudents.includes(student.id);
              const isPicked = pickedStudents.includes(student.id);
              const isActive = !isExcluded && !isPicked;
              
              let statusLabel = 'Active';
              let labelBg = 'rgba(16, 185, 129, 0.08)';
              let labelColor = '#10b981';
              
              if (isExcluded) {
                statusLabel = 'Excluded';
                labelBg = 'rgba(255,255,255,0.03)';
                labelColor = 'var(--text-muted)';
              } else if (isPicked) {
                statusLabel = 'Picked';
                labelBg = 'rgba(245, 158, 11, 0.08)';
                labelColor = '#f59e0b';
              }

              return (
                <div 
                  key={student.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.45rem 0.6rem',
                    borderRadius: '6px',
                    marginBottom: '0.4rem',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--border-color)' : 'transparent',
                    background: isActive ? 'transparent' : 'rgba(0, 0, 0, 0.08)',
                    opacity: isActive ? 1 : 0.55,
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <input
                      type="checkbox"
                      checked={!isExcluded}
                      onChange={() => toggleExclude(student.id)}
                      disabled={isSpinning}
                      style={{
                        width: '15px',
                        height: '15px',
                        cursor: 'pointer',
                        accentColor: 'var(--primary)'
                      }}
                    />
                    <span 
                      style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)', cursor: 'pointer' }}
                      onClick={() => !isSpinning && toggleExclude(student.id)}
                    >
                      {student.name}
                    </span>
                  </div>

                  <span 
                    onClick={() => !isSpinning && !isExcluded && togglePicked(student.id)}
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: '700',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      background: labelBg,
                      color: labelColor,
                      cursor: isExcluded ? 'not-allowed' : 'pointer',
                      border: '1px solid rgba(255,255,255,0.03)'
                    }}
                  >
                    {statusLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Winner modal popup overlay */}
      {showWinnerModal && winner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(3, 7, 18, 0.75)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          animation: 'fadeIn 0.3s ease'
        }}>
          <ConfettiOverlay />
          
          <div className="glass-panel" style={{
            maxWidth: '460px',
            width: '90%',
            padding: '3rem 2rem',
            textAlign: 'center',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 20px 60px rgba(225, 0, 49, 0.22), 0 0 40px rgba(99, 102, 241, 0.08)',
            transform: 'scale(1)',
            animation: 'scaleIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            position: 'relative'
          }}>
            <h5 style={{
              color: 'var(--primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontSize: '0.85rem',
              fontWeight: '800',
              marginBottom: '1rem'
            }}>
              🎉 Winner Selected 🎉
            </h5>
            
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '900',
              color: '#ffffff',
              margin: '1.25rem 0 1.5rem',
              textShadow: '0 0 15px rgba(255,255,255,0.15)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}>
              {winner.name}
            </h2>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
              Selected from class <strong>{selectedClass}</strong> for <strong>{subject}</strong>.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px' }}
                onClick={() => {
                  setShowWinnerModal(false);
                }}
              >
                Awesome!
              </button>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px' }}
                onClick={() => {
                  setShowWinnerModal(false);
                  setTimeout(() => {
                    startSpin();
                  }, 150);
                }}
                disabled={activeWheelStudents.length === 0}
              >
                Spin Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation classes stylesheet */}
      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.9) translateY(20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
      
    </div>
  );
}

/* ==========================================================================
   CONFETTI CANVASES FALLING PARTICLES ENGINE
   ========================================================================== */
function ConfettiOverlay() {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const colors = ['#E10031', '#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
    const particles = Array.from({ length: 110 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * -window.innerHeight - 20,
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: Math.random() * 8 - 4,
      speedY: Math.random() * 6 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 6 - 3,
      opacity: 1
    }));
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;
      
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        
        p.speedY += 0.045; // Gravity
        p.speedX *= 0.99;  // Drag
        
        if (p.y > canvas.height - 120) {
          p.opacity -= 0.015;
        }
        
        if (p.opacity > 0) {
          active = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });
      
      if (active) {
        animationId = requestAnimationFrame(animate);
      }
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        pointerEvents: 'none', 
        zIndex: 9999 
      }} 
    />
  );
}
