import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export default function LoadingScreen({ theme, onComplete }) {
  const [ticked1, setTicked1] = useState(false);
  const [ticked2, setTicked2] = useState(false);
  const [ticked3, setTicked3] = useState(false);
  const [ticked4, setTicked4] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Tick checklist items in sequence
    const t1 = setTimeout(() => setTicked1(true), 2200);
    const t2 = setTimeout(() => setTicked2(true), 2700);
    const t3 = setTimeout(() => setTicked3(true), 3200);
    const t4 = setTimeout(() => setTicked4(true), 3700);

    // Percentage counter animation logic matching the HTML lerp
    const start = Date.now() + 1400;
    const duration = 3600;
    const milestones = [
      [0, 0], [0.3, 28], [0.55, 55], [0.78, 74], [1, 100]
    ];

    function lerp(a, b, t) { return a + (b - a) * t; }

    function getProgress(t) {
      for (let i = 1; i < milestones.length; i++) {
        if (t <= milestones[i][0]) {
          const seg = (t - milestones[i-1][0]) / (milestones[i][0] - milestones[i-1][0]);
          return lerp(milestones[i-1][1], milestones[i][1], seg);
        }
      }
      return 100;
    }

    let frameId;
    function animatePct() {
      const now = Date.now();
      const elapsed = Math.max(0, now - start);
      const t = Math.min(elapsed / duration, 1);
      const v = Math.round(getProgress(t));
      setPercentage(v);
      
      if (t < 1) {
        frameId = requestAnimationFrame(animatePct);
      } else {
        setTimeout(() => {
          setIsDone(true);
          // When exit animation finishes (700ms), call onComplete
          setTimeout(() => {
            onComplete();
          }, 700);
        }, 600);
      }
    }

    const startTimeout = setTimeout(() => {
      frameId = requestAnimationFrame(animatePct);
    }, 1400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(startTimeout);
      cancelAnimationFrame(frameId);
    };
  }, [onComplete]);

  return (
    <div className="loading-screen-wrap" style={{
      position: 'fixed',
      inset: 0,
      width: '100vw',
      height: '100vh',
      background: theme === 'dark' ? '#030712' : '#fdf8f3',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      zIndex: 99999
    }}>
      {/* ── INTERNAL STYLES TO PORT CSS CLEANLY ───────────────────────── */}
      <style>{`
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        .loading-screen-wrap {
          --red: #E10031;
          --red-soft: rgba(225,0,49,0.08);
          --red-mid: rgba(225,0,49,0.18);
          --grey: ${theme === 'dark' ? '#9ca3af' : '#6b7280'};
          --cream: ${theme === 'dark' ? '#030712' : '#fdf8f3'};
          --warm: ${theme === 'dark' ? '#080c1a' : '#f7f0e8'};
          --ink: ${theme === 'dark' ? '#f3f4f6' : '#1c1917'};
          --ink-mid: ${theme === 'dark' ? '#e5e7eb' : '#44403c'};
          --ink-muted: ${theme === 'dark' ? '#9ca3af' : '#a8a29e'};
          --line: ${theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(28,25,23,0.08)'};
          --card-bg: ${theme === 'dark' ? 'rgba(17, 24, 39, 0.85)' : '#fff'};
          --card-border: ${theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(28,25,23,0.08)'};
          --track-bg: ${theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(28,25,23,0.07)'};
          --box-border: ${theme === 'dark' ? 'rgba(255,255,255,0.15)' : '#d1d5db'};
          --wash-end: ${theme === 'dark' ? 'rgba(8, 12, 26, 0.4)' : 'rgba(247, 240, 232, 0.4)'};
        }

        /* Subtle warm grid background */
        .loading-screen-grid {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(var(--line) 1px, transparent 1px),
            linear-gradient(90deg, var(--line) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
        }

        /* Soft warm radial wash */
        .loading-screen-wash {
          position: fixed;
          inset: 0;
          background: radial-gradient(ellipse 70% 60% at 50% 50%, var(--cream) 0%, var(--wash-end) 100%);
          pointer-events: none;
          z-index: 0;
        }

        /* ── Floating task cards in background ── */
        .bg-cards {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .bg-card {
          position: absolute;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 10px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          opacity: 0;
          animation: cardFloat 6s ease-in-out infinite;
        }

        .bg-card::before {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .bg-card.done::before { background: #22c55e; }
        .bg-card.doing::before { background: #E10031; animation: dotBlink 1.2s ease-in-out infinite; }
        .bg-card.todo::before { 
          background: ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}; 
          border: 1px solid var(--box-border); 
        }

        @keyframes dotBlink {
          0%,100% { opacity: 1; } 50% { opacity: 0.3; }
        }

        .bg-card-label {
          font-size: 11px;
          color: var(--ink-mid);
          font-weight: 400;
          white-space: nowrap;
        }

        .bg-card.done .bg-card-label { text-decoration: line-through; color: var(--ink-muted); }

        /* Positioned cards */
        .bc1 { top: 14%; left: 7%;  animation-delay: 0s;    animation-duration: 7s; }
        .bc2 { top: 22%; right: 8%; animation-delay: 0.8s;  animation-duration: 8s; }
        .bc3 { top: 62%; left: 5%;  animation-delay: 1.6s;  animation-duration: 6.5s; }
        .bc4 { top: 70%; right: 6%; animation-delay: 0.4s;  animation-duration: 9s; }
        .bc5 { top: 38%; left: 3%;  animation-delay: 2s;    animation-duration: 7.5s; }
        .bc6 { top: 48%; right: 4%; animation-delay: 1.2s;  animation-duration: 6s; }

        @keyframes cardFloat {
          0%   { opacity: 0; transform: translateY(8px); }
          15%  { opacity: 0.55; }
          80%  { opacity: 0.55; transform: translateY(-4px); }
          100% { opacity: 0; transform: translateY(-10px); }
        }

        /* Mini bar charts floating */
        .bg-chart {
          position: absolute;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 10px;
          padding: 10px 14px;
          display: flex;
          align-items: flex-end;
          gap: 4px;
          opacity: 0;
          animation: cardFloat 8s ease-in-out infinite;
        }

        .bg-bar {
          width: 8px;
          border-radius: 2px 2px 0 0;
          background: #E10031;
          opacity: 0.5;
        }
        .bg-bar.grey { background: var(--grey); opacity: 0.3; }

        .bch1 { top: 80%; left: 18%; animation-delay: 1s; }
        .bch2 { top: 10%; left: 40%; animation-delay: 2.5s; animation-duration: 9s; }

        /* ── Main loader ── */
        .loader {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 30px;
          opacity: 0;
          animation: fadeUp 0.9s cubic-bezier(0.22,1,0.36,1) forwards 0.3s;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Logo area */
        .logo-wrap {
          position: relative;
          width: 76px;
          height: 76px;
          margin-top: -30px;
          margin-bottom: -5px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Soft halo behind logo */
        .logo-halo {
          position: absolute;
          inset: -20px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(225,0,49,0.07) 0%, transparent 70%);
          animation: haloBreath 3.5s ease-in-out infinite;
        }

        @keyframes haloBreath {
          0%,100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.15); opacity: 1; }
        }

        /* Dashed orbit ring — like a task progress ring */
        .orbit-ring {
          position: absolute;
          inset: -18px;
          border-radius: 50%;
          border: 1.5px dashed rgba(225,0,49,0.2);
          animation: orbitSpin 20s linear infinite;
        }

        .orbit-ring::before {
          content: '';
          position: absolute;
          top: 50%;
          left: -5px;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          background: var(--card-bg);
          border: 2px solid #E10031;
          border-radius: 50%;
          box-shadow: 0 1px 6px rgba(225,0,49,0.25);
        }

        @keyframes orbitSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* SVG logo */
        .logo-svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 4px 16px rgba(225,0,49,0.12));
          animation: logoSettle 0.9s cubic-bezier(0.22,1,0.36,1) forwards 0.4s;
          opacity: 0;
          transform: scale(0.88);
        }

        @keyframes logoSettle {
          to { opacity: 1; transform: scale(1); }
        }

        .logo-svg circle {
          fill: none;
          stroke-width: 14px;
        }
        .logo-svg circle.r { stroke: #E10031; stroke-dasharray: 565; stroke-dashoffset: 565; }
        .logo-svg circle.g { stroke: var(--grey); stroke-dasharray: 565; stroke-dashoffset: 565; }

        .logo-svg circle:nth-child(1) { animation: drawRing 1.6s cubic-bezier(0.77,0,0.175,1) forwards 0.5s; }
        .logo-svg circle:nth-child(2) { animation: drawRing 1.6s cubic-bezier(0.77,0,0.175,1) forwards 0.75s; }
        .logo-svg circle:nth-child(3) { animation: drawRing 1.6s cubic-bezier(0.77,0,0.175,1) forwards 1s; }
        .logo-svg circle:nth-child(4) { animation: drawRing 1.6s cubic-bezier(0.77,0,0.175,1) forwards 1.25s; }

        @keyframes drawRing {
          to { stroke-dashoffset: 0; }
        }

        /* ── Text content ── */
        .content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          margin-top: 45px; /* Safely push the text block lower, away from the logo's bottom ring */
        }

        .headline {
          font-family: 'DM Serif Display', serif;
          font-size: 26px;
          color: var(--ink);
          letter-spacing: -0.3px;
          text-align: center;
          line-height: 1.2;
        }

        .headline span {
          color: #E10031;
        }

        .subline {
          font-size: 13px;
          color: var(--ink-muted);
          font-weight: 300;
          letter-spacing: 0.2px;
          text-align: center;
        }

        /* ── Task checklist animation ── */
        .checklist {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 260px;
          margin-top: 8px;
        }

        .check-item {
          display: flex;
          align-items: center;
          gap: 10px;
          opacity: 0;
          transform: translateX(-8px);
          transition: all 0.4s ease;
        }

        .check-item.visible {
          opacity: 1;
          transform: translateX(0);
        }

        .check-box {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1.5px solid var(--box-border);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: all 0.3s ease;
        }

        .check-item.ticked .check-box {
          background: #E10031;
          border-color: #E10031;
        }

        .check-tick {
          width: 8px;
          height: 5px;
          border-left: 1.5px solid #fff;
          border-bottom: 1.5px solid #fff;
          transform: rotate(-45deg) translateY(-1px);
          opacity: 0;
          transition: opacity 0.2s ease 0.15s;
        }

        .check-item.ticked .check-tick { opacity: 1; }

        .check-label {
          font-size: 12.5px;
          color: var(--ink-mid);
          font-weight: 400;
          transition: all 0.3s ease;
        }
        .check-item.ticked .check-label {
          color: var(--ink-muted);
          text-decoration: line-through;
        }

        /* ── Progress bar ── */
        .progress-wrap {
          width: 260px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 4px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .progress-label {
          font-size: 11px;
          color: var(--ink-muted);
          letter-spacing: 0.5px;
        }

        .progress-pct {
          font-size: 11px;
          color: #E10031;
          font-weight: 500;
          font-variant-numeric: tabular-nums;
        }

        .progress-track {
          width: 100%;
          height: 3px;
          background: var(--track-bg);
          border-radius: 99px;
          overflow: hidden;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          width: 0%;
          background: #E10031;
          border-radius: 99px;
          animation: pfill 3.6s cubic-bezier(0.4,0,0.2,1) forwards 1.4s;
          position: relative;
        }

        .progress-fill::after {
          content: '';
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 24px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5));
          border-radius: 99px;
        }

        @keyframes pfill {
          0%   { width: 0%; }
          30%  { width: 28%; }
          55%  { width: 55%; }
          78%  { width: 74%; }
          100% { width: 100%; }
        }

        /* ── Bottom tag ── */
        .tagline {
          font-size: 14px;
          color: var(--ink-muted);
          letter-spacing: 0.4px;
          opacity: 0;
          white-space: nowrap;
          animation: fadeUp 0.6s ease forwards 2s;
          margin-top: 14px;
          text-align: center;
        }

        .tagline strong {
          color: #E10031;
          font-weight: 700;
        }

        /* Exit */
        .loader.done {
          animation: exitUp 0.7s cubic-bezier(0.4,0,1,1) forwards;
        }
        @keyframes exitUp {
          to { opacity: 0; transform: translateY(-14px); }
        }
      `}</style>

      {/* Floating background task cards */}
      <div className="bg-cards">
        <div className="bg-card done bc1"><span className="bg-card-label">Attendance report — Year 9</span></div>
        <div className="bg-card doing bc2"><span className="bg-card-label">Syncing pupil data…</span></div>
        <div className="bg-card todo bc3"><span className="bg-card-label">Progress review — Term 2</span></div>
        <div className="bg-card done bc4"><span className="bg-card-label">Parent letters exported</span></div>
        <div className="bg-card todo bc5"><span className="bg-card-label">SEN tracker — update</span></div>
        <div className="bg-card doing bc6"><span className="bg-card-label">Loading class groups…</span></div>

        {/* Mini bar charts */}
        <div className="bg-chart bch1">
          <div className="bg-bar" style={{ height: '18px' }}></div>
          <div className="bg-bar grey" style={{ height: '28px' }}></div>
          <div className="bg-bar" style={{ height: '12px' }}></div>
          <div className="bg-bar grey" style={{ height: '22px' }}></div>
          <div className="bg-bar" style={{ height: '32px' }}></div>
        </div>
        <div className="bg-chart bch2">
          <div className="bg-bar grey" style={{ height: '20px' }}></div>
          <div className="bg-bar" style={{ height: '14px' }}></div>
          <div className="bg-bar grey" style={{ height: '30px' }}></div>
          <div className="bg-bar" style={{ height: '24px' }}></div>
        </div>
      </div>

      <div className={`loader ${isDone ? 'done' : ''}`} id="loader">
        {/* Logo */}
        <div className="logo-wrap">
          <div className="logo-halo"></div>
          <div className="orbit-ring"></div>
          <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" style={{ overflow: 'visible', isolation: 'isolate' }}>
            <circle className="r" cx="100" cy="-8"  r="90" />
            <circle className="r" cx="100" cy="208" r="90" />
            <circle className="r" cx="-8"  cy="100" r="90" />
            <circle className="g" cx="208" cy="100" r="90" />
          </svg>
        </div>

        {/* Title */}
        <div className="content">
          <p className="headline">Getting your<br />dashboard <span>ready</span></p>
          <p className="subline">Saving you time, one task at a time</p>
        </div>

        {/* Checklist */}
        <div className="checklist" id="checklist">
          <div className={`check-item visible ${ticked1 ? 'ticked' : ''}`} style={{ animationDelay: '1.6s' }}>
            <div className="check-box"><div className="check-tick"></div></div>
            <span className="check-label">Fetching your class data</span>
          </div>
          <div className={`check-item visible ${ticked2 ? 'ticked' : ''}`} style={{ animationDelay: '2.1s' }}>
            <div className="check-box"><div className="check-tick"></div></div>
            <span className="check-label">Loading attendance records</span>
          </div>
          <div className={`check-item visible ${ticked3 ? 'ticked' : ''}`} style={{ animationDelay: '2.6s' }}>
            <div className="check-box"><div className="check-tick"></div></div>
            <span className="check-label">Preparing reports</span>
          </div>
          <div className={`check-item visible ${ticked4 ? 'ticked' : ''}`} style={{ animationDelay: '3.1s' }}>
            <div className="check-box"><div className="check-tick"></div></div>
            <span className="check-label">Everything's in order</span>
          </div>
        </div>

        {/* Progress */}
        <div className="progress-wrap">
          <div className="progress-header">
            <span className="progress-label">Setting up your workspace</span>
            <span className="progress-pct" id="pct">{percentage}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" id="pfill"></div>
          </div>
        </div>

        {/* Tagline moved here below progress bar */}
        <p className="tagline">Less admin. More <strong>teaching.</strong></p>
      </div>
    </div>
  );
}
