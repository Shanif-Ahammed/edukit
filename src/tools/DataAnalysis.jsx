import React, { useState } from 'react';
import { 
  BarChart3, TrendingUp, Award, Target, AlertTriangle, 
  Users, CheckCircle2, ChevronRight, ChevronDown, HelpCircle 
} from 'lucide-react';
import { useData } from '../context/DataContext';

// KHDA IB Attainment 3-Band classification
// Below = IB 1-2-3 | Meeting = IB 4 | Exceeding = IB 5-6-7
const IB_BANDS = {
  exceeding: { label: 'Exceeding (IB 5–7)', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
  meeting:   { label: 'Meeting (IB 4)',      color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' },
  below:     { label: 'Below (IB 1–3)',      color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
};

// KHDA class-level descriptor derived from the distribution
const getKhdaDescriptor = (pctMeetOrExceed, pctExceed, pctBelow) => {
  if (pctMeetOrExceed >= 75 && pctExceed >= 75)  return { label: 'OUTSTANDING',  color: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.35)',  icon: '🌟' };
  if (pctMeetOrExceed >= 75 && pctExceed >= 61)  return { label: 'VERY GOOD',    color: '#6366f1', bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.35)',  icon: '✨' };
  if (pctMeetOrExceed >= 75 && pctExceed >= 50)  return { label: 'GOOD',          color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.35)',  icon: '👍' };
  if (pctMeetOrExceed >= 75)                     return { label: 'ACCEPTABLE',   color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.35)',  icon: '✅' };
  if (pctBelow >= 85)                            return { label: 'VERY WEAK',    color: '#dc2626', bg: 'rgba(220,38,38,0.10)',   border: 'rgba(220,38,38,0.45)',   icon: '🔴' };
  if (pctBelow >= 25)                            return { label: 'WEAK',          color: '#f97316', bg: 'rgba(249,115,22,0.08)',  border: 'rgba(249,115,22,0.35)',  icon: '⚠️' };
  return                                                { label: 'INADEQUATE',   color: '#94a3b8', bg: 'rgba(148,163,184,0.06)', border: 'rgba(148,163,184,0.25)', icon: '❗' };
};

// KHDA class-level progress descriptor derived from target progress
const getKhdaProgressDescriptor = (pctMeetOrExceed, pctExceed, pctBelow) => {
  if (pctMeetOrExceed >= 85 && pctExceed >= 50) return { label: 'OUTSTANDING',  color: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.35)',  icon: '🌟' };
  if (pctMeetOrExceed >= 75 && pctExceed >= 35) return { label: 'VERY GOOD',    color: '#6366f1', bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.35)',  icon: '✨' };
  if (pctMeetOrExceed >= 65)                    return { label: 'GOOD',          color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.35)',  icon: '👍' };
  if (pctMeetOrExceed >= 50)                    return { label: 'ACCEPTABLE',   color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.35)',  icon: '✅' };
  if (pctBelow >= 75)                           return { label: 'VERY WEAK',    color: '#dc2626', bg: 'rgba(220,38,38,0.10)',   border: 'rgba(220,38,38,0.45)',   icon: '🔴' };
  return                                               { label: 'WEAK',          color: '#f97316', bg: 'rgba(249,115,22,0.08)',  border: 'rgba(249,115,22,0.35)',  icon: '⚠️' };
};


// IB MYP Grade Boundaries — CPT out of 32
const IB_GRADE_BANDS = [
  { grade: 7, min: 28, max: 32 },
  { grade: 6, min: 24, max: 27 },
  { grade: 5, min: 19, max: 23 },
  { grade: 4, min: 15, max: 18 },
  { grade: 3, min: 10, max: 14 },
  { grade: 2, min: 6,  max: 9  },
  { grade: 1, min: 0,  max: 5  },
];
const CPT_BORDER_THRESHOLD = 2; // pts within a boundary = borderline / at-risk

export default function DataAnalysis() {
  const { fileConnected, students, selectedClass, subject } = useData();
  const [hoveredBar, setHoveredBar] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [groupingMode, setGroupingMode] = useState('attainment'); // 'attainment' | 'progress'
  const [filterType, setFilterType] = useState('all'); // 'all' | 'exceeding' | 'meeting' | 'below'
  const [atRiskOpen, setAtRiskOpen] = useState(false);
  const [borderlineOpen, setBorderlineOpen] = useState(false);
  const [expandedAttainTier, setExpandedAttainTier] = useState(null); // null | 'good' | 'vg' | 'out'
  const [expandedProgTier, setExpandedProgTier] = useState(null);     // null | 'good' | 'vg' | 'out'

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
            <BarChart3 size={38} className="animate-pulse" />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Data Analysis Suite</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto 2rem' }}>
            Connect your Master Excel iSAMS file at the top of the portal to activate automated KHDA attainment descriptors, student target comparisons, and class performance trends.
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
          <AlertTriangle size={40} style={{ color: 'var(--warning)', marginBottom: '1rem', opacity: 0.8 }} />
          <h3>No students found in the active class</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            There are no student records matching class group <strong>"{selectedClass}"</strong> in your Excel sheet.
          </p>
        </div>
      </div>
    );
  }

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
    return null;
  };

  // 1. IB 3-Band Attainment Counts
  let attainmentExceedingCount = 0; // IB 5-6-7
  let attainmentMeetingCount   = 0; // IB 4
  let attainmentBelowCount     = 0; // IB 1-2-3
  let gradedStudentsCount = 0;

  classStudents.forEach(s => {
    const grade = getEffectiveGrade(s);
    if (grade !== null) {
      gradedStudentsCount++;
      if (grade >= 5)      attainmentExceedingCount++;
      else if (grade === 4) attainmentMeetingCount++;
      else                  attainmentBelowCount++;
    }
  });

  const percentOf = (count) => {
    if (gradedStudentsCount === 0) return 0;
    return Math.round((count / gradedStudentsCount) * 100);
  };

  const pctExceeding      = percentOf(attainmentExceedingCount);
  const pctMeeting        = percentOf(attainmentMeetingCount);
  const pctBelow          = percentOf(attainmentBelowCount);
  const pctMeetOrExceed   = percentOf(attainmentMeetingCount + attainmentExceedingCount);

  const khdaDescriptor = getKhdaDescriptor(pctMeetOrExceed, pctExceeding, pctBelow);

  const attainmentBands = [
    { key: 'exceeding', count: attainmentExceedingCount, percentage: pctExceeding, ...IB_BANDS.exceeding },
    { key: 'meeting',   count: attainmentMeetingCount,   percentage: pctMeeting,   ...IB_BANDS.meeting   },
    { key: 'below',     count: attainmentBelowCount,     percentage: pctBelow,     ...IB_BANDS.below     },
  ];

  // 2. Target Progress: CPT vs MEG (both out of 32)
  //    Exceeding : CPT >= MEG  OR  IB Grade = 7
  //    Meeting   : CPT == MEG - 1  (exactly 1 pt below)
  //    Below     : CPT <= MEG - 2  (2+ pts below)
  let progressExceedingCount = 0;
  let progressMeetingCount   = 0;
  let progressBelowCount     = 0;
  let megConnectedCount = 0;

  const rosterWithProgress = classStudents.map(s => {
    const actualCpt   = (s.cpt !== null && s.cpt !== undefined && s.cpt !== '') ? Number(s.cpt)  : null;
    const expectedMeg = (s.meg !== null && s.meg !== undefined && s.meg !== '') ? Number(s.meg) : null;
    const actual      = getEffectiveGrade(s); // IB 1-7 for display

    let status = 'No MEG';
    let diff   = 0;

    if (actualCpt !== null && expectedMeg !== null) {
      megConnectedCount++;
      diff = actualCpt - expectedMeg;

      // IB 7 override: always Exceeding regardless of MEG
      if (actual === 7) {
        progressExceedingCount++;
        status = 'Exceeding';
      } else if (diff >= 0) {       // CPT at or above MEG
        progressExceedingCount++;
        status = 'Exceeding';
      } else if (diff === -1) {     // exactly 1 pt below MEG
        progressMeetingCount++;
        status = 'Meeting';
      } else {                      // 2+ pts below MEG
        progressBelowCount++;
        status = 'Below';
      }
    }

    // Resolve attainment status
    let attainmentStatus = 'No Grade';
    if (actual !== null) {
      if (actual >= 5) attainmentStatus = 'Exceeding';
      else if (actual === 4) attainmentStatus = 'Meeting';
      else attainmentStatus = 'Below';
    }

    return {
      ...s,
      actualCpt,
      expectedMeg,
      actualGrade: actual,
      progressStatus: status,
      cptDiff: diff,
      attainmentStatus
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  const progressPercentOf = (count) => {
    if (megConnectedCount === 0) return 0;
    return Math.round((count / megConnectedCount) * 100);
  };

  const percentExceeding         = progressPercentOf(progressExceedingCount);
  const percentMeeting           = progressPercentOf(progressMeetingCount);
  const percentBelow             = progressPercentOf(progressBelowCount);
  const percentMeetingOrExceeding = progressPercentOf(progressMeetingCount + progressExceedingCount);

  const khdaProgressDescriptor = getKhdaProgressDescriptor(percentMeetingOrExceeding, percentExceeding, percentBelow);

  // --- KHDA Pathway Target Upgrade Calculations ---
  // A. Attainment Pathway
  const N_att = gradedStudentsCount;
  const meetExceedCount_att = attainmentMeetingCount + attainmentExceedingCount;
  const exceedCount_att = attainmentExceedingCount;

  // Good Attainment Targets: >= 75% Meet or Exceed, >= 50% Exceed
  const reqMeetGood_att = Math.ceil(0.75 * N_att);
  const defMeetGood_att = Math.max(0, reqMeetGood_att - meetExceedCount_att);
  const reqExceedGood_att = Math.ceil(0.50 * N_att);
  const defExceedGood_att = Math.max(0, reqExceedGood_att - exceedCount_att);
  const isGoodAchieved_att = pctMeetOrExceed >= 75 && pctExceeding >= 50;

  // Very Good Attainment Targets: >= 75% Meet or Exceed, >= 61% Exceed
  const reqMeetVG_att = Math.ceil(0.75 * N_att);
  const defMeetVG_att = Math.max(0, reqMeetVG_att - meetExceedCount_att);
  const reqExceedVG_att = Math.ceil(0.61 * N_att);
  const defExceedVG_att = Math.max(0, reqExceedVG_att - exceedCount_att);
  const isVGAchieved_att = pctMeetOrExceed >= 75 && pctExceeding >= 61;

  // Outstanding Attainment Targets: >= 75% Meet or Exceed, >= 75% Exceed
  const reqMeetOut_att = Math.ceil(0.75 * N_att);
  const defMeetOut_att = Math.max(0, reqMeetOut_att - meetExceedCount_att);
  const reqExceedOut_att = Math.ceil(0.75 * N_att);
  const defExceedOut_att = Math.max(0, reqExceedOut_att - exceedCount_att);
  const isOutAchieved_att = pctMeetOrExceed >= 75 && pctExceeding >= 75;

  // Attainment Candidates
  // Below (IB 1-3) -> Meeting (IB 4). Starts at CPT 15.
  const belowCandidates_att = rosterWithProgress
    .filter(s => s.actualGrade !== null && s.actualGrade <= 3 && s.actualCpt !== null)
    .map(s => ({
      ...s,
      ptsNeeded: 15 - s.actualCpt
    }))
    .sort((a, b) => a.ptsNeeded - b.ptsNeeded); // closest first

  // Meeting (IB 4) -> Exceeding (IB 5). Starts at CPT 19.
  const meetingCandidates_att = rosterWithProgress
    .filter(s => s.actualGrade === 4 && s.actualCpt !== null)
    .map(s => ({
      ...s,
      ptsNeeded: 19 - s.actualCpt
    }))
    .sort((a, b) => a.ptsNeeded - b.ptsNeeded); // closest first

  // B. Progress Pathway
  const M_prog = megConnectedCount;
  const meetExceedCount_prog = progressMeetingCount + progressExceedingCount;
  const exceedCount_prog = progressExceedingCount;

  // Good Progress Targets: >= 65% Meet or Exceed
  const reqMeetGood_prog = Math.ceil(0.65 * M_prog);
  const defMeetGood_prog = Math.max(0, reqMeetGood_prog - meetExceedCount_prog);
  const isGoodAchieved_prog = percentMeetingOrExceeding >= 65;

  // Very Good Progress Targets: >= 75% Meet or Exceed, >= 35% Exceed
  const reqMeetVG_prog = Math.ceil(0.75 * M_prog);
  const defMeetVG_prog = Math.max(0, reqMeetVG_prog - meetExceedCount_prog);
  const reqExceedVG_prog = Math.ceil(0.35 * M_prog);
  const defExceedVG_prog = Math.max(0, reqExceedVG_prog - exceedCount_prog);
  const isVGAchieved_prog = percentMeetingOrExceeding >= 75 && percentExceeding >= 35;

  // Outstanding Progress Targets: >= 85% Meet or Exceed, >= 50% Exceed
  const reqMeetOut_prog = Math.ceil(0.85 * M_prog);
  const defMeetOut_prog = Math.max(0, reqMeetOut_prog - meetExceedCount_prog);
  const reqExceedOut_prog = Math.ceil(0.50 * M_prog);
  const defExceedOut_prog = Math.max(0, reqExceedOut_prog - exceedCount_prog);
  const isOutAchieved_prog = percentMeetingOrExceeding >= 85 && percentExceeding >= 50;

  // Progress Candidates
  // Below Progress -> Meeting Progress. Currently cptDiff <= -2. Needs to reach cptDiff === -1.
  const belowCandidates_prog = rosterWithProgress
    .filter(s => s.progressStatus === 'Below' && s.expectedMeg !== null && s.actualCpt !== null)
    .map(s => ({
      ...s,
      ptsNeeded: -1 - s.cptDiff // e.g. -2 diff needs 1 pt, -3 diff needs 2 pts
    }))
    .sort((a, b) => a.ptsNeeded - b.ptsNeeded);

  // Meeting Progress -> Exceeding Progress. Currently cptDiff === -1. Needs 1 pt to reach 0.
  const meetingCandidates_prog = rosterWithProgress
    .filter(s => s.progressStatus === 'Meeting' && s.expectedMeg !== null && s.actualCpt !== null)
    .map(s => ({
      ...s,
      ptsNeeded: 1
    }))
    .sort((a, b) => a.name.localeCompare(b.name));


  // Filter roster for the list
  const filteredRoster = rosterWithProgress.filter(s => {
    if (filterType === 'all') return true;
    
    if (groupingMode === 'attainment') {
      if (filterType === 'exceeding') return s.attainmentStatus === 'Exceeding';
      if (filterType === 'meeting')   return s.attainmentStatus === 'Meeting';
      if (filterType === 'below')     return s.attainmentStatus === 'Below';
    } else { // 'progress'
      if (filterType === 'exceeding') return s.progressStatus === 'Exceeding';
      if (filterType === 'meeting')   return s.progressStatus === 'Meeting';
      if (filterType === 'below')     return s.progressStatus === 'Below';
    }
    return true;
  });

  // At-Risk / Borderline — CPT vs IB MYP grade boundaries
  const atRiskStudents = [];
  const borderlineStudents = [];
  classStudents.forEach(s => {
    if (s.cpt === null || s.cpt === undefined || s.cpt === '') return;
    const cpt = Number(s.cpt);
    const band = IB_GRADE_BANDS.find(b => cpt >= b.min && cpt <= b.max);
    if (!band) return;
    const distFromMin = cpt - band.min;   // 0 = sitting exactly at lower bound
    const distFromMax = band.max - cpt;   // 0 = sitting exactly at upper bound
    if (band.grade > 1 && distFromMin < CPT_BORDER_THRESHOLD) {
      atRiskStudents.push({ ...s, cpt, ibGradeBand: band.grade, ptsFromDrop: distFromMin, dropToGrade: band.grade - 1 });
    } else if (band.grade < 7 && distFromMax < CPT_BORDER_THRESHOLD) {
      borderlineStudents.push({ ...s, cpt, ibGradeBand: band.grade, ptsToNext: distFromMax, nextGrade: band.grade + 1 });
    }
  });
  atRiskStudents.sort((a, b) => a.ptsFromDrop - b.ptsFromDrop);
  borderlineStudents.sort((a, b) => a.ptsToNext - b.ptsToNext);
  const hasCptData = classStudents.some(s => s.cpt !== null && s.cpt !== undefined && s.cpt !== '');

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      
      {/* Subject and Overview Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem 2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'linear-gradient(90deg, rgba(225, 0, 49, 0.05) 0%, rgba(13, 20, 35, 0.45) 100%)', borderLeft: '4px solid var(--primary)' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--primary)', textTransform: 'uppercase' }}>Active Roster Overview</span>
          <h2 style={{ fontSize: '1.5rem', marginTop: '0.15rem' }}>
            {selectedClass} &middot; {subject} {groupingMode === 'attainment' ? 'Attainment Analysis' : 'Target Progress Analysis'}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Total Students</span>
            <strong style={{ fontSize: '1.35rem', color: 'var(--text-main)' }}>{classStudents.length}</strong>
          </div>
          <div style={{ width: '1px', background: 'var(--border-color)' }} />
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Graded Records</span>
            <strong style={{ fontSize: '1.35rem', color: 'var(--text-main)' }}>{gradedStudentsCount}</strong>
          </div>
          <div style={{ width: '1px', background: 'var(--border-color)' }} />
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>MEG Targets Loaded</span>
            <strong style={{ fontSize: '1.35rem', color: 'var(--text-main)' }}>{megConnectedCount}</strong>
          </div>
        </div>
      </div>

      {/* Master Analysis Pivot Toggle */}
      <div className="glass-panel" style={{ 
        padding: '1rem 1.5rem', 
        marginBottom: '2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '1rem',
        background: 'rgba(255, 255, 255, 0.015)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: groupingMode === 'attainment' ? 'rgba(225, 0, 49, 0.1)' : 'rgba(99, 102, 241, 0.1)',
            color: groupingMode === 'attainment' ? 'var(--primary)' : 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-color)',
            transition: 'all 0.3s ease'
          }}>
            {groupingMode === 'attainment' ? <Award size={18} /> : <Target size={18} />}
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', margin: 0, fontWeight: '700' }}>Analysis Perspective</h4>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
              {groupingMode === 'attainment' 
                ? 'Viewing student distributions, KHDA classification metrics, and boundary risks.' 
                : 'Viewing student actual vs. MEG target competency progress metrics.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <button
            style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.82rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              background: groupingMode === 'attainment' ? 'linear-gradient(135deg, rgba(225, 0, 49, 0.15) 0%, rgba(225, 0, 49, 0.05) 100%)' : 'transparent',
              borderLeft: groupingMode === 'attainment' ? '2px solid var(--primary)' : 'none',
              color: groupingMode === 'attainment' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: groupingMode === 'attainment' ? '700' : '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
            onClick={() => {
              setGroupingMode('attainment');
              setFilterType('all');
            }}
          >
            <Award size={14} />
            Attainment Analysis
          </button>
          <button
            disabled={megConnectedCount === 0}
            style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.82rem',
              borderRadius: '6px',
              border: 'none',
              cursor: megConnectedCount === 0 ? 'not-allowed' : 'pointer',
              opacity: megConnectedCount === 0 ? 0.5 : 1,
              transition: 'all 0.25s ease',
              background: groupingMode === 'progress' ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%)' : 'transparent',
              borderLeft: groupingMode === 'progress' ? '2px solid var(--accent)' : 'none',
              color: groupingMode === 'progress' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: groupingMode === 'progress' ? '700' : '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
            title={megConnectedCount === 0 ? "Connect Expected Grade (MEG) column to view progress analytics" : "View CPT performance compared to MEG targets"}
            onClick={() => {
              setGroupingMode('progress');
              setFilterType('all');
            }}
          >
            <Target size={14} />
            Target Progress vs MEG
          </button>
        </div>
      </div>

      {/* Conditionally Render Visual Sections by Perspective Pivot */}

      {/* ATTAINMENT VIEW PERSPECTIVE */}
      {groupingMode === 'attainment' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '2.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem' }}>
          
          {/* KHDA ATTAINMENT ANALYSIS CARD */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Award size={20} style={{ color: 'var(--primary)' }} />
              KHDA Attainment Descriptors
            </h3>

            {/* KHDA Class-Level Descriptor Banner */}
            {gradedStudentsCount > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem 1.5rem',
                background: khdaDescriptor.bg,
                border: `1px solid ${khdaDescriptor.border}`,
                borderLeft: `5px solid ${khdaDescriptor.color}`,
                borderRadius: '10px',
                marginBottom: '1.5rem'
              }}>
                <span style={{ fontSize: '2rem' }}>{khdaDescriptor.icon}</span>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: khdaDescriptor.color, marginBottom: '0.2rem' }}>KHDA Class Descriptor</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '900', color: khdaDescriptor.color, lineHeight: '1.1' }}>
                    {khdaDescriptor.label}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.35rem 0 0', lineHeight: '1.3' }}>
                    {pctMeetOrExceed}% of students are Meeting or Exceeding (IB 4+), with {pctExceeding}% Exceeding (IB 5+).
                  </p>
                </div>
              </div>
            )}

            {/* Attainment Bands Map List */}
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {attainmentBands.map((band, idx) => {
                const isActive = groupingMode === 'attainment' && filterType === band.key;
                const isHovered = hoveredBar === idx || isActive;
                return (
                  <div 
                    key={band.key} 
                    style={{ 
                      marginBottom: '1.15rem', 
                      cursor: 'pointer',
                      background: isActive ? 'rgba(255,255,255,0.01)' : 'transparent',
                      borderRadius: '8px',
                      padding: '0.35rem 0.5rem',
                      border: isActive ? `1px dashed ${band.color}` : '1px solid transparent',
                      transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={() => setHoveredBar(idx)}
                    onMouseLeave={() => setHoveredBar(null)}
                    onClick={() => {
                      setGroupingMode('attainment');
                      setFilterType(filterType === band.key ? 'all' : band.key);
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.82rem' }}>
                      <span style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: band.color }} />
                        {band.label}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontWeight: '700' }}>
                        {band.count} student{band.count !== 1 ? 's' : ''} &middot; <strong style={{ color: 'var(--text-main)' }}>{band.percentage}%</strong>
                      </span>
                    </div>
                    
                    {/* Bar Gauge */}
                    <div style={{
                      width: '100%',
                      height: '24px',
                      borderRadius: '6px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: `${Math.max(band.percentage, 1)}%`,
                        height: '100%',
                        background: band.gradient,
                        borderRadius: '5px',
                        transform: isHovered ? 'scaleY(1.08)' : 'scaleY(1)',
                        transition: 'transform 0.2s ease',
                        transformOrigin: 'bottom'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STUDENTS AT RISK & BORDERLINE CARD */}
          {hasCptData && (
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <AlertTriangle size={20} style={{ color: '#f97316' }} />
                Students at Risk &amp; Borderline
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Based on CPT score position within IB MYP grade boundaries (out of 32 pts). Threshold: ±{CPT_BORDER_THRESHOLD} pts from a boundary.
              </p>

              {/* Two clickable summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1rem' }}>

                {/* At Risk card */}
                <div
                  onClick={() => setAtRiskOpen(o => !o)}
                  style={{
                    cursor: 'pointer',
                    padding: '1.25rem 1.5rem',
                    background: atRiskStudents.length > 0 ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${atRiskStudents.length > 0 ? 'rgba(239,68,68,0.3)' : 'var(--border-color)'}`,
                    borderLeft: `5px solid ${atRiskStudents.length > 0 ? '#ef4444' : 'var(--border-color)'}`,
                    borderRadius: '10px',
                    transition: 'box-shadow 0.2s',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ef4444', marginBottom: '0.35rem' }}>
                        🔴 At Risk of Drop
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: '900', color: atRiskStudents.length > 0 ? '#ef4444' : 'var(--text-muted)', lineHeight: 1 }}>
                        {atRiskStudents.length}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                        near lower boundary
                      </div>
                    </div>
                    <ChevronDown
                      size={20}
                      style={{
                        color: '#ef4444',
                        opacity: atRiskStudents.length > 0 ? 0.8 : 0.3,
                        transform: atRiskOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }}
                    />
                  </div>
                </div>

                {/* Borderline card */}
                <div
                  onClick={() => setBorderlineOpen(o => !o)}
                  style={{
                    cursor: 'pointer',
                    padding: '1.25rem 1.5rem',
                    background: borderlineStudents.length > 0 ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${borderlineStudents.length > 0 ? 'rgba(245,158,11,0.3)' : 'var(--border-color)'}`,
                    borderLeft: `5px solid ${borderlineStudents.length > 0 ? '#f59e0b' : 'var(--border-color)'}`,
                    borderRadius: '10px',
                    transition: 'box-shadow 0.2s',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f59e0b', marginBottom: '0.35rem' }}>
                        ⚡ Borderline Up
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: '900', color: borderlineStudents.length > 0 ? '#f59e0b' : 'var(--text-muted)', lineHeight: 1 }}>
                        {borderlineStudents.length}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                        near upper boundary
                      </div>
                    </div>
                    <ChevronDown
                      size={20}
                      style={{
                        color: '#f59e0b',
                        opacity: borderlineStudents.length > 0 ? 0.8 : 0.3,
                        transform: borderlineOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* ---- At Risk expanded list ---- */}
              {atRiskOpen && (
                <div style={{ marginTop: '0.5rem', marginBottom: '1rem', animation: 'fadeIn 0.2s ease', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: '800', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
                    🔴 At Risk — Student List
                  </div>
                  {atRiskStudents.length === 0 ? (
                    <div style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                      ✅ No students are at risk of dropping.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {atRiskStudents.map(s => (
                        <div key={s.id} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          background: 'rgba(239,68,68,0.04)',
                          border: '1px solid rgba(239,68,68,0.18)',
                          borderRadius: '6px',
                        }}>
                          <span style={{ fontWeight: '700', fontSize: '0.8rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{s.name}</span>
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexShrink: 0 }}>
                            <div style={{ textAlign: 'center', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', fontSize: '0.75rem', fontWeight: '700', color: '#ef4444' }}>
                              IB {s.ibGradeBand}
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: '600' }}>
                              {s.ptsFromDrop === 0 ? 'At bound' : `+${s.ptsFromDrop} pt`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ---- Borderline expanded list ---- */}
              {borderlineOpen && (
                <div style={{ marginTop: '0.5rem', marginBottom: '1rem', animation: 'fadeIn 0.2s ease', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: '800', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
                    ⚡ Borderline — Student List
                  </div>
                  {borderlineStudents.length === 0 ? (
                    <div style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                      No students are borderline for a grade up.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {borderlineStudents.map(s => (
                        <div key={s.id} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          background: 'rgba(245,158,11,0.04)',
                          border: '1px solid rgba(245,158,11,0.18)',
                          borderRadius: '6px',
                        }}>
                          <span style={{ fontWeight: '700', fontSize: '0.8rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{s.name}</span>
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexShrink: 0 }}>
                            <div style={{ textAlign: 'center', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', fontSize: '0.75rem', fontWeight: '700', color: '#f59e0b' }}>
                              IB {s.ibGradeBand}
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: '600' }}>
                              {s.ptsToNext === 0 ? 'At bound' : `${s.ptsToNext} pt to IB ${s.nextGrade}`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          </div>

          {/* KHDA Pathway Upgrade Guide Card */}
          <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>KHDA Attainment Upgrade Pathways</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 1.5rem 0' }}>
              Strategic intervention roadmap. Shows precisely how many student upgrades are required to elevate the cohort rating.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {/* GOOD Pathway */}
              <div style={{
                padding: '1.25rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'rgba(255,255,255,0.01)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '220px'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>GOOD TIER</span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      background: isGoodAchieved_att ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                      color: isGoodAchieved_att ? '#10b981' : 'var(--text-muted)',
                      border: `1px solid ${isGoodAchieved_att ? 'rgba(16,185,129,0.3)' : 'var(--border-color)'}`
                    }}>
                      {isGoodAchieved_att ? '🌟 ACHIEVED' : 'PATHWAY ACTIVE'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 1rem 0', lineHeight: '1.3' }}>
                    Requires ≥75% Meeting (IB 4+) and ≥50% Exceeding (IB 5+).
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Meeting target (IB 4+):</span>
                      <strong style={{ color: defMeetGood_att === 0 ? '#10b981' : 'var(--primary)' }}>
                        {defMeetGood_att === 0 ? 'Achieved ✓' : `Need ${defMeetGood_att} more`}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Exceeding target (IB 5+):</span>
                      <strong style={{ color: defExceedGood_att === 0 ? '#10b981' : 'var(--primary)' }}>
                        {defExceedGood_att === 0 ? 'Achieved ✓' : `Need ${defExceedGood_att} more`}
                      </strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedAttainTier(expandedAttainTier === 'good' ? null : 'good')}
                  style={{
                    marginTop: '1.25rem',
                    padding: '0.45rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: expandedAttainTier === 'good' ? 'rgba(255,255,255,0.05)' : 'transparent',
                    color: 'var(--text-main)',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    transition: 'all 0.2s'
                  }}
                >
                  {expandedAttainTier === 'good' ? 'Hide Candidates' : 'View Target Candidates'}
                  <ChevronDown size={14} style={{ transform: expandedAttainTier === 'good' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </button>
              </div>

              {/* VERY GOOD Pathway */}
              <div style={{
                padding: '1.25rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'rgba(255,255,255,0.01)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '220px'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>VERY GOOD TIER</span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      background: isVGAchieved_att ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
                      color: isVGAchieved_att ? 'var(--accent)' : 'var(--text-muted)',
                      border: `1px solid ${isVGAchieved_att ? 'rgba(99,102,241,0.3)' : 'var(--border-color)'}`
                    }}>
                      {isVGAchieved_att ? '🌟 ACHIEVED' : 'PATHWAY ACTIVE'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 1rem 0', lineHeight: '1.3' }}>
                    Requires ≥75% Meeting (IB 4+) and ≥61% Exceeding (IB 5+).
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Meeting target (IB 4+):</span>
                      <strong style={{ color: defMeetVG_att === 0 ? '#10b981' : 'var(--primary)' }}>
                        {defMeetVG_att === 0 ? 'Achieved ✓' : `Need ${defMeetVG_att} more`}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Exceeding target (IB 5+):</span>
                      <strong style={{ color: defExceedVG_att === 0 ? '#10b981' : 'var(--primary)' }}>
                        {defExceedVG_att === 0 ? 'Achieved ✓' : `Need ${defExceedVG_att} more`}
                      </strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedAttainTier(expandedAttainTier === 'vg' ? null : 'vg')}
                  style={{
                    marginTop: '1.25rem',
                    padding: '0.45rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: expandedAttainTier === 'vg' ? 'rgba(255,255,255,0.05)' : 'transparent',
                    color: 'var(--text-main)',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    transition: 'all 0.2s'
                  }}
                >
                  {expandedAttainTier === 'vg' ? 'Hide Candidates' : 'View Target Candidates'}
                  <ChevronDown size={14} style={{ transform: expandedAttainTier === 'vg' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </button>
              </div>

              {/* OUTSTANDING Pathway */}
              <div style={{
                padding: '1.25rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'rgba(255,255,255,0.01)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '220px'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>OUTSTANDING TIER</span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      background: isOutAchieved_att ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                      color: isOutAchieved_att ? '#10b981' : 'var(--text-muted)',
                      border: `1px solid ${isOutAchieved_att ? 'rgba(16,185,129,0.3)' : 'var(--border-color)'}`
                    }}>
                      {isOutAchieved_att ? '🌟 ACHIEVED' : 'PATHWAY ACTIVE'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 1rem 0', lineHeight: '1.3' }}>
                    Requires ≥75% Meeting (IB 4+) and ≥75% Exceeding (IB 5+).
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Meeting target (IB 4+):</span>
                      <strong style={{ color: defMeetOut_att === 0 ? '#10b981' : 'var(--primary)' }}>
                        {defMeetOut_att === 0 ? 'Achieved ✓' : `Need ${defMeetOut_att} more`}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Exceeding target (IB 5+):</span>
                      <strong style={{ color: defExceedOut_att === 0 ? '#10b981' : 'var(--primary)' }}>
                        {defExceedOut_att === 0 ? 'Achieved ✓' : `Need ${defExceedOut_att} more`}
                      </strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedAttainTier(expandedAttainTier === 'out' ? null : 'out')}
                  style={{
                    marginTop: '1.25rem',
                    padding: '0.45rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: expandedAttainTier === 'out' ? 'rgba(255,255,255,0.05)' : 'transparent',
                    color: 'var(--text-main)',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    transition: 'all 0.2s'
                  }}
                >
                  {expandedAttainTier === 'out' ? 'Hide Candidates' : 'View Target Candidates'}
                  <ChevronDown size={14} style={{ transform: expandedAttainTier === 'out' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </button>
              </div>
            </div>

            {/* Expanded Drawer for Candidates */}
            {expandedAttainTier && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(255,255,255,0.015)',
                animation: 'fadeIn 0.25s ease-out'
              }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Target Intervention Candidates — {expandedAttainTier === 'good' ? 'Good' : expandedAttainTier === 'vg' ? 'Very Good' : 'Outstanding'} Pathway
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {/* Meeting Candidates (Below -> Meeting) */}
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                      🔴 Below to Meeting Candidates (Target: IB 4)
                    </span>
                    {belowCandidates_att.length === 0 ? (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No candidates below IB 4.</span>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                        {belowCandidates_att.slice(0, 5).map(s => (
                          <div key={s.id} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '0.45rem 0.6rem', background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: '6px', fontSize: '0.76rem'
                          }}>
                            <span style={{ fontWeight: '600' }}>{s.name}</span>
                            <span style={{ color: 'var(--text-muted)' }}>
                              CPT: <strong>{s.actualCpt}</strong> (Need +{s.ptsNeeded} pts)
                            </span>
                          </div>
                        ))}
                        {belowCandidates_att.length > 5 && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '0.25rem' }}>
                            +{belowCandidates_att.length - 5} more candidates
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Exceeding Candidates (Meeting -> Exceeding) */}
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                      ✨ Meeting to Exceeding Candidates (Target: IB 5)
                    </span>
                    {meetingCandidates_att.length === 0 ? (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No candidates at IB 4.</span>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                        {meetingCandidates_att.slice(0, 5).map(s => (
                          <div key={s.id} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '0.45rem 0.6rem', background: 'rgba(99,102,241,0.03)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: '6px', fontSize: '0.76rem'
                          }}>
                            <span style={{ fontWeight: '600' }}>{s.name}</span>
                            <span style={{ color: 'var(--text-muted)' }}>
                              CPT: <strong>{s.actualCpt}</strong> (Need +{s.ptsNeeded} pts)
                            </span>
                          </div>
                        ))}
                        {meetingCandidates_att.length > 5 && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '0.25rem' }}>
                            +{meetingCandidates_att.length - 5} more candidates
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TARGET PROGRESS VIEW PERSPECTIVE */}
      {groupingMode === 'progress' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '2.5rem' }}>
          
          {/* Bottom Grid: side-by-side dynamic progress analysis */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem' }}>
            
            {/* KHDA Progress Descriptors Card */}
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Target size={20} style={{ color: 'var(--accent)' }} />
                KHDA Progress Descriptors
              </h3>

              {megConnectedCount === 0 ? (
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-muted)' }}>
                  <HelpCircle size={32} style={{ opacity: 0.4, marginBottom: '1rem' }} />
                  <h4>No Expected Grade (MEG) Column Matched</h4>
                  <p style={{ fontSize: '0.82rem', marginTop: '0.5rem', maxWidth: '380px' }}>
                    Your spreadsheet must have an expected target grade column (e.g. "MEG", "Target Grade") to compare actual performance against targets.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  
                  {/* KHDA Class-Level Progress Descriptor Banner */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1rem 1.5rem',
                    background: khdaProgressDescriptor.bg,
                    border: `1px solid ${khdaProgressDescriptor.border}`,
                    borderLeft: `5px solid ${khdaProgressDescriptor.color}`,
                    borderRadius: '10px',
                    marginBottom: '1.5rem'
                  }}>
                    <span style={{ fontSize: '2rem' }}>{khdaProgressDescriptor.icon}</span>
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: khdaProgressDescriptor.color, marginBottom: '0.2rem' }}>KHDA Progress Descriptor</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '900', color: khdaProgressDescriptor.color, lineHeight: '1.1' }}>
                        {khdaProgressDescriptor.label}
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.35rem 0 0', lineHeight: '1.3' }}>
                        {percentMeetingOrExceeding}% of students are Meeting or Exceeding their MEG targets, with {percentExceeding}% Exceeding.
                      </p>
                    </div>
                  </div>

                  {/* Circular Gauge and Progress Bars */}
                  <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    
                    {/* Circular SVG Meter */}
                    <div style={{ width: '110px', height: '110px', position: 'relative', flexShrink: 0 }}>
                      <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                        {/* Background track circle */}
                        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border-color)" strokeWidth="8" />
                        {/* Progress track circle */}
                        <circle 
                          cx="50" cy="50" r="42" 
                          fill="none" 
                          stroke="var(--accent)" 
                          strokeWidth="8" 
                          strokeDasharray={`${2 * Math.PI * 42}`}
                          strokeDashoffset={`${2 * Math.PI * 42 * (1 - percentMeetingOrExceeding / 100)}`}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                        />
                      </svg>
                      {/* Gauge Text Overlay */}
                      <div style={{
                        position: 'absolute',
                        top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center'
                      }}>
                        <strong style={{ fontSize: '1.4rem', color: 'var(--text-main)', display: 'block', lineHeight: 1 }}>{percentMeetingOrExceeding}%</strong>
                        <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.15rem' }}>Meeting/Exceeding</span>
                      </div>
                    </div>

                    {/* Progress bars explanation */}
                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      
                      {/* Exceeding */}
                      <div style={{ cursor: 'pointer' }} onClick={() => {
                        setGroupingMode('progress');
                        setFilterType(filterType === 'exceeding' ? 'all' : 'exceeding');
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: groupingMode === 'progress' && filterType === 'exceeding' ? '700' : '500' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                            Exceeding ({progressExceedingCount})
                          </span>
                          <strong>{percentExceeding}%</strong>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', border: groupingMode === 'progress' && filterType === 'exceeding' ? '1px solid #10b981' : 'none' }}>
                          <div style={{ height: '100%', width: `${percentExceeding}%`, background: '#10b981', borderRadius: '4px', transition: 'width 0.8s ease' }} />
                        </div>
                      </div>

                      {/* Meeting */}
                      <div style={{ cursor: 'pointer' }} onClick={() => {
                        setGroupingMode('progress');
                        setFilterType(filterType === 'meeting' ? 'all' : 'meeting');
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: groupingMode === 'progress' && filterType === 'meeting' ? '700' : '500' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} />
                            Meeting ({progressMeetingCount})
                          </span>
                          <strong>{percentMeeting}%</strong>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', border: groupingMode === 'progress' && filterType === 'meeting' ? '1px solid var(--accent)' : 'none' }}>
                          <div style={{ height: '100%', width: `${percentMeeting}%`, background: 'var(--accent)', borderRadius: '4px', transition: 'width 0.8s ease' }} />
                        </div>
                      </div>

                      {/* Below */}
                      <div style={{ cursor: 'pointer' }} onClick={() => {
                        setGroupingMode('progress');
                        setFilterType(filterType === 'below' ? 'all' : 'below');
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: groupingMode === 'progress' && filterType === 'below' ? '700' : '500' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                            Below ({progressBelowCount})
                          </span>
                          <strong>{percentBelow}%</strong>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', border: groupingMode === 'progress' && filterType === 'below' ? '1px solid #ef4444' : 'none' }}>
                          <div style={{ height: '100%', width: `${percentBelow}%`, background: '#ef4444', borderRadius: '4px', transition: 'width 0.8s ease' }} />
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Teacher Pedagogical Insights Card */}
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CheckCircle2 size={20} style={{ color: '#10b981' }} />
                Teacher Pedagogical Insights
              </h3>

              {megConnectedCount === 0 ? (
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-muted)' }}>
                  <HelpCircle size={32} style={{ opacity: 0.4, marginBottom: '1rem' }} />
                  <h4>No Expected Grade (MEG) Column Matched</h4>
                  <p style={{ fontSize: '0.82rem', marginTop: '0.5rem', maxWidth: '380px' }}>
                    Pedagogical insights are generated dynamically based on student target tracking.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%', justifyContent: 'space-between' }}>
                  
                  {/* Growth Diagnostic Banner */}
                  <div style={{
                    padding: '0.85rem 1.15rem',
                    fontSize: '0.8rem',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    lineHeight: '1.45',
                    color: 'var(--text-muted)',
                    borderLeft: '4px solid var(--accent)'
                  }}>
                    <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.2rem', fontSize: '0.85rem' }}>Class Growth Diagnostic</strong>
                    {percentMeetingOrExceeding >= 85 ? (
                      <span>🌟 <strong>Outstanding Trajectory:</strong> The vast majority of the roster matches or exceeds their MEG benchmark. Instruction is optimally pitched and scaffolded.</span>
                    ) : percentMeetingOrExceeding >= 75 ? (
                      <span>✨ <strong>Highly Effective Instruction:</strong> Strong overall target compliance. Core concepts are well understood by the cohort with standard progression.</span>
                    ) : percentMeetingOrExceeding >= 65 ? (
                      <span>👍 <strong>Steady Progress:</strong> Adequate progress overall. A few critical students require localized differentiation to close the MEG gap.</span>
                    ) : (
                      <span>⚠️ <strong>Target Remediation Flag:</strong> Elevated target deficit detected. Focus on reinforcing foundational MYP concepts and targeted feedback loops.</span>
                    )}
                  </div>

                  {/* Priority Student Alerts */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    
                    {/* Enrichment Candidates */}
                    <div style={{ 
                      padding: '0.75rem 1rem', 
                      background: 'rgba(16, 185, 129, 0.04)', 
                      border: '1px solid rgba(16, 185, 129, 0.15)',
                      borderRadius: '8px',
                      fontSize: '0.78rem'
                    }}>
                      <strong style={{ color: '#10b981', display: 'block', fontSize: '0.8rem', marginBottom: '0.35rem' }}>🌟 Enrichment Focus</strong>
                      {(() => {
                        const list = rosterWithProgress.filter(s => s.expectedMeg !== null && s.actualCpt !== null && (s.cptDiff >= 3 || s.actualGrade === 7));
                        if (list.length === 0) {
                          return <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>No extreme high-achievers flagged.</span>;
                        }
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            {list.slice(0, 2).map(s => (
                              <div key={s.id} style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--text-main)', fontWeight: '600' }}>
                                {s.name} <span style={{ color: '#10b981', fontSize: '0.7rem' }}>(+{s.cptDiff} pts)</span>
                              </div>
                            ))}
                            {list.length > 2 && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>+{list.length - 2} more candidates</span>}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Intervention Priority */}
                    <div style={{ 
                      padding: '0.75rem 1rem', 
                      background: 'rgba(239, 68, 68, 0.04)', 
                      border: '1px solid rgba(239, 68, 68, 0.15)',
                      borderRadius: '8px',
                      fontSize: '0.78rem'
                    }}>
                      <strong style={{ color: '#ef4444', display: 'block', fontSize: '0.8rem', marginBottom: '0.35rem' }}>⚠️ Urgent Support</strong>
                      {(() => {
                        const list = rosterWithProgress.filter(s => s.expectedMeg !== null && s.actualCpt !== null && s.cptDiff <= -3);
                        if (list.length === 0) {
                          return <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>All students within 2 pts of MEG.</span>;
                        }
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            {list.slice(0, 2).map(s => (
                              <div key={s.id} style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--text-main)', fontWeight: '600' }}>
                                {s.name} <span style={{ color: '#ef4444', fontSize: '0.7rem' }}>({s.cptDiff} pts)</span>
                              </div>
                            ))}
                            {list.length > 2 && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>+{list.length - 2} more priority</span>}
                          </div>
                        );
                      })()}
                    </div>

                  </div>

                  {/* Key Curricular Action Points */}
                  <div style={{ fontSize: '0.78rem' }}>
                    <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.4rem' }}>Recommended Curriculum Actions</strong>
                    <ul style={{ paddingLeft: '1.15rem', margin: 0, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {percentBelow > 25 ? (
                        <li>Structure scaffolded peer-review workshops targeting Below-CPT students.</li>
                      ) : (
                        <li>Leverage the MEETING cohort for collaborative team problem solving.</li>
                      )}
                      {percentExceeding > 40 ? (
                        <li>Offer open-ended inquiry extensions for high-performing students.</li>
                      ) : (
                        <li>Integrate additional MYP criterion guide sessions to boost meeting students to exceeding.</li>
                      )}
                      <li>Deploy localized interventions focusing on the specific students in the urgent list.</li>
                    </ul>
                  </div>

                </div>
              )}
            </div>

          </div>

          {/* KHDA Pathway Progress Upgrade Guide Card */}
          {megConnectedCount > 0 && (
            <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <TrendingUp size={20} style={{ color: 'var(--accent)' }} />
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>KHDA Progress Upgrade Pathways</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 1.5rem 0' }}>
                Strategic intervention roadmap. Shows precisely how many student progression upgrades are required to elevate the cohort progress rating.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {/* GOOD Pathway */}
                <div style={{
                  padding: '1.25rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'rgba(255,255,255,0.01)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '220px'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>GOOD TIER</span>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background: isGoodAchieved_prog ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                        color: isGoodAchieved_prog ? '#10b981' : 'var(--text-muted)',
                        border: `1px solid ${isGoodAchieved_prog ? 'rgba(16,185,129,0.3)' : 'var(--border-color)'}`
                      }}>
                        {isGoodAchieved_prog ? '🌟 ACHIEVED' : 'PATHWAY ACTIVE'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 1rem 0', lineHeight: '1.3' }}>
                      Requires ≥65% Meeting or Exceeding MEG Target.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Meeting/Exceeding Target:</span>
                        <strong style={{ color: defMeetGood_prog === 0 ? '#10b981' : 'var(--accent)' }}>
                          {defMeetGood_prog === 0 ? 'Achieved ✓' : `Need ${defMeetGood_prog} more`}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedProgTier(expandedProgTier === 'good' ? null : 'good')}
                    style={{
                      marginTop: '1.25rem',
                      padding: '0.45rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: expandedProgTier === 'good' ? 'rgba(255,255,255,0.05)' : 'transparent',
                      color: 'var(--text-main)',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    {expandedProgTier === 'good' ? 'Hide Candidates' : 'View Target Candidates'}
                    <ChevronDown size={14} style={{ transform: expandedProgTier === 'good' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </button>
                </div>

                {/* VERY GOOD Pathway */}
                <div style={{
                  padding: '1.25rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'rgba(255,255,255,0.01)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '220px'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>VERY GOOD TIER</span>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background: isVGAchieved_prog ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
                        color: isVGAchieved_prog ? 'var(--accent)' : 'var(--text-muted)',
                        border: `1px solid ${isVGAchieved_prog ? 'rgba(99,102,241,0.3)' : 'var(--border-color)'}`
                      }}>
                        {isVGAchieved_prog ? '🌟 ACHIEVED' : 'PATHWAY ACTIVE'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 1rem 0', lineHeight: '1.3' }}>
                      Requires ≥75% Meeting/Exceeding MEG Target and ≥35% Exceeding.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Meeting/Exceeding Target:</span>
                        <strong style={{ color: defMeetVG_prog === 0 ? '#10b981' : 'var(--accent)' }}>
                          {defMeetVG_prog === 0 ? 'Achieved ✓' : `Need ${defMeetVG_prog} more`}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Exceeding Target:</span>
                        <strong style={{ color: defExceedVG_prog === 0 ? '#10b981' : 'var(--accent)' }}>
                          {defExceedVG_prog === 0 ? 'Achieved ✓' : `Need ${defExceedVG_prog} more`}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedProgTier(expandedProgTier === 'vg' ? null : 'vg')}
                    style={{
                      marginTop: '1.25rem',
                      padding: '0.45rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: expandedProgTier === 'vg' ? 'rgba(255,255,255,0.05)' : 'transparent',
                      color: 'var(--text-main)',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    {expandedProgTier === 'vg' ? 'Hide Candidates' : 'View Target Candidates'}
                    <ChevronDown size={14} style={{ transform: expandedProgTier === 'vg' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </button>
                </div>

                {/* OUTSTANDING Pathway */}
                <div style={{
                  padding: '1.25rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'rgba(255,255,255,0.01)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '220px'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>OUTSTANDING TIER</span>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background: isOutAchieved_prog ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                        color: isOutAchieved_prog ? '#10b981' : 'var(--text-muted)',
                        border: `1px solid ${isOutAchieved_prog ? 'rgba(16,185,129,0.3)' : 'var(--border-color)'}`
                      }}>
                        {isOutAchieved_prog ? '🌟 ACHIEVED' : 'PATHWAY ACTIVE'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 1rem 0', lineHeight: '1.3' }}>
                      Requires ≥85% Meeting/Exceeding MEG Target and ≥50% Exceeding.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Meeting/Exceeding Target:</span>
                        <strong style={{ color: defMeetOut_prog === 0 ? '#10b981' : 'var(--accent)' }}>
                          {defMeetOut_prog === 0 ? 'Achieved ✓' : `Need ${defMeetOut_prog} more`}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Exceeding Target:</span>
                        <strong style={{ color: defExceedOut_prog === 0 ? '#10b981' : 'var(--accent)' }}>
                          {defExceedOut_prog === 0 ? 'Achieved ✓' : `Need ${defExceedOut_prog} more`}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedProgTier(expandedProgTier === 'out' ? null : 'out')}
                    style={{
                      marginTop: '1.25rem',
                      padding: '0.45rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: expandedProgTier === 'out' ? 'rgba(255,255,255,0.05)' : 'transparent',
                      color: 'var(--text-main)',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    {expandedProgTier === 'out' ? 'Hide Candidates' : 'View Target Candidates'}
                    <ChevronDown size={14} style={{ transform: expandedProgTier === 'out' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </button>
                </div>
              </div>

              {/* Expanded Drawer for Candidates */}
              {expandedProgTier && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  background: 'rgba(255,255,255,0.015)',
                  animation: 'fadeIn 0.25s ease-out'
                }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Target Progress Intervention Candidates — {expandedProgTier === 'good' ? 'Good' : expandedProgTier === 'vg' ? 'Very Good' : 'Outstanding'} Pathway
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {/* Meeting Candidates (Below -> Meeting Progress) */}
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                        ⚡ Below to Meeting Candidates (Target: −1 pt below MEG)
                      </span>
                      {belowCandidates_prog.length === 0 ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No borderline progress candidates.</span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                          {belowCandidates_prog.slice(0, 5).map(s => (
                            <div key={s.id} style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              padding: '0.45rem 0.6rem', background: 'rgba(99,102,241,0.03)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: '6px', fontSize: '0.76rem'
                            }}>
                              <span style={{ fontWeight: '600' }}>{s.name}</span>
                              <span style={{ color: 'var(--text-muted)' }}>
                                CPT: <strong>{s.actualCpt}</strong> / MEG: <strong>{s.expectedMeg}</strong> (Need +{s.ptsNeeded} pt)
                              </span>
                            </div>
                          ))}
                          {belowCandidates_prog.length > 5 && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '0.25rem' }}>
                              +{belowCandidates_prog.length - 5} more candidates
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Exceeding Candidates (Meeting -> Exceeding Progress) */}
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#10b981', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                        🌟 Meeting to Exceeding Candidates (Target: ≥ MEG)
                      </span>
                      {meetingCandidates_prog.length === 0 ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No candidates at exactly −1 pt from MEG.</span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                          {meetingCandidates_prog.slice(0, 5).map(s => (
                            <div key={s.id} style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              padding: '0.45rem 0.6rem', background: 'rgba(16,185,129,0.03)', border: '1px solid rgba(16,185,129,0.12)', borderRadius: '6px', fontSize: '0.76rem'
                            }}>
                              <span style={{ fontWeight: '600' }}>{s.name}</span>
                              <span style={{ color: 'var(--text-muted)' }}>
                                CPT: <strong>{s.actualCpt}</strong> / MEG: <strong>{s.expectedMeg}</strong> (Need +{s.ptsNeeded} pt)
                              </span>
                            </div>
                          ))}
                          {meetingCandidates_prog.length > 5 && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '0.25rem' }}>
                              +{meetingCandidates_prog.length - 5} more candidates
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Graph Section: Actual vs Expected Grade Comparison (Bespoke Interactive SVG Line Chart) - FULL WIDTH */}
          {gradedStudentsCount > 0 && megConnectedCount > 0 && (
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
                Roster Competency Trend
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                Alphabetical breakdown illustrating individual target achievement gaps. Hover nodes for detailed info.
              </p>

              <div style={{ position: 'relative', width: '100%', height: '200px', overflowX: 'auto', overflowY: 'hidden', flexGrow: 1, marginBottom: '1rem' }}>
                {/* Custom SVG line plot */}
                <div style={{ minWidth: `${Math.max(rosterWithProgress.length * 40, 500)}px`, height: '170px', position: 'relative' }}>
                  <svg width="100%" height="100%" viewBox={`0 0 ${Math.max(rosterWithProgress.length * 40, 500)} 170`} preserveAspectRatio="none">
                    <defs>
                      {/* Glowing line gradients */}
                      <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="megGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Guide Grid Lines (CPT 0-32 in 8pt steps) */}
                    {[0, 8, 16, 24, 32].map(g => {
                      const y = 165 - (g / 32) * 145;
                      return (
                        <g key={g}>
                          <line x1="0" y1={y} x2="100%" y2={y} stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4 4" />
                          <text x="5" y={y - 4} fill="var(--text-muted)" fontSize="8" fontWeight="600">{g}pt</text>
                        </g>
                      );
                    })}

                    {/* Draw Areas */}
                    {(() => {
                      const width = Math.max(rosterWithProgress.length * 40, 500);
                      const step = width / (rosterWithProgress.length + 1);
                      
                      // Expected Path Points (MEG out of 32)
                      const megPoints = rosterWithProgress.map((s, i) => {
                        const x = step * (i + 1);
                        const megVal = s.expectedMeg !== null && s.expectedMeg !== undefined ? s.expectedMeg : 16;
                        const y = 165 - (megVal / 32) * 145;
                        return { x, y };
                      });

                      // Actual Path Points (CPT out of 32)
                      const actualPoints = rosterWithProgress.map((s, i) => {
                        const x = step * (i + 1);
                        const cptVal = s.actualCpt !== null && s.actualCpt !== undefined ? s.actualCpt : 16;
                        const y = 165 - (cptVal / 32) * 145;
                        return { x, y };
                      });

                      // Build path commands
                      const megPath = megPoints.length > 0 ? `M ${megPoints[0].x} ${megPoints[0].y} ` + megPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') : '';
                      const actualPath = actualPoints.length > 0 ? `M ${actualPoints[0].x} ${actualPoints[0].y} ` + actualPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') : '';

                      const megArea    = megPoints.length    > 0 ? `${megPath}    L ${megPoints[megPoints.length - 1].x}       155 L ${megPoints[0].x}       155 Z` : '';
                      const actualArea = actualPoints.length > 0 ? `${actualPath} L ${actualPoints[actualPoints.length - 1].x} 155 L ${actualPoints[0].x} 155 Z` : '';

                      return (
                        <>
                          {/* Fill Gradients */}
                          {megArea && <path d={megArea} fill="url(#megGrad)" />}
                          {actualArea && <path d={actualArea} fill="url(#actualGrad)" />}

                          {/* Stroke lines */}
                          {megPath && <path d={megPath} fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />}
                          {actualPath && <path d={actualPath} fill="none" stroke="var(--primary)" strokeWidth="2.5" />}

                          {/* Interactive Circles / Dots */}
                          {rosterWithProgress.map((s, i) => {
                            const actualX = actualPoints[i].x;
                            const actualY = actualPoints[i].y;
                            const expectedY = megPoints[i].y;
                            const isHovered = hoveredPoint === i;

                            return (
                              <g key={s.id}>
                                {/* Hover interactive trigger column */}
                                <rect 
                                  x={actualX - step/2} 
                                  y="0" 
                                  width={step} 
                                  height="170" 
                                  fill="transparent" 
                                  style={{ cursor: 'pointer' }}
                                  onMouseEnter={() => setHoveredPoint(i)}
                                  onMouseLeave={() => setHoveredPoint(null)}
                                />

                                {/* expected Target dot */}
                                {s.expectedMeg !== null && (
                                  <circle 
                                    cx={actualX} cy={expectedY} r="3" 
                                    fill="var(--bg-app)" stroke="var(--accent)" strokeWidth="1.5" 
                                  />
                                )}

                                {/* actual Grade dot */}
                                {s.actualGrade !== null && (
                                  <circle 
                                    cx={actualX} cy={actualY} r={isHovered ? 6 : 4} 
                                    fill="var(--primary)" 
                                    stroke="#fff" strokeWidth={isHovered ? 2 : 1}
                                    style={{ transition: 'r 0.15s ease' }}
                                    filter={isHovered ? 'drop-shadow(0 0 4px var(--primary))' : 'none'}
                                  />
                                )}
                              </g>
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                </div>
                
                {/* Custom Tooltip overlay */}
                {(() => {
                  const student = rosterWithProgress[hoveredPoint];
                  if (!student) return null;
                  const width = Math.max(rosterWithProgress.length * 40, 500);
                  const step = width / (rosterWithProgress.length + 1);
                  const leftPos = step * (hoveredPoint + 1);
                  
                  // Prevent tooltip from flowing off screen
                  const percentLeft = (leftPos / width) * 100;
                  const alignRight = percentLeft > 80;

                  return (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: alignRight ? `${leftPos - 190}px` : `${leftPos + 10}px`,
                      zIndex: 10,
                      width: '180px',
                      pointerEvents: 'none',
                      padding: '0.75rem',
                      fontSize: '0.78rem',
                      lineHeight: '1.4'
                    }} className="glass-panel animate-fade-in">
                      <div style={{ fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem', marginBottom: '0.4rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {student.name}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                        <span>CPT Score:</span>
                        <strong style={{ color: 'var(--primary)' }}>{student.actualCpt !== null ? `${student.actualCpt}/32` : 'No Data'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                        <span>MEG Target:</span>
                        <strong style={{ color: 'var(--accent)' }}>{student.expectedMeg !== null ? `${student.expectedMeg}/32` : 'No Data'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                        <span>IB Grade:</span>
                        <strong style={{ color: 'var(--text-main)' }}>{student.actualGrade || '-'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', paddingTop: '0.3rem', borderTop: '1px dashed var(--border-color)' }}>
                        <span>CPT vs MEG:</span>
                        <strong style={{ 
                          color: student.progressStatus === 'Exceeding' ? '#10b981' : 
                                 student.progressStatus === 'Meeting' ? 'var(--accent)' : 
                                 student.progressStatus === 'Below' ? '#ef4444' : 'var(--text-muted)'
                        }}>
                          {student.cptDiff > 0 ? `+${student.cptDiff} pts` :
                           student.cptDiff === -1 ? '−1 pt (Meeting)' :
                           student.cptDiff < -1 ? `${student.cptDiff} pts (Below)` : 'On target'}
                        </strong>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Chart Legends */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '12px', height: '3px', background: 'var(--primary)' }} />
                  Actual CPT Score
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '12px', height: '3px', borderTop: '2px dashed var(--accent)' }} />
                  MEG Target
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dynamic Performance Pivot Listing */}
      {(gradedStudentsCount > 0 || megConnectedCount > 0) && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
                <Users size={20} style={{ color: 'var(--text-muted)' }} />
                Student Performance Listing
              </h3>
            </div>
            {/* Filter Toggle Pills */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Showing <strong>{filteredRoster.length}</strong> of <strong>{rosterWithProgress.length}</strong> students
              </span>

              <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(255,255,255,0.02)', padding: '0.25rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <button 
                  style={{ 
                    padding: '0.35rem 0.75rem', 
                    fontSize: '0.78rem', 
                    borderRadius: '4px', 
                    border: 'none', 
                    cursor: 'pointer',
                    background: filterType === 'all' ? 'rgba(255, 255, 255, 0.08)' : 'transparent', 
                    color: filterType === 'all' ? 'var(--text-main)' : 'var(--text-muted)' 
                  }}
                  onClick={() => setFilterType('all')}
                >
                  All ({rosterWithProgress.length})
                </button>
                <button 
                  style={{ 
                    padding: '0.35rem 0.75rem', 
                    fontSize: '0.78rem', 
                    borderRadius: '4px', 
                    border: 'none', 
                    cursor: 'pointer',
                    background: filterType === 'exceeding' ? 'rgba(16, 185, 129, 0.12)' : 'transparent', 
                    color: filterType === 'exceeding' ? '#10b981' : 'var(--text-muted)', 
                    fontWeight: filterType === 'exceeding' ? '700' : 'normal' 
                  }}
                  onClick={() => setFilterType('exceeding')}
                >
                  Exceeding ({groupingMode === 'attainment' ? attainmentExceedingCount : progressExceedingCount})
                </button>
                <button 
                  style={{ 
                    padding: '0.35rem 0.75rem', 
                    fontSize: '0.78rem', 
                    borderRadius: '4px', 
                    border: 'none', 
                    cursor: 'pointer',
                    background: filterType === 'meeting' ? 'rgba(99, 102, 241, 0.12)' : 'transparent', 
                    color: filterType === 'meeting' ? 'var(--accent)' : 'var(--text-muted)', 
                    fontWeight: filterType === 'meeting' ? '700' : 'normal' 
                  }}
                  onClick={() => setFilterType('meeting')}
                >
                  Meeting ({groupingMode === 'attainment' ? attainmentMeetingCount : progressMeetingCount})
                </button>
                <button 
                  style={{ 
                    padding: '0.35rem 0.75rem', 
                    fontSize: '0.78rem', 
                    borderRadius: '4px', 
                    border: 'none', 
                    cursor: 'pointer',
                    background: filterType === 'below' ? 'rgba(239, 68, 68, 0.12)' : 'transparent', 
                    color: filterType === 'below' ? '#ef4444' : 'var(--text-muted)', 
                    fontWeight: filterType === 'below' ? '700' : 'normal' 
                  }}
                  onClick={() => setFilterType('below')}
                >
                  Below ({groupingMode === 'attainment' ? attainmentBelowCount : progressBelowCount})
                </button>
              </div>
            </div>
          </div>

          {/* Roster Listing Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {filteredRoster.map(s => {
              const isExceeding = groupingMode === 'attainment' 
                ? s.attainmentStatus === 'Exceeding'
                : s.progressStatus === 'Exceeding';
              
              const isMeeting = groupingMode === 'attainment'
                ? s.attainmentStatus === 'Meeting'
                : s.progressStatus === 'Meeting';
                
              const isBelow = groupingMode === 'attainment'
                ? s.attainmentStatus === 'Below'
                : s.progressStatus === 'Below';

              let borderColor = 'var(--border-color)';
              let statusBg = 'rgba(255,255,255,0.03)';
              let statusText = 'var(--text-muted)';
              
              if (isExceeding) {
                borderColor = 'rgba(16, 185, 129, 0.25)';
                statusBg = 'rgba(16, 185, 129, 0.08)';
                statusText = '#10b981';
              } else if (isMeeting) {
                borderColor = 'rgba(99, 102, 241, 0.25)';
                statusBg = 'rgba(99, 102, 241, 0.08)';
                statusText = 'var(--accent)';
              } else if (isBelow) {
                borderColor = 'rgba(239, 68, 68, 0.25)';
                statusBg = 'rgba(239, 68, 68, 0.08)';
                statusText = '#ef4444';
              }

              return (
                <div 
                  key={s.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '1rem 1.25rem', 
                    border: '1px solid', 
                    borderColor, 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    background: 'var(--bg-card)'
                  }}
                >
                  <div style={{ overflow: 'hidden' }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: '700', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', marginBottom: '0.2rem' }}>
                      {s.name}
                    </h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
                      {s.formGroup || selectedClass}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                    {groupingMode === 'attainment' ? (
                      <>
                        <div style={{ textAlign: 'center', padding: '0.25rem 0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                          <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>CPT</span>
                          <strong style={{ fontSize: '0.85rem' }}>{s.actualCpt !== null ? `${s.actualCpt}/32` : '-'}</strong>
                        </div>
                        <div style={{ textAlign: 'center', padding: '0.25rem 0.5rem', borderRadius: '4px', background: statusBg, border: `1px solid ${borderColor}` }}>
                          <span style={{ fontSize: '0.55rem', color: statusText, display: 'block', textTransform: 'uppercase' }}>Grade</span>
                          <strong style={{ fontSize: '0.85rem', color: statusText }}>{s.actualGrade !== null ? `IB ${s.actualGrade}` : '-'}</strong>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ textAlign: 'center', padding: '0.25rem 0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                          <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>MEG</span>
                          <strong style={{ fontSize: '0.85rem' }}>{s.expectedMeg !== null ? `${s.expectedMeg}/32` : '-'}</strong>
                        </div>
                        <div style={{ textAlign: 'center', padding: '0.25rem 0.5rem', borderRadius: '4px', background: statusBg, border: `1px solid ${borderColor}` }}>
                          <span style={{ fontSize: '0.55rem', color: statusText, display: 'block', textTransform: 'uppercase' }}>CPT</span>
                          <strong style={{ fontSize: '0.85rem', color: statusText }}>{s.actualCpt !== null ? `${s.actualCpt}/32` : '-'}</strong>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
