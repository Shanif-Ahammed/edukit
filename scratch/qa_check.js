import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

// Paths
const baseDir = 'g:\\AppDev\\Teacher portal - V3';
const rosterPath = path.join(baseDir, 'sample_students.csv');
const commentsPath = path.join(baseDir, 'public', 'comment_bank', 'comments.json');
const ibGradePath = path.join(baseDir, 'public', 'comment_bank', 'ib_grade.json');
const criteriaPath = path.join(baseDir, 'public', 'comment_bank', 'criteria.json');

// Read files
const rosterText = fs.readFileSync(rosterPath, 'utf8');
const commentsData = JSON.parse(fs.readFileSync(commentsPath, 'utf8'));
const ibGradeData = JSON.parse(fs.readFileSync(ibGradePath, 'utf8'));
const criteriaData = JSON.parse(fs.readFileSync(criteriaPath, 'utf8'));

// Parse roster
const parsedRoster = Papa.parse(rosterText, { header: true, skipEmptyLines: true });
const rosterSubjects = new Set();
const rosterClassesBySubject = {};

parsedRoster.data.forEach(row => {
  let sub = row['Subject'];
  let cls = row['Class'];
  if (sub) {
    sub = sub.trim();
    // Resolve Double/Triple Science like CommentGenerator does
    if (sub === 'Double Science') {
      const cl = (cls || '').toLowerCase();
      if (cl.includes('(bio)')) sub = 'Biology';
      else if (cl.includes('(phy)')) sub = 'Physics';
      else if (cl.includes('(chem)')) sub = 'Chemistry';
      else sub = 'Integrated Sciences - English';
    } else if (sub === 'Triple Science') {
      const cl = (cls || '').toLowerCase();
      if (cl.includes('-bio')) sub = 'Biology';
      else if (cl.includes('-phy')) sub = 'Physics';
      else if (cl.includes('-chem')) sub = 'Chemistry';
      else sub = 'Integrated Sciences - English';
    }
    rosterSubjects.add(sub);
    if (!rosterClassesBySubject[sub]) {
      rosterClassesBySubject[sub] = new Set();
    }
    rosterClassesBySubject[sub].add(cls);
  }
});

console.log('--- Subjects in Roster ---');
const subjectsArray = Array.from(rosterSubjects).sort();
subjectsArray.forEach(s => {
  console.log(`- ${s} (e.g. from class ${Array.from(rosterClassesBySubject[s])[0]})`);
});

console.log('\n--- Auditing comment_bank/comments.json ---');
let missingComments = 0;
subjectsArray.forEach(s => {
  if (!commentsData[s]) {
    console.log(`❌ Missing in comments.json: "${s}"`);
    missingComments++;
  } else {
    // Check criteria keys
    const c = commentsData[s];
    ['A', 'B', 'C', 'D'].forEach(crit => {
      if (!c[crit]) {
        console.log(`❌ Missing Criterion ${crit} in comments.json for "${s}"`);
        missingComments++;
      } else {
        if (!c[crit].strength || !c[crit].improvement) {
          console.log(`❌ Missing strength/improvement block in Criterion ${crit} for "${s}"`);
          missingComments++;
        }
      }
    });
  }
});
if (missingComments === 0) {
  console.log('✅ All roster subjects have full A/B/C/D strength/improvement comments in comments.json.');
}

console.log('\n--- Auditing comment_bank/ib_grade.json ---');
let missingIbGrades = 0;
subjectsArray.forEach(s => {
  if (!ibGradeData[s]) {
    console.log(`❌ Missing in ib_grade.json: "${s}"`);
    missingIbGrades++;
  } else {
    const grades = ibGradeData[s];
    ['3', '4', '5', '6', '7'].forEach(g => {
      if (!grades[g]) {
        console.log(`❌ Missing Grade "${g}" comment in ib_grade.json for "${s}"`);
        missingIbGrades++;
      }
    });
  }
});
if (missingIbGrades === 0) {
  console.log('✅ All roster subjects have full grade 3-7 comments in ib_grade.json.');
}

console.log('\n--- Auditing comment_bank/criteria.json ---');
let missingCriteria = 0;
subjectsArray.forEach(s => {
  if (!criteriaData[s]) {
    console.log(`❌ Missing in criteria.json: "${s}"`);
    missingCriteria++;
  } else {
    const c = criteriaData[s];
    ['A', 'B', 'C', 'D'].forEach(crit => {
      if (!c[crit]) {
        console.log(`❌ Missing criterion ${crit} label in criteria.json for "${s}"`);
        missingCriteria++;
      }
    });
  }
});
if (missingCriteria === 0) {
  console.log('✅ All roster subjects have full criterion labels in criteria.json.');
}
