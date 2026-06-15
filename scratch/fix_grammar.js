import fs from 'fs';
import path from 'path';

const baseDir = 'g:\\AppDev\\Teacher portal - V3';
const commentsPath = path.join(baseDir, 'public', 'comment_bank', 'comments.json');
const ibGradePath = path.join(baseDir, 'public', 'comment_bank', 'ib_grade.json');
const atlPath = path.join(baseDir, 'public', 'comment_bank', 'atl.json');

let commentsText = fs.readFileSync(commentsPath, 'utf8');
let ibGradeText = fs.readFileSync(ibGradePath, 'utf8');
let atlText = fs.readFileSync(atlPath, 'utf8');

console.log('--- Fixing Grammar & Typos in Comment Banks ---');

// 1. Misspelled words
console.log('Fixing "inconssitent" -> "inconsistent"');
commentsText = commentsText.replace(/inconssitent/gi, 'inconsistent');
ibGradeText = ibGradeText.replace(/inconssitent/gi, 'inconsistent');
atlText = atlText.replace(/inconssitent/gi, 'inconsistent');

console.log('Fixing "deepend" -> "deepen"');
commentsText = commentsText.replace(/deepend/gi, 'deepen');
ibGradeText = ibGradeText.replace(/deepend/gi, 'deepen');
atlText = atlText.replace(/deepend/gi, 'deepen');

// 2. Errant commas after Student! or Subject! (subject-verb separation commas)
console.log('Fixing subject-verb separation commas (e.g., "Student!, demonstrated")');
ibGradeText = ibGradeText.replace(/Student!,\s+demonstrated/g, 'Student! demonstrated');
ibGradeText = ibGradeText.replace(/Student!,\s+utilised/g, 'Student! utilised');
ibGradeText = ibGradeText.replace(/Student!,\s+showed/g, 'Student! showed');
ibGradeText = ibGradeText.replace(/Student!,\s+modelled/g, 'Student! modelled');
ibGradeText = ibGradeText.replace(/Student!,\s+found/g, 'Student! found');

// 3. Capitalization issues after Student! or Subject! in English comments
console.log('Fixing capitalization after placeholders');
ibGradeText = ibGradeText.replace(/Student!\s+Can\b/g, 'Student! can');
ibGradeText = ibGradeText.replace(/Student!\s+Has\b/g, 'Student! has');
ibGradeText = ibGradeText.replace(/Student!\s+Grew\b/g, 'Student! grew');
ibGradeText = ibGradeText.replace(/Subject!\s+Has\b/g, 'Subject! has');

// 4. Double spaces
console.log('Fixing double spaces');
commentsText = commentsText.replace(/(\w+)\s{2,}(\w+)/g, '$1 $2');
ibGradeText = ibGradeText.replace(/(\w+)\s{2,}(\w+)/g, '$1 $2');
atlText = atlText.replace(/(\w+)\s{2,}(\w+)/g, '$1 $2');

// 5. Chemistry Grade 3, Language and Literature - Arabic Grade 3, and Language Acquisition - Arabic Grade 3 broken structures
console.log('Fixing broken sentences in ib_grade.json Grade 3 comments');
// Let's replace the specific broken Chemistry Grade 3 sentence:
// Old: "Through consistent application of chemical understanding, Student!, found aspects of Subject! has found this course demanding and has shown inconsistency in meeting the criteria."
// New: "Throughout the course, Student! has found Subject! demanding and has shown inconsistency in meeting the criteria."
ibGradeText = ibGradeText.replace(
  /"Through consistent application of chemical understanding, Student!, found aspects of Subject! has found this course demanding and has shown inconsistency in meeting the criteria\."/g,
  `"Throughout the course, Student! has found Subject! demanding and has shown inconsistency in meeting the criteria."`
);

// Let's replace the duplicate Grade 4 and Grade 5 sentences for Chemistry:
// Old Grade 4: "Student! demonstrated a growing understanding..."
// Old Grade 5: "Student! demonstrated a growing understanding..." (same)
// New Grade 4: "Student! demonstrated a developing understanding of the assessment criteria in Subject!, utilising chemical knowledge, practical skills, and data analysis with moderate consistency across tasks."
// New Grade 5: "Student! demonstrated a sound understanding of the assessment criteria in Subject!, utilising chemical knowledge, practical skills, and data analysis with general consistency across tasks. This has resulted in an overall IB Level 5."
ibGradeText = ibGradeText.replace(
  /"4": "Student!, demonstrated a growing understanding of the assessment criteria in Subject!, utilising application of chemical knowledge, practical skills, data analysis, and evaluation with general consistency across tasks\."/g,
  `"4": "Student! demonstrated a developing understanding of the assessment criteria in Subject!, utilising chemical knowledge, practical skills, and data analysis with moderate consistency across tasks."`
);
ibGradeText = ibGradeText.replace(
  /"5": "Student!, demonstrated a growing understanding of the assessment criteria in Subject!, utilising application of chemical knowledge, practical skills, data analysis, and evaluation with general consistency across tasks\."/g,
  `"5": "Student! demonstrated a sound understanding of the assessment criteria in Subject!, utilising chemical knowledge, practical skills, and data analysis with general consistency across tasks. This has resulted in an overall IB Level 5."`
);

// Let's replace the broken Language and Literature - Arabic Grade 3 sentence:
// Old: "Throughout the course, Student!, found aspects of Subject! has experienced challenges this year, with variable success in meeting assessment standards."
// New: "Throughout the course, Student! has encountered challenges in Subject!, with variable success in meeting assessment standards."
ibGradeText = ibGradeText.replace(
  /"3": "Throughout the course, Student!, found aspects of Subject! has experienced challenges this year, with variable success in meeting assessment standards\."/g,
  `"3": "Throughout the course, Student! has encountered challenges in Subject!, with variable success in meeting assessment standards."`
);

// Let's replace the broken Language Acquisition - Arabic Grade 3 sentence:
// Old: "Across listening, speaking, reading, and writing tasks, Student!, found aspects of Subject! has found this course demanding and has shown inconsistency in meeting the criteria."
// New: "Across listening, speaking, reading, and writing tasks, Student! has found this course demanding and has shown inconsistency in meeting the criteria."
ibGradeText = ibGradeText.replace(
  /"3": "Across listening, speaking, reading, and writing tasks, Student!, found aspects of Subject! has found this course demanding and has shown inconsistency in meeting the criteria\."/g,
  `"3": "Across listening, speaking, reading, and writing tasks, Student! has found this course demanding and has shown inconsistency in meeting the criteria."`
);

// 6. Missing period in Language and Literature - German Grade 7:
// Old: "...IB-Note 7"
// New: "...IB-Note 7."
ibGradeText = ibGradeText.replace(
  /"7": "Im Laufe des Schuljahres zeigte Student! herausragende Leistungen in Subject!\. Anspruchsvolle Analysen und differenzierte Interpretationen von Texten, eine überzeugende Organisation von Ideen sowie ein äußerst präziser und differenzierter Einsatz der Fachsprache führten zu einer konstanten Leistung auf höchstem Niveau\. Diese außergewöhnliche Leistungsqualität entsprach uneingeschränkt einem Leistungsniveau der IB-Note 7"/g,
  `"7": "Im Laufe des Schuljahres zeigte Student! herausragende Leistungen in Subject!. Anspruchsvolle Analysen und differenzierte Interpretationen von Texten, eine überzeugende Organisation von Ideen sowie ein äußerst präziser und differenzierter Einsatz der Fachsprache führten zu einer konstanten Leistung auf höchstem Niveau. Diese außergewöhnliche Leistungsqualität entsprach uneingeschränkt einem Leistungsniveau der IB-Note 7."`
);

// Save files back
fs.writeFileSync(commentsPath, commentsText, 'utf8');
fs.writeFileSync(ibGradePath, ibGradeText, 'utf8');
fs.writeFileSync(atlPath, atlText, 'utf8');

console.log('✅ Grammar and typo corrections applied successfully!');
