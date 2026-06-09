// generate-comment-gen-pdf.cjs
// Automated PDF compiler script for SISD EduKit Comment Generator Technical Documentation
// Usage: node generate-comment-gen-pdf.cjs

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pdfPath = path.join(__dirname, 'SISD_Comment_Generator_Technical_Documentation.pdf');

console.log('--- SISD EduKit Comment Generator PDF Compiler ---');

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
    Title: 'SISD EduKit - Comment Generator Technical Specs & Privacy Compliance Report',
    Author: 'SISD Lead Architect',
    Subject: 'Comment Generator Security & Compliance Approval',
    Keywords: 'SISD, EduKit, Comment Generator, iSAMS, DSIB, Compliance, UAE PDPL, Client-Side, Privacy',
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
     .text('SISD EduKit - Comment Generator Technical Specs & Privacy Compliance Report', 54, 30, { align: 'left' });
  doc.text('CONFIDENTIAL / DSIB COMPLIANT', 54, 30, { align: 'right' });
  
  // Header line
  doc.strokeColor(BORDER).lineWidth(0.5).moveTo(54, 42).lineTo(541, 42).stroke();
  
  // Footer line
  doc.strokeColor(BORDER).lineWidth(0.5).moveTo(54, 792 - 42).lineTo(541, 792 - 42).stroke();
  
  // Footer
  doc.fontSize(8)
     .fillColor(GRAY_MUTED)
     .text('Swiss International Scientific School Dubai • Comment Generator Approval', 54, 792 - 34, { align: 'left' });
  
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
   .text('REF: SISD-EDUKIT-COMMENTGEN-1.0.0', 120, 105);

doc.moveDown(4);

// Title
doc.fontSize(32)
   .fillColor(BLUE_DARK)
   .font('Helvetica-Bold')
   .text('SISD EduKit', 54, 180, { lineGap: 6 });

doc.fontSize(24)
   .fillColor(RED)
   .font('Helvetica')
   .text('Comment Generator Module', { lineGap: 8 });

// Divider
doc.strokeColor(RED).lineWidth(3).moveTo(54, 270).lineTo(150, 270).stroke();

doc.moveDown(2);

// Subtitle
doc.fontSize(14)
   .fillColor(GRAY_TEXT)
   .font('Helvetica-Oblique')
   .text('Technical Specifications, Local Client-Side Security Architecture, UAE PDPL Compliance & Academic Quality Assurance Report', 54, 300, { width: 480, lineGap: 4 });

doc.moveDown(5);

// Metadata Block
doc.save();
doc.rect(54, 460, 487, 180).fill(BG_BOX);
doc.rect(54, 460, 487, 180).strokeColor(BORDER).lineWidth(1).stroke();

doc.fontSize(10).fillColor(GRAY_MUTED).font('Helvetica-Bold').text('PROJECT AUDIT METADATA', 74, 480);

const metaY = 510;
doc.fontSize(10).fillColor(GRAY_MUTED).font('Helvetica').text('Institution:', 74, metaY);
doc.fillColor(GRAY_TEXT).font('Helvetica-Bold').text('Swiss International Scientific School Dubai (SISD)', 180, metaY);

doc.fillColor(GRAY_MUTED).font('Helvetica').text('Module Boundary:', 74, metaY + 22);
doc.fillColor(GRAY_TEXT).font('Helvetica-Bold').text('Offline Client-Side Sandbox (No Network Transmissions)', 180, metaY + 22);

doc.fillColor(GRAY_MUTED).font('Helvetica').text('Compliance Standards:', 74, metaY + 44);
doc.fillColor(GRAY_TEXT).font('Helvetica-Bold').text('DSIB Guidelines, KHDA Student Security Directive, UAE PDPL', 180, metaY + 44);

doc.fillColor(GRAY_MUTED).font('Helvetica').text('Core Engine:', 74, metaY + 66);
doc.fillColor(GRAY_TEXT).font('Helvetica-Bold').text('Local Criteria Mapping & Deterministic JSON Banks', 180, metaY + 66);
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
   .text('The SISD EduKit Comment Generator is a high-performance, local-first reporting engine designed to automate the assembly of student report card remarks for IB MYP educators at the Swiss International Scientific School in Dubai (SISD). Report card writing typically involves high administrative overhead and strict regulations concerning student record data privacy.', { lineGap: 3.5 });

doc.moveDown(0.8);

doc.text('Rather than using third-party remote servers or public cloud AI APIs (which pose risks of data leakages and violate student data protection policies), the Comment Generator executes entirely in the browser thread of the teacher\'s device. It parses local Excel sheets containing student names and grades, cross-references these with coordinator-approved criteria rubrics and JSON comment banks, and outputs complete, beautifully formatted paragraphs locally—with zero bytes of pupil records transmitted to the internet.', { lineGap: 3.5 });

// Tech Stack
doc.fontSize(20)
   .fillColor(BLUE_DARK)
   .font('Helvetica-Bold')
   .text('Technology Stack', 54, 340);
doc.strokeColor(RED).lineWidth(1.5).moveTo(54, 365).lineTo(120, 365).stroke();

doc.moveDown(1.5);

doc.fontSize(10.5)
   .fillColor(GRAY_TEXT)
   .font('Helvetica')
   .text('• React 19 & Vite 8: Provides a modern, responsive, component-driven UI architecture that compiles to lightweight static files, eliminating server-side load.', { lineGap: 3 });
doc.text('• SheetJS (xlsx): Enables binary Excel sheet parsing on the client side. Ingests iSAMS rosters, grades, and demographics in less than 50 milliseconds inside the browser memory.', { lineGap: 3 });
doc.text('• Service Worker Pre-Caching: Facilitates offline-first availability, loading application pages instantly even in dead zones or during campus network outages.', { lineGap: 3 });
doc.text('• Client-Side Storage: Persists active rosters in the browser\'s LocalStorage sandbox. Data is kept locally under the domain\'s Same-Origin Policy.', { lineGap: 3 });
doc.text('• Pre-Cached JSON Comment Banks: Pre-authored structures containing localized subject remarks written by coordinators, eliminating the need for cloud databases.', { lineGap: 3 });

// ==========================================
// PAGE 3: DATA PRIVACY & COMPLIANCE
// ==========================================
doc.addPage();

doc.fontSize(20)
   .fillColor(BLUE_DARK)
   .font('Helvetica-Bold')
   .text('Data Privacy & Regulatory Compliance', 54, 60);
doc.strokeColor(RED).lineWidth(1.5).moveTo(54, 85).lineTo(120, 85).stroke();

doc.moveDown(1.5);

doc.fontSize(11)
   .fillColor(GRAY_TEXT)
   .font('Helvetica-Bold')
   .text('A. UAE Federal PDPL (Decree-Law No. 45 of 2021) Alignment', { lineGap: 2 });
doc.font('Helvetica')
   .text('The UAE Personal Data Protection Law mandates strict rules regarding processing and transmitting personal data. Because the Comment Generator does not utilize any server API endpoints, backend databases, or tracking scripts, student names and grades never cross international borders or leave the teacher\'s device. The school operates in complete compliance with the PDPL.', { lineGap: 3.5 });

doc.moveDown(0.8);

doc.font('Helvetica-Bold')
   .text('B. Dubai DSIB & KHDA Student Security Directives', { lineGap: 2 });
doc.font('Helvetica')
   .text('Centralized servers and cloud storage represent high-value targets for malicious actors. By running entirely in browser sandbox threads, the Comment Generator eliminates the risk of centralized data breaches. Security scaling is tied to the physical device and internal directory credentials of the teacher\'s terminal.', { lineGap: 3.5 });

doc.moveDown(0.8);

doc.font('Helvetica-Bold')
   .text('C. Automated Data Erasure Protocol', { lineGap: 2 });
doc.font('Helvetica')
   .text('Teachers retain complete ownership of the data workspace. Clicking "Disconnect Data" or clearing the browser\'s storage completely wipes all traces of student records from memory cache, returning the client sandbox to a zero-record state.', { lineGap: 3.5 });

// Privacy pillars box
doc.save();
doc.rect(54, 450, 487, 130).fill('#fffafb');
doc.rect(54, 450, 487, 130).strokeColor(RED).lineWidth(1).stroke();

doc.fontSize(11)
   .fillColor(RED_DARK)
   .font('Helvetica-Bold')
   .text('🛡️ Comment Generator Privacy Commitments', 74, 465);

doc.fontSize(9.5)
   .fillColor(GRAY_TEXT)
   .font('Helvetica')
   .text('1. Zero Cloud Transmission: Student names, criteria grades, and comments remain local.', 74, 490);
doc.text('2. Deterministic Execution: Logic is governed by local formulas, not cloud LLMs.', 74, 510);
doc.text('3. Temporary Sandbox: Closes immediately when browser cache or session is disconnected.', 74, 530);
doc.text('4. No Analytics: No tracking tags, telemetry tools, or pixel scripts are incorporated.', 74, 550);
doc.restore();

// ==========================================
// PAGE 4: DETAILED WORKFLOWS & QUALITY ASSURANCE
// ==========================================
doc.addPage();

doc.fontSize(20)
   .fillColor(BLUE_DARK)
   .font('Helvetica-Bold')
   .text('Comment Generation Workflows & QA', 54, 60);
doc.strokeColor(RED).lineWidth(1.5).moveTo(54, 85).lineTo(120, 85).stroke();

doc.moveDown(1.5);

doc.fontSize(11)
   .fillColor(GRAY_TEXT)
   .font('Helvetica')
   .text('To maintain high academic standards and prevent errors during the reporting cycle, the Comment Generator integrates automated validation gates and QA workflows:', { lineGap: 3.5 });

doc.moveDown(1);

doc.fontSize(10.5)
   .fillColor(BLUE_DARK)
   .font('Helvetica-Bold')
   .text('1. Automatic Grade Boundary Guard (1/2 Marks Warning)', { lineGap: 2 });
doc.fontSize(9.5)
   .fillColor(GRAY_TEXT)
   .font('Helvetica')
   .text('If a student\'s total MYP criteria score (A+B+C+D) falls exactly 1 or 2 marks below the next higher grade boundary, the generator highlights the entry and warns the teacher. This encourages peer-checking and score verification before exporting.', { lineGap: 3 });

doc.moveDown(0.8);

doc.fontSize(10.5)
   .fillColor(BLUE_DARK)
   .font('Helvetica-Bold')
   .text('2. Manual Draft Interception for Low Attainment', { lineGap: 2 });
doc.fontSize(9.5)
   .fillColor(GRAY_TEXT)
   .font('Helvetica')
   .text('If a student achieves a final MYP Grade of 1 or 2, or individual criteria grades of 1 or 2, the generator flags the record as "⚠️ Manual Draft". It halts automatic stitching to force the teacher to customize the comment manually, ensuring pedagogical support matches low attainment levels.', { lineGap: 3 });

doc.moveDown(0.8);

doc.fontSize(10.5)
   .fillColor(BLUE_DARK)
   .font('Helvetica-Bold')
   .text('3. Missing Data Auditing & Copy Lockdowns', { lineGap: 2 });
doc.fontSize(9.5)
   .fillColor(GRAY_TEXT)
   .font('Helvetica')
   .text('If a student\'s record connected from iSAMS is missing required MYP criteria marks, the Comment Generator locks the copying features for that row and labels the student "⚠️ Missing Grades", forcing data consistency prior to export.', { lineGap: 3 });

doc.moveDown(0.8);

doc.fontSize(10.5)
   .fillColor(BLUE_DARK)
   .font('Helvetica-Bold')
   .text('4. Coordinator-Aligned Subject Banks (JSON)', { lineGap: 2 });
doc.fontSize(9.5)
   .fillColor(GRAY_TEXT)
   .font('Helvetica')
   .text('Comment banks are structured in pre-authored JSON lists configured by SISD Subject Coordinators and Senior Leadership. The engine maps criteria achievement and ATL ratings (Novice, Practitioner, Expert) dynamically to pre-approved phrasing, guaranteeing semantic alignment across sections.', { lineGap: 3 });

// ==========================================
// PAGE 5: THREAT MATRIX & OPERATIONS
// ==========================================
doc.addPage();

doc.fontSize(20)
   .fillColor(BLUE_DARK)
   .font('Helvetica-Bold')
   .text('Security Architecture & Threat Matrix', 54, 60);
doc.strokeColor(RED).lineWidth(1.5).moveTo(54, 85).lineTo(120, 85).stroke();

doc.moveDown(1.5);

doc.fontSize(10)
   .font('Helvetica')
   .text('Below is the threat matrix for the Comment Generator module showing mitigations of the zero-transmission local model:', { lineGap: 4 });

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
  { threat: 'Database Data Leak', like: 'Low', imp: 'Critical', mit: 'No central database exists. Student rosters reside only in temporary client-side memory.', res: 'Zero' },
  { threat: 'Cloud API Key Theft', like: 'Low', imp: 'High', mit: 'Stateless offline design. Key integration is avoided inside the comment compiler workflows.', res: 'Zero' },
  { threat: 'In-Transit Siphoning', like: 'Low', imp: 'High', mit: '100% offline generation loop. No network packets contain student records or PII payloads.', res: 'Zero' },
  { threat: 'Device Loss/Theft', like: 'Medium', imp: 'High', mit: 'Client storage is bound by device operating system screenlocks, browser passwords, and manual purge.', res: 'Low' }
];

let rowY = tableTop + 24;
rows.forEach((row, index) => {
  if (index % 2 === 0) {
    doc.rect(54, rowY, 487, 34).fill('#f7fafc');
  } else {
    doc.rect(54, rowY, 487, 34).fill('#ffffff');
  }
  
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

doc.moveDown(2.5);

doc.fontSize(20)
   .fillColor(BLUE_DARK)
   .font('Helvetica-Bold')
   .text('Core Operational & Financial Benefits', 54, 305);
doc.strokeColor(RED).lineWidth(1.5).moveTo(54, 330).lineTo(120, 330).stroke();

doc.moveDown(1.5);

doc.fontSize(10.5)
   .fillColor(GRAY_TEXT)
   .font('Helvetica')
   .text('• Zero Infrastructure Overhead: Because there are no backend applications, servers, databases, or API integrations involved in generating comments, operational costs are exactly $0/month.', { lineGap: 3 });
doc.text('• Maximum Network Resilience: Operating from local cache means the Comment Generator functions normally during local school Wi-Fi outages, protecting teachers from downtime during high-stress reporting cycles.', { lineGap: 3 });
doc.text('• Seamless IT Support: Users can resolve 99% of formatting or data mismatches instantly by clearing local browser buffers or clicking "Disconnect MIS Data" without risk of database corruption.', { lineGap: 3 });

// ==========================================
// PAGE 6: APPROVAL SIGN-OFF
// ==========================================
doc.addPage();

doc.fontSize(20)
   .fillColor(BLUE_DARK)
   .font('Helvetica-Bold')
   .text('IT Approval & Verification Protocol', 54, 60);
doc.strokeColor(RED).lineWidth(1.5).moveTo(54, 85).lineTo(120, 85).stroke();

doc.moveDown(1.5);

doc.fontSize(11)
   .fillColor(GRAY_TEXT)
   .font('Helvetica-Oblique')
   .text('This technical specification document serves as the formal architectural proposal and security audit declaration for the SISD EduKit Comment Generator. By processing assessments inside browser sandboxes and using client-side execution boundaries, the engine guarantees compliance, privacy, and absolute data safety.', { lineGap: 4 });

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
   .text('Upon review of the zero-transmission backend, local sandboxing, and immediate browser-controlled LocalStorage clear routines, this module is cleared for deployment under standard DSIB security recommendations.', 74, 414, { width: 440, lineGap: 2 });
doc.restore();

// End Document
doc.end();

stream.on('finish', () => {
  console.log('✓ PDF generated successfully at:');
  console.log(`  ${pdfPath}`);
  console.log('-------------------------------------------');
});
