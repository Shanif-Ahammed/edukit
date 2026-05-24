import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Sparkles, Send, Trash2, 
  HelpCircle, AlertTriangle, Layers, Users, BookOpen
} from 'lucide-react';

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

const SYSTEM_INSTRUCTION = `You are the SISD EduKit AI Assistant, a helpful AI guide built directly into the Swiss International Scientific School in Dubai (SISD) Teacher Portal.
Your primary role is to help teachers with any questions they have about using the EduKit web application.

Here is all the technical and operational context about the EduKit application:
1. GENERAL ARCHITECTURE:
- The website is completely offline and client-side to satisfy Dubai DSIB data security and pupil protection guidelines. No rosters or student grades are sent to any cloud server (except when querying you, the AI, which uses an anonymous proxy/API key).
- Local storage keys (e.g. 'edukit_mis_...') are used to keep rosters cached in the teacher's browser so they don't have to re-upload files every time.
- All student data imports must use Excel (.xlsx) files.

2. FEATURES & MODULES:
- **Dashboard**: The portal landing page. Allows connecting a class database (Excel files from iSAMS) or loading the SISD Demo Class to test the tools.
- **Comment Gen (Comment Generator)**: 
  - Automatically generates rich, personalized MYP report card comments based on student grades and ATL (Approaches to Learning) progress levels.
  - Teachers select a subject, an active class, and an ATL focus (e.g. Communication, Research, Thinking, Social, Self-Management).
  - *Special Check (Missing Grades Alert)*: If a student is missing any Criterion grades (Crit A, B, C, or D), the comment generator locks editability, disables copying/regeneration, marks them as '⚠️ Missing Grades', and prompts: "⚠️ Criterion grades are missing. Comment cannot be generated." This is because comments rely on complete data. The alert also explains that missing grades in downloads are usually due to them not being published and resynced in the Online Assessment System (OAS) on iSAMS first.
  - *Manual Draft Interception*: If a student achieves a final grade of 1 or 2, or has individual Criterion marks of 1 or 2, the system intercepts auto-generation, labels the row '⚠️ Manual Draft', hides copy/regenerate actions, and disables manual text box edits.
- **Seating Chart (Seating Plan Studio)**: 
  - An interactive A4 landscape canvas drag-and-drop workspace.
  - Allows dragging single desks, square 4-seat tables, round 6-seat tables, entrance doors, and smartboards to construct classroom layouts.
  - Desks support rotating left/right, and clicking "Edit Seats" opens a seat assignment modal with checkboxes to label tags (Emirati, EAL, MAGT, Inclusion, Boarding).
  - Offers a smart auto-assign seating algorithm (automatically placing student seats logically based on their tags or randomly).
  - Has print style overrides to fit the seating plan cleanly onto a physical A4 landscape sheet.
  - *Dropdown Suggestion Correction*: When no roster is connected, the autocomplete search dropdown for seat assignments is blank to avoid confusing teachers with mock data, but teachers can still type any custom names manually.
- **Cohort Analysis (Data Analysis)**: 
  - Dynamic analytics dashboard for connected rosters.
  - Shows visual statistics (class gender distribution, percentage of Emirati students, EAL and Inclusion ratios).
  - Computes exact Criterion averages (Crit A, B, C, D) and lists top/bottom achievers to help teachers plan targeted intervention.
- **Gradebook List (ATL Tracker)**: 
  - A compact list view of the active class roster displaying student grades (Crit A-D), ATL Progress, and educational tags.
  - Extremely useful as a quick reference sheet.
- **Group Maker & Picker**:
  - Combined into a single, unified tab with two sub-sections.
  - *Group Generator*: Generates visual student groupings (e.g. pairs, groups of 3/4/5, or custom numbers of teams) while maintaining demographic balance (balancing gender, EAL, and inclusion status automatically). Note: the "Print Teams" button was removed from the toolbar to keep layouts clean.
  - *Student Picker Wheel*: A premium, high-DPI HTML5 canvas spin wheel for picking random students. Includes dynamic HSL color wheel sectors, tactile drag/friction physics, pointer tick wiggles on sector boundary crossings, visual overlay modal celebration animations, and falling canvas confetti particles. Features options to "Eliminate Picked Students", instant random pick shortcut, and absent list exclude checkboxes.
- **Teacher Toolkit**: 
  - A comprehensive toolkit and reference containing two major sections:
    - *Assessment Guidelines (Academic Framework)*: Features the official school grading rules, including MYP boundaries (Grade 7 = 28-32, Grade 6 = 24-27, Grade 5 = 19-23, Grade 4 = 15-18, Grade 3 = 10-14, Grade 2 = 6-9, Grade 1 = 1-5), DP boundaries, CP/BTEC grading, and OAS resynchronization steps. Includes interactive converters for Arabic MYP/DP to Ministry of Education (MOE) percentages and MYP CPT boundaries. Includes a Quality Assurance checklist filterable by role.
    - *EduKit Portal Help (User Guides)*: Step-by-step guides for roster sheets, comment generators, seating plannings, data analytics, and troubleshooting.
  - Features a dedicated "Common Mistakes & Troubleshooting" section detailing:
    - Rule: The Excel file downloaded directly from iSAMS is **completely ready-to-go** out-of-the-box. The creator of this portal is the same person who created the iSAMS data/report template, meaning all column names, sheets, and headers are perfectly aligned without any decorative top banners. Teachers **never** have to rename headers or format the Excel files themselves.
    - Mistake 1 (Static Roster Disconnect): Roster changes in iSAMS don't sync live; teachers must re-download the latest ready-to-go roster directly from iSAMS and re-upload it.
    - Mistake 2 (OAS Resync Blanks): Blanks in Excel downloads are because grades were entered in gradebooks but not published, resynced, and saved in the Online Assessment System (OAS) first.
    - Mistake 3 (Wrong File Upload): Uploading a completely unrelated file (e.g. personal lesson plans) instead of the official iSAMS sheet will trigger a header mismatch error.
3. TERMINOLOGY:
- We have standardized all MIS references in user strings and documentation to **iSAMS**.
- Central grade sync refers to **OAS (Online Assessment System)**.

4. OFFICIAL SISD ASSESSMENT TIMELINES & GRADE CALCULATIONS (from the 2025-2026 Academic Framework):
- **OAS Gradebook Cycle Dates (OAS Timeframes / Page 13 Table)**:
  - **Assessment Point 3 (AP3 / Term 1 Reports)**: OAS opens on **16/01/2026 (16th January 2026 - provisional)** and closes on **24/01/2026 (24th January 2026)**.
  - **Assessment Point 4 (AP4 / G12 Mocks)**: OAS opens on **09/05/2026 (9th May 2026)** and closes on **15/05/2026 (15th May 2026)**.
  - **Assessment Point 5 (AP5 / End of Year Reports)**: OAS opens on **15/06/2026 (15th June 2026)** (assumes teachers have correctly completed gradebooks) and closes on **19/06/2026 (19th June 2026)**.
- **iSAMS Gradebook Cycles (Cycles Open/Close Dates)**:
  - **Assessment Point 1 (Targets)**: Automatically inputted. Closes same time as AP2.
  - **AP2**: Open 10/11/2025 - Close 17/11/2025
  - **AP3**: Open 09/01/2026 - Close 23/01/2026
  - **AP4 G12**: Open 08/05/2026 - Close 15/05/2026
  - **AP5 (Full written report G11)**: Open 11/05/2026 - Close 04/06/2026
- **IB MYP Grade Boundary Conversions (Page 2 & 6 Table)**:
  - Criterion Points Total (CPT out of 32 / sum of Criteria A, B, C, D) convert to final IB MYP Grades (1-7) using:
    - 28-32 -> Grade 7
    - 24-27 -> Grade 6
    - 19-23 -> Grade 5 (Exceeds KHDA Expectations)
    - 15-18 -> Grade 4 (Meets KHDA Expectations)
    - 10-14 -> Grade 3 (Intervention required to reach Grade 4)
    - 6-9 -> Grade 2
    - 1-5 -> Grade 1
- **Arabic to Ministry of Education (MOE) Percentage Scales (Page 16 & 17 Table)**:
  - Arabic MYP points (/32) map to Minimum MOE grade percentage:
    - 12 -> 50% | 13 -> 52% | 14 -> 55% | 15 -> 58% | 16 -> 60% | 17 -> 63% | 18 -> 66% | 19 -> 69% | 20 -> 72% | 21 -> 74% | 22 -> 76% | 23 -> 80% | 24 -> 82% | 25 -> 84% | 26 -> 86% | 27 -> 88% | 28 -> 90% | 29 -> 92% | 30 -> 94% | 31 -> 97% | 32 -> 100%. (New students default to CPT 15).
  - Arabic DP Grade (1-7) maps to MOE Grade:
    - 1 -> under 40% (Fail) | 2 -> 40-49% | 3 -> 50-59% | 4 -> 60-69% | 5 -> 70-79% | 6 -> 80-89% | 7 -> 90-100%.
- **Other MOE mandatory subjects (Islamic, Social, MSC) (Page 18 & 19)**:
  - Term 1: 35% weight (10% formative, 25% summative end of term exam)
  - Term 2: 30% weight (10% formative, 20% summative)
  - Term 3: 35% weight (10% formative, 25% project-based)
  - Pass marks: G6-8 is 50% | G9 is 60%.

INSTRUCTIONS:
- Answer questions in a warm, encouraging, and extremely clear manner.
- Keep answers concise and structured. Use bullet points or bold text to make answers highly scannable.
- Reassure teachers that they **do not need to edit, rename, or format** their iSAMS Excel files. The file downloaded directly from iSAMS is completely ready-to-go.
- If asked about school assessment framework dates, grade boundaries, MOE percentages, or Quality Assurance responsibilities, answer accurately based on the detailed framework guidelines above. Explicitly state the exact dates (e.g. OAS for AP5 opens on June 15th, 2026 and closes on June 19th, 2026).
- If a teacher reports missing student grades in their downloaded Excel sheets, guide them on publishing, resyncing, and saving in iSAMS OAS.
- Under all circumstances, remain professional and focus only on SISD EduKit Teacher Portal and School Assessment Framework questions.`;

const SUGGESTED_PROMPTS = [
  {
    icon: <AlertTriangle size={15} style={{ color: 'var(--warning)' }} />,
    label: "What are the Common Mistakes?",
    text: "What are the most common integration mistakes or troubleshooting issues when using the EduKit Teacher Portal?"
  },
  {
    icon: <AlertTriangle size={15} style={{ color: 'var(--warning)' }} />,
    label: "Why are my students' grades showing up blank?",
    text: "I've entered all my grades in the gradebook, but when I open the Excel file in the portal, the grade columns are empty. How do I get them to appear?"
  },
  {
    icon: <Users size={15} style={{ color: 'var(--accent)' }} />,
    label: "A new student is missing from my class list",
    text: "I've recently had a new student join my class, but they aren't appearing in my seating chart or comments list. How can I refresh the class list to show them?"
  },
  {
    icon: <HelpCircle size={15} style={{ color: 'var(--primary)' }} />,
    label: "Do I need to manually format the iSAMS Excel file?",
    text: "Do I need to rename column headers, remove merged banners, or format the Excel sheet after downloading it from iSAMS? Or is it completely ready-to-go out-of-the-box?"
  },
  {
    icon: <Layers size={15} style={{ color: '#10b981' }} />,
    label: "What happens if I upload the wrong file?",
    text: "Since the iSAMS Excel is ready-to-go, what should I do if I accidentally upload an incorrect file (like a lesson plan or a different report) by mistake?"
  }
];

export default function AiAssistant() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('edukit_ai_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load chat history:", e);
      }
    }
    return [
      {
        sender: 'ai',
        text: "Hello! I am your **EduKit AI Assistant**. Ask me anything about using the SISD Teacher Portal modules (Dashboard, Comment Gen, Seating Chart, Cohort Analysis, or Group Maker & Picker), or troubleshooting common import issues!"
      }
    ];
  });

  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem('edukit_gemini_api_key') || '');
  const [apiKeyInput, setApiKeyInput] = useState('');

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    if (customApiKey) {
      localStorage.removeItem('edukit_gemini_api_key');
      setCustomApiKey('');
      setApiKeyInput('');
      alert("Personal API Key cleared successfully!");
    } else {
      const key = apiKeyInput.trim();
      if (!key) {
        alert("Please enter a valid Gemini API Key first.");
        return;
      }
      localStorage.setItem('edukit_gemini_api_key', key);
      setCustomApiKey(key);
      setApiKeyInput('');
      alert("Personal API Key saved securely in browser cache!");
    }
  };

  const chatEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('edukit_ai_history', JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend) => {
    const queryText = textToSend.trim();
    if (!queryText) return;

    // Append user message
    const userMessage = { sender: 'user', text: queryText };
    setMessages(prev => [...prev, userMessage]);
    setInputVal('');
    setLoading(true);
    setErrorMsg('');

    try {
      // Build conversational payload with history context
      const chatHistoryText = messages
        .map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
        .join('\n');
      
      const payloadPrompt = `${SYSTEM_INSTRUCTION}\n\nChat History:\n${chatHistoryText}\nUser: ${queryText}\nAssistant:`;

      let response;
      let data;

      try {
        // 1. First, attempt to query the secure serverless backend proxy
        let vercelApiUrl = import.meta.env.VITE_VERCEL_API_URL || '';
        if (vercelApiUrl && !vercelApiUrl.startsWith('http://') && !vercelApiUrl.startsWith('https://')) {
          vercelApiUrl = `https://${vercelApiUrl}`;
        }
        const proxyEndpoint = vercelApiUrl ? `${vercelApiUrl.replace(/\/$/, '')}/api/gemini` : '/api/gemini';

        response = await fetch(proxyEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ prompt: payloadPrompt })
        });

        if (response.status === 404) {
          throw new Error("Local environment: Serverless API proxy route not found.");
        }

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || `Proxy returned ${response.status}`);
        }

        data = await response.json();
      } catch (proxyErr) {
        console.warn("Secure proxy unavailable. Details:", proxyErr.message);

        // If the user has explicitly configured VITE_VERCEL_API_URL, do not silently swallow the error.
        // Instead, raise a proxy error so we can help the user debug why their Vercel serverless function is failing!
        if (import.meta.env.VITE_VERCEL_API_URL) {
          throw new Error(`PROXY_ERROR: ${proxyErr.message}`);
        }

        // 2. Fallback: Direct client-side fetch (requires personal API Key on GitHub Pages)
        if (!customApiKey) {
          throw new Error("API_KEY_REQUIRED");
        }

        response = await fetch(GEMINI_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': customApiKey
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: payloadPrompt
                  }
                ]
              }
            ]
          })
        });

        if (!response.ok) {
          throw new Error(`Gemini API returned status ${response.status}`);
        }

        data = await response.json();
      }
      
      // Parse content from Gemini API response format
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, but I received an empty response. Please try again.";

      setMessages(prev => [...prev, { sender: 'ai', text: generatedText }]);
    } catch (err) {
      console.error("AI Assistant Error:", err);
      if (err.message === "API_KEY_REQUIRED") {
        setErrorMsg("API Key Required");
        setMessages(prev => [
          ...prev, 
          { 
            sender: 'ai', 
            text: "⚠️ **Gemini API Key Required**: To secure pupil data and run the AI assistant on public servers (like GitHub Pages), you must enter your personal Gemini API Key. Please enter your key in the **GitHub Pages / API Key** field in the left sidebar, click **Save**, and try again!" 
          }
        ]);
      } else if (err.message.startsWith("PROXY_ERROR:")) {
        const errorDetail = err.message.replace("PROXY_ERROR: ", "");
        setErrorMsg("Proxy Error");
        setMessages(prev => [
          ...prev, 
          { 
            sender: 'ai', 
            text: `⚠️ **Secure Vercel Proxy Error**: The assistant failed to get a response from your Vercel deployment.\n\n**Error Details:** \`${errorDetail}\`\n\n**Common Solutions:**\n1. Make sure you added \`GEMINI_API_KEY\` to your **Environment Variables** in the Vercel Project dashboard.\n2. Ensure your Vercel deployment succeeded and is active.\n3. Make sure Vercel allows CORS requests from your GitHub Pages origin.` 
          }
        ]);
      } else {
        setErrorMsg("Failed to get response from Gemini. Please verify your connection.");
        setMessages(prev => [
          ...prev, 
          { 
            sender: 'ai', 
            text: `⚠️ **Connection Error**: I could not reach the serverless proxy or your personal Gemini session.\n\n**Details:** ${err.message || 'Unknown network error'}\n\nPlease check your internet connection or API settings.` 
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear your AI Assistant chat history?")) {
      const initial = [
        {
          sender: 'ai',
          text: "Chat cleared! Ask me anything about using the SISD Teacher Portal modules or troubleshooting common import issues!"
        }
      ];
      setMessages(initial);
      localStorage.removeItem('edukit_ai_history');
    }
  };

  const parseInlineMarkdown = (text) => {
    return text
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Inline Code
      .replace(/\`(.*?)\`/g, '<code style="background: rgba(0,0,0,0.15); padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 0.85em;">$1</code>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  };

  // Convert markdown-like text to basic HTML safely
  const renderMessageText = (text) => {
    const lines = text.split('\n');
    let insideCodeBlock = false;
    let codeContent = [];
    let htmlLines = [];
    let insideList = false;

    for (let line of lines) {
      // Check code block markers
      if (line.trim().startsWith('```')) {
        if (insideCodeBlock) {
          // Close block
          htmlLines.push(`<pre style="background: rgba(0,0,0,0.25); padding: 0.75rem; border-radius: 6px; font-family: monospace; font-size: 0.8rem; overflow-x: auto; white-space: pre-wrap; margin: 0.5rem 0;">${codeContent.join('\n')}</pre>`);
          codeContent = [];
          insideCodeBlock = false;
        } else {
          insideCodeBlock = true;
        }
        continue;
      }

      if (insideCodeBlock) {
        codeContent.push(line);
        continue;
      }

      // Check lists
      const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ');
      if (isBullet) {
        if (!insideList) {
          htmlLines.push('<ul style="margin: 0.5rem 0; padding-left: 1.5rem; list-style-type: disc;">');
          insideList = true;
        }
        const bulletText = line.trim().substring(2);
        htmlLines.push(`<li style="margin-bottom: 0.25rem;">${parseInlineMarkdown(bulletText)}</li>`);
        continue;
      } else {
        if (insideList) {
          htmlLines.push('</ul>');
          insideList = false;
        }
      }

      // Check headers
      if (line.trim().startsWith('### ')) {
        htmlLines.push(`<h4 style="font-size: 1rem; font-weight: 800; margin: 0.85rem 0 0.4rem 0; color: var(--primary);">${parseInlineMarkdown(line.trim().substring(4))}</h4>`);
        continue;
      }
      if (line.trim().startsWith('## ')) {
        htmlLines.push(`<h3 style="font-size: 1.15rem; font-weight: 800; margin: 1rem 0 0.5rem 0; color: var(--primary);">${parseInlineMarkdown(line.trim().substring(3))}</h3>`);
        continue;
      }
      if (line.trim().startsWith('# ')) {
        htmlLines.push(`<h2 style="font-size: 1.3rem; font-weight: 850; margin: 1.2rem 0 0.6rem 0; color: var(--primary);">${parseInlineMarkdown(line.trim().substring(2))}</h2>`);
        continue;
      }

      // Regular line
      if (line.trim() === '') {
        htmlLines.push('<div style="height: 0.5rem;"></div>');
      } else {
        htmlLines.push(`<p style="margin: 0.4rem 0; line-height: 1.5;">${parseInlineMarkdown(line)}</p>`);
      }
    }

    if (insideList) {
      htmlLines.push('</ul>');
    }

    return <div dangerouslySetInnerHTML={{ __html: htmlLines.join('') }} />;
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem', minHeight: 'calc(100vh - 180px)', display: 'grid', gridTemplateColumns: '1fr 2.2fr', gap: '2rem', borderRadius: 'var(--radius-lg)' }}>
      
      {/* ── LEFT SIDEBAR: GUIDE & SUGGESTIONS ───────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', borderRight: '1px solid var(--border-color)', paddingRight: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '850', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={24} style={{ color: 'var(--primary)' }} />
            AI Portal Guide
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Get instant solutions regarding roster imports, Criterion grades calculation, Seating Plan Studio, spin wheel controls, and iSAMS integration.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Suggested Queries
          </span>
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              className="glass-panel"
              onClick={() => handleSend(prompt.text)}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                padding: '0.85rem 1rem',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.01)',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'var(--text-main)',
                fontSize: '0.82rem',
                fontWeight: '700',
                transition: 'all 0.2s',
                lineHeight: '1.3'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.background = 'rgba(225, 0, 49, 0.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
              }}
            >
              <span style={{ marginTop: '2px', flexShrink: 0 }}>{prompt.icon}</span>
              <span>{prompt.label}</span>
            </button>
          ))}
        </div>

        {import.meta.env.VITE_VERCEL_API_URL ? (
          <div className="glass-panel" style={{ marginTop: 'auto', padding: '1.25rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.03)', borderColor: 'rgba(16, 185, 129, 0.2)', marginBottom: '0.75rem', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.05)' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: '850', color: '#10b981', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.04em' }}>
              🛡️ Secure Cloud Proxy Active
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0, fontWeight: '500' }}>
              Your inquiries are securely routed through your Vercel cloud deployment. No personal Gemini API Key is required!
            </p>
          </div>
        ) : (
          <div className="glass-panel" style={{ marginTop: 'auto', padding: '1rem', borderRadius: '10px', background: 'rgba(251, 191, 36, 0.02)', borderColor: 'rgba(251, 191, 36, 0.15)', marginBottom: '0.75rem' }}>
            <h4 style={{ fontSize: '0.78rem', fontWeight: '800', color: '#fbbf24', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              🔑 GitHub Pages / API Key
            </h4>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '0.75rem' }}>
              To use the AI securely on public sites like GitHub Pages without exposing keys, enter your personal Gemini API Key below. Stored locally in your browser cache.
            </p>
            <form onSubmit={handleSaveApiKey} style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="password"
                placeholder={customApiKey ? "••••••••••••••••••••" : "AIzaSy..."}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                style={{
                  flexGrow: 1,
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.78rem',
                  padding: '0.35rem 0.5rem',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                className="btn"
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  borderRadius: '6px',
                  background: customApiKey ? '#ef4444' : 'var(--primary)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
              >
                {customApiKey ? "Clear" : "Save"}
              </button>
            </form>
          </div>
        )}

        <div className="glass-panel" style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.03)', borderColor: 'rgba(16, 185, 129, 0.15)' }}>
          <h4 style={{ fontSize: '0.78rem', fontWeight: '800', color: '#10b981', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            🔒 Local Data Security
          </h4>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.4', margin: 0 }}>
            Your inquiries are handled privately using an anonymous model session. Rest assured, local school sheets remain safe inside your browser context.
          </p>
        </div>
      </div>

      {/* ── RIGHT AREA: CHAT SCREEN ────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '520px' }}>
        
        {/* Chat Header Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-main)' }}>Gemini-1.5-Flash</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>(Free Tier Session)</span>
          </div>
          <button
            onClick={clearChat}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.82rem',
              fontWeight: '700',
              padding: '4px 8px',
              borderRadius: '6px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <Trash2 size={13} />
            Clear Chat
          </button>
        </div>

        {/* Messages Stream Scrollbox */}
        <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '6px', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', minHeight: '360px', marginBottom: '1.5rem' }}>
          {messages.map((m, idx) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  width: '100%'
                }}
              >
                <div
                  style={{
                    maxWidth: '82%',
                    padding: '0.85rem 1.25rem',
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isUser ? 'linear-gradient(135deg, var(--primary) 0%, #a80024 100%)' : 'var(--bg-app)',
                    border: isUser ? 'none' : '1px solid var(--border-color)',
                    boxShadow: isUser ? '0 4px 12px rgba(225, 0, 49, 0.15)' : 'none',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem',
                    lineHeight: '1.5',
                    wordBreak: 'break-word'
                  }}
                >
                  {!isUser && (
                    <div style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                      EduKit Bot
                    </div>
                  )}
                  {renderMessageText(m.text)}
                </div>
              </div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
              <div style={{ padding: '0.85rem 1.25rem', borderRadius: '16px 16px 16px 4px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="dot-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
                <span className="dot-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', animationDelay: '0.2s' }} />
                <span className="dot-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', animationDelay: '0.4s' }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '4px', fontWeight: '600' }}>EduKit Bot is typing...</span>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Input Controls Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputVal);
          }}
          style={{
            display: 'flex',
            gap: '0.75rem',
            background: 'rgba(255,255,255,0.01)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '0.4rem 0.6rem',
            alignItems: 'center'
          }}
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={loading}
            placeholder="Type your question about rosters, seating plans, or comment codes..."
            style={{
              flexGrow: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main)',
              fontSize: '0.88rem',
              padding: '0.4rem 0.5rem'
            }}
          />
          <button
            type="submit"
            disabled={loading || !inputVal.trim()}
            style={{
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: (loading || !inputVal.trim()) ? 'not-allowed' : 'pointer',
              opacity: (loading || !inputVal.trim()) ? 0.4 : 1,
              transition: 'all 0.2s',
              boxShadow: (loading || !inputVal.trim()) ? 'none' : '0 2px 8px rgba(225, 0, 49, 0.25)'
            }}
            onMouseEnter={(e) => {
              if (!loading && inputVal.trim()) e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Send size={14} />
          </button>
        </form>

      </div>
    </div>
  );
}
