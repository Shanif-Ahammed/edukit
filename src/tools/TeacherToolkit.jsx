import React, { useState } from 'react';
import {
  BookOpen, GraduationCap, HelpCircle, FileSpreadsheet, Sparkles,
  BarChart3, Users, AlertCircle, CheckCircle2, ShieldCheck,
  Search, Calculator, Calendar, ArrowRight, ShieldAlert,
  ChevronDown, UserCheck, RefreshCw, Info, Settings
} from 'lucide-react';

export default function TeacherToolkit() {
  const [activeAssessSubTab, setActiveAssessSubTab] = useState('overview'); // For Assessment Guidelines

  // Interactive Calculator States
  const [mypCptInput, setMypCptInput] = useState('24');
  const [cat4SearchQuery, setCat4SearchQuery] = useState('');
  const [arabicMypPoints, setArabicMypPoints] = useState('18');
  const [arabicDpGrade, setArabicDpGrade] = useState('5');
  const [qaRoleFilter, setQaRoleFilter] = useState('all');

  // Interactive FAQs states
  const [faqOpen, setFaqOpen] = useState({
    locked: false,
    emptyGrades: false,
    liveSync: false
  });

  const toggleFaq = (key) => {
    setFaqOpen(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // ── DATA FOR WIDGETS ───────────────────────────────────────────────────

  // MYP Grade boundary mappings
  const getMypBoundaryResult = (points) => {
    const pts = parseInt(points, 10);
    if (isNaN(pts) || pts < 0 || pts > 32) return { error: "Please enter a points total between 0 and 32." };
    if (pts >= 28) return { grade: 7, desc: "Excellent quality; comprehensive understanding and consistent application of critical and creative thinking.", notes: "Exceeds KHDA expectations." };
    if (pts >= 24) return { grade: 6, desc: "High quality; extensive understanding and frequent demonstration of critical and creative thinking.", notes: "Exceeds KHDA expectations." };
    if (pts >= 19) return { grade: 5, desc: "Generally high quality; secure understanding and some sophistication in critical and creative thinking.", notes: "KHDA exceeding curriculum expectations grade." };
    if (pts >= 15) return { grade: 4, desc: "Good quality; mostly accurate understanding; demonstrates some critical and creative thinking.", notes: "KHDA meeting curriculum expectations grade." };
    if (pts >= 10) return { grade: 3, desc: "Acceptable quality; basic understanding with some errors; limited application of knowledge and skills.", notes: "Any child at this level or below should be receiving intervention to help them achieve at least a Grade 4." };
    if (pts >= 6) return { grade: 2, desc: "Limited quality; significant gaps in understanding and infrequent critical or creative thinking.", notes: "Critical intervention recommended." };
    return { grade: 1, desc: "Work of very limited quality; shows major misunderstandings and minimal critical or creative thinking.", notes: "Urgent intervention required." };
  };

  // CAT4 Proxy Subject Mappings
  const cat4Proxies = [
    { subject: "Art", proxy: "IB MYP Arts" },
    { subject: "Biology", proxy: "IB MYP Sciences" },
    { subject: "I&S Commerce", proxy: "IB MYP Humanities" },
    { subject: "Chemistry", proxy: "IB MYP Sciences" },
    { subject: "Design", proxy: "IB MYP Technology" },
    { subject: "Drama", proxy: "IB MYP Arts" },
    { subject: "English LL", proxy: "IB MYP English" },
    { subject: "English as additional Language", proxy: "IB MYP English" },
    { subject: "French LA", proxy: "IB MYP French" },
    { subject: "French LL", proxy: "IB MYP French" },
    { subject: "German LA", proxy: "IB MYP German" },
    { subject: "German LL", proxy: "IB MYP German" },
    { subject: "I&S (English, French or German)", proxy: "IB MYP Humanities" },
    { subject: "Information Technology", proxy: "IB MYP Technology" },
    { subject: "Mathematics", proxy: "IB MYP Mathematics" },
    { subject: "Music", proxy: "IB MYP Arts" },
    { subject: "Physics", proxy: "IB MYP Sciences" },
    { subject: "PHE/PHP", proxy: "IB MYP Physical Education" },
    { subject: "Science (Integrated, Double)", proxy: "IB MYP Sciences" },
    { subject: "Spanish LA", proxy: "IB MYP Spanish" },
    { subject: "Visual Arts", proxy: "IB MYP Arts" },
  ];

  const filteredCat4Proxies = cat4Proxies.filter(item =>
    item.subject.toLowerCase().includes(cat4SearchQuery.toLowerCase()) ||
    item.proxy.toLowerCase().includes(cat4SearchQuery.toLowerCase())
  );

  // Arabic MYP to MOE scale conversion
  const getArabicMypConversion = (points) => {
    const pts = parseInt(points, 10);
    if (isNaN(pts) || pts < 12 || pts > 32) return null;
    const table = {
      12: 50, 13: 52, 14: 55, 15: 58, 16: 60, 17: 63, 18: 66, 19: 69, 20: 72,
      21: 74, 22: 76, 23: 80, 24: 82, 25: 84, 26: 86, 27: 88, 28: 90, 29: 92,
      30: 94, 31: 97, 32: 100
    };
    return table[pts];
  };

  // Arabic DP Grade to MOE scale
  const getArabicDpConversion = (grade) => {
    const grd = parseInt(grade, 10);
    const table = {
      1: "Under 40% (Fail)",
      2: "40% - 49%",
      3: "50% - 59%",
      4: "60% - 69%",
      5: "70% - 79%",
      6: "80% - 89%",
      7: "90% - 100%"
    };
    return table[grd] || "N/A";
  };

  // Quality Assurance Responsibilities Matrix
  const qaMatrix = [
    { role: "Secondary Data and Exams Officer", task: "Check for grades that are lower than the previous AP and alert relevant SubCos.", ap: "AP3 - AP5" },
    { role: "Secondary Data and Exams Officer", task: "Check overall attainment benchmarks against the KHDA inspection framework and inform Deputy Headteacher Academics.", ap: "AP3 & AP5" },
    { role: "SubCos", task: "Check for missing data (obtain spreadsheet from Secondary Data and Exams Officer) and chase up teachers. If student data is missing or gradebook updates are made, instruct teachers to download the latest roster/score file.", ap: "All APs" },
    { role: "Teachers", task: "Coordinated by SubCo, peer-check inputted data in gradebooks. If there is any update done in the gradebook, make sure to download the latest roster file. If a student score is missing, make sure to download the latest file.", ap: "AP3 & AP5" },
    { role: "Assistant Head, Student Experience", task: "Check all Emirati student data and alert Deputy Headteacher Academics if any Emirati student is in danger of failing to meet the Thanaweya requirements.", ap: "AP3 & AP5" },
    { role: "DP Coordinator", task: "Review student predicted grades and ensure comprehensive DP cohort alignment.", ap: "AP4 & AP5" },
    { role: "CP Coordinator", task: "Conduct checking of all CP Component and Unit grades against school targets.", ap: "All APs" },
    { role: "Inclusion Team", task: "Perform spot checking of Inclusion student data and discuss findings with Deputy Headteacher Academics.", ap: "AP3 & AP5" },
    { role: "MAGT Coordinator", task: "Perform spot checking of MAGT student data and discuss findings with Deputy Headteacher Academics.", ap: "AP3 & AP5" },
    { role: "Head of Upper School", task: "Check cumulative grades and predicted grades in direct consultation with DP and CP Coordinators.", ap: "AP3 - AP5" },
    { role: "SLT", task: "Conduct final spot checks of grades based on earlier QA reviews.", ap: "AP3 & AP5" },
    { role: "Deputy Head of pastoral, GLCs & Assistant GLCs", task: "QA of comment banks: Read, amend, and test comment banks for Homeroom Tutor comments. Inform Secondary Data and Exams Officer when satisfied.", ap: "AP3 (Tutor comments)" },
    { role: "Deputy Head of Academics, SubCos & Assistant SubCos", task: "QA of comment banks: Read, amend, and test comment banks for Teacher Subject comments. Inform Secondary Data and Exams Officer when satisfied.", ap: "AP5 (Subject comments)" },
    { role: "GLCs & Assistant GLCs", task: "QA of reports: Read tutor comments, alert Homeroom Tutors of required changes, and inform Deputy Head of pastoral when complete.", ap: "AP3" },
    { role: "Deputy Head of pastoral", task: "QA of reports: Spot check tutor comments post-GLC check and inform GLCs of any issues. Inform Secondary Data and Exams Officer when reports are ready to go.", ap: "AP3" },
    { role: "SLT, SubCos & Assistant SubCos", task: "QA of reports: Read full reports for an assigned Homeroom. Alert SubCos of required changes, and inform Secondary Data and Exams Officer when reports are ready. (SLT: 2 full classes each; SubCos: 1 full class each).", ap: "AP5" },
  ];

  const uniqueRoles = ["all", ...new Set(qaMatrix.map(item => item.role))];
  const filteredQaMatrix = qaRoleFilter === 'all'
    ? qaMatrix
    : qaMatrix.filter(item => item.role === qaRoleFilter);

  // ── RENDER SUB-TAB CHANGER ─────────────────────────────────────────────
  const mypBoundary = getMypBoundaryResult(mypCptInput);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3.5rem' }}>

      {/* ── AESTHETIC BANNER HEADER ────────────────────────────────────── */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(225, 0, 49, 0.06) 0%, rgba(99, 102, 241, 0.03) 100%)',
          border: '1px solid var(--border-primary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <GraduationCap size={26} style={{ color: 'var(--primary)' }} />
          <h1 style={{ fontSize: '1.85rem', fontWeight: '850', letterSpacing: '-0.04em' }}>SISD Academic Data Framework Reference</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
          Access official SISD Assessment Guidelines (MYP, DP, CP, MOE) compiled directly from the <strong style={{ fontWeight: '800' }}>2025-2026 Academic Data Framework</strong>. Utilise interactive converters, calculators, and Quality Assurance roles checker.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }}>

        {/* Secondary Sub-Navigation (Assessment Guidelines) */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.5rem 0.75rem' }}>
            Assessment & Data Guidelines
          </span>

          {[
            { id: 'overview', label: 'Framework Overview', icon: Info },
            { id: 'myp', label: 'MYP Gradebook & CPT', icon: Calculator },
            { id: 'dp_cp', label: 'DP & CP Frameworks', icon: Calendar },
            { id: 'oas', label: 'Roster Updates & Descriptors', icon: RefreshCw },
            { id: 'atl_attitude', label: 'ATL & Attitude Rubrics', icon: Sparkles },
            { id: 'moe', label: 'MOE Subjects & Arabic', icon: ShieldAlert },
            { id: 'qa', label: 'Quality Assurance Matrix', icon: UserCheck },
            { id: 'faq', label: 'Reference FAQs', icon: HelpCircle }
          ].map((subTab) => {
            const Icon = subTab.icon;
            const isActive = activeAssessSubTab === subTab.id;
            return (
              <button
                key={subTab.id}
                onClick={() => setActiveAssessSubTab(subTab.id)}
                className="btn"
                style={{
                  justifyContent: 'flex-start',
                  padding: '0.65rem 0.95rem',
                  fontSize: '0.85rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? 'var(--bg-card-hover)' : 'transparent',
                  color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                  boxShadow: isActive ? 'inset 3px 0 0 var(--primary)' : 'none',
                  fontWeight: isActive ? '750' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <Icon size={16} style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }} />
                {subTab.label}
              </button>
            );
          })}
        </div>

        {/* Guidelines Details View */}
        <div className="glass-panel" style={{ padding: '2rem' }}>

          {/* SUBTAB: OVERVIEW & GENERAL PRINCIPLES */}
          {activeAssessSubTab === 'overview' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.45rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <GraduationCap size={22} /> SISD Academic Data Framework 2025-2026
              </h2>

              {/* 📅 IMPORTANT DATES SECTION */}
              <div
                className="glass-panel"
                style={{
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                  background: 'rgba(251, 191, 36, 0.02)',
                  borderColor: 'rgba(251, 191, 36, 0.15)',
                  borderRadius: '10px'
                }}
              >
                <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.75rem 0' }}>
                  <Calendar size={18} /> Important Assessment Cycle Dates (2025-2026)
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4', margin: '0 0 1rem 0' }}>
                  Official gradebook entry deadlines and iSAMS roster download guidelines. If any updates are made, download the latest roster file.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {/* Left: iSAMS Gradebook Cycles */}
                  <div style={{ background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.75rem' }}>
                      📥 iSAMS Gradebook Entry Windows
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>
                        <span style={{ fontWeight: '700' }}>AP2 Cycles:</span>
                        <span style={{ color: 'var(--text-muted)' }}>10/11/2025 – 17/11/2025</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>
                        <span style={{ fontWeight: '700' }}>AP3 Cycles:</span>
                        <span style={{ color: 'var(--text-muted)' }}>09/01/2026 – 23/01/2026</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: '700' }}>AP5 Cycles (G11 Full Written):</span>
                        <span style={{ color: 'var(--text-muted)' }}>11/05/2026 – 04/06/2026</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: OAS Sync Windows */}
                  <div style={{ background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.75rem' }}>
                      🔄 OAS Cloud Sync & Publication
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>
                        <span style={{ fontWeight: '700' }}>AP3 Sync (Term 1 Reports):</span>
                        <span style={{ color: 'var(--text-muted)' }}>16/01/2026 – 24/01/2026</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>
                        <span style={{ fontWeight: '700' }}>AP4 Sync (G12 Mocks):</span>
                        <span style={{ color: 'var(--text-muted)' }}>09/05/2026 – 15/05/2026</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: '700' }}>AP5 Sync (End of Year):</span>
                        <span style={{ color: 'var(--text-muted)' }}>15/06/2026 – 19/06/2026</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: '750', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Core Assessment Principles</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                All assessments at the Swiss International Scientific School in Dubai adhere to high pedagogical rigor, ensuring that grading remains valid, reliable, and supportive of each child's learning pathway:
              </p>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <li><strong>Validity & Reliability:</strong> Assessments are rigorously aligned to test the exact skills and knowledge intended, serving as a trustworthy gauge of student achievement.</li>
                <li><strong>Criterion-Based Summative:</strong> Summative assessments are fully criterion-based and utilize valid IB rubrics. Marks are assigned by the subject teacher and moderated collaboratively within departments to ensure standard alignment.</li>
                <li><strong>Evidence-Based & 'Best Fit':</strong> Attainment grades are rooted in rich evidence, informed by summatives, and finalized using the professional 'Best Fit' principle.</li>
                <li><strong>Minimum Expected Grade (MEG):</strong> The MEG serves as the baseline expectations rather than a ceiling. Teachers are strongly encouraged to guide students toward more ambitious targets using tailored feedback and targeted interventions.</li>
              </ul>

              <h3 style={{ fontSize: '1.05rem', fontWeight: '750', marginTop: '1.5rem', marginBottom: '0.75rem' }}>The Three Levels of Data</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                SISD structures assessment analytics across three sequential depths:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--accent)', display: 'block', marginBottom: '0.25rem' }}>Level 1: Granular Classroom Data</span>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    Question-specific or rubric-specific marks tracked by teachers locally. Used to guide next-day lesson plans and provide individualized formative feedback.
                  </p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary)', display: 'block', marginBottom: '0.25rem' }}>Level 2: Holistic Departmental Data</span>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    Criterion achievement scores recorded in ManageBac trackers or spreadsheets. Formulated against the eight MYP subject groups (Criteria A, B, C, D) or DP targets. Directs class-level and department-wide interventions.
                  </p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', color: '#10b981', display: 'block', marginBottom: '0.25rem' }}>Level 3: Official Assessment Points (OAS & iSAMS)</span>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    Data entered directly into iSAMS for Assessment Points (APs 1-5) or mock examinations. Utilized by administration, inspectors (KHDA/DSIB), and parents to evaluate overall student progress and school benchmarks.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB: MYP GRADEBOOK & CALCULATIONS */}
          {activeAssessSubTab === 'myp' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.45rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <Calculator size={22} /> MYP Calculations, Targets, and Boundaries
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

                {/* Left Column: Interactive Boundary Calculator */}
                <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calculator size={15} /> Boundary & Attainment Calculator
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
                    Enter the Cumulative Point Total (CPT) out of 32 (sum of Criteria A, B, C, D) to instantly map it to the official IB MYP Grade (1-7) and see KHDA inspection notes.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '750', color: 'var(--text-main)' }}>CPT Score (/32):</label>
                    <input
                      type="number"
                      min="0"
                      max="32"
                      value={mypCptInput}
                      onChange={(e) => setMypCptInput(e.target.value)}
                      style={{
                        width: '80px',
                        background: 'var(--bg-app)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        padding: '0.4rem',
                        borderRadius: '8px',
                        outline: 'none',
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        fontWeight: '700'
                      }}
                    />
                  </div>

                  {mypBoundary.error ? (
                    <div style={{ color: 'var(--error)', fontSize: '0.8rem', fontWeight: '700' }}>{mypBoundary.error}</div>
                  ) : (
                    <div style={{ background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700' }}>IB MYP GRADE:</span>
                        <span style={{
                          fontSize: '1.4rem',
                          fontWeight: '850',
                          color: mypBoundary.grade >= 4 ? '#10b981' : 'var(--warning)',
                          textShadow: '0 0 10px rgba(16,185,129,0.1)'
                        }}>
                          {mypBoundary.grade} / 7
                        </span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-main)', lineHeight: '1.45', marginBottom: '0.5rem' }}>
                        <strong>Description:</strong> {mypBoundary.desc}
                      </p>
                      <div style={{ fontSize: '0.7rem', color: mypBoundary.grade >= 5 ? '#10b981' : mypBoundary.grade === 4 ? 'var(--warning)' : 'var(--error)', fontWeight: '750', background: 'rgba(255,255,255,0.01)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
                        ℹ️ {mypBoundary.notes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: KHDA Inspection Standards Table */}
                <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--accent)', marginBottom: '0.75rem' }}>
                    KHDA Attainment Benchmarks (AP5)
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                    School inspector expectations for cohort attainment at Assessment Point 5 (AP5):
                  </p>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                        <th style={{ padding: '6px 0', color: 'var(--text-muted)' }}>Inspection Judgment</th>
                        <th style={{ padding: '6px 0', color: 'var(--text-muted)' }}>% of Grades @ 4+</th>
                        <th style={{ padding: '6px 0', color: 'var(--text-muted)' }}>% of Grades @ 5+</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '6px 0', fontWeight: '800', color: '#10b981' }}>Outstanding</td>
                        <td style={{ padding: '6px 0' }}>75%</td>
                        <td style={{ padding: '6px 0' }}>75%</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '6px 0', fontWeight: '700', color: 'var(--accent)' }}>Very Good</td>
                        <td style={{ padding: '6px 0' }}>75%</td>
                        <td style={{ padding: '6px 0' }}>61%</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '6px 0', fontWeight: '600', color: 'var(--warning)' }}>Good</td>
                        <td style={{ padding: '6px 0' }}>75%</td>
                        <td style={{ padding: '6px 0' }}>50%</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '6px 0', color: 'var(--text-muted)' }}>Acceptable</td>
                        <td style={{ padding: '6px 0' }}>75%</td>
                        <td style={{ padding: '6px 0' }}>--</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>

              {/* CAT4 Proxy Subject Finder Widget */}
              <h3 style={{ fontSize: '1.05rem', fontWeight: '750', marginBottom: '0.5rem', color: 'var(--text-main)' }}>CAT4 Proxy Subject Finder</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: '1.5', marginBottom: '1rem' }}>
                There are no native CAT4 expected grades for certain subjects. SISD maps proxy subjects automatically in iSAMS gradebooks (e.g. Design relies on Technology indices). Search below to check proxies:
              </p>

              <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-app)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                  <Search size={16} style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Type a subject name to find CAT4 Proxy... (e.g. Design, Commerce, Biology)"
                    value={cat4SearchQuery}
                    onChange={(e) => setCat4SearchQuery(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-main)',
                      outline: 'none',
                      fontSize: '0.85rem',
                      width: '100%'
                    }}
                  />
                </div>

                <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', paddingRight: '4px' }}>
                  {filteredCat4Proxies.length > 0 ? (
                    filteredCat4Proxies.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--bg-app)',
                          border: '1px solid var(--border-color)',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.8rem'
                        }}
                      >
                        <span style={{ fontWeight: '750', color: 'var(--text-main)' }}>{item.subject}</span>
                        <span style={{ fontSize: '0.72rem', background: 'var(--accent-glow)', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                          {item.proxy}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span style={{ gridColumn: '1 / -1', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                      No subjects match your query.
                    </span>
                  )}
                </div>
              </div>

              {/* MYP MEGs logic */}
              <h3 style={{ fontSize: '1.05rem', fontWeight: '750', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Minimum Expected Grade (MEG) Rules</h3>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <li><strong>Returning Students:</strong> MEG is calculated as the previous year's AP5 Cumulative Points Total (CPT /32) + 1. (For example, an AP5 score of 24 in Grade 8 translates to an automatic MEG target of 25 in Grade 9).</li>
                <li><strong>New Students & Grade 6:</strong> Set at the lowest equivalent /32 points mapped to their subject-specific CAT4 'if challenged' grade. (For example, a CAT4 'if challenged' score of 6 maps to a MEG target of 24 points).</li>
                <li><strong>Missing CAT4 Index:</strong> In rare cases where a student has no prior CAT4 data or CPT index, the MEG is set to a base points value of 15 (MYP Grade 4 equivalent).</li>
              </ul>
            </div>
          )}

          {/* SUBTAB: DP & CP FRAMEWORKS */}
          {activeAssessSubTab === 'dp_cp' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.45rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <Calendar size={22} /> Diploma (DP) & Careers-related (CP) Programmes
              </h2>

              <h3 style={{ fontSize: '1.05rem', fontWeight: '750', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Diploma Programme (DP)</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                DP subjects conduct <strong style={{ fontWeight: '800' }}>three summative assessments per term</strong> across DP1 (G11) and DP2 (G12). Grade boundaries are calculated strictly on standard IB thresholds, with an additional <strong style={{ fontWeight: '800' }}>+5% to +7%</strong> margin applied (at the discretion of the Subject Coordinator) during early, less synoptic assessments:
              </p>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1.5rem' }}>
                <li><strong>DP MEG (G11):</strong> The MEG is equivalent to the Centre for Evaluation and Monitoring (CEM) test projected grade. If CEM tests are incomplete, the MEG draws from the CAT4 'If Challenged' HL or SL grade.</li>
                <li><strong>DP MEG (G12):</strong> Determined automatically from the student's DP1 final AP5 cumulative grade, or AP5 + 1.</li>
                <li><strong>DP Core Gradebooks:</strong> TOK and Extended Essay (EE) utilize the A-E scale. Grade 11 gradebooks record a single holistic grade per term. Grade 12 records separate segments for TOK Exhibition, TOK Essay, and Extended Essay.</li>
              </ul>

              <h3 style={{ fontSize: '1.05rem', fontWeight: '750', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Careers-related Programme (CP) & BTEC</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                The CP path balances rigorous academics with practical vocational skills under the BTEC modular structure:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>BTEC Grading & Components</span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '0.5rem' }}>
                    BTEC units are evaluated across 3 key modular components. Gradebooks remain open year-round to facilitate continuous progress assessments.
                  </p>
                  <strong style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>Grading Options:</strong>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    <li><strong>U:</strong> Ungraded / Unsubmitted</li>
                    <li><strong>Pass:</strong> Meets baseline outcomes</li>
                    <li><strong>Merit:</strong> Demonstrates deeper analysis</li>
                    <li><strong>Distinction:</strong> Outstanding conceptual insight</li>
                  </ul>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--accent)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>CP Core Framework</span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '0.75rem' }}>
                    Tutors track core CP structures under three central components (Personal and Professional Skills, Language and Culture Studies, Community Engagement).
                  </p>
                  <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', textAlign: 'center', color: 'var(--warning)' }}>
                    ⚠️ Grading states are strictly: "On track" or "Not on track"
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB: OAS RESYNC & TIMEFRAMES */}
          {activeAssessSubTab === 'oas' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.45rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <RefreshCw size={22} /> Gradebook Roster Updates & iSAMS Sync
              </h2>

              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  color: '#10b981',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                  lineHeight: '1.5'
                }}
              >
                <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontWeight: '700' }}>Gradebook Roster Update Rule</strong>
                  <p style={{ marginTop: '0.25rem', color: 'var(--text-main)', opacity: 0.9 }}>
                    If student data is missing or if there is any update done in your iSAMS gradebook, make sure to download the latest roster file. If a student score/grade is missing, make sure to download the latest Excel file from iSAMS and reconnect it on the dashboard.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

                {/* Language Acquisition descriptors */}
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: '750', marginBottom: '0.75rem', color: 'var(--text-main)' }}>Language Acquisition Descriptors</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '6px' }}>
                      <span style={{ fontWeight: '800', color: 'var(--primary)' }}>Emergent:</span> Students understand generally simple contexts and speak/write clearly using basic structures.
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '6px' }}>
                      <span style={{ fontWeight: '800', color: 'var(--accent)' }}>Capable:</span> Students understand more complex contexts and write clearly using complex sentence structures.
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '6px' }}>
                      <span style={{ fontWeight: '800', color: '#10b981' }}>Proficient:</span> Students understand complex texts and communicate with highly wide-ranging, sophisticated vocabulary.
                    </div>
                  </div>
                </div>

                {/* Tutor Service as Action expectations */}
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: '750', marginBottom: '0.75rem', color: 'var(--text-main)' }}>Tutor Service as Action (SA) Status</h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                      <strong>AP3 Tutor SA Options:</strong>
                      <ul style={{ paddingLeft: '1rem', marginTop: '0.25rem', color: 'var(--text-muted)' }}>
                        <li><strong style={{ color: 'var(--error)' }}>Concern:</strong> 1 or 0 SA activities logged on ManageBac.</li>
                        <li><strong style={{ color: 'var(--warning)' }}>On Track:</strong> 2 activities logged with partial evidence.</li>
                        <li><strong style={{ color: '#10b981' }}>Excellent:</strong> 2 extended activities logged with comprehensive evidence.</li>
                      </ul>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                      <strong>AP5 Tutor SA Options:</strong>
                      <ul style={{ paddingLeft: '1rem', marginTop: '0.25rem', color: 'var(--text-muted)' }}>
                        <li><strong style={{ color: '#10b981' }}>Completed:</strong> Demonstrated learning in all 7 SA outcomes with full reflections.</li>
                        <li><strong style={{ color: 'var(--error)' }}>Not Completed:</strong> Gaps in outcomes or lacks comprehensive portfolio evidence.</li>
                      </ul>
                    </div>
                  </div>
                </div>

              </div>

              {/* OAS Timeframes table */}
              <h3 style={{ fontSize: '1.02rem', fontWeight: '750', marginBottom: '0.5rem' }}>OAS Assessment Cycles & Calendars</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px 0' }}>Cycle Point</th>
                    <th style={{ padding: '8px 0' }}>Description</th>
                    <th style={{ padding: '8px 0' }}>Date Open</th>
                    <th style={{ padding: '8px 0' }}>Date Closed</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '8px 0', fontWeight: '700' }}>Assessment Point 1</td>
                    <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Target settings automatically uploaded</td>
                    <td style={{ padding: '8px 0' }}>--</td>
                    <td style={{ padding: '8px 0' }}>Same as AP2</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '8px 0', fontWeight: '700' }}>Assessment Point 2</td>
                    <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Summative and welcome back results</td>
                    <td style={{ padding: '8px 0' }}>10/11/2025</td>
                    <td style={{ padding: '8px 0' }}>17/11/2025</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '8px 0', fontWeight: '700' }}>Assessment Point 3</td>
                    <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Term 1 grades, mock data (Provisional)</td>
                    <td style={{ padding: '8px 0' }}>16/01/2026</td>
                    <td style={{ padding: '8px 0' }}>24/01/2026</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '8px 0', fontWeight: '700' }}>AP4 (Grade 12)</td>
                    <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>DP2 mock/predicted benchmarks</td>
                    <td style={{ padding: '8px 0' }}>09/05/2026</td>
                    <td style={{ padding: '8px 0' }}>15/05/2026</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '8px 0', fontWeight: '700' }}>Assessment Point 5</td>
                    <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>End of Year (EOY) written report sync</td>
                    <td style={{ padding: '8px 0' }}>15/06/2026</td>
                    <td style={{ padding: '8px 0' }}>19/06/2026</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* SUBTAB: ATL & ATTITUDE SCALE RUBRICS */}
          {activeAssessSubTab === 'atl_attitude' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.45rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <Sparkles size={22} /> Approaches & Attitude to Learning Rubrics
              </h2>

              <h3 style={{ fontSize: '1.05rem', fontWeight: '750', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                Approaches to Learning (ATL) Scale
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1rem' }}>
                Evaluated at AP3 and AP5 across 5 central categories (Thinking, Communication, Social, Self-Management, and Research) to record skill acquisition:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '8px' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>Novice (N)</strong>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    The student is introduced to the skill. They observe others performing it to understand what it looks like in practice.
                  </p>
                </div>
                <div style={{ border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '8px' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--accent)', display: 'block', marginBottom: '4px' }}>Beginner (B)</strong>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    The student begins to use the skill by imitating others. They still rely heavily on scaffolding, modelling, and close teacher guidance.
                  </p>
                </div>
                <div style={{ border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '8px' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#10b981', display: 'block', marginBottom: '4px' }}>Practitioner (P)</strong>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    The student applies the skill confidently and effectively. They can use it independently in a range of everyday classroom contexts.
                  </p>
                </div>
                <div style={{ border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '8px' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--warning)', display: 'block', marginBottom: '4px' }}>Expert (E)</strong>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    The student has full command of the skill. They can model it for others and constructively evaluate how effectively it is being used in team dynamics.
                  </p>
                </div>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: '750', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                Attitude to Learning Scale (Best-Fit Descriptor)
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1rem' }}>
                Teachers select a 'Best Fit' approach. (For instance, a pupil who is punctual but has inconsistent effort and occasional negative behavior maps to 'Approaching Expectations'):
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)', padding: '0.85rem 1.25rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#10b981' }}>Exceeding Expectations (EE)</strong>
                    <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>Consistently Exemplary</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    Consistently punctual. Hardworking and participative in all lessons. Completes home learning on time and with superb effort. Extremely well-behaved and mannered with teacher and peers.
                  </p>
                </div>

                <div style={{ border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)', padding: '0.85rem 1.25rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>Meeting Expectations (ME)</strong>
                    <span style={{ fontSize: '0.72rem', background: 'var(--accent-glow)', color: 'var(--accent)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>Standard Achieved</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    Generally punctual. Hardworking and participative in most lessons. Completes home learning on time. Well-behaved.
                  </p>
                </div>

                <div style={{ border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)', padding: '0.85rem 1.25rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--warning)' }}>Approaching Expectations (AE)</strong>
                    <span style={{ fontSize: '0.72rem', background: 'var(--warning-bg)', color: 'var(--warning)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>Area for Growth</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    Sometimes late to lessons. Inconsistent effort in lessons. Completes most home learning. Occasional negative behaviour in class.
                  </p>
                </div>

                <div style={{ border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)', padding: '0.85rem 1.25rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--error)' }}>Below Expectations (BE)</strong>
                    <span style={{ fontSize: '0.72rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>Intervention Required</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    Regularly late to lessons. Usually lacks effort in lessons. Often fails to complete home learning. Regularly disrupts classes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB: MINISTRY OF EDUCATION (MOE) & ARABIC CALCULATORS */}
          {activeAssessSubTab === 'moe' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.45rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <ShieldAlert size={22} /> Ministry of Education (MOE) Subjects & Scale Mappings
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                MOE mandatory subjects (Arabic A, Arabic B, Islamic Studies, Social Studies for Arab Students, and Moral Social Cultural Education (MSC)) must be assessed and reported using a percentage score:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

                {/* Arabic MYP Points-to-MOE percentage mapping widget */}
                <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)' }}>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calculator size={14} /> Arabic MYP points to MOE Grade Converter
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Enter Arabic MYP Cumulative Points (/32) to see equivalent percentage score. (Note: New students without prior MEG are assigned a base points value of 15).
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: '750', color: 'var(--text-main)' }}>Arabic MYP Points (/32):</label>
                    <input
                      type="number"
                      min="12"
                      max="32"
                      value={arabicMypPoints}
                      onChange={(e) => setArabicMypPoints(e.target.value)}
                      style={{
                        width: '80px',
                        background: 'var(--bg-app)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        padding: '0.4rem',
                        borderRadius: '8px',
                        outline: 'none',
                        fontSize: '0.88rem',
                        textAlign: 'center',
                        fontWeight: '700'
                      }}
                    />
                  </div>

                  {getArabicMypConversion(arabicMypPoints) !== null ? (
                    <div style={{ background: 'rgba(0,0,0,0.15)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>MINIMUM MOE GRADE:</span>
                      <span style={{ fontSize: '1.35rem', fontWeight: '850', color: '#10b981' }}>
                        {getArabicMypConversion(arabicMypPoints)}%
                      </span>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--warning)', fontSize: '0.75rem', fontWeight: '700' }}>
                      Please enter points between 12 and 32 (conversion starts at 12 CPT / 50% MOE grade).
                    </div>
                  )}
                </div>

                {/* Arabic DP points-to-MOE mapping */}
                <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)' }}>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--accent)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calculator size={14} /> Arabic DP Grade to MOE Grade
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    Select DP final grade level (1-7) to map to standard school reporting percentage bounds:
                  </p>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {['1', '2', '3', '4', '5', '6', '7'].map((val) => (
                      <button
                        key={val}
                        onClick={() => setArabicDpGrade(val)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          background: arabicDpGrade === val ? 'var(--accent-gradient)' : 'var(--bg-app)',
                          color: '#fff',
                          fontWeight: '800',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.15)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>MOE PERCENTAGE BOUND:</span>
                      <span style={{ fontSize: '1rem', fontWeight: '850', color: 'var(--accent)' }}>
                        {getArabicDpConversion(arabicDpGrade)}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', fontStyle: 'italic', marginTop: '0.25rem' }}>
                      ℹ️ This scale is utilized strictly for local school reporting purposes only.
                    </span>
                  </div>
                </div>

              </div>

              {/* Other MOE subjects details */}
              <h3 style={{ fontSize: '1.02rem', fontWeight: '750', marginBottom: '0.5rem' }}>Other Mandated Subjects (Islamic A/B, Social Studies, MSC)</h3>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1.25rem' }}>
                <li><strong>Target Selection:</strong> Returning students have MEGs calculated as their prior year percentage grade + 3% (above-expected progress target). New students are assigned 60% automatically (no CAT4 proxy exists).</li>
                <li><strong>Term 1 weighting (AP3):</strong> Represents 35% of overall grade. (Formative assessments: 10% [class activities, homework, tasks]; Summative assessment: 25% [end-of-term exam]).</li>
                <li><strong>Term 2 weighting (AP4):</strong> Represents 30% of overall grade. (Formative: 10%; Summative: 20%).</li>
                <li><strong>Term 3 weighting (AP5):</strong> Represents 35% of overall grade. (Formative: 10%; Summative: 25% [practical or project-based research evaluating deep skills]).</li>
              </ul>

              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
                <strong style={{ fontSize: '0.8rem', color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem' }}>MOE Passing Criteria & Cohort Judgments</strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <div>
                    <span style={{ fontWeight: '750', color: 'var(--warning)', display: 'block', marginBottom: '4px' }}>Minimum Passing Scores:</span>
                    Grades 6–8: 50% points minimum | Grade 9: 60% points minimum. (Incomplete/unsubmitted work defaults to 50%).
                  </div>
                  <div>
                    <span style={{ fontWeight: '750', color: '#10b981', display: 'block', marginBottom: '4px' }}>Meeting Expectations:</span>
                    Grades 6–8: 54% threshold | Grades 9–12: 60% threshold | Above expectations (G6-12): 70% threshold.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB: QUALITY ASSURANCE MATRIX */}
          {activeAssessSubTab === 'qa' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.45rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <UserCheck size={22} /> Quality Assurance (QA) Checkpoint Matrix
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                Ensure absolute accuracy of gradebooks, comments, and reports. Filter responsibilities by your assigned professional role below:
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-main)' }}>Filter Matrix by Role:</label>
                <select
                  value={qaRoleFilter}
                  onChange={(e) => setQaRoleFilter(e.target.value)}
                  style={{
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    outline: 'none',
                    fontSize: '0.85rem',
                    fontWeight: '700'
                  }}
                >
                  {uniqueRoles.map((role) => (
                    <option key={role} value={role}>
                      {role === 'all' ? 'All Roles & Responsibilities' : role}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
                {filteredQaMatrix.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid var(--border-color)',
                      background: 'rgba(255,255,255,0.01)',
                      padding: '1rem',
                      borderRadius: '8px',
                      display: 'grid',
                      gridTemplateColumns: '180px 1fr 120px',
                      gap: '1rem',
                      alignItems: 'center',
                      fontSize: '0.8rem'
                    }}
                  >
                    <strong style={{ color: 'var(--primary)' }}>{item.role}</strong>
                    <span style={{ color: 'var(--text-muted)', lineHeight: '1.4' }}>{item.task}</span>
                    <span style={{
                      fontSize: '0.72rem',
                      background: 'var(--accent-glow)',
                      border: '1px solid var(--accent)',
                      color: 'var(--accent)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      textAlign: 'center',
                      fontWeight: '700'
                    }}>
                      {item.ap}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUBTAB: REFERENCE FAQS */}
          {activeAssessSubTab === 'faq' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.45rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <HelpCircle size={22} /> Assessment & iSAMS Frequently Asked Questions
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* FAQ 1 */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', overflow: 'hidden' }}>
                  <button
                    onClick={() => toggleFaq('locked')}
                    style={{
                      width: '100%',
                      padding: '1rem 1.25rem',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      color: 'var(--text-main)',
                      fontWeight: '750',
                      fontSize: '0.88rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <span>Q: Why do some students appear locked (greyed out) in the iSAMS Gradebook?</span>
                    <ChevronDown size={16} style={{ transform: faqOpen.locked ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </button>
                  {faqOpen.locked && (
                    <div style={{ padding: '0 1.25rem 1rem 1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', lineHeight: '1.5' }}>
                      Students who have left the school or moved to a different class section will automatically appear greyed out in the gradebook. This is a crucial feature of iSAMS that ensures historical assessment data remains perfectly preserved. A greyed-out row indicates that the student is no longer active in the current class, but their grades remain available for administrative reference and audits.
                    </div>
                  )}
                </div>

                {/* FAQ 2 */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', overflow: 'hidden' }}>
                  <button
                    onClick={() => toggleFaq('emptyGrades')}
                    style={{
                      width: '100%',
                      padding: '1rem 1.25rem',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      color: 'var(--text-main)',
                      fontWeight: '750',
                      fontSize: '0.88rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <span>Q: Why is student data or a student's score/grades missing in the Excel sheet?</span>
                    <ChevronDown size={16} style={{ transform: faqOpen.emptyGrades ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </button>
                  {faqOpen.emptyGrades && (
                    <div style={{ padding: '0 1.25rem 1rem 1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', lineHeight: '1.5' }}>
                      This happens when the local portal data is not up to date with the latest gradebook. If there is any update done in the gradebook, make sure to download the latest roster file. If a student score or grade is missing, make sure to download the latest file from iSAMS and re-upload/re-connect it on the Dashboard.
                    </div>
                  )}
                </div>

                {/* FAQ 3 */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', overflow: 'hidden' }}>
                  <button
                    onClick={() => toggleFaq('liveSync')}
                    style={{
                      width: '100%',
                      padding: '1rem 1.25rem',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      color: 'var(--text-main)',
                      fontWeight: '750',
                      fontSize: '0.88rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <span>Q: Does this EduKit web application connect live to iSAMS servers?</span>
                    <ChevronDown size={16} style={{ transform: faqOpen.liveSync ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </button>
                  {faqOpen.liveSync && (
                    <div style={{ padding: '0 1.25rem 1rem 1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', lineHeight: '1.5' }}>
                      No. To satisfy Dubai DSIB strict data security laws and student privacy guidelines, <strong style={{ fontWeight: '800' }}>EduKit operates 100% offline inside your local browser cache</strong>. No student names, rosters, or grades are ever uploaded to cloud servers. All parsing, seating plans, group calculations, and comments generation occur client-side. Thus, any live updates in iSAMS will require you to download a fresh Excel sheet and re-connect the database in the EduKit Dashboard.
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
