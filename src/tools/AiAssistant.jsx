import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Sparkles, Send, Trash2,
  HelpCircle, AlertTriangle, Layers, Users, BookOpen
} from 'lucide-react';



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
  - Has print style overrides to fit the seating plan cleanly onto a physical A4 landscape sheet. The print layout is 100% zoom-independent and robust against browser page-zoom clipping by using fluid parent containers (with width: 100%, max-width: none, and overflow: visible) and an exact 297mm x 210mm A4 landscape canvas.
  - *Dropdown Suggestion Correction*: When no roster is connected, the autocomplete search dropdown for seat assignments is blank to avoid confusing teachers with mock data, but teachers can still type any custom names manually.
- **Cohort Analysis (Data Analysis)**: 
  - Dynamic analytics dashboard for connected rosters.
  - Shows visual statistics (class gender distribution, percentage of Emirati students, EAL and Inclusion ratios).
  - Computes exact Criterion averages (Crit A, B, C, D) and lists top/bottom achievers to help teachers plan targeted intervention.
- **Gradebook List (ATL Tracker)**: 
  - A compact list view of the active class roster displaying student grades (Crit A-D), ATL Progress, and educational tags.
  - Extremely useful as a quick reference sheet.
- **Teacher Utilities**:
  - Combined into a single, unified tab with three sub-sections.
  - *Study Group Matcher*: Generates visual student groupings (e.g. pairs, groups of 3/4/5, or custom numbers of teams) while maintaining demographic balance and offering smart options like academic peer-pairing. Note: the "Print Teams" button was removed from the toolbar to keep layouts clean.
  - *Student Picker Wheel*: A premium, high-DPI HTML5 canvas spin wheel for picking random students. Includes HSL sectors, celebration overlays, confetti animation, and absentees exclusion.
  - *Classroom Timer*: A premium, multi-session ProTimer dashboard designed to track 1 to 6 sessions simultaneously, with dynamic time boundary alarms, custom time setups, and automatic iSAMS auto-start scheduling.
- **Teacher Toolkit**: 
  - A comprehensive toolkit and reference containing two major sections:
    - *Assessment & Data Guidelines (Academic Data Framework)*: Features the official school grading rules, including MYP boundaries (Grade 7 = 28-32, Grade 6 = 24-27, Grade 5 = 19-23, Grade 4 = 15-18, Grade 3 = 10-14, Grade 2 = 6-9, Grade 1 = 1-5), DP boundaries, CP/BTEC grading, and OAS resynchronization steps. Includes interactive converters for Arabic MYP/DP to Ministry of Education (MOE) percentages and MYP CPT boundaries. Includes a Quality Assurance checklist filterable by role.
    - *EduKit Portal Help (User Guides)*: Step-by-step guides for roster sheets, comment generators, seating plannings, data analytics, and troubleshooting.
  - Features a dedicated "Common Mistakes & Troubleshooting" section detailing:
    - Rule: The Excel file downloaded directly from iSAMS is **completely ready-to-go** out-of-the-box. The creator of this portal is the same person who manage the iSAMS data/report template, meaning all column names, sheets, and headers are perfectly aligned without any decorative top banners. Teachers **never** have to rename headers or format the Excel files themselves.
    - To download/export the Excel file: Go to iSAMS, look at the wizard bar on the right side top, select "Analytics & Insights", click "Create New Report", choose "Edukit Export". Once it opens, choose your name in the "Select User" dropdown. This will create and download an Excel spreadsheet with all the classes assigned to you, along with their active student rosters and demographic data.
    - We recommend downloading this file only after completing your gradebook and resyncing/saving your grades in the Online Assessment System (OAS) first.
    - Mistake 1 (Static Roster Disconnect): Roster changes in iSAMS don't sync live; teachers must re-download the latest ready-to-go roster directly from iSAMS and re-upload it.
    - Mistake 2 (OAS Resync Blanks): Blanks in Excel downloads are because grades were entered in gradebooks but not published, resynced, and saved in the Online Assessment System (OAS) first.
    - Mistake 3 (Wrong File Upload): Uploading a completely unrelated file (e.g. personal lesson plans) instead of the official iSAMS sheet will trigger a header mismatch error.
3. TERMINOLOGY:
- We have standardized all MIS references in user strings and documentation to **iSAMS**.
- Central grade sync refers to **OAS (Online Assessment System)**.

4. OFFICIAL SISD ASSESSMENT TIMELINES & GRADE CALCULATIONS (from the 2025-2026 Academic Data Framework):

OAS TIMEFRAMES (ONLINE ASSESSMENT SYSTEM)
- Assessment Point 3: Opens 16/01/2026 (provisional) and closes 24/01/2026.
- Assessment Point 4 (G12): Opens 09/05/2026 and closes 15/05/2026.
- Assessment Point 5: Opens 15/06/2026 (assumes teachers have correctly completed gradebook) and closes 19/06/2026.

ISAMS GRADEBOOK CYCLES: MYP
- Assessment Point 1 (Targets): The automatically inputted MEG and CAT4 'if challenged' grade share the same open and close dates as AP2.
- AP2: Opens 10/11/2025 and closes 17/11/2025. (Only two criteria scores are entered; the overall MYP grade is not shown).
- AP3 (Includes G10 mock exam data): Opens 09/01/2026 and closes 23/01/2026. (Scores for all four criteria must be entered).
- AP4 (Excluding G12): Opens 10/04/2026 and closes 20/04/2026. (Only two criteria scores are entered).
- AP5 (Full written report): Opens 11/05/2026 and closes 04/06/2026. (Scores for all four criteria must be entered using a 'Best Fit' approach).

ISAMS GRADEBOOK CYCLES: DP (DIPLOMA PROGRAMME)
- Assessment Point 1 (Targets): Automatically inputted MEG, CEM, and CAT4 'if challenged' grades share the same open and close dates as AP2.
- AP2: Opens 10/11/2025 and closes 17/11/2025.
- AP3: Opens 09/01/2026 and closes 23/01/2026.
- AP4 (G12): Opens 08/05/2026 and closes 15/05/2026.
- AP5 (Full written report G11): Opens 11/05/2026 and closes 04/06/2026.

ISAMS GRADEBOOK CYCLES: CP (CAREERS-RELATED PROGRAMME)
- Assessment Point 1 (Targets): Automatically inputted MEG, CEM, and CAT4 'if challenged' grades share the same open and close dates as AP2.
- AP2: Opens 10/11/2025 and closes 17/11/2025.
- AP3: Opens 09/01/2026 and closes 24/01/2026.
- AP4 (G12): Opens 09/05/2026 and closes 15/05/2026.
- AP5 (Full written report G11): Opens 11/05/2026 and closes 04/06/2026.
- BTEC Gradebooks: BTEC courses are modular/unit-based; gradebooks remain open all year for ongoing U, Pass, Merit, or Distinction component entries.

ASSESSMENT PRINCIPLES
- Assessments are valid (testing supposed knowledge/skills) and reliable (trustworthy gauge of attainment).
- Summative assessments are criterion-based, use valid rubrics, are marked by the subject teacher, and moderated by colleagues.
- Attainment grades are evidence-based, informed by summative assessments, and utilize a 'Best Fit' approach.
- The Minimum Expected Grade (MEG) is the minimum expectation against which progress is calculated; it is not the student's target.
- Teachers should define ambitious targets supported by quality teaching, feedback, and interventions.

LEVELS OF DATA (APPLIES TO MYP, DP, AND CP)
- Level 1: Granular, criterion/question-specific data recorded by teachers to inform lessons and provide personalized feedback using rubrics and markschemes.
- Level 2: Holistic assessment data linked to criteria/objectives, recorded in departmental trackers or ManageBac, and used to inform interventions.
- Level 3: Data entered into ISAMS for specific Assessment Points (APs) or high-validity exams (e.g., mocks) to judge attainment, progress, and strategic improvement priorities.
- Note for DP/CP: Data needs to be entered into ManageBac gradebooks for a consistent approach so parents and students can access it.

IB MYP ATTAINMENT & GRADE BOUNDARY CONVERSIONS
- The school calculates Level 3 attainment using the MYP framework and a 'best fit' principle, utilizing recent Level 2 data.
- Each of the four criteria (A, B, C, D) is assessed on a 0-8 scale.
- A Cumulative Points Total (CPT) of 28-32 converts to an IB MYP Grade of 7 (Excellent quality).
- A CPT of 24-27 converts to an IB MYP Grade of 6 (High quality).
- A CPT of 19-23 converts to an IB MYP Grade of 5 (Generally high quality; KHDA exceeding expectations).
- A CPT of 15-18 converts to an IB MYP Grade of 4 (Good quality; KHDA meeting expectations).
- A CPT of 10-14 converts to an IB MYP Grade of 3 (Acceptable quality; intervention required to achieve Grade 4).
- A CPT of 6-9 converts to an IB MYP Grade of 2 (Limited quality).
- A CPT of 1-5 converts to an IB MYP Grade of 1 (Very limited quality).

DIPLOMA PROGRAMME (DP) & CP ATTAINMENT
- Each DP subject conducts three summative assessments per term across DP1 and DP2.
- Summative assessments use IB grade boundaries plus 5% - 7% additional (at SubCo discretion) for less synoptic assessments.
- Formal examinations (welcome back, mocks) use the most recent IB boundaries.
- Teachers assign levels 1-7 applying the 'Best Fit' principle.
- DP Core: In Grade 11, TOK and EE receive a single A-E scale grade per term. In Grade 12 Term 1, separate grades are given for TOK Exhibition, TOK Essay, and EE.
- CP Core: Teachers input 'On track' or 'Not on track' for Personal and Professional Skills, Language and Culture Studies, and Community Engagement.

KHDA FRAMEWORK JUDGMENTS (AP5 DATA)
- The school judges attainment following the KHDA framework using the AP5 data point.
- Outstanding: 75% of grades at 4 or above, and 75% of grades at 5 or above.
- Very Good: 75% of grades at 4 or above, and 61% of grades at 5 or above.
- Good: 75% of grades at 4 or above, and 50% of grades at 5 or above.
- Acceptable: 75% of grades at 4 or above.

INTERNAL PROGRESS TRACKING (MYP)
- The school tracks progress by comparing current AP5 data with previous year's AP5 data.
- Above expected progress (1): One or more MYP points (/32) per academic year.
- Above expected progress (2): Any student with an MYP Grade of 7 who remains there ('Everest principle').
- Expected progress: The same MYP points as the previous year.
- Below expected progress: Less MYP points than the previous year (excluding anyone remaining at MYP Grade 7).

TARGET SETTING: CAT4, CEM, AND MEG
- MYP Minimum Expected Grade (MEG): For returning students, it is the previous year's AP5 CPT +1. For new students, it is derived from the lowest equivalent points of the CAT4 'if challenged' grade (applied to all G6). If no CAT4, MEG defaults to points equivalent to an MYP 4.
- MYP CAT4 Subject Mapping: Art/Drama/Music/Visual Arts -> IB MYP Arts; Biology/Chemistry/Physics/Science -> IB MYP Sciences; I&S -> IB MYP Humanities; Design/IT -> IB MYP Technology; PHE -> IB MYP Physical Education; Languages map to their respective IB MYP languages.
- DP/CP Grade 11: The Centre for Evaluation and Monitoring (CEM) test determines projected grades (MEG). If no CEM, CAT4 'If Challenged' is used for HL or SL.
- DP/CP Grade 12: MEG is automatically set as the AP5 cumulative grade from DP1 or AP5 +1. Teachers review during AP1; changes require SubCo and SLT approval.

SCIENCE & LATE JOINER SPECIFICS
- AP3 Double/Triple Science (G9/G10): If a criterion is not assessed summatively for one discipline by AP3, teachers use the criterion score from another discipline.
- Grade 10 Examinations: The final examination contributes 75% of the final grade; teacher judgment (Best Fit) constitutes 25%. G10 Double/Triple Science exams are averaged to provide a unified score.
- Late Joiners/Missed Assessments: Teachers use previous summative, formative, or in-class work to form a judgment. CAT4 data can inform judgment. If joined too soon to judge, input N/A for that AP only and do not set a target.

ARABIC TO MINISTRY OF EDUCATION (MOE) PERCENTAGE SCALES
- Arabic MYP points (out of 32) map to a Minimum MOE Grade: 12=50%, 13=52%, 14=55%, 15=58%, 16=60%, 17=63%, 18=66%, 19=69%, 20=72%, 21=74%, 22=76%, 23=80%, 24=82%, 25=84%, 26=86%, 27=88%, 28=90%, 29=92%, 30=94%, 31=97%, 32=100%.
- For new Arabic MYP students without a CAT4 target, the MEG is automatically set at 15.
- Arabic DP Grade to MOE Grade: 1=40-%, 2=40-49%, 3=50-59%, 4=60-69%, 5=70-79%, 6=80-89%, 7=90-100%. Used for local reporting only; does not replace the official IB grade.

OTHER MOE MANDATORY SUBJECTS (ISLAMIC, SOCIAL STUDIES, MSC)
- MEG for returning students is the previous year's final grade +3%. New students are assigned 60%.
- Term 1 (AP3): 35% weight (10% formative, 25% summative exam).
- Term 2 (AP4): 30% weight (10% formative, 20% summative).
- Term 3 (AP5): 35% weight (10% formative, 25% project-based assessment).
- Pass marks: G6-8 is 50%; G9 is 60%.
- Curriculum standards: Meeting expectations G6-8 (54%), Meeting expectations G9-12 (60%), Above expectations G6-12 (70%). If not enough work is completed, automatically given 50%.

APPROACHES TO LEARNING (ATL)
- Assessed at AP3 and AP5 using a four-point scale across Thinking, Communication, Social, Self-management, and Research skills.
- Novice (N): Introduced to the skill; observes others.
- Beginner (B): Begins to use skill by imitating; relies on scaffolding/guidance.
- Practitioner (P): Applies skill confidently/effectively; uses independently.
- Expert (E): Full command; can model for others and evaluate effectiveness.

ATTITUDE TO LEARNING
- Exceeding expectations (EE): Consistently punctual, hardworking, superb home learning effort, well-behaved.
- Meeting Expectations (ME): Generally punctual, hardworking in most lessons, completes home learning, well-behaved.
- Approaching Expectations (AE): Sometimes late, inconsistent effort, completes most home learning, occasional negative behavior.
- Below Expectations (BE): Regularly late, lacks effort, often fails home learning, regularly disrupts.
- Teachers use a 'Best Fit' approach if behaviors span multiple categories.

ONLINE ASSESSMENT SYSTEM (OAS) & COMMENT GENERATORS
- Teachers must click 'Resync Gradebook Data' on OAS every time a grade changes in ISAMS; cells turn green when synchronized.
- Language acquisition teachers input a descriptor: Emergent, Capable, or Proficient.
- Tutors input Service as Action (SAA) status. AP3: Concern (1 or 0 activities), On track (2 activities), Excellent (2 extended activities). AP5: Completed or Not Completed.
- AP3 Comment Generator: Homeroom Tutors select descriptors for Character, IB Learner Profile, CAS/SAA, ASA involvement, and Activity. Tutors must replace the word *Activity* with the specific activity.
- AP5 Comment Generator: Used for all subjects to automatically compile comments. 
  - **Structure of Generated Comment**: Built by joining four distinct segments with a space:
    1. *Segment 1 (Overall Attainment)*: Statement on overall performance based on final IB Grade (1-7).
    2. *Segment 2 (ATL Progress)*: Statement on the selected ATL focus skill (Communication, Social, Self-Management, Research, Thinking) and progress level (Expert, Practitioner, Beginner, Novice). The generator randomly selects one of several alternative options from the ATL comment bank for the student's category and level to ensure variety and uniqueness across class reports.
    3. *Segment 3 (Key Strength)*: Highlights the student's highest-scoring MYP Criterion (Crit A, B, C, or D) with its subject-specific name.
    4. *Segment 4 (Target for Growth)*: Suggests improvement for the student's lowest-scoring MYP Criterion.
  - **Placeholders replaced in templates**: Replaces custom tags like 'Student!' (Forename), 'He!'/'he!' (He/She, he/she), 'His!'/'his!' (His/Her, his/her), 'him!' (him/her), 'Subject!' (Subject name), and 'A!', 'B!', 'C!', 'D!', 'BestCrit!', 'WeakCrit!' (resolved with subject-specific criterion names like 'Knowing and Understanding'). Standard tags like '[Name]', '[He/She]', '[he/she]', '[His/Her]', '[his/her]', '[Him/Her]', '[him/her]', '[Grade]', '[Subject]', '[CritA]', '[CritB]', '[CritC]', '[CritD]', '[BestCrit]', '[WeakCrit]', '[ATL Skill]', '[ATL]' are also supported.
  - **Safety & Lock Rules**:
    - *Manual Draft Interception*: If overall IB Grade is 1 or 2, or any individual Criterion score is 1 or 2, the generator intercepts and locks generation, labeling the row '⚠️ Manual Draft' and outputting a prompt for the teacher to write a highly customized manual comment.
    - *Missing Grades Lock*: If any criteria grade (A, B, C, or D) is missing (blank/null), the comment is locked and remains empty ('') because complete data is required.
- Elective Subject Generator: Teachers select three attributes to generate a personalized comment.

QUALITY ASSURANCE (QA) ROLES
- Data Manager: Checks for grades lower than previous AP (alert SubCo, AP3-5); checks attainment vs KHDA framework (inform Deputy Headteacher, AP3/5).
- SubCos: Check for missing data, chase teachers; read/amend/test teacher comment banks (AP5).
- Teachers: Peer check inputted data.
- Assistant Head, Student Experience: Checks Emirati student data against thanaweya requirements.
- DP/CP Coordinators: Review predicted/cumulative grades and component targets.
- Inclusion/MAGT Teams: Spot check specific student group data.
- SLT: Check cumulative/predicted grades and final spot checks.
- Deputy Head of pastoral, GLCs, Assistant GLCs: Read/amend/test tutor comment banks (AP3); read and check tutor comments.
- SLT, SubCos, Assistant SubCos: Read full reports for Homerooms before AP5 release.

FAQ
- Locked students: Students who appear greyed out in the gradebook have left the school or moved to a different class, preserving historical data.

INSTRUCTIONS:
- Answer questions in a warm, funny, simple manner.
- Keep answers concise and structured. Use bullet points or bold text to make answers highly scannable.
- Reassure teachers that they **do not need to edit, rename, or format** their iSAMS Excel files. The file downloaded directly from iSAMS is completely ready-to-go.
- If asked about school academic data framework dates, grade boundaries, MOE percentages, or Quality Assurance responsibilities, answer accurately based on the detailed framework guidelines above. Explicitly state the exact dates (e.g. OAS for AP5 opens on June 15th, 2026 and closes on June 19th, 2026).
- If a teacher reports missing student grades in their downloaded Excel sheets, guide them on publishing, resyncing, and saving in iSAMS OAS.
- Under all circumstances, remain professional and focus only on SISD EduKit Teacher Portal and School Academic Data Framework questions.`;

const SUGGESTED_PROMPTS = [
  {
    icon: <Sparkles size={15} style={{ color: 'var(--primary)' }} />,
    label: "What can EduKit do?",
    text: "What are the core features, modules, and capabilities of the SISD EduKit Teacher Portal, and how can it help me?"
  },
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
    label: "How and where to get the Excel file?",
    text: "How and where do I download the correct Excel gradebook spreadsheet from iSAMS, and do I need to perform any resync steps?"
  }
];

// Premium typewriter/streaming text animator to ease waiting discomfort
function TypewriterText({ text, isLast, renderMessageText, chatEndRef }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!isLast) {
      setDisplayedText(text || '');
      return;
    }

    const words = (text || '').split(' ');
    let currentWordIndex = 0;
    setDisplayedText('');

    const interval = setInterval(() => {
      if (currentWordIndex < words.length) {
        setDisplayedText((prev) => prev + (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex]);
        currentWordIndex++;
        // Keep scroll visible during animation
        chatEndRef.current?.scrollIntoView({ behavior: 'auto' });
      } else {
        clearInterval(interval);
      }
    }, 15); // Fast, premium pacing at 15ms per word

    return () => clearInterval(interval);
  }, [text, isLast, chatEndRef]);

  return renderMessageText(displayedText);
}

export default function AiAssistant() {
  const [messages, setMessages] = useState(() => {
    const defaultWelcome = [
      {
        sender: 'ai',
        text: "Hello and welcome! 👋 I am your **EduKit AI Assistant**, here to help make your teaching administration as smooth and effortless as possible.\n\nFeel free to ask me anything about:\n• **Dashboard & Class Roster Imports** (Excel files from iSAMS)\n• **Comment Generator** (Personalized MYP grade and ATL comments)\n• **Seating Plan Studio** (Interactive A4 drag-and-drop workspace)\n• **Cohort Analysis & ATL Trackers** (Student performance analytics)\n• **Teacher Utilities** (Classroom timers, student spinners, and groupings)\n\nHow can I help you with your classroom setup or reporting tasks today? 😊"
      }
    ];

    const saved = localStorage.getItem('edukit_ai_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Hot-patch legacy/buggy welcome messages containing undefined or outdated descriptions
          if (parsed[0] && parsed[0].sender === 'ai' && (parsed[0].text.includes('undefined') || parsed[0].text.includes('troubleshooting common import issues'))) {
            parsed[0].text = defaultWelcome[0].text;
          }
          return parsed;
        }
      } catch (e) {
        console.error("Failed to load chat history:", e);
      }
    }
    return defaultWelcome;
  });

  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const infoRef = useRef(null);

  // Close info panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (infoRef.current && !infoRef.current.contains(event.target)) {
        setShowInfoPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);





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
      // Format chat history to Gemini's native structured format
      const nativeContents = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      // Append active prompt
      nativeContents.push({
        role: 'user',
        parts: [{ text: queryText }]
      });

      const nativeSystemInstruction = {
        parts: [{ text: SYSTEM_INSTRUCTION }]
      };

      let response;
      let data;

      // Query the secure Vercel serverless proxy
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
        body: JSON.stringify({
          contents: nativeContents,
          systemInstruction: nativeSystemInstruction
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Proxy returned ${response.status}`);
      }

      data = await response.json();



      // Parse content from Gemini API response format
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, but I received an empty response. Please try again.";

      setMessages(prev => [...prev, { sender: 'ai', text: generatedText }]);
    } catch (err) {
      console.error("AI Assistant Error:", err);
      setErrorMsg("Failed to get response. Please try again.");

      const isQuotaOrRateLimit =
        err.message?.toLowerCase().includes('quota') ||
        err.message?.toLowerCase().includes('limit') ||
        err.message?.toLowerCase().includes('429') ||
        (typeof response !== 'undefined' && response?.status === 429);

      const errorMessageText = isQuotaOrRateLimit
        ? `The EduKit AI Assistant is currently experiencing a high volume of inquiries. Please try again in a few minutes.\n\nIf you need immediate support with your rosters, seating plans, or comment templates, please reach out directly to **[shanif.ahammed@sisd.ae](mailto:shanif.ahammed@sisd.ae)**, and we will get you sorted right away!`
        : `⚠️ **Service Temporarily Offline**: We couldn't connect to the assistant. Please check your network connection and try again shortly.\n\nIf you continue to face issues, you can email **[shanif.ahammed@sisd.ae](mailto:shanif.ahammed@sisd.ae)** directly or try again later.`;

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: errorMessageText
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear your AI Assistant chat history?")) {
      const initial = [
        {
          sender: 'ai',
          text: "Chat history cleared! Ask me anything about using the SISD Teacher Portal modules or troubleshooting common import issues. I am ready to help! 😊"
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
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem', height: 'calc(100vh - 200px)', minHeight: '480px', display: 'grid', gridTemplateColumns: '1fr 2.2fr', gap: '2rem', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>

      {/* ── LEFT SIDEBAR: GUIDE & SUGGESTIONS ───────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', borderRight: '1px solid var(--border-color)', paddingRight: '2rem', overflowY: 'auto', minHeight: 0 }}>
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



        <div className="glass-panel" style={{ marginTop: 'auto', padding: '1rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.03)', borderColor: 'rgba(16, 185, 129, 0.15)' }}>
          <h4 style={{ fontSize: '0.78rem', fontWeight: '800', color: '#10b981', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            🔒 Local Data Security
          </h4>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.4', margin: 0 }}>
            Your inquiries are handled privately using an anonymous model session. Rest assured, local school sheets remain safe inside your browser context.
          </p>
        </div>
      </div>

      {/* ── RIGHT AREA: CHAT SCREEN ────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>

        {/* Chat Header Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.25rem', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }} ref={infoRef}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-main)' }}>Gemini-3.1-Flash-Lite</span>
            <button
              onClick={() => setShowInfoPanel(!showInfoPanel)}
              style={{
                background: 'transparent',
                border: 'none',
                color: showInfoPanel ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
                borderRadius: '50%',
                transition: 'color 0.2s',
                outline: 'none'
              }}
              title="View Model & Rate Limit Info"
            >
              <HelpCircle size={14} />
            </button>

            {/* Premium Glassmorphic Rate Limit Panel */}
            {showInfoPanel && (
              <div
                className="glass-panel"
                style={{
                  position: 'absolute',
                  top: '1.75rem',
                  left: '0',
                  width: '280px',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  background: 'var(--bg-card-heavy)',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--border-color)',
                  zIndex: 200,
                  animation: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  textAlign: 'left'
                }}
              >
                <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  🤖 Active Model Details
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.35rem' }}>
                    <span>Model:</span>
                    <strong style={{ color: 'var(--text-main)' }}>Gemini 3.1 Flash Lite</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Engine Type:</span>
                    <strong style={{ color: '#10b981' }}>Ultra-Low-Latency Generation</strong>
                  </div>
                </div>
              </div>
            )}
            <span style={{
              fontSize: '0.68rem',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#10b981',
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              fontWeight: '700',
              letterSpacing: '0.02em',
              marginLeft: '0.35rem'
            }}>
              Secure Cloud Proxy
            </span>
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
        <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '6px', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem', minHeight: 0 }}>
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
                  {m.sender === 'ai' && idx === messages.length - 1 ? (
                    <TypewriterText
                      text={m.text}
                      isLast={true}
                      renderMessageText={renderMessageText}
                      chatEndRef={chatEndRef}
                    />
                  ) : (
                    renderMessageText(m.text)
                  )}
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
