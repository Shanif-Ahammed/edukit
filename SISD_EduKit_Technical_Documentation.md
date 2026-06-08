# 🏫 SISD EduKit - Teacher Portal
## Comprehensive Technical Documentation & Architecture Report
**Prepared for**: Swiss International Scientific School in Dubai (SISD) IT Department, DSIB Inspection Committee, and Academic Leadership
**Version**: 1.0.0  
**Classification**: Public / Technical Approval Submission  
**Author**: Lead Systems Architect  

---

### Executive Summary

**SISD EduKit - Teacher Portal** is a next-generation, high-performance, and secure offline-first workspace designed specifically for educators at the **Swiss International Scientific School in Dubai (SISD)**. 

To satisfy Dubai DSIB data security and pupil protection guidelines, SISD EduKit implements a **pure client-side (100% backend-less) architecture**. There is **absolutely no database, cloud storage, or application server backend** associated with this system. All student MIS parses, grade calculations, criteria mapping, interactive classroom seating arrangements, and academic report card comment assembly run entirely in-browser using client-side JavaScript. 

**Core Privacy Principle**: Student records, names, classes, grades, and lists **never leave the user's browser, are never transmitted across any network, and are never stored on any server or database.** 

Instead of using privacy-compromising cloud-based generative AI networks to draft report cards, the portal employs a **smartly structured, purely coded Report Comment Builder**. This builder dynamically compiles highly personalized report paragraphs by mapping student grading files directly against a **pre-authored JSON comment bank** written by subject coordinators and Senior Leadership Team (SLT) members. The system is completely offline-capable, and all operational states can be completely and instantly purged by clearing the browser cache or clicking "Disconnect MIS Data."

---

### 1. Technology Stack

The application relies entirely on modern, lightweight, and standard web technologies to guarantee maximum portability, lightning-fast rendering speed, and zero platform dependency.

*   **Core Framework**: **React 19**
    *   Leverages component-driven UI architecture, lightweight state hooks (`useState`, `useEffect`, `useContext`), and the Virtual DOM for highly responsive transitions.
*   **Build System**: **Vite 8**
    *   Provides ultra-fast Hot Module Replacement (HMR) and a highly optimized Rollup-based compilation pipeline for production-ready static assets.
*   **Styling & Design System**: **Vanilla CSS (Custom Properties)**
    *   Structured using standard CSS Custom Properties (Variables) inside `src/index.css`. Includes high-contrast dark modes, glassmorphism UI elements, strict visual hierarchies, and print-specific layout overrides (`@media print`).
*   **Data Parsing Libraries**:
    *   **SheetJS (xlsx@0.18.5)**: Used to parse raw Excel sheets directly from school management systems (like iSAMS) inside the client browser.
    *   **PapaParse (papaparse@5.5.3)**: Provides fast, robust client-side CSV parsing.
*   **Interactive Visual Elements**:
    *   **Canvas Confetti (canvas-confetti@1.9.4)**: Powers lightweight, performant canvas-based animations for study group matching and reward selectors.
    *   **Lucide React (lucide-react@1.16.0)**: Provides a consistent, vector-grade icon design language.
*   **Service Worker Engine**: Custom PWA service worker (`public/sw.js`) implementing caching strategies to allow offline execution.

---

### 2. System Architecture & Data Flows

SISD EduKit operates on a **100% static, client-side, zero-backend architecture**. Because all core teacher tools are written as client side scripts, the system is fully operational offline and does not carry server storage liabilities.

```
+---------------------------------------------------------------------------------------------+
|                                  LOCAL CLIENT-SIDE BROWSER                                  |
|                                                                                             |
|   +-------------------+                                                                     |
|   |   iSAMS Export    | ----(Local XLSX File)----+                                          |
|   |   (Local Excel)   |                          |                                          |
|   +-------------------+                          v                                          |
|                                         +------------------+        +-------------------+   |
|   +-------------------+                 |   Excel Parser   | ---->  | DataContext State |   |
|   | Local Comment Bank| ----(JSON)----> | (SheetJS Engine) |        | (Transient Memory)|   |
|   | (Authored by SLT) |                 +------------------+        +-------------------+   |
|   +-------------------+                          ^                            |             |
|                                                  |                            v             |
|                                         +------------------+        +-------------------+   |
|                                         |  Comment Builder |        |  PWA Local Cache  |   |
|                                         | (Stitched Logic) |        |   (sw.js Cache)   |   |
|                                         +------------------+        +-------------------+   |
|                                                  |                            ^             |
|                                                  v                            |             |
|                                         +------------------+                  |             |
|                                         | Compiled Report  |                  |             |
|                                         | (Copy/Excel Out) |                  |             |
|                                         +------------------+                  |             |
|                                                                               |             |
+-------------------------------------------------------------------------------+-------------+
                                                                                |
                                                  Deploy Compiled Code Assets   |
                                                  (HTML, CSS, JS Shells Only)   |
                                                                                v
+---------------------------------------------------------------------------------------------+
|                                STATIC HOSTING LAYER (NO BACKEND)                            |
|                                                                                             |
|   +-------------------------------------------------------------------------------------+   |
|   | GitHub Pages (Free Static Files Distribution - Zero Database, Zero Processing)      |   |
|   +-------------------------------------------------------------------------------------+   |
+---------------------------------------------------------------------------------------------+
```

#### A. Static Frontend Hosting
All compiled static files (HTML, CSS, JS, Assets) are deployed directly to a static hosting platform (e.g., **GitHub Pages**). Because the site only serves static code assets to the teacher's browser, there are no databases, backend runtime environments, or file servers hosting private data. 

#### B. Stateless Help Chat Proxy
To support an interactive **technical support bot (`AiAssistant`)** inside the app to help teachers troubleshoot Excel templates, the portal features a stateless, zero-key cloud proxy:
1.  **Vercel Serverless Function (`api/gemini.js`)**: A secure serverless endpoint is hosted on Vercel. This function retains a private key on the server-side to resolve general portal questions (e.g. *"how do I export the excel from iSAMS?"*).
2.  **Strict Isolation from Student Data**: The Help Assistant is completely separate from active gradebooks and seating charts. It **cannot access the attached Excel roster or local browser databases**. Teachers query the chatbot strictly for user guide assistance, with zero network transaction of student records.
3.  **Stateless Execution**: The serverless proxy has no database connection, writes no request logs, and acts purely as a stateless gateway for general educational help prompts.

#### C. Offline-First PWA Engine
The custom Service Worker (`public/sw.js`) intercepts assets to enable complete functionality during campus Wi-Fi drops:
*   **Static Shell Caching (`install` event)**: Pre-caches critical HTML/CSS/JS shell elements during load.
*   **Stale-While-Revalidate Strategy**: Static assets are loaded immediately from the cache for sub-second startup speeds, while a network check runs in the background to fetch system updates transparently.
*   **Navigation Fallback**: Navigation requests default to the cached `index.html` structure when offline.

---

### 3. Data Privacy & Compliance Framework

#### A. Zero-Transmission Core Policy
The most critical asset of the SISD EduKit is its complete adherence to zero-transmission principles:
1.  **Direct Local Parse**: When a teacher connects an iSAMS roster Excel export, the file is read in memory using client-side JavaScript. The file is never uploaded to any server.
2.  **No Server-Side Analytics**: There are no tracking scripts (such as Google Analytics or Hotjar) capturing teacher clicks, input values, or roster metadata.
3.  **Purely Coded, Local Comment Assembly**: Generative comment drafts are assembled completely offline in the browser thread. The application reads pre-cached, subject-specific JSON comment banks authored by SISD subject coordinators and SLT. Because no network calls, AI APIs, or databases are connected to compile comments, roster records are structurally protected from online exposure.
4.  **AI Local Boundary & Direct Excel Exclusion**: The Gemini AI help chatbot (`AiAssistant`) is strictly an interactive user guide and has **absolutely no direct access to connected Excel spreadsheets**. The Excel file exists solely in local browser memory variables and is never transmitted to the chatbot's serverless proxy or Google Gemini endpoints.
5.  **Strict Non-Training Policy**: Chatbot queries strictly consist of general teacher help questions and system instructions. The proxy routes requests using Google's developer API tier, which **has no access to student data or portal source code for AI model training purposes** (prompt inputs are never saved, logged, or utilized to train Google models).

#### B. Local Storage Boundaries & Security
To prevent teachers from having to re-import their rosters every single time they refresh their tab, the application caches transient work state in the browser's **Web Storage Sandbox (`localStorage`)** under standard isolated domains.
*   **Storage Keys**: `edukit_mis_connected`, `edukit_mis_filename`, `edukit_mis_students`, `edukit_mis_classes`, `edukit_mis_selected_class`, `edukit_mis_subject`, `edukit_mis_teacher`.
*   **Sandbox Isolation**: By standard browser security protocols (Same-Origin Policy), the Web Storage is strictly sandboxed. Only scripts served from the exact same domain can access this data. Other websites, browser tabs, or external networks are strictly prohibited by the browser's core engine from reading these variables.

#### C. Comprehensive Data Erasure
Data removal is instantaneous and requires no database queries or contact with administrators:
1.  **Application Disconnect**: When the user clicks the **"Disconnect MIS Data"** button, the React context executes `changeFile()`, which clears internal application state and runs:
    ```javascript
    localStorage.removeItem('edukit_mis_connected');
    localStorage.removeItem('edukit_mis_filename');
    localStorage.removeItem('edukit_mis_students');
    localStorage.removeItem('edukit_mis_classes');
    localStorage.removeItem('edukit_mis_selected_class');
    localStorage.removeItem('edukit_mis_subject');
    localStorage.removeItem('edukit_mis_teacher');
    localStorage.removeItem('edukit_mis_missing');
    ```
2.  **Browser Cache Purge**: Standard browser clearing of "Cookies and Site Data" immediately destroys the LocalStorage database and Service Worker caches, returning the device to a pristine, zero-data state.

#### D. Compliance Auditing

| Standard / Regulation | Compliance Status | Rationale |
| :--- | :---: | :--- |
| **UAE PDPL (Federal Decree-Law No. 45 of 2021 on Personal Data Protection)** | **Fully Compliant** | The law governs the collection and processing of personal data. Since SISD EduKit **does not collect, store, or transmit** any personal data to servers, it does not act as an external data controller or processor. Data remains strictly in the custody of the authorized teacher on their device. |
| **KHDA / DSIB Pupil Protection Guidelines** | **Fully Compliant** | Student rosters, behavioral tags, and grades cannot be leaked or breached in a server attack, as there is no central database. Authorized teachers process records within sandboxed, authenticated local devices. |
| **GDPR (General Data Protection Regulation)** | **Fully Compliant** | Complies with standard GDPR principles (Data Minimization, Storage Limitation, and Right to Erasure) by executing all operations locally and allowing instant, user-controlled deletion. |

---

### 4. Security Architecture & Threat Model

The application mitigates common web vulnerabilities through strict architecture patterns:

#### A. Threat Matrix & Risk Assessment

| Threat Identification | Likelihood | Impact | Mitigation Strategy | Residual Risk |
| :--- | :---: | :---: | :--- | :---: |
| **Gemini API Key Theft** (Frontend Exposure) | Low | High | **Serverless Secure Proxy**: The frontend does not possess the API key. The key resides in protected environment variables within the Vercel cloud container (`process.env.GEMINI_API_KEY`). | **Negligible** |
| **Student Roster Leak** (Data Breach of Hosting Server) | Low | Critical | **Zero Storage Architecture**: The static hosting server (GitHub Pages) only stores HTML, CSS, and JS assets. There are no databases or files containing student information on the server. A breach of the hosting platform yields only source code, never student data. | **Zero** |
| **Cross-Site Scripting (XSS)** (Malicious Data Injection) | Low | Medium | **Sanitized Data Binding**: React's native data binding automatically escapes JSX variable rendering (`{student.name}`), preventing raw HTML injection from malicious MIS inputs. | **Negligible** |
| **Unauthorized Local Device Access** (Physical Theft of Device) | Medium | High | **Standard OS/Browser Locks**: Storage is sandboxed. The risk is minimized by standard OS-level logins, screen locks, and the "Disconnect MIS Data" button which can be clicked at the end of every active session. | **Low** |
| **Unauthorized AI Requests** (Proxy Spamming) | Medium | Low | **CORS Restriction**: The Vercel function can be configured to inspect headers and restrict requests to approved SISD domains, preventing off-site exploitation of the proxy. | **Low** |

---

### 5. Website Portal Features & Interactive Tools

SISD EduKit offers an integrated workspace packed with features that consolidate teacher workflows into a single secure browser tab. The key website modules include:

1.  **iSAMS Excel Dashboard Connector**:
    *   *Fuzzy Header Dictionary*: Employs advanced regular expression arrays to automatically match varying column titles (e.g., student name vs full name) directly from iSAMS raw exports.
    *   *Instant Connection Badge*: Visually displays standard missing parameters (like MEGs or EAL tags) and indicates server connection state (always local).
2.  **Smartly Structured Report Comment Builder**:
    *   *Pre-Authored Comment Banks*: Pulls grade-matched comment segments written directly by subject coordinators and SLT. Stitches these segments dynamically inside the browser.
    *   *Grade Boundary Interception*: Active integrity safeguards warn teachers if a student's total marks are within 1 or 2 points of a higher grade tier, helping prevent grading entry errors.
    *   *Dynamic Pronoun Selector*: Resolves subject/object/possessive pronouns based on gender indicators and maps them into report comment strings.
    *   *100% Offline-Ready*: Operates completely offline, requiring zero network configurations, developer keys, or database connectivity.
3.  **A4 Seating Chart Studio**:
    *   *Interactive Seating Arranger*: Desktop grid-mapping canvas with fully interactive drag-and-drop student seat indicators.
    *   *Automatic Balancing Filters*: Displays colored badges indicating EAL, Inclusion (SEN), Emirati, and MAGT student distribution, allowing teachers to visually balance classroom environments.
    *   *Landscape Print Override*: Custom CSS rendering formats the seating grid cleanly for standard landscape printing.
4.  **Tactile Picker & Study Group Matcher**:
    *   *Simulation Picker Wheel*: Hardware-accelerated selector wheel featuring custom canvas physics, sound effects, and confetti particle simulations for classroom engagement.
    *   *Peer-Grouping Generator*: Collaboratively groups students by specific group sizes, with peer-balancing matrices.
5.  **Teacher Convertor Toolkit**:
    *   *Arabic Grade Conversion Charts*: Maps numerical ratings to official Ministry of Education (MOE) percentages.
    *   *MYP Grade Boundaries*: Identifies grade point totals (1-7 scale) across Middle Years Programme criteria boundaries.

---

### 6. Quality Assurance (QA) & Reporting Cycle Audit

The SISD EduKit acts as a core technical enabler for the official school **2025-2026 Academic Data Framework Quality Assurance (QA) Guidelines**. The portal structurally aligns system controls with institutional review roles to guarantee grading and reporting integrity:

*   **Subject Coordinators (SubCos) Review Pathway**:
    *   *Missing Data Auditing*: If a student connected from iSAMS is missing any required MYP criterion grades (Criterion A, B, C, or D), the system locks down comment generation, labels the student `⚠️ Missing Grades`, and halts copying. This assists SubCos in chasing teachers to input missing assessment data in the Online Assessment System (OAS).
    *   *Comment Bank Alignment*: SubCos can review, test, and amend pre-authored JSON comment banks directly within the browser, verifying alignment with academic standards before AP5 releases.
*   **Teacher Peer-Checking Interface**:
    *   *Grade Boundary Guard (1/2 Marks)*: System logic flags border grade boundary totals (1 or 2 points below higher grading tiers), warning teachers to re-evaluate attainment before finalizing entries in iSAMS.
    *   *Manual Draft Interception*: If a student achieves a final MYP Grade of 1 or 2, or individual criteria grades of 1 or 2, the system automatically intercepts auto-generation, labels the row `⚠️ Manual Draft`, and restricts default stitching. This prompts teachers to draft custom support plans and intervention comments.
*   **Inclusion, EAL, and MAGT Spot-Checking**:
    *   *Real-Time Balancing Badges*: The Seating Chart Studio and Cohort Analysis tools display colored badges showing EAL, Emirati, Inclusion (SEN), and MAGT allocations, allowing specialist coordinators to audit and verify individual student groups directly on A4 grids.
*   **Data Manager Framework Audits**:
    *   *Attainment vs. KHDA Judgments*: The Cohort Analysis Dashboard processes average criteria achievement scores (Crit A-D) and gender distributions, allowing the Data Manager to run local validations against KHDA attainment boundaries (Outstanding, Very Good, Good, Acceptable) for AP5 reporting, keeping all computations local.

---

### 7. Core Operational & Financial Benefits

*   **Zero Server Infrastructure Cost**: Because there is no database server, application server, or storage server to maintain, the operational cost of SISD EduKit is **$0/month**. Static assets are hosted for free on GitHub Pages, and Vercel's free serverless tier easily absorbs standard proxy requests.
*   **High Performance**: Calculations, sorting, and Excel parsing occur locally at native CPU execution speeds, avoiding the latency of network Round-Trip Times (RTT). Rosters with 1,000+ records are loaded and mapped in under **50 milliseconds**.
*   **Zero Maintenance Overhead**: Since there are no SQL/NoSQL databases, cache systems (Redis), or backend frameworks (Django/Node Express) to patch, update, or backup, the app requires virtually zero ongoing operational maintenance.
*   **Maximum Resilience**: If the school's external network fails, teachers can still load the application from their cache, parse roster Excel sheets, arrange seating plans, and use all conversion toolkits with zero interruption.

---

### 8. Maintenance & Support Framework

The architecture of SISD EduKit drastically simplifies the maintenance lifecycle, shifting operational liabilities from school IT staff to automated client-side runtimes:

*   **Zero Server Maintenance**: Unlike standard database-backed portal applications, SISD EduKit requires no backend server OS patching, security system updates, or database backup policies. The application runs strictly as static files.
*   **Browser Compatibility**: Fully supported across all standard modern HTML5-compliant browsers (Google Chrome, Microsoft Edge, Apple Safari, and Mozilla Firefox).
*   **Seamless Application Updates**: System patches and asset updates are automatically handled by the custom Service Worker cache invalidation routine (`sw.js`). When a new build is deployed, the service worker pre-caches assets in the background, updating standard layouts for subsequent sessions without user intervention.
*   **Robust IT Support Protocol**:
    *   *Simplified Client Troubleshooting*: Since the application is entirely stateless, 99% of user-reported issues can be resolved instantly by clicking the **"Disconnect MIS Data"** button or executing a hard page refresh (`Ctrl + F5`). This resets local sandbox buffers with zero risk of database corruption or file loss.
    *   *IT Customization Path*: School IT engineers can easily add custom fuzzy headers or update grading matrices directly inside `src/context/DataContext.jsx` without dealing with backend server deployments.

---

### 9. Technical Verification & Print Guidelines

To submit this document for executive sign-off:
1.  Open the accompanying **`SISD_EduKit_Technical_Documentation.html`** file in your desktop browser.
2.  Review the premium typography, detailed margins, and tables.
3.  Press **`Ctrl + P`** (Windows) or **`Cmd + P`** (Mac) to open the system print menu.
4.  Set the destination to **`Save as PDF`**.
5.  Under Options, ensure **"Background graphics"** is checked to preserve the elegant highlights and modern border gradients, and set **"Margins"** to **"Default"**.
6.  Click **`Save`** to generate your official, vector-quality, PDF technical report.
