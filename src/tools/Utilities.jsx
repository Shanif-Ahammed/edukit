import React, { useState, useEffect, useRef } from 'react';
import { 
  Layers, Users, RefreshCw, Copy, CheckCircle2, 
  Settings2, UserCheck, AlertCircle, Clock, Play, Pause, RotateCcw, Settings, X, Check,
  Maximize2, Minimize2, ZoomIn, ZoomOut, ArrowLeft
} from 'lucide-react';
import { useData } from '../context/DataContext';

export default function Utilities() {
  const { fileConnected, students, selectedClass, subject } = useData();
  const [activeSubTab, setActiveSubTab] = useState('maker'); // 'maker' | 'picker' | 'timer'
  const [groupSize, setGroupSize] = useState(4);
  const [groupingCriteria, setGroupingCriteria] = useState('random'); // 'random' | 'mixed_attainment' | 'similar_attainment' | 'atl_strengths' | 'support_balance' | 'gender_balance' | 'strong_struggling'
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
    const primaryATL = s.atlProgress || 'Practitioner';
    // Look at overrides across five skills and average them
    let overrideSum = 0;
    let count = 0;
    const skills = ['Communication', 'Social', 'SelfManagement', 'Research', 'Thinking'];
    
    skills.forEach(sk => {
      const overrideKey = `atl_${sk}`;
      if (s[overrideKey]) {
        count++;
        const val = s[overrideKey];
        if (val === 'Expert' || val === 'Excellent') overrideSum += 4;
        else if (val === 'Practitioner' || val === 'Good') overrideSum += 3;
        else if (val === 'Beginner' || val === 'Satisfactory' || val === 'Developing') overrideSum += 2;
        else if (val === 'Novice' || val === 'Needs Improvement') overrideSum += 1;
      }
    });

    if (count > 0) return overrideSum / count;

    if (primaryATL === 'Expert' || primaryATL === 'Excellent') return 4;
    if (primaryATL === 'Practitioner' || primaryATL === 'Good') return 3;
    if (primaryATL === 'Beginner' || primaryATL === 'Satisfactory' || primaryATL === 'Developing') return 2;
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
    } else if (groupingCriteria === 'strong_struggling') {
      // Sort academic grade descending
      pool.sort((a, b) => getEffectiveGrade(b) - getEffectiveGrade(a));
      
      let left = 0;
      let right = pool.length - 1;
      let groupIdx = 0;
      
      while (left <= right) {
        // Add the strong student from left
        if (left <= right) {
          formedGroups[groupIdx % numGroups].members.push(pool[left]);
          left++;
        }
        // Add the struggling student from right
        if (left <= right) {
          formedGroups[groupIdx % numGroups].members.push(pool[right]);
          right--;
        }
        groupIdx++;
      }
    }

    setGroups(formedGroups);
  };

  // Re-run grouping automatically when class or size changes
  useEffect(() => {
    if (classStudents.length > 0) {
      generateGroups();
    }
  }, [selectedClass, groupSize, groupingCriteria, students]);

  const copyGroupsToClipboard = () => {
    if (groups.length === 0) return;
    
    let text = `SISD TEAMS - ${selectedClass.toUpperCase()} - ${subject.toUpperCase()}\n`;
    text += `Grouping Criteria: ${groupingCriteria.replace('_', ' ').toUpperCase()} · Target Group Size: ${groupSize}\n`;
    text += `==================================================\n\n`;

    groups.forEach(g => {
      text += `TEAM ${g.id}\n`;
      text += `--------------------------------------------------\n`;
      g.members.forEach((m, idx) => {
        const role = idx === 0 && groupingCriteria === 'atl_strengths' ? ' [Team Leader]' : '';
        text += `- ${m.name}${role}\n`;
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 3000);
  };

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
            Study Group Matcher
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
          <button
            onClick={() => setActiveSubTab('timer')}
            className="btn"
            style={{
              padding: '0.6rem 1.6rem',
              fontSize: '0.88rem',
              borderRadius: '9px',
              background: activeSubTab === 'timer' ? 'var(--primary-gradient)' : 'transparent',
              color: activeSubTab === 'timer' ? '#fff' : 'var(--text-muted)',
              borderColor: 'transparent',
              boxShadow: activeSubTab === 'timer' ? '0 4px 15px var(--primary-glow)' : 'none',
              transition: 'all 0.25s'
            }}
          >
            <Clock size={15} />
            Classroom Timer
          </button>
        </div>
      </div>

      {activeSubTab === 'timer' ? (
        <TimerDashboard />
      ) : !fileConnected ? (
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
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Visual Study Group Matcher</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto 2rem' }}>
              Connect your Master Excel iSAMS file at the top of the portal to activate automated collaborative grouping algorithms, visual group card decks, and quick copy/print rosters.
            </p>
          </div>
        </div>
      ) : classStudents.length === 0 ? (
        <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
          <div className="glass-panel" style={{ padding: '4.5rem 2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <AlertCircle size={40} style={{ color: 'var(--warning)', marginBottom: '1rem', opacity: 0.8 }} />
            <h3>No students found in the active class</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              There are no student records matching class group <strong>"{selectedClass}"</strong> in your Excel sheet.
            </p>
          </div>
        </div>
      ) : activeSubTab === 'maker' ? (
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
                  <option value="strong_struggling">🤝 Pair Strong & Struggling Students</option>
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

/* ==========================================================================
   CLASSROOM MULTI-SESSION PROTIMER COMPONENT
   ========================================================================== */
function TimerDashboard() {
  const [globalTime, setGlobalTime] = useState(new Date());
  const [dashboardInitialized, setDashboardInitialized] = useState(false);
  const [selectedSessionCount, setSelectedSessionCount] = useState(1);
  const [timers, setTimers] = useState([]);
  
  // Modal Edit state
  const [editingTimer, setEditingTimer] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalDuration, setModalDuration] = useState(25);
  const [modalAutoStart, setModalAutoStart] = useState("");

  // Zoom and Fullscreen states
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const dashboardRef = useRef(null);

  // Sync fullscreen state with document events (e.g. Esc key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Global ticking interval
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setGlobalTime(now);

      const hh = now.getHours().toString().padStart(2, '0');
      const mm = now.getMinutes().toString().padStart(2, '0');
      const currentClockStr = `${hh}:${mm}`;

      setTimers(prev => prev.map(t => {
        let nextTimeLeft = t.timeLeftSeconds;
        let nextIsRunning = t.isRunning;
        let nextAutoStartTime = t.autoStartTime;

        // Auto start scheduler trigger
        if (t.autoStartTime === currentClockStr && !t.isRunning && t.timeLeftSeconds === t.durationMinutes * 60) {
          nextIsRunning = true;
          nextAutoStartTime = ""; // Clear so it only triggers once
        }

        // Ticking countdown logic
        if (nextIsRunning) {
          if (nextTimeLeft > 0) {
            nextTimeLeft--;
          } else {
            nextIsRunning = false;
          }
        }

        return {
          ...t,
          timeLeftSeconds: nextTimeLeft,
          isRunning: nextIsRunning,
          autoStartTime: nextAutoStartTime
        };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleInitialize = (count) => {
    const defaultMins = [25, 120, 5, 75, 15, 60];
    const defaultLabels = ['Session A', 'Session B', 'Session C', 'Session D', 'Session E', 'Session F'];
    const initialTimers = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      title: defaultLabels[i] || `Session ${String.fromCharCode(65 + i)}`,
      durationMinutes: defaultMins[i] || 25,
      timeLeftSeconds: (defaultMins[i] || 25) * 60,
      isRunning: false,
      autoStartTime: ""
    }));
    setTimers(initialTimers);
    setDashboardInitialized(true);
  };

  const handleStartAll = () => {
    const isAnyRunning = timers.some(t => t.isRunning);
    setTimers(prev => prev.map(t => ({
      ...t,
      isRunning: !isAnyRunning && t.timeLeftSeconds > 0
    })));
  };

  const handleResetAll = () => {
    setTimers(prev => prev.map(t => ({
      ...t,
      isRunning: false,
      timeLeftSeconds: t.durationMinutes * 60
    })));
  };

  const handleToggleTimer = (id) => {
    setTimers(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          isRunning: !t.isRunning && t.timeLeftSeconds > 0
        };
      }
      return t;
    }));
  };

  const handleResetTimer = (id) => {
    setTimers(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          isRunning: false,
          timeLeftSeconds: t.durationMinutes * 60
        };
      }
      return t;
    }));
  };

  const handleOpenEdit = (t) => {
    setEditingTimer(t);
    setModalTitle(t.title);
    setModalDuration(t.durationMinutes);
    setModalAutoStart(t.autoStartTime);
  };

  const handleSaveEdit = () => {
    setTimers(prev => prev.map(t => {
      if (t.id === editingTimer.id) {
        const mins = parseInt(modalDuration) || 1;
        return {
          ...t,
          title: modalTitle.trim() || 'Session',
          durationMinutes: mins,
          timeLeftSeconds: mins * 60,
          isRunning: false,
          autoStartTime: modalAutoStart
        };
      }
      return t;
    }));
    setEditingTimer(null);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (dashboardRef.current?.requestFullscreen) {
        dashboardRef.current.requestFullscreen().catch(err => {
          console.error("Fullscreen request failed:", err);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(1.8, Math.round((prev + 0.1) * 10) / 10));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(0.6, Math.round((prev - 0.1) * 10) / 10));
  };

  const handleResetZoom = () => {
    setZoomLevel(1.0);
  };

  const isAnyRunning = timers.some(t => t.isRunning);

  // Time format calculations
  const hh = globalTime.getHours().toString().padStart(2, '0');
  const mm = globalTime.getMinutes().toString().padStart(2, '0');
  const ss = globalTime.getSeconds().toString().padStart(2, '0');
  const dateStr = globalTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  const getMilestoneTime = (baseTime, timeLeftSeconds, milestoneSeconds) => {
    const diff = Math.max(0, timeLeftSeconds - milestoneSeconds);
    const targetDate = new Date(baseTime.getTime() + diff * 1000);
    return targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className="animate-fade-in" style={{ padding: '1rem 0' }}>
      <style>{`
        .mono {
          font-family: 'JetBrains Mono', monospace, Courier, monospace;
        }
        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(213, 43, 30, 0.5); }
          70% { box-shadow: 0 0 0 16px rgba(213, 43, 30, 0); }
          100% { box-shadow: 0 0 0 0 rgba(213, 43, 30, 0); }
        }
        .timer-finished-pulse {
          animation: pulse-red 1.8s infinite;
          background: #D52B1E !important;
          border-color: #991b1b !important;
        }
        #timer-fullscreen-container:fullscreen {
          background-color: var(--bg-app) !important;
          padding: 3rem 2rem !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          overflow-y: auto !important;
        }
      `}</style>

      {!dashboardInitialized ? (
        <div className="glass-panel animate-fade-in" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            flexShrink: 0
          }}>
            <svg 
              className="sisd-logo-svg"
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="-110 -110 420 420" 
              style={{ 
                overflow: 'visible', 
                isolation: 'isolate', 
                width: '100%', 
                height: '100%',
                filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.25))'
              }}
            >
              <circle className="sisd-ring sisd-ring-1" cx="100" cy="-8" r="90" style={{ strokeWidth: '16px' }} />
              <circle className="sisd-ring sisd-ring-2" cx="100" cy="208" r="90" style={{ strokeWidth: '16px' }} />
              <circle className="sisd-ring sisd-ring-3" cx="-8" cy="100" r="90" style={{ strokeWidth: '16px' }} />
              <circle className="sisd-ring sisd-ring-4" cx="208" cy="100" r="90" style={{ strokeWidth: '16px' }} />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '850', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>ProTimer Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.12em', marginBottom: '2.5rem' }}>
            Tailored Multiple Session Timer
          </p>

          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '1rem', letterSpacing: '0.04em' }}>
              How many sessions to track?
            </label>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1.5rem' }}>
              {[1, 2, 3, 4, 5, 6].map(count => (
                <button
                  key={count}
                  onClick={() => setSelectedSessionCount(count)}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: selectedSessionCount === count ? '#D52B1E' : 'var(--border-color)',
                    background: selectedSessionCount === count ? 'rgba(213,43,30,0.1)' : 'transparent',
                    color: selectedSessionCount === count ? '#D52B1E' : 'var(--text-muted)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {count}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => handleInitialize(selectedSessionCount)}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #D52B1E 0%, #b02419 100%)',
                color: '#fff',
                borderColor: 'transparent',
                fontWeight: '700',
                boxShadow: '0 4px 15px rgba(213,43,30,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              Initialize Dashboard
            </button>
          </div>
        </div>
      ) : (
        <div 
          ref={dashboardRef}
          id="timer-fullscreen-container"
          className="animate-fade-in"
          style={{ 
            padding: isFullscreen ? '3rem 2rem' : '1rem 0',
            background: isFullscreen ? 'var(--bg-app)' : 'transparent',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: isFullscreen ? '100vh' : 'auto'
          }}
        >
          {/* Zoom Wrapper */}
          <div 
            style={{
              zoom: zoomLevel,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'zoom 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Dashboard Header: Global Clock */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem', textAlign: 'center' }}>
              {/* SISD EduKit brand logo and header */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg 
                    className="sisd-logo-svg"
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="-110 -110 420 420" 
                    style={{ 
                      overflow: 'visible', 
                      isolation: 'isolate', 
                      width: '100%', 
                      height: '100%',
                      filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.25))'
                    }}
                  >
                    <circle className="sisd-ring sisd-ring-1" cx="100" cy="-8" r="90" style={{ strokeWidth: '16px' }} />
                    <circle className="sisd-ring sisd-ring-2" cx="100" cy="208" r="90" style={{ strokeWidth: '16px' }} />
                    <circle className="sisd-ring sisd-ring-3" cx="-8" cy="100" r="90" style={{ strokeWidth: '16px' }} />
                    <circle className="sisd-ring sisd-ring-4" cx="208" cy="100" r="90" style={{ strokeWidth: '16px' }} />
                  </svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '900', lineHeight: 1, letterSpacing: '-0.04em', margin: 0, color: 'var(--text-main)' }}>SISD EduKit</h2>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.12em', lineHeight: 1 }}>TEACHER PORTAL</span>
                </div>
              </div>

              <div className="mono" style={{ fontSize: '4.5rem', fontWeight: '900', letterSpacing: '-0.04em', color: 'var(--text-main)', lineHeight: 1 }}>
                {hh}:{mm}:{ss}
              </div>
              <div style={{ color: '#D52B1E', fontWeight: '800', tracking: '0.35em', textTransform: 'uppercase', marginTop: '0.75rem', fontSize: '0.72rem', letterSpacing: '0.3em' }}>
                {dateStr}
              </div>
              
              <div style={{ marginTop: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <button
                  onClick={handleStartAll}
                  className="btn btn-primary"
                  style={{
                    padding: '0.65rem 1.6rem',
                    fontSize: '0.8rem',
                    borderRadius: '12px',
                    background: isAnyRunning ? 'var(--warning-gradient)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderColor: 'transparent',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    boxShadow: isAnyRunning ? '0 4px 12px rgba(245,158,11,0.18)' : '0 4px 12px rgba(16,185,129,0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {isAnyRunning ? <Pause size={14} /> : <Play size={14} />}
                  {isAnyRunning ? 'Pause All' : 'Start All'}
                </button>
                
                <button
                  onClick={handleResetAll}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.65rem 1.2rem',
                    borderRadius: '12px',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="Reset All Timers"
                >
                  <RotateCcw size={14} />
                  Reset All
                </button>

                <button
                  onClick={() => setDashboardInitialized(false)}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.65rem 1.2rem',
                    borderRadius: '12px',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="Back to active session setup"
                >
                  <ArrowLeft size={14} />
                  Setup Page
                </button>

                <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 4px' }} />

                {/* Zoom Controls */}
                <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 6px', borderRadius: '12px', borderColor: 'var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                  <button
                    onClick={handleZoomOut}
                    className="btn-icon"
                    style={{ width: '28px', height: '28px', borderRadius: '8px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Zoom Out"
                  >
                    <ZoomOut size={13} />
                  </button>
                  <span 
                    onClick={handleResetZoom}
                    style={{ fontSize: '0.73rem', fontWeight: '800', color: 'var(--text-muted)', minWidth: '40px', textAlign: 'center', cursor: 'pointer', userSelect: 'none' }}
                    title="Reset Zoom to 100%"
                  >
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="btn-icon"
                    style={{ width: '28px', height: '28px', borderRadius: '8px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Zoom In"
                  >
                    <ZoomIn size={13} />
                  </button>
                </div>

                {/* Fullscreen Controls */}
                <button
                  onClick={handleToggleFullscreen}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.65rem 1.2rem',
                    borderRadius: '12px',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
                >
                  {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                </button>
              </div>
            </div>

            {/* Centered Responsive Flex Deck of Active Session Timers */}
            <div 
              style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '1.75rem', 
                justifyContent: 'center', 
                alignItems: 'center',
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 1rem'
              }}
            >
              {timers.map(t => {
                const totalSecs = t.durationMinutes * 60;
                const elapsed = totalSecs - t.timeLeftSeconds;
                const isFirstHour = elapsed < 3600;
                const isLast15 = t.timeLeftSeconds < 900;
                const statusRed = isFirstHour || isLast15;

                const isFinished = t.timeLeftSeconds === 0;
                const minutesLeft = Math.floor(t.timeLeftSeconds / 60);
                const secondsLeft = t.timeLeftSeconds % 60;
                const displayStr = `${minutesLeft.toString().padStart(2, '0')}:${secondsLeft.toString().padStart(2, '0')}`;

                // Dynamic text color overrides based on thresholds
                let displayColor = 'var(--text-main)';
                if (!isFinished) {
                  if (t.timeLeftSeconds <= 300) {
                    displayColor = '#D52B1E';
                  } else if (t.timeLeftSeconds <= 1800) {
                    displayColor = '#f59e0b';
                  }
                }

                return (
                  <div
                    key={t.id}
                    className={`glass-panel ${isFinished ? 'timer-finished-pulse' : ''}`}
                    style={{
                      padding: '1.5rem',
                      borderRadius: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '1.25rem',
                      position: 'relative',
                      borderTop: isFinished ? '8px solid #991b1b' : '8px solid #D52B1E',
                      textAlign: 'center',
                      background: 'var(--bg-card)',
                      transition: 'all 0.3s ease',
                      width: '300px',
                      flexShrink: 0
                    }}
                  >
                    {/* Settings gear trigger */}
                    <button
                      onClick={() => handleOpenEdit(t)}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'transparent',
                        border: 'none',
                        color: isFinished ? 'rgba(255,255,255,0.45)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#D52B1E'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = isFinished ? 'rgba(255,255,255,0.45)' : 'var(--text-muted)'; }}
                      title="Edit Session Timer"
                    >
                      <Settings size={15} />
                    </button>

                    {/* Status Indicator Dot */}
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: isFinished ? '#ffffff' : (statusRed ? '#D52B1E' : '#10b981'),
                        boxShadow: isFinished ? '0 0 8px #fff' : (statusRed ? '0 0 8px rgba(213,43,30,0.5)' : '0 0 8px rgba(16,185,129,0.5)'),
                        marginTop: '0.25rem'
                      }}
                    />

                    {/* Labels */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <h3 style={{
                        fontSize: '0.8rem',
                        fontWeight: '900',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: isFinished ? '#ffffff' : 'var(--text-main)'
                      }}>
                        {t.title}
                      </h3>
                      
                      {t.autoStartTime && (
                        <span style={{
                          fontSize: '0.62rem',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          color: isFinished ? 'rgba(255,255,255,0.8)' : '#D52B1E'
                        }}>
                          @ {t.autoStartTime}
                        </span>
                      )}
                    </div>

                    {/* Giant countdown text */}
                    <div
                      className="mono"
                      style={{
                        fontSize: '3.75rem',
                        fontWeight: '900',
                        letterSpacing: '-0.04em',
                        lineHeight: 1,
                        color: isFinished ? '#ffffff' : displayColor,
                        transition: 'color 0.3s'
                      }}
                    >
                      {displayStr}
                    </div>

                    {/* Milestones Panel */}
                    <div style={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      borderTop: '1px solid ' + (isFinished ? 'rgba(255,255,255,0.18)' : 'var(--border-color)'),
                      borderBottom: '1px solid ' + (isFinished ? 'rgba(255,255,255,0.18)' : 'var(--border-color)'),
                      padding: '8px 4px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.62rem', fontWeight: '800', color: isFinished ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>30m Mark</span>
                        <span className="mono" style={{ fontSize: '0.8rem', fontWeight: '700', color: isFinished ? '#ffffff' : 'var(--text-main)' }}>
                          {totalSecs > 1800 ? getMilestoneTime(globalTime, t.timeLeftSeconds, 1800) : '---'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.62rem', fontWeight: '800', color: isFinished ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>5m Mark</span>
                        <span className="mono" style={{ fontSize: '0.8rem', fontWeight: '700', color: isFinished ? '#ffffff' : '#D52B1E' }}>
                          {totalSecs > 300 ? getMilestoneTime(globalTime, t.timeLeftSeconds, 300) : '---'}
                        </span>
                      </div>
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleToggleTimer(t.id)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '10px',
                          background: isFinished ? '#ffffff' : (t.isRunning ? '#f59e0b' : '#D52B1E'),
                          color: isFinished ? '#D52B1E' : '#ffffff',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'transform 0.15s ease',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                        title={t.isRunning ? "Pause" : "Play"}
                      >
                        {t.isRunning ? <Pause size={14} /> : <Play size={14} />}
                      </button>

                      <button
                        onClick={() => handleResetTimer(t.id)}
                        style={{
                          padding: '8px',
                          borderRadius: '10px',
                          background: isFinished ? 'rgba(255,255,255,0.15)' : 'var(--bg-app)',
                          color: isFinished ? '#ffffff' : 'var(--text-muted)',
                          border: '1px solid ' + (isFinished ? 'rgba(255,255,255,0.25)' : 'var(--border-color)'),
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'transform 0.15s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                        title="Reset Session Timer"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Edit Config Modal Overlay */}
      {editingTimer && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(3, 7, 18, 0.75)',
          backdropFilter: 'blur(12px)',
          zIndex: 100000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div className="glass-panel animate-fade-in" style={{
            padding: '2rem',
            width: '100%',
            maxWidth: '460px',
            background: 'var(--bg-card)',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '850', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.02em' }}>
                <span style={{ width: '4px', height: '22px', background: '#D52B1E', borderRadius: '4px', display: 'inline-block' }} />
                Session Configuration
              </h2>
              <button
                onClick={() => setEditingTimer(null)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>Title</label>
                <input
                  type="text"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    borderRadius: '10px',
                    outline: 'none',
                    fontWeight: '600'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>Duration (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={modalDuration}
                    onChange={(e) => setModalDuration(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      borderRadius: '10px',
                      outline: 'none',
                      fontWeight: '600'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>Auto-Start Time</label>
                  <input
                    type="time"
                    value={modalAutoStart}
                    onChange={(e) => setModalAutoStart(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.73rem 1rem',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      borderRadius: '10px',
                      outline: 'none',
                      fontWeight: '600'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '1.25rem' }}>
                <button
                  onClick={handleSaveEdit}
                  className="btn btn-primary"
                  style={{
                    flexGrow: 2,
                    padding: '0.85rem',
                    background: 'linear-gradient(135deg, #D52B1E 0%, #b02419 100%)',
                    color: '#fff',
                    borderColor: 'transparent',
                    fontWeight: '700',
                    borderRadius: '12px',
                    boxShadow: '0 4px 15px rgba(213,43,30,0.2)'
                  }}
                >
                  Apply Changes
                </button>
                <button
                  onClick={() => setEditingTimer(null)}
                  className="btn btn-secondary"
                  style={{
                    flexGrow: 1,
                    padding: '0.85rem',
                    borderRadius: '12px',
                    color: 'var(--text-muted)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
