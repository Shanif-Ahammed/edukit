import React, { useState } from 'react';
import { 
  FileSpreadsheet, Sparkles, BarChart3, Users, AlertCircle, 
  HelpCircle, ShieldCheck, ArrowRight, Info
} from 'lucide-react';

export default function PortalHelp() {
  const [activeGuideTab, setActiveGuideTab] = useState('database');

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      
      {/* Visual Header Banner */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '2rem', 
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(99, 102, 241, 0.03) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.25)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <HelpCircle size={26} style={{ color: '#3b82f6' }} />
          <h1 style={{ fontSize: '1.75rem', fontWeight: '850', letterSpacing: '-0.04em' }}>EduKit User Guide & Help Center</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', maxWidth: '800px' }}>
          Welcome to the interactive SISD EduKit guide. Learn how to format sheets, configure MYP benchmarks, automate report comments, and analyze student cohorts.
        </p>
      </div>

      {/* Tabs Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Navigation Sidebar */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0.5rem 0.75rem' }}>
            Guide Sections
          </span>
          
          {[
            { id: 'database', label: 'Roster Connection', icon: FileSpreadsheet, color: '#3b82f6' },
            { id: 'comments', label: 'Comment Assistant', icon: Sparkles, color: 'var(--primary)' },
            { id: 'analysis', label: 'Data Analytics', icon: BarChart3, color: '#10b981' },
            { id: 'planner', label: 'Seating & Groups', icon: Users, color: '#f43f5e' },
            { id: 'mistakes', label: 'Common Mistakes', icon: AlertCircle, color: '#f59e0b' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeGuideTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveGuideTab(tab.id)}
                className="btn"
                style={{
                  justifyContent: 'flex-start',
                  padding: '0.75rem 1rem',
                  fontSize: '0.9rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? 'rgba(255,255,255,0.04)' : 'transparent',
                  color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                  boxShadow: isActive ? 'inset 4px 0 0 ' + tab.color : 'none',
                  fontWeight: isActive ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <Icon size={18} style={{ color: isActive ? tab.color : 'var(--text-muted)' }} />
                {tab.label}
              </button>
            );
          })}

          <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '1rem', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem 0.75rem' }}>
              <ShieldCheck size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                All rosters, seating plans, and spreadsheet calculations are kept 100% local inside your browser. No pupil data is uploaded to servers.
              </span>
            </div>
          </div>
        </div>

        {/* Content Panel */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          
          {/* GUIDE: ROSTER CONNECTION */}
          {activeGuideTab === 'database' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6' }}>
                <FileSpreadsheet size={20} /> Connecting Roster Spreadsheet
              </h2>

              <div 
                style={{ 
                  background: 'var(--warning-bg)', 
                  border: '1px solid var(--warning-border)', 
                  color: 'var(--warning-text)', 
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
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontWeight: '700' }}>⚠️ CRITICAL NOTICE: Static Connected Roster</strong>
                  <p style={{ marginTop: '0.25rem', color: 'var(--text-main)', opacity: 0.9 }}>
                    Your connected student database runs entirely offline in your browser cache. This data is <strong style={{ fontWeight: '800' }}>static</strong>. Any changes to gradebooks, student scores, or class allocations in external sheets will <strong style={{ fontWeight: '800' }}>not</strong> sync automatically. You must re-upload the spreadsheet to import updates.
                  </p>
                  <p style={{ marginTop: '0.5rem', fontWeight: '700' }}>
                    💡 Pro Tip: We highly recommend waiting to connect your final Excel sheet until the term gradebook is fully complete.
                  </p>
                </div>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: '750', marginBottom: '0.65rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                📥 How to Download the Excel Export from iSAMS
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '0.75rem' }}>
                Follow these exact steps in iSAMS to export your ready-to-go student database:
              </p>
              <ol style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem' }}>
                <li>Log into <strong>iSAMS</strong>.</li>
                <li>On the <strong>wizard bar</strong> on the right side top, go to <strong>Analytics & Insights</strong>.</li>
                <li>Select <strong>Create New Report</strong> and choose <strong>Edukit Export</strong>.</li>
                <li>Once it opens, select your name in the <strong>Select User</strong> dropdown.</li>
                <li>This will compile and download an Excel spreadsheet containing all the classes assigned to you, along with their active student rosters and demographic data.</li>
              </ol>
              <div 
                style={{ 
                  background: 'rgba(59, 130, 246, 0.05)', 
                  borderLeft: '4px solid #3b82f6', 
                  padding: '0.75rem 1rem', 
                  borderRadius: '0 8px 8px 0', 
                  marginBottom: '1.75rem',
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
                  lineHeight: '1.5'
                }}
              >
                💡 <strong>Pro Tip:</strong> We highly recommend downloading this file after completing your term gradebook, ensuring all grades are published, and resyncing/saving in the <strong>Online Assessment System (OAS)</strong> first.
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Excel Layout Guidelines</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                The Excel gradebook downloaded directly from iSAMS is <strong style={{ fontWeight: '800' }}>completely ready-to-go</strong> out-of-the-box. The portal and the iSAMS templates are designed to match perfectly. You <strong style={{ fontWeight: '800' }}>never</strong> need to rename headers. The parser automatically maps columns:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '1rem' }}>
                  <strong style={{ fontSize: '0.82rem', color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem' }}>Core Connected Columns</strong>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <li><code style={{ color: '#3b82f6' }}>Student Name</code>: Roster full name (e.g. John Doe)</li>
                    <li><code style={{ color: '#3b82f6' }}>Class</code>: Class tag (e.g. Grade 9A, G10-B)</li>
                    <li><code style={{ color: '#3b82f6' }}>IB Grade</code>: Final MYP academic score (1 to 7)</li>
                    <li><code style={{ color: '#3b82f6' }}>MEG</code>: Minimum Expected Grade targets (1 to 7)</li>
                  </ul>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '1rem' }}>
                  <strong style={{ fontSize: '0.82rem', color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem' }}>Academic Details (Highly Recommended)</strong>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <li><code style={{ color: 'var(--primary)' }}>Crit A</code> to <code style={{ color: 'var(--primary)' }}>Crit D</code>: Core MYP criteria marks (1 to 8)</li>
                    <li><code style={{ color: 'var(--primary)' }}>ATL Progress</code>: Approaches to learning level (Excellent, Good, etc.)</li>
                    <li><code style={{ color: 'var(--primary)' }}>Gender</code>: Student gender (Male, Female)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* GUIDE: COMMENT ASSISTANT */}
          {activeGuideTab === 'comments' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <Sparkles size={20} /> Comment Generator & Bank
              </h2>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                The Comment Assistant automatically constructs a coherent, four-sentence MYP report card summary card based on active ATL targets and criterion benchmarks.
              </p>

              <div 
                style={{ 
                  background: 'rgba(245,158,11,0.05)', 
                  borderLeft: '4px solid #fbbf24', 
                  padding: '1rem', 
                  borderRadius: '0 8px 8px 0', 
                  marginBottom: '1.5rem',
                  fontSize: '0.85rem' 
                }}
              >
                <div style={{ fontWeight: '700', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.25rem' }}>
                  <AlertCircle size={15} /> ⚠️ Low Performance & Criteria Overrides (Grades 1 & 2)
                </div>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.45' }}>
                  For pupils achieving a final IB Grade of <strong style={{ fontWeight: '800' }}>1</strong> or <strong style={{ fontWeight: '800' }}>2</strong>, or having <strong style={{ fontWeight: '800' }}>any</strong> individual criterion A, B, C, or D scores of <strong style={{ fontWeight: '800' }}>1</strong> or <strong style={{ fontWeight: '800' }}>2</strong>, the system automatically intercepts generation. Rather than printing boilerplate template remarks, it alerts the teacher that a <strong style={{ fontWeight: '800' }}>manual draft</strong> is required, offering a descriptive prompt specifying which grade metrics need attention.
                </p>
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Sentence Construction Structure</h3>
              <ol style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <li>
                  <strong style={{ color: 'var(--text-main)' }}>Sentence 1 (Academic Status):</strong> Resolves the student's final IB Grade score, summarizing their overall concept-driven understanding.
                </li>
                <li>
                  <strong style={{ color: 'var(--text-main)' }}>Sentence 2 (ATL Focus):</strong> Summarizes progress in the selected Approaches to Learning (ATL) focus category (e.g. Communication, Self-Management).
                </li>
                <li>
                  <strong style={{ color: 'var(--text-main)' }}>Sentence 3 (Core Strength):</strong> Evaluates A-D performance to isolate their highest criterion score and explains their operational strength.
                </li>
                <li>
                  <strong style={{ color: 'var(--text-main)' }}>Sentence 4 (Actionable Target):</strong> Targets their lowest criterion score to deliver constructive instructions for future enrichment.
                </li>
              </ol>
            </div>
          )}

          {/* GUIDE: DATA ANALYTICS */}
          {activeGuideTab === 'analysis' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
                <BarChart3 size={20} /> Data Analytics & Ratings
              </h2>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                The Analytics Dashboard evaluates classes from two independent dimensions: <strong style={{ fontWeight: '800' }}>Attainment Analysis</strong> and <strong style={{ fontWeight: '800' }}>Target Progress Analysis</strong>. Toggle tabs at the top of the analytics page to dynamically recalculate benchmarks.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#10b981', display: 'block', marginBottom: '0.5rem' }}>
                    Attainment Perspective (KHDA)
                  </span>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    Focuses on final IB Grades achieved against official KHDA/DSIB criteria:
                  </p>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <li><strong>Outstanding:</strong> {'>='} 75% of cohort at Grade 5-7 AND 75% at Grade 4-7</li>
                    <li><strong>Very Good:</strong> {'>='} 61% at Grade 5-7 AND 75% at Grade 4-7</li>
                    <li><strong>Good:</strong> {'>='} 50% at Grade 5-7 AND 75% at Grade 4-7</li>
                    <li><strong>Acceptable:</strong> {'>='} 75% at Grade 4-7</li>
                  </ul>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#3b82f6', display: 'block', marginBottom: '0.5rem' }}>
                    Target Progress Perspective
                  </span>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    Evaluates actual grades against student targets (MEG Expected Benchmarks):
                  </p>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <li><strong>Outstanding:</strong> {'>='} 85% meet/exceed target</li>
                    <li><strong>Very Good:</strong> {'>='} 75% meet/exceed target</li>
                    <li><strong>Good:</strong> {'>='} 65% meet/exceed target</li>
                    <li><strong>Acceptable:</strong> {'>='} 50% meet/exceed target</li>
                  </ul>
                </div>
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Pedagogical Insights</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6' }}>
                Located on the Target Progress view, the insights section automatically aggregates student performance trends to generate cohort actions. It highlights <strong style={{ fontWeight: '800' }}>Enrichment Candidates</strong> (students exceeding target by 3+ levels) and <strong style={{ fontWeight: '800' }}>Urgent Interventions</strong> (students falling behind targets by 3+ levels) to guide differentiate instruction.
              </p>
            </div>
          )}

          {/* GUIDE: SEATING & GROUPS */}
          {activeGuideTab === 'planner' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f43f5e' }}>
                <Users size={20} /> Seating Planner & Group Maker
              </h2>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                Plan classroom layouts and assemble learning cohorts with zero manual drawing or alignment hassles.
              </p>

              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Seating Charts</h3>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.5rem' }}>
                <li><strong>Drag and Drop Desks:</strong> Add individual student desks, drag them anywhere on a grid layout, and click to remove. Supports round 6-seat tables, round pods, doors, and boards.</li>
                <li><strong>Auto-generation templates:</strong> Generate layouts instantly in Rows, Clusters (pod arrangements), or circular configurations.</li>
                <li><strong>Student roster snap:</strong> Auto-assign connected class rosters to the desk layout with a single click. (Emirati, EAL, MAGT, and Inclusion tags will highlight in seat details).</li>
              </ul>

              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Group Maker & Picker</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6' }}>
                The Group Maker balances gender distributions, mixes achievement levels, and groups students to ensure collaboration. The Student Picker contains a physical HTML5 wheel spinner to select random students, featuring a pointer tick and falling celebration confetti.
              </p>
            </div>
          )}

          {/* GUIDE: COMMON MISTAKES */}
          {activeGuideTab === 'mistakes' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b' }}>
                <AlertCircle size={20} /> Common Mistakes & Troubleshooting
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Mistake 1 */}
                <div style={{ 
                  background: 'rgba(245, 158, 11, 0.03)', 
                  border: '1px solid rgba(245, 158, 11, 0.15)', 
                  borderRadius: '8px', 
                  padding: '1.25rem' 
                }}>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: '800', 
                    color: '#f59e0b', 
                    background: 'rgba(245, 158, 11, 0.08)', 
                    padding: '0.15rem 0.5rem', 
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    display: 'inline-block',
                    marginBottom: '0.5rem',
                    letterSpacing: '0.04em'
                  }}>
                    Mistake 1: Static Roster Disconnect
                  </span>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: '750', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    "Why don't my students appear here in EduKit, even though they exist in iSAMS?"
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
                    <strong>The Reason:</strong> iSAMS and EduKit <strong style={{ fontWeight: '800' }}>do not connect live</strong> to protect student data privacy. You must re-download the latest roster spreadsheet from iSAMS and re-upload it inside the Dashboard database connect tab to refresh lists.
                  </p>
                </div>

                {/* Mistake 2 */}
                <div style={{ 
                  background: 'rgba(59, 130, 246, 0.03)', 
                  border: '1px solid rgba(59, 130, 246, 0.15)', 
                  borderRadius: '8px', 
                  padding: '1.25rem' 
                }}>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: '800', 
                    color: '#3b82f6', 
                    background: 'rgba(59, 130, 246, 0.08)', 
                    padding: '0.15rem 0.5rem', 
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    display: 'inline-block',
                    marginBottom: '0.5rem',
                    letterSpacing: '0.04em'
                  }}>
                    Mistake 2: Missing Criterion Grades in Exported Sheets
                  </span>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: '750', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    "I entered student criterion grades in my gradebook in iSAMS, but why are they blank in the Excel sheet?"
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
                    <strong>The Reason:</strong> The Excel exporter pulls grades directly from the central <strong style={{ fontWeight: '800' }}>OAS (Online Assessment System)</strong> database. Ensure that you <strong style={{ fontWeight: '800' }}>publish, resync, and save all criterion grade entries in OAS first</strong> before triggering the Excel download, then upload the updated sheet.
                  </p>
                </div>

                {/* Mistake 3 */}
                <div style={{ 
                  background: 'rgba(244, 63, 94, 0.03)', 
                  border: '1px solid rgba(244, 63, 94, 0.15)', 
                  borderRadius: '8px', 
                  padding: '1.25rem' 
                }}>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: '800', 
                    color: '#f43f5e', 
                    background: 'rgba(244, 63, 94, 0.08)', 
                    padding: '0.15rem 0.5rem', 
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    display: 'inline-block',
                    marginBottom: '0.5rem',
                    letterSpacing: '0.04em'
                  }}>
                    Mistake 3: Accidental File Upload Error
                  </span>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: '750', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    "I uploaded my roster Excel file, but my students are not importing or show errors. Why?"
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
                    <strong>The Reason:</strong> The portals mappings search for standard columns like `Student Name`, `Class`, `IB Grade`, and `MEG`. If you accidentally upload an incorrect file (like a lesson plan, personal calendar, or unrelated roster sheet), the parser will fail with a columns mismatch alert. Ensure you select the official ready-to-go iSAMS template.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
