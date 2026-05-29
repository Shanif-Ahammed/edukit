import React, { useState, useMemo } from 'react';
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
  const {
    roster: rosterWithProgress,
    progressExceedingCount,
    progressMeetingCount,
    progressBelowCount,
    megConnectedCount
  } = useMemo(() => {
    let progressExceedingCount = 0;
    let progressMeetingCount   = 0;
    let progressBelowCount     = 0;
    let megConnectedCount = 0;

    const roster = classStudents.map(s => {
      const actualCpt   = (s.cpt !== null && s.cpt !== undefined && s.cpt !== '') ? Number(s.cpt)  : null;
      const rawMeg      = (s.meg !== null && s.meg !== undefined && s.meg !== '') ? Number(s.meg) : null;
      let expectedMeg   = rawMeg;

      // If MEG in Excel is a grade (1-7) rather than CPT points (0-32), map it to minimum CPT points of that grade
      if (expectedMeg !== null && expectedMeg >= 1 && expectedMeg <= 7) {
        if (expectedMeg === 7) expectedMeg = 28;
        else if (expectedMeg === 6) expectedMeg = 24;
        else if (expectedMeg === 5) expectedMeg = 19;
        else if (expectedMeg === 4) expectedMeg = 15;
        else if (expectedMeg === 3) expectedMeg = 10;
        else if (expectedMeg === 2) expectedMeg = 6;
        else expectedMeg = 0;
      }

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

    return {
      roster,
      progressExceedingCount,
      progressMeetingCount,
      progressBelowCount,
      megConnectedCount
    };
  }, [classStudents, subject]);

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

  // --- GRADE DISTRIBUTION & BELL CURVE CALCULATIONS ---
  const {
    gradeCounts,
    classAverage,
    maxCount,
    curvePoints,
    curveOutlinePath,
    curveFillPath,
    avgX
  } = useMemo(() => {
    const gradeCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    let totalGradesSum = 0;
    let totalGradesCount = 0;

    classStudents.forEach(s => {
      const g = getEffectiveGrade(s);
      if (g !== null && g >= 1 && g <= 7) {
        gradeCounts[g] = (gradeCounts[g] || 0) + 1;
        totalGradesSum += g;
        totalGradesCount++;
      }
    });

    const classAverage = totalGradesCount > 0 ? (totalGradesSum / totalGradesCount) : 0;
    const maxCount = Math.max(...Object.values(gradeCounts), 1);

    // Map 7 grades to coordinates for Attainment Curve (scaled to half height)
    const curvePoints = [1, 2, 3, 4, 5, 6, 7].map(g => {
      const x = 50 + (g - 1) * 100;
      const count = gradeCounts[g] || 0;
      const y = 130 - (count / maxCount) * 90; // Baseline at Y=130, Max count goes up to Y=40
      return { x, y };
    });

    // Generate Bezier Curve outline path for Attainment curve
    let curveOutlinePath = '';
    if (curvePoints.length > 0) {
      curveOutlinePath = `M ${curvePoints[0].x} ${curvePoints[0].y}`;
      for (let i = 0; i < curvePoints.length - 1; i++) {
        const p0 = curvePoints[i];
        const p1 = curvePoints[i + 1];
        const cp1x = p0.x + 50;
        const cp1y = p0.y;
        const cp2x = p1.x - 50;
        const cp2y = p1.y;
        curveOutlinePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
      }
    }

    // Closed fill path down to baseline Y=130
    const curveFillPath = curveOutlinePath 
      ? `${curveOutlinePath} L ${curvePoints[curvePoints.length - 1].x} 130 L ${curvePoints[0].x} 130 Z`
      : '';

    // Class Average X-axis coordinate mapping
    const avgX = classAverage > 0 ? (50 + (classAverage - 1) * 100) : 0;

    return {
      gradeCounts,
      classAverage,
      maxCount,
      curvePoints,
      curveOutlinePath,
      curveFillPath,
      avgX
    };
  }, [classStudents]);

  // --- TARGET PROGRESS: NATIVE CPT VS EXPECTED MEG COMPARISON (0-32 SCALE) ---
  const {
    progressCptAverage,
    progressMegAverage,
    progressGraphStudents,
    cptPoints,
    megPoints,
    progressCptLinePath,
    progressMegLinePath,
    progressCptAreaPath,
    progressMegAreaPath,
    badgeCptY,
    badgeMegY
  } = useMemo(() => {
    let progressCptSum = 0;
    let progressCptCount = 0;
    let progressMegSum = 0;
    let progressMegCount = 0;

    rosterWithProgress.forEach(s => {
      if (s.actualCpt !== null) {
        progressCptSum += s.actualCpt;
        progressCptCount++;
      }
      if (s.expectedMeg !== null) {
        progressMegSum += s.expectedMeg;
        progressMegCount++;
      }
    });

    const progressCptAverage = progressCptCount > 0 ? (progressCptSum / progressCptCount) : 0;
    const progressMegAverage = progressMegCount > 0 ? (progressMegSum / progressMegCount) : 0;

    // Filter student roster to include only students that have a CPT score or an expected MEG
    const progressGraphStudents = rosterWithProgress.filter(s => s.actualCpt !== null || s.expectedMeg !== null);

    // Compute curve coordinates for actual CPT and expected MEG points
    const cptPoints = [];
    const megPoints = [];

    if (progressGraphStudents.length > 0) {
      const colWidth = 620 / progressGraphStudents.length;
      progressGraphStudents.forEach((s, idx) => {
        const x = 50 + (idx + 0.5) * colWidth;
        if (s.actualCpt !== null) {
          cptPoints.push({ x, y: 150 - (s.actualCpt / 32) * 130 });
        }
        if (s.expectedMeg !== null) {
          megPoints.push({ x, y: 150 - (s.expectedMeg / 32) * 130 });
        }
      });
    }

    // Generate Actual CPT curve path
    let progressCptLinePath = '';
    if (cptPoints.length > 0) {
      progressCptLinePath = `M ${cptPoints[0].x} ${cptPoints[0].y}`;
      for (let i = 0; i < cptPoints.length - 1; i++) {
        const p0 = cptPoints[i];
        const p1 = cptPoints[i + 1];
        const localOffset = (p1.x - p0.x) / 2;
        progressCptLinePath += ` C ${p0.x + localOffset} ${p0.y}, ${p1.x - localOffset} ${p1.y}, ${p1.x} ${p1.y}`;
      }
    }

    // Generate Expected MEG curve path
    let progressMegLinePath = '';
    if (megPoints.length > 0) {
      progressMegLinePath = `M ${megPoints[0].x} ${megPoints[0].y}`;
      for (let i = 0; i < megPoints.length - 1; i++) {
        const p0 = megPoints[i];
        const p1 = megPoints[i + 1];
        const localOffset = (p1.x - p0.x) / 2;
        progressMegLinePath += ` C ${p0.x + localOffset} ${p0.y}, ${p1.x - localOffset} ${p1.y}, ${p1.x} ${p1.y}`;
      }
    }

    const progressCptAreaPath = progressCptLinePath
      ? `${progressCptLinePath} L ${cptPoints[cptPoints.length - 1].x} 150 L ${cptPoints[0].x} 150 Z`
      : '';

    const progressMegAreaPath = progressMegLinePath
      ? `${progressMegLinePath} L ${megPoints[megPoints.length - 1].x} 150 L ${megPoints[0].x} 150 Z`
      : '';

    // Collision resolution for right-side average badges
    const progressCptAvgY = 150 - (progressCptAverage / 32) * 130;
    const progressMegAvgY = 150 - (progressMegAverage / 32) * 130;

    let badgeCptY = progressCptAvgY - 8;
    let badgeMegY = progressMegAvgY - 8;

    if (progressCptAverage > 0 && progressMegAverage > 0 && Math.abs(progressCptAvgY - progressMegAvgY) < 18) {
      if (progressCptAvgY >= progressMegAvgY) {
        // CPT average is lower on screen (larger Y value)
        badgeCptY = progressCptAvgY + 2;
        badgeMegY = progressMegAvgY - 18;
      } else {
        // MEG average is lower on screen (larger Y value)
        badgeCptY = progressCptAvgY - 18;
        badgeMegY = progressMegAvgY + 2;
      }
    }

    return {
      progressCptAverage,
      progressMegAverage,
      progressGraphStudents,
      cptPoints,
      megPoints,
      progressCptLinePath,
      progressMegLinePath,
      progressCptAreaPath,
      progressMegAreaPath,
      badgeCptY,
      badgeMegY
    };
  }, [rosterWithProgress]);

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
            Progress Analysis
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
                <div style={{ flexGrow: 1 }}>
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

            {/* Attainment Bands Circular Gauge & Slim Progress Bars */}
            <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', flexGrow: 1 }}>
              
              {/* Circular SVG Meter showing Meeting/Exceeding Attainment Percentage */}
              <div style={{ width: '110px', height: '110px', position: 'relative', flexShrink: 0 }}>
                <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                  {/* Background track circle */}
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border-color)" strokeWidth="8" />
                  {/* Progress track circle */}
                  <circle 
                    cx="50" cy="50" r="42" 
                    fill="none" 
                    stroke="var(--primary)" 
                    strokeWidth="8" 
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - pctMeetOrExceed / 100)}`}
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
                  <strong style={{ fontSize: '1.4rem', color: 'var(--text-main)', display: 'block', lineHeight: 1 }}>{pctMeetOrExceed}%</strong>
                  <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.15rem' }}>Meeting/Exceeding</span>
                </div>
              </div>

              {/* Progress bars explanation */}
              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {attainmentBands.map((band) => {
                  const isActive = groupingMode === 'attainment' && filterType === band.key;
                  return (
                    <div 
                      key={band.key} 
                      style={{ cursor: 'pointer' }} 
                      onClick={() => {
                        setGroupingMode('attainment');
                        setFilterType(filterType === band.key ? 'all' : band.key);
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: isActive ? '700' : '500' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: band.color }} />
                          {band.label} ({band.count})
                        </span>
                        <strong>{band.percentage}%</strong>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', border: isActive ? `1px solid ${band.color}` : 'none' }}>
                        <div style={{ height: '100%', width: `${band.percentage}%`, background: band.color, borderRadius: '4px', transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
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

          {/* GRADE DISTRIBUTION BELL CURVE & AVERAGE CARD */}
          <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Grade Distribution & Bell Curve</h3>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--primary)', display: 'inline-block' }} />
                  Grade Curve
                </div>
                {classAverage > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px dashed var(--accent)', display: 'inline-block' }} />
                    Class Average ({classAverage.toFixed(2)})
                  </div>
                )}
              </div>
            </div>

            {gradedStudentsCount === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                ⚠️ No grades available in this class to display distribution. Make sure student grades or CPT marks are loaded.
              </div>
            ) : (
              <div style={{ width: '100%', overflowX: 'auto' }}>
                <div style={{ minWidth: '660px', paddingBottom: '0.25rem' }}>
                  <svg viewBox="0 0 700 160" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="bellCurveGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Baseline */}
                    <line x1="40" y1="130" x2="660" y2="130" stroke="var(--border-color-hover)" strokeWidth="1.5" />
                    
                    {/* Vertical Grid Ticks & Labels */}
                    {[1, 2, 3, 4, 5, 6, 7].map(g => {
                      const x = 50 + (g - 1) * 100;
                      return (
                        <g key={g}>
                          <line x1={x} y1="20" x2={x} y2="130" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3,5" />
                          <line x1={x} y1="130" x2={x} y2="135" stroke="var(--border-color-hover)" strokeWidth="1.5" />
                        </g>
                      );
                    })}

                    {/* Smooth Filled Bell Curve Area */}
                    <path d={curveFillPath} fill="url(#bellCurveGrad)" style={{ transition: 'all 0.5s ease' }} />

                    {/* Smooth Outline Path */}
                    <path d={curveOutlinePath} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" style={{ transition: 'all 0.5s ease', filter: 'drop-shadow(0 4px 8px var(--primary-glow))' }} />

                    {/* Interactive Node Circles for each grade point */}
                    {curvePoints.map((p, idx) => {
                      const grade = idx + 1;
                      const count = gradeCounts[grade] || 0;
                      const percentage = Math.round((count / gradedStudentsCount) * 100);
                      return (
                        <g key={grade} style={{ cursor: 'pointer' }}>
                          <circle cx={p.x} cy={p.y} r="6" fill="var(--bg-app)" stroke="var(--primary)" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 4px var(--primary-glow))' }} />
                          <circle cx={p.x} cy={p.y} r="2.5" fill="var(--text-main)" />
                          
                          {/* Grade Label at bottom */}
                          <text x={p.x} y="150" textAnchor="middle" fill="var(--text-muted)" fontSize="0.75rem" fontWeight="800" fontFamily="var(--font-header)">
                            IB {grade}
                          </text>
                          
                          {/* Count Badge overlaying the node */}
                          <g transform={`translate(${p.x - 22}, ${p.y - 25})`}>
                            <rect width="44" height="16" rx="4" fill="var(--bg-card-hover)" stroke="var(--border-color-hover)" strokeWidth="1" />
                            <text x="22" y="11" textAnchor="middle" fill="var(--text-main)" fontSize="0.6rem" fontWeight="850">
                              {count} ({percentage}%)
                            </text>
                          </g>
                        </g>
                      );
                    })}

                    {/* Vertical Class Average Line */}
                    {classAverage > 0 && (
                      <g>
                        <line 
                          x1={avgX} y1="20" x2={avgX} y2="130" 
                          stroke="var(--accent)" 
                          strokeWidth="1.5" 
                          strokeDasharray="4,4" 
                          style={{ filter: 'drop-shadow(0 0 4px rgba(99, 102, 241, 0.4))' }}
                        />
                        <circle cx={avgX} cy="130" r="3.5" fill="var(--accent)" />
                        <circle cx={avgX} cy="130" r="7" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.4" />

                        {/* Top Indicator flag */}
                        <g transform={`translate(${avgX - 50}, 0)`}>
                          <rect 
                            width="100" height="18" rx="4" 
                            fill="rgba(99, 102, 241, 0.15)" 
                            stroke="var(--accent)" 
                            strokeWidth="1" 
                            style={{ backdropFilter: 'blur(4px)' }}
                          />
                          <text x="50" y="12" textAnchor="middle" fill="var(--text-main)" fontSize="0.6rem" fontWeight="900" fontFamily="var(--font-header)">
                            AVERAGE: {classAverage.toFixed(2)}
                          </text>
                        </g>
                      </g>
                    )}
                  </svg>
                </div>
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

          {/* TARGET expected grade (MEG) BELL CURVE & AVERAGE CARD */}
          <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem 2rem', marginTop: '2rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <TrendingUp size={20} style={{ color: 'var(--accent)' }} />
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Actual CPT vs Expected MEG Distribution</h3>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--primary)', display: 'inline-block' }} />
                  Actual Distribution (CPT)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--accent)', display: 'inline-block' }} />
                  Expected Distribution (MEG)
                </div>
              </div>
            </div>

            {progressMegCount === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                ⚠️ No Expected Targets (MEGs) loaded in this class. Connect a spreadsheet with target expected grades.
              </div>
            ) : (
              <div style={{ width: '100%', overflowX: 'auto' }}>
                <div style={{ minWidth: '660px', paddingBottom: '0.25rem' }}>
                  <svg viewBox="0 0 740 200" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="progressBellCurveGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="actualBellCurveGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Baseline */}
                    <line x1="50" y1="150" x2="670" y2="150" stroke="var(--border-color-hover)" strokeWidth="1.5" />
                    
                    {/* Horizontal Grid Ticks & Labels */}
                    {[0, 8, 16, 24, 32].map(pt => {
                      const y = 150 - (pt / 32) * 130;
                      return (
                        <g key={`pt-tick-${pt}`}>
                          <line x1="50" y1={y} x2="670" y2={y} stroke="var(--border-color)" strokeWidth="0.8" strokeDasharray="3,5" opacity="0.3" />
                          <line x1="45" y1={y} x2="50" y2={y} stroke="var(--border-color-hover)" strokeWidth="1.5" />
                          
                          {/* Point Label on left */}
                          <text x="38" y={y + 3} textAnchor="end" fill="var(--text-muted)" fontSize="0.65rem" fontWeight="800">
                            {pt}
                          </text>
                        </g>
                      );
                    })}

                    {/* Expected MEG Area Path */}
                    {progressMegAreaPath && (
                      <path 
                        d={progressMegAreaPath} 
                        fill="url(#progressBellCurveGrad)" 
                        style={{ transition: 'all 0.5s ease' }} 
                      />
                    )}

                    {/* Actual CPT Area Path */}
                    {progressCptAreaPath && (
                      <path 
                        d={progressCptAreaPath} 
                        fill="url(#actualBellCurveGrad)" 
                        style={{ transition: 'all 0.5s ease' }} 
                      />
                    )}

                    {/* Expected MEG Spline Path */}
                    {progressMegLinePath && (
                      <path 
                        d={progressMegLinePath} 
                        fill="none" 
                        stroke="var(--accent)" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        opacity="0.5" 
                        style={{ transition: 'all 0.5s ease' }} 
                      />
                    )}

                    {/* Actual CPT Spline Path */}
                    {progressCptLinePath && (
                      <path 
                        d={progressCptLinePath} 
                        fill="none" 
                        stroke="var(--primary)" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        opacity="0.7" 
                        style={{ transition: 'all 0.5s ease', filter: 'drop-shadow(0 2px 4px var(--primary-glow))' }} 
                      />
                    )}

                    {/* Student Bars & Nodes */}
                    {progressGraphStudents.map((s, idx) => {
                      const colWidth = 620 / progressGraphStudents.length;
                      const x = 50 + (idx + 0.5) * colWidth;
                      const cptY = s.actualCpt !== null ? 150 - (s.actualCpt / 32) * 130 : null;
                      const megY = s.expectedMeg !== null ? 150 - (s.expectedMeg / 32) * 130 : null;
                      const displayName = s.forename + (s.surname ? ' ' + s.surname.charAt(0) + '.' : '');

                      return (
                        <g key={`student-bar-${s.id}`} style={{ cursor: 'pointer' }}>
                          <title>
                            {s.name}
                            {"\n"}Actual CPT: {s.actualCpt !== null ? `${s.actualCpt}/32` : 'No CPT score'}
                            {"\n"}Expected MEG: {s.expectedMeg !== null ? `${s.expectedMeg}/32` : 'No expected MEG'}
                            {s.actualCpt !== null && s.expectedMeg !== null ? `\nAttainment Gap: ${s.cptDiff >= 0 ? '+' : ''}${s.cptDiff} points` : ''}
                          </title>

                          {/* Guide Line */}
                          <line x1={x} y1="20" x2={x} y2="150" stroke="var(--border-color)" strokeWidth="0.8" strokeDasharray="2,4" opacity="0.2" />

                          {/* Gap Connection Line */}
                          {cptY !== null && megY !== null && (
                            <line 
                              x1={x} y1={megY} x2={x} y2={cptY} 
                              stroke={s.cptDiff >= 0 ? '#10b981' : '#ef4444'} 
                              strokeWidth="2.5" 
                              strokeLinecap="round"
                              opacity="0.85"
                            />
                          )}

                          {/* Expected MEG Node */}
                          {megY !== null && (
                            <circle cx={x} cy={megY} r="3.5" fill="var(--bg-app)" stroke="var(--accent)" strokeWidth="1.5" />
                          )}

                          {/* Actual CPT Node - Color dynamically based on attainment gap */}
                          {cptY !== null && (
                            <circle 
                              cx={x} 
                              cy={cptY} 
                              r="4.5" 
                              fill={s.cptDiff >= 0 ? '#10b981' : '#ef4444'} 
                              stroke="var(--bg-app)" 
                              strokeWidth="1.5" 
                              style={{ filter: `drop-shadow(0 0 3.5px ${s.cptDiff >= 0 ? 'rgba(16,185,129,0.45)' : 'rgba(239,68,68,0.45)'})` }} 
                            />
                          )}
                        </g>
                      );
                    })}

                    {/* 5. Horizontal Expected MEG Average Line (Indigo) */}
                    {progressMegAverage > 0 && (
                      <g>
                        <line 
                          x1="50" y1={progressMegAvgY} x2="670" y2={progressMegAvgY} 
                          stroke="var(--accent)" 
                          strokeWidth="1.5" 
                          strokeDasharray="3,3" 
                          style={{ filter: 'drop-shadow(0 0 3px var(--accent-glow))' }}
                        />
                        
                        {/* Indicator flag on the right */}
                        <g transform={`translate(675, ${badgeMegY})`}>
                          <rect 
                            width="60" height="16" rx="3" 
                            fill="rgba(99, 102, 241, 0.15)" 
                            stroke="var(--accent)" 
                            strokeWidth="0.8" 
                            style={{ backdropFilter: 'blur(4px)' }}
                          />
                          <text x="30" y="10" textAnchor="middle" fill="var(--text-main)" fontSize="0.55rem" fontWeight="900" fontFamily="var(--font-header)">
                            MEG: {progressMegAverage.toFixed(1)}
                          </text>
                        </g>
                      </g>
                    )}

                    {/* 6. Horizontal Actual CPT Average Line (Red) */}
                    {progressCptAverage > 0 && (
                      <g>
                        <line 
                          x1="50" y1={progressCptAvgY} x2="670" y2={progressCptAvgY} 
                          stroke="var(--primary)" 
                          strokeWidth="1.5" 
                          strokeDasharray="3,3" 
                          style={{ filter: 'drop-shadow(0 0 3px var(--primary-glow))' }}
                        />
                        
                        {/* Indicator flag on the right */}
                        <g transform={`translate(675, ${badgeCptY})`}>
                          <rect 
                            width="60" height="16" rx="3" 
                            fill="rgba(225, 0, 49, 0.15)" 
                            stroke="var(--primary)" 
                            strokeWidth="0.8" 
                            style={{ backdropFilter: 'blur(4px)' }}
                          />
                          <text x="30" y="10" textAnchor="middle" fill="var(--text-main)" fontSize="0.55rem" fontWeight="900" fontFamily="var(--font-header)">
                            CPT: {progressCptAverage.toFixed(1)}
                          </text>
                        </g>
                      </g>
                    )}
                  </svg>
                </div>

                {/* Symmetrical comparison summary details */}
                <div style={{
                  marginTop: '1.25rem',
                  padding: '1rem 1.25rem',
                  background: 'rgba(255, 255, 255, 0.015)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Actual CPT Average</span>
                      <strong style={{ fontSize: '0.92rem', color: 'var(--primary)' }}>
                        {progressCptAverage.toFixed(1)} / 32
                      </strong>
                    </div>
                    <div style={{ width: '1px', background: 'var(--border-color)' }} />
                    <div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Expected MEG Average</span>
                      <strong style={{ fontSize: '0.92rem', color: 'var(--accent)' }}>
                        {progressMegAverage.toFixed(1)} / 32
                      </strong>
                    </div>
                    <div style={{ width: '1px', background: 'var(--border-color)' }} />
                    <div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Attainment Gap</span>
                      <strong style={{ fontSize: '0.92rem', color: (progressCptAverage >= progressMegAverage) ? 'var(--success)' : 'var(--error)' }}>
                        {progressCptAverage >= progressMegAverage ? '+' : ''}{(progressCptAverage - progressMegAverage).toFixed(1)} pts
                      </strong>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', maxWidth: '420px', margin: 0, lineHeight: '1.4' }}>
                    💡 <strong>Distribution Overlay:</strong> Comparing the red Actual CPT curve against the blue Expected MEG curve reveals shift directions. Peaks shifted to the right of targets indicate high-value progress gains!
                  </p>
                </div>
              </div>
            )}
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
