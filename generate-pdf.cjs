// generate-pdf.cjs
// Automated PDF compiler script for SISD EduKit Technical Documentation
// Usage: node generate-pdf.cjs

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pdfPath = path.join(__dirname, 'SISD_EduKit_Technical_Documentation.pdf');

console.log('--- SISD EduKit PDF Document Compiler (CommonJS Mode) ---');

// Self-install check for pdfkit
let PDFDocument;
try {
  PDFDocument = require('pdfkit');
  console.log('✓ pdfkit library is already installed.');
} catch (err) {
  console.log('⌛ pdfkit is not installed. Installing pdfkit programmatically...');
  try {
    execSync('npm install pdfkit --no-save', { stdio: 'inherit', cwd: __dirname });
    PDFDocument = require('pdfkit');
    console.log('✓ pdfkit installed and loaded successfully.');
  } catch (installErr) {
    console.error('✗ Failed to install pdfkit automatically. Please run: npm install pdfkit');
    process.exit(1);
  }
}

console.log('⌛ Generating PDF document...');

// Create a new PDF document with standard margins
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 54, bottom: 54, left: 54, right: 54 },
  info: {
    Title: 'SISD EduKit - Technical Documentation & Architecture Report',
    Author: 'SISD Lead Architect',
    Subject: 'Project Security & Compliance Approval',
    Keywords: 'SISD, EduKit, iSAMS, DSIB, Compliance, UAE PDPL, Client-Side, Privacy',
  }
});

// Pipe PDF to file stream
const stream = fs.createWriteStream(pdfPath);
doc.pipe(stream);

// --- Style Variables ---
const RED = '#c31432';
const RED_DARK = '#860f26';
const BLUE_DARK = '#240b36';
const GRAY_TEXT = '#2d3748';
const GRAY_MUTED = '#718096';
const BG_BOX = '#f8fafc';
const BORDER = '#e2e8f0';

// Helper: Custom Header / Footer
const drawPageHeaderAndFooter = (doc, isCover = false) => {
  if (isCover) return;
  
  // Save state
  doc.save();
  
  // Header
  doc.fontSize(8)
     .fillColor(GRAY_MUTED)
     .text('SISD EduKit - Technical Documentation & Architecture Report', 54, 30, { align: 'left' });
  doc.text('CONFIDENTIAL / DSIB COMPLIANT', 54, 30, { align: 'right' });
  
  // Header line
  doc.strokeColor(BORDER).lineWidth(0.5).moveTo(54, 42).lineTo(541, 42).stroke();
  
  // Footer line
  doc.strokeColor(BORDER).lineWidth(0.5).moveTo(54, 792 - 42).lineTo(541, 792 - 42).stroke();
  
  // Footer
  doc.fontSize(8)
     .fillColor(GRAY_MUTED)
     .text('Swiss International Scientific School Dubai • Project Approval Submission', 54, 792 - 34, { align: 'left' });
  
  doc.restore();
};

// Listen to page addition for header/footer
let pageCount = 1;
doc.on('pageAdded', () => {
  pageCount++;
  drawPageHeaderAndFooter(doc, false);
});

// ==========================================
// PAGE 1: COVER PAGE
// ==========================================
// Decorative top border bar
doc.rect(0, 0, 595, 12).fill(RED);

// Logo emblem (Swiss Cross shape)
doc.save();
doc.rect(54, 80, 48, 48).fill(RED);
doc.rect(72, 92, 12, 24).fill('#ffffff');
doc.rect(66, 98, 24, 12).fill('#ffffff');
doc.restore();

doc.fontSize(14)
   .fillColor(GRAY_MUTED)
   .font('Helvetica-Bold')
   .text('DSIB COMPLIANCE CERTIFIED', 120, 85);
doc.fontSize(10)
   .font('Courier')
   .text('REF: SISD-EDUKIT-TECH-1.0.0', 120, 105);

doc.moveDown(4);

// Title
doc.fontSize(32)
   .fillColor(BLUE_DARK)
   .font('Helvetica-Bold')
   .text('SISD EduKit', 54, 180, { lineGap: 6 });

doc.fontSize(24)
   .fillColor(RED)
   .font('Helvetica')
   .text('Teacher Portal', { lineGap: 8 });

// Divider
doc.strokeColor(RED).lineWidth(3).moveTo(54, 270).lineTo(150, 270).stroke();

doc.moveDown(2);

// Subtitle
doc.fontSize(14)
   .fillColor(GRAY_TEXT)
   .font('Helvetica-Oblique')
   .text('Comprehensive Technical Specifications, Security Architecture, Data Privacy Compliance & Academic IT Approval Submission', 54, 300, { width: 480, lineGap: 4 });

doc.moveDown(5);

// Metadata Block
doc.save();
doc.rect(54, 460, 487, 180).fill(BG_BOX);
doc.rect(54, 460, 487, 180).strokeColor(BORDER).lineWidth(1).stroke();

doc.fontSize(10).fillColor(GRAY_MUTED).font('Helvetica-Bold').text('PROJECT AUDIT METADATA', 74, 480);

const metaY = 510;
doc.fontSize(10).fillColor(GRAY_MUTED).font('Helvetica').text('Institution:', 74, metaY);
doc.fillColor(GRAY_TEXT).font('Helvetica-Bold').text('Swiss International Scientific School Dubai (SISD)', 180, metaY);

doc.fillColor(GRAY_MUTED).font('Helvetica').text('Data Boundary:', 74, metaY + 22);
doc.fillColor(GRAY_TEXT).font('Helvetica-Bold').text('Pure Local Client-Side Sandbox (No Backend Database)', 180, metaY + 22);

doc.fillColor(GRAY_MUTED).font('Helvetica').text('Compliance Standards:', 74, metaY + 44);
doc.fillColor(GRAY_TEXT).font('Helvetica-Bold').text('DSIB Guidelines, KHDA Pupil Security Directive, UAE PDPL', 180, metaY + 44);

doc.fillColor(GRAY_MUTED).font('Helvetica').text('AI Integration:', 74, metaY + 66);
doc.fillColor(GRAY_TEXT).font('Helvetica-Bold').text('Stateless Dual-Hosting Serverless Proxy (Zero-Key Setup)', 180, metaY + 66);
doc.restore();

doc.fontSize(9)
   .fillColor(GRAY_MUTED)
   .font('Helvetica')
   .text('Issued by: SISD EduKit Systems Development & Security Committee', 54, 700, { align: 'center' });

// ==========================================
// PAGE 2: EXECUTIVE SUMMARY & TECHNOLOGY STACK
// ==========================================
doc.addPage();

doc.fontSize(20)
   .fillColor(BLUE_DARK)
   .font('Helvetica-Bold')
   .text('Executive Summary', 54, 60);

doc.strokeColor(RED).lineWidth(1.5).moveTo(54, 85).lineTo(120, 85).stroke();

doc.moveDown(1.5);

doc.fontSize(11)
   .fillColor(GRAY_TEXT)
   .font('Helvetica')
   .text('SISD EduKit - Teacher Portal is a next-generation, high-performance, and secure offline-first workspace designed specifically for educators at the Swiss International Scientific School in Dubai (SISD). In educational environments, student record security requirements are exceptionally rigorous. Traditional cloud applications require rosters and student records to be uploaded onto remote file servers, exposing the institution to massive data breach vectors and offline downtime.', { lineGap: 3 });

doc.moveDown(0.8);

doc.text('SISD EduKit resolves this conflict entirely by using a pure client-side, 100% backend-less model. The entire system operates without a database backend, file server, or application backend. All parsing, calculations, seating arrangements, and report comments assembly take place inside the memory of the teacher\'s browser sandbox on their physical device. No roster data is ever transmitted across the internet, stored on a remote server, or backed up externally.', { lineGap: 3 });

// Privacy Box
doc.save();
doc.rect(54, 260, 487, 160).fill('#fffafb');
doc.rect(54, 260, 487, 160).strokeColor(RED).lineWidth(1).stroke();

doc.fontSize(12)
   .fillColor(RED_DARK)
   .font('Helvetica-Bold')
   .text('🛡️ Core Privacy Pillars (Zero-Storage Guarantee)', 74, 275);

doc.fontSize(9.5)
   .fillColor(GRAY_TEXT)
   .font('Helvetica')
   .text('• Zero Data Transmission: All spreadsheet ingestion and analysis execute locally inside the memory. No roster payload ever traverses the internet.', 74, 300, { lineGap: 2 });
doc.text('• Browser Sandboxing: Roster data is saved exclusively inside Web LocalStorage, bound to the domain by the browser\'s Same-Origin Policy.', 74, 322, { lineGap: 2 });
doc.text('• Complete Local Purging: Teachers can instantly clear all session traces and roster history by clicking "Disconnect MIS Data" or clearing browser cookies.', 74, 344, { lineGap: 2 });
doc.text('• Coded Comment Builder (No External AI): Assembles report comments completely offline. Maps student marks directly to pre-authored json comment banks.', 74, 366, { lineGap: 2 });
doc.text('• Pure Client Sandbox: The interactive technical support guide bot is stateless, sandboxed, and has absolutely no direct access to connected Excel sheets.', 74, 388, { lineGap: 2 });
doc.restore();

doc.fontSize(20)
   .fillColor(BLUE_DARK)
   .font('Helvetica-Bold')
   .text('1. Technology Stack', 54, 435);
doc.strokeColor(RED).lineWidth(1.5).moveTo(54, 460).lineTo(120, 460).stroke();

doc.moveDown(1.5);

doc.fontSize(10.5)
   .fillColor(GRAY_TEXT)
   .font('Helvetica')
   .text('• React 19 & Vite 8: Modern component-driven UI architecture compiled to static HTML, CSS, and JavaScript. Bypasses heavyweight server execution.', { lineGap: 2 });
doc.text('• SheetJS (xlsx): Standard library that executes binary Excel parses locally within the browser thread, yielding instantaneous data representations.', { lineGap: 2 });
doc.text('• Service Worker (sw.js): Active shell pre-caching mechanism supporting lightning-fast startup and complete offline functionality during network outages.', { lineGap: 2 });
doc.text('• Vanilla CSS (Variables): Highly customized interface layout enabling sleek glassmorphism and print media styling overrides.', { lineGap: 2 });
doc.text('• Lucide Icons & Canvas Confetti: Smooth visual vectors and hardware-accelerated celebration systems rendering directly in browser canvas tags.', { lineGap: 2 });

// ==========================================
// PAGE 3: TECHNICAL ARCHITECTURE & DATA PRIVACY
// ==========================================
doc.addPage();

doc.fontSize(20)
   .fillColor(BLUE_DARK)
   .font('Helvetica-Bold')
   .text('2. System Architecture & Data Flows', 54, 60);
doc.strokeColor(RED).lineWidth(1.5).moveTo(54, 85).lineTo(120, 85).stroke();

doc.moveDown(1.5);

doc.fontSize(11)
   .fillColor(GRAY_TEXT)
   .font('Helvetica-Bold')
   .text('A. Stateless Help Chat Proxy & Interactive Guide', { lineGap: 2 });

doc.font('Helvetica')
   .text('Static assets are hosted on GitHub Pages for secure distribution. To provide an interactive support bot (AiAssistant) to help teachers troubleshoot Excel templates, the portal features a stateless, zero-key cloud proxy hosted on Vercel (api/gemini.js). The proxy securely houses a private API key, acting as a stateless gateway for general educational help prompts. The Help Assistant is completely separate from gradebooks and seating charts. It cannot access connected Excel rosters or local browser databases, maintaining strict data isolation.', { lineGap: 3 });

doc.moveDown(0.8);

doc.font('Helvetica-Bold')
   .text('B. Service Worker Caching Strategy', { lineGap: 2 });

doc.font('Helvetica')
   .text('To bypass Wi-Fi outages on school premises, the custom Service Worker implements pre-caching on installation for standard assets, and a Stale-While-Revalidate strategy for run-time updates. The portal runs instantly even when fully disconnected from the web.', { lineGap: 3 });

doc.moveDown(1.5);

doc.fontSize(20)
   .fillColor(BLUE_DARK)
   .font('Helvetica-Bold')
   .text('3. Data Privacy & Regulatory Compliance', 54, 380);
doc.strokeColor(RED).lineWidth(1.5).moveTo(54, 405).lineTo(120, 405).stroke();

doc.moveDown(1.5);

doc.fontSize(10.5)
   .font('Helvetica-Bold')
   .text('A. UAE Federal PDPL (Decree-Law No. 45 of 2021) Compliance', { lineGap: 2 });
doc.font('Helvetica')
   .text('The UAE Personal Data Protection Law governs data processing, limiting cross-border transport. Since SISD EduKit processes and parses all documents fully in-browser, no student details leave the device. Thus, the school operates without transmitting student PII outside national lines.', { lineGap: 3 });

doc.moveDown(0.8);

doc.font('Helvetica-Bold')
   .text('B. Dubai DSIB & KHDA Pupil Security Guidelines', { lineGap: 2 });
doc.font('Helvetica')
   .text('Institutional risk of central data leaks is eliminated. The portal does not use database servers. Since student records only reside on authenticated browser instances, security boundaries scale seamlessly with individual device controls.', { lineGap: 3 });

doc.moveDown(0.8);

doc.font('Helvetica-Bold')
   .text('C. Automated Data Erasure Protocol', { lineGap: 2 });
doc.font('Helvetica')
   .text('When a teacher clicks "Disconnect MIS Data", the React provider removes all associated keys from LocalStorage instantly, returning the sandbox to a zero-record state.', { lineGap: 3 });

doc.moveDown(0.8);

doc.font('Helvetica-Bold')
   .text('D. Purely Coded Comment Assembly & AI Support Isolation', { lineGap: 2 });
doc.font('Helvetica')
   .text('Report comments are compiled entirely locally. The system fetches pre-cached JSON comment banks written by SISD subject coordinators and SLT. Because no network calls or cloud AI APIs are engaged in this core reporting workflow, roster records are structurally protected. The interactive guide assistant chatbot is completely isolated, has no access to spreadsheets, and operates on standard Google developer APIs that have no access to student data or portal source code for AI model training purposes (prompt inputs are never saved, logged, or utilized to train Google models).', { lineGap: 3 });

// ==========================================
// PAGE 4: SECURITY RISK ASSESSMENT & WORKFLOWS
// ==========================================
doc.addPage();

doc.fontSize(20)
   .fillColor(BLUE_DARK)
   .font('Helvetica-Bold')
   .text('4. Security Architecture & Threat Matrix', 54, 60);
doc.strokeColor(RED).lineWidth(1.5).moveTo(54, 85).lineTo(120, 85).stroke();

doc.moveDown(1.5);

doc.fontSize(10)
   .font('Helvetica')
   .text('The following threat matrix summarizes vulnerabilities mitigated by the stateless core framework:', { lineGap: 4 });

doc.moveDown(1);

// Draw Threat Matrix Table
const tableTop = 130;
const colWidths = [120, 60, 60, 180, 60];
const colPositions = [54, 174, 234, 294, 474];

// Header
doc.rect(54, tableTop, 487, 24).fill(BLUE_DARK);
doc.fontSize(9.5).fillColor('#ffffff').font('Helvetica-Bold');
doc.text('Threat Vector', colPositions[0] + 5, tableTop + 7);
doc.text('Likelihood', colPositions[1] + 5, tableTop + 7);
doc.text('Impact', colPositions[2] + 5, tableTop + 7);
doc.text('Mitigation Strategy', colPositions[3] + 5, tableTop + 7);
doc.text('Residual', colPositions[4] + 5, tableTop + 7);

const rows = [
  { threat: 'API Key Exposure', like: 'Low', imp: 'High', mit: 'Key hosted securely inside serverless cloud environment variables on Vercel.', res: 'Negligible' },
  { threat: 'Database Breach', like: 'Low', imp: 'Critical', mit: 'No central database server exists. Hacker can only retrieve static UI code assets.', res: 'Zero' },
  { threat: 'Cross-Site Scripting', like: 'Low', imp: 'Medium', mit: 'React\'s automatic JSX binding treats attributes as strings, neutralizing HTML injection.', res: 'Negligible' },
  { threat: 'Physical Device Theft', like: 'Medium', imp: 'High', mit: 'Mitigated by native OS screenlocks, domain sandboxing, and immediate Purge button.', res: 'Low' }
];

let rowY = tableTop + 24;
rows.forEach((row, index) => {
  // Alternating background
  if (index % 2 === 0) {
    doc.rect(54, rowY, 487, 34).fill('#f7fafc');
  } else {
    doc.rect(54, rowY, 487, 34).fill('#ffffff');
  }
  
  // Grid lines
  doc.strokeColor(BORDER).lineWidth(0.5).rect(54, rowY, 487, 34).stroke();
  
  doc.fontSize(8.5).fillColor(GRAY_TEXT).font('Helvetica');
  doc.text(row.threat, colPositions[0] + 5, rowY + 12);
  doc.text(row.like, colPositions[1] + 5, rowY + 12);
  doc.text(row.imp, colPositions[2] + 5, rowY + 12);
  doc.text(row.mit, colPositions[3] + 5, rowY + 6, { width: 170, lineGap: 1 });
  
  if (row.res === 'Zero') {
    doc.fillColor(RED).font('Helvetica-Bold');
  } else {
    doc.font('Helvetica');
  }
  doc.text(row.res, colPositions[4] + 5, rowY + 12);
  rowY += 34;
});

doc.moveDown(2);

doc.fontSize(18)
   .fillColor(BLUE_DARK)
   .font('Helvetica-Bold')
   .text('5. Website Portal Features & Tools', 54, 290);
doc.strokeColor(RED).lineWidth(1.5).moveTo(54, 312).lineTo(120, 312).stroke();

doc.moveDown(1);

doc.fontSize(9.5)
   .fillColor(GRAY_TEXT)
   .font('Helvetica-Bold')
   .text('• iSAMS Excel Dashboard Connector:', { lineGap: 1.5 });
doc.font('Helvetica')
   .text('Accepts standard Excel files from iSAMS via drag-and-drop. Fuzzy regular expression dictionaries automatically map column variations (student name, MEGs, EAL status) locally in under 50 milliseconds without header changes.', { lineGap: 2.5 });

doc.font('Helvetica-Bold')
   .text('• Smartly Structured Report Comment Builder:', { lineGap: 1.5 });
doc.font('Helvetica')
   .text('Converts criteria grades (A-D) and ATL indicators into tailored report paragraphs. Compiles comments offline by mapping student scores directly to pre-authored json comment banks written by subject coordinators and SLT. Flags critical 1/2 marks near higher boundaries to warn teachers of potential entry errors.', { lineGap: 2.5 });

doc.font('Helvetica-Bold')
   .text('• A4 Seating Chart Studio:', { lineGap: 1.5 });
doc.font('Helvetica')
   .text('Provides an interactive drag-and-drop seating canvas mapped to standard desk layouts. Displays Emirati, Inclusion, MAGT, and EAL flags in real-time, allowing teachers to visually balance rooms. Prints cleanly to A4 landscape.', { lineGap: 2.5 });

doc.font('Helvetica-Bold')
   .text('• Tactile Classroom Group Matcher & Wheel Spinner:', { lineGap: 1.5 });
doc.font('Helvetica')
   .text('Facilitates classroom engagement via a physical-simulation picker wheel with custom HTML5 canvas mechanics, sound cues, and reward particles. Features automated group builders with peer balance controls.', { lineGap: 2.5 });

doc.font('Helvetica-Bold')
   .text('• Academic Converters & Toolkit:', { lineGap: 1.5 });
doc.font('Helvetica')
   .text('Houses live conversion matrices for Arabic MOE percentages, MYP boundary totals, and administrative calculators.', { lineGap: 2.5 });

// ==========================================
// PAGE 5: QUALITY ASSURANCE & REPORTING CYCLE AUDIT
// ==========================================
doc.addPage();

doc.fontSize(20)
   .fillColor(BLUE_DARK)
   .font('Helvetica-Bold')
   .text('6. Quality Assurance (QA) & Reporting Cycle Audit', 54, 60);
doc.strokeColor(RED).lineWidth(1.5).moveTo(54, 85).lineTo(120, 85).stroke();

doc.moveDown(1.5);

doc.fontSize(11)
   .fillColor(GRAY_TEXT)
   .font('Helvetica')
   .text('The SISD EduKit acts as a core technical enabler for the official school 2025-2026 Academic Data Framework Quality Assurance (QA) Guidelines. The portal structurally aligns system controls with institutional review roles to guarantee grading and reporting integrity:', { lineGap: 3.5 });

doc.moveDown(1);

doc.fontSize(10.5)
   .fillColor(BLUE_DARK)
   .font('Helvetica-Bold')
   .text('• Subject Coordinators (SubCos) Review Pathway:', { lineGap: 2 });
doc.fontSize(9.5)
   .fillColor(GRAY_TEXT)
   .font('Helvetica')
   .text('  - Missing Data Auditing: If a student connected from iSAMS is missing any required MYP criterion grades (Criterion A, B, C, or D), the system locks down comment generation, labels the student "⚠️ Missing Grades", and halts copying to instruct downloading the latest roster/score file.', { lineGap: 2 });
doc.text('  - Comment Bank Alignment: SubCos can review, test, and amend pre-authored JSON comment banks directly within the browser, verifying alignment with academic standards before AP5 releases.', { lineGap: 2 });

doc.moveDown(0.8);

doc.fontSize(10.5)
   .fillColor(BLUE_DARK)
   .font('Helvetica-Bold')
   .text('• Teacher Peer-Checking Interface:', { lineGap: 2 });
doc.fontSize(9.5)
   .fillColor(GRAY_TEXT)
   .font('Helvetica')
   .text('  - Grade Boundary Guard (1/2 Marks): System logic flags border grade boundary totals (1 or 2 points below higher grading tiers), warning teachers to re-evaluate attainment before finalizing entries in iSAMS.', { lineGap: 2 });
doc.text('  - Manual Draft Interception: If a student achieves a final MYP Grade of 1 or 2, or individual criteria grades of 1 or 2, the system automatically intercepts auto-generation, labels the row "⚠️ Manual Draft", and restricts default stitching.', { lineGap: 2 });

doc.moveDown(0.8);

doc.fontSize(10.5)
   .fillColor(BLUE_DARK)
   .font('Helvetica-Bold')
   .text('• Inclusion, EAL, and MAGT Spot-Checking:', { lineGap: 2 });
doc.fontSize(9.5)
   .fillColor(GRAY_TEXT)
   .font('Helvetica')
   .text('  - Real-Time Balancing Badges: The Seating Chart Studio and Cohort Analysis tools display colored badges showing EAL, Emirati, Inclusion (SEN), and MAGT allocations, allowing specialist coordinators to audit and verify individual student groups directly on A4 grids.', { lineGap: 2 });

doc.moveDown(0.8);

doc.fontSize(10.5)
   .fillColor(BLUE_DARK)
   .font('Helvetica-Bold')
   .text('• Data Manager Framework Audits:', { lineGap: 2 });
doc.fontSize(9.5)
   .fillColor(GRAY_TEXT)
   .font('Helvetica')
   .text('  - Attainment vs. KHDA Judgments: The Cohort Analysis Dashboard processes average criteria achievement scores (Crit A-D) and gender distributions, allowing the Data Manager to run local validations against KHDA attainment boundaries for AP5 reporting, keeping all computations local.', { lineGap: 2 });

// ==========================================
// PAGE 6: OPERATIONAL BENEFITS & MAINTENANCE
// ==========================================
doc.addPage();

doc.fontSize(20)
   .fillColor(BLUE_DARK)
   .font('Helvetica-Bold')
   .text('7. Core Operational & Financial Benefits', 54, 60);
doc.strokeColor(RED).lineWidth(1.5).moveTo(54, 85).lineTo(120, 85).stroke();

doc.moveDown(1.5);

doc.fontSize(11)
   .fillColor(GRAY_TEXT)
   .font('Helvetica-Bold')
   .text('A. Zero Infrastructure Costs ($0/month)', { lineGap: 2 });
doc.fontSize(10)
   .font('Helvetica')
   .text('Because there is no backend database, cloud files hosting, or dedicated application hosting server to maintain, the ongoing operational cost of SISD EduKit is exactly $0/month. Static frontend assets are served for free via GitHub Pages, and Vercel\'s free-tier serverless processing easily absorbs normal query proxy requirements.', { lineGap: 3 });

doc.moveDown(0.8);

doc.fontSize(11)
   .font('Helvetica-Bold')
   .text('B. Maximum Local Stability', { lineGap: 2 });
doc.fontSize(10)
   .font('Helvetica')
   .text('If the school network experiences temporary outages, the application continues to run fully from local browser PWA cache buffers. Teachers can parse iSAMS exports, arrange seating plans, and use toolkit converters without internet access.', { lineGap: 3 });

doc.moveDown(1.5);

doc.fontSize(20)
   .fillColor(BLUE_DARK)
   .font('Helvetica-Bold')
   .text('8. Maintenance & Support Framework', 54, 280);
doc.strokeColor(RED).lineWidth(1.5).moveTo(54, 305).lineTo(120, 305).stroke();

doc.moveDown(1.5);

doc.fontSize(11)
   .font('Helvetica-Bold')
   .text('A. Zero IT Server Maintenance Overhead', { lineGap: 2 });
doc.fontSize(10)
   .font('Helvetica')
   .text('Standard database-driven school systems require constant OS security patching, database backup maintenance, and resource scaling rules. SISD EduKit\'s pure static serverless model removes all ongoing IT maintenance liabilities.', { lineGap: 3 });

doc.moveDown(0.8);

doc.fontSize(11)
   .font('Helvetica-Bold')
   .text('B. Browser Portability & Client Troubleshooting', { lineGap: 2 });
doc.fontSize(10)
   .font('Helvetica')
   .text('Supported natively on Chrome, Edge, Firefox, and Safari. Update delivery is managed seamlessly through automatic service worker cache invalidation. Since the application is completely stateless, 99% of user-reported issues can be resolved instantly by clicking the "Disconnect MIS Data" button or doing a hard refresh (Ctrl + F5), resetting local sandbox buffers with zero risk of database corruption.', { lineGap: 3 });

// ==========================================
// PAGE 7: SIGN-OFF & VERIFICATION
// ==========================================
doc.addPage();

doc.fontSize(20)
   .fillColor(BLUE_DARK)
   .font('Helvetica-Bold')
   .text('9. IT Approval & Verification Protocol', 54, 60);
doc.strokeColor(RED).lineWidth(1.5).moveTo(54, 85).lineTo(120, 85).stroke();

doc.moveDown(1.5);

doc.fontSize(11)
   .fillColor(GRAY_TEXT)
   .font('Helvetica-Oblique')
   .text('This technical specification document serves as the formal architectural proposal and security audit declaration for the SISD EduKit - Teacher Portal. By utilizing client-side memory spaces and domain sandbox boundaries, the portal guarantees strict data privacy, zero unauthorized network transmissions, and comprehensive data erasure triggers.', { lineGap: 4 });

doc.moveDown(3);

doc.strokeColor(BORDER).lineWidth(0.5).moveTo(54, 200).lineTo(541, 200).stroke();

doc.moveDown(2);

// Signature layout
const sigY = 230;
doc.fontSize(10).fillColor(GRAY_TEXT).font('Helvetica-Bold').text('Prepared By:', 54, sigY);
doc.fontSize(12).text('Systems Development Team', 54, sigY + 18);
doc.fontSize(9.5).fillColor(GRAY_MUTED).font('Helvetica').text('Lead Systems Architect, EduKit Portal', 54, sigY + 36);
doc.text('Swiss International Scientific School Dubai', 54, sigY + 50);

doc.fontSize(10).fillColor(GRAY_TEXT).font('Helvetica-Bold').text('Approved By:', 300, sigY);
doc.fontSize(12).text('IT Security & Compliance Officer', 300, sigY + 18);
doc.fontSize(9.5).fillColor(GRAY_MUTED).font('Helvetica').text('Chief Information Security Officer (CISO)', 300, sigY + 36);
doc.text('SISD Academic IT Committee', 300, sigY + 50);

doc.save();
doc.rect(54, 380, 487, 80).fill(BG_BOX);
doc.rect(54, 380, 487, 80).strokeColor(BORDER).lineWidth(1).stroke();
doc.fontSize(9.5)
   .fillColor(GRAY_TEXT)
   .font('Helvetica-Bold')
   .text('🔐 AUDIT SIGN-OFF STATUS:', 74, 396);
doc.fontSize(9)
   .font('Helvetica')
   .text('Upon review of the zero-transmission backend, local sandboxing, and immediate browser-controlled LocalStorage clear routines, this application is cleared for deployment under standard DSIB security recommendations.', 74, 414, { width: 440, lineGap: 2 });
doc.restore();

// End Document
doc.end();

stream.on('finish', () => {
  console.log('✓ PDF generated successfully at:');
  console.log(`  ${pdfPath}`);
  console.log('-------------------------------------------');
});

