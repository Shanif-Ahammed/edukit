import fs from 'fs';
import path from 'path';

const baseDir = 'g:\\AppDev\\Teacher portal - V3';
const commentsPath = path.join(baseDir, 'public', 'comment_bank', 'comments.json');
const ibGradePath = path.join(baseDir, 'public', 'comment_bank', 'ib_grade.json');
const atlPath = path.join(baseDir, 'public', 'comment_bank', 'atl.json');

const commentsText = fs.readFileSync(commentsPath, 'utf8');
const ibGradeText = fs.readFileSync(ibGradePath, 'utf8');
const atlText = fs.readFileSync(atlPath, 'utf8');

console.log('--- Scanning files for typos & grammar issues ---');

function checkPattern(name, text, pattern) {
  let match;
  let count = 0;
  while ((match = pattern.exec(text)) !== null) {
    console.log(`[${name}] Found: "${match[0]}" around index ${match.index}`);
    count++;
    if (count > 15) {
      console.log(`[${name}] ... and more (truncated)`);
      break;
    }
  }
}

console.log('\nChecking "inconssitent":');
checkPattern('comments.json', commentsText, /inconssitent/gi);
checkPattern('ib_grade.json', ibGradeText, /inconssitent/gi);
checkPattern('atl.json', atlText, /inconssitent/gi);

console.log('\nChecking double spaces:');
checkPattern('comments.json', commentsText, /\w+  \w+/g);
checkPattern('ib_grade.json', ibGradeText, /\w+  \w+/g);
checkPattern('atl.json', atlText, /\w+  \w+/g);

console.log('\nChecking "Student!," (comma splice):');
checkPattern('comments.json', commentsText, /Student!,\s+/g);
checkPattern('ib_grade.json', ibGradeText, /Student!,\s+/g);
checkPattern('atl.json', atlText, /Student!,\s+/g);

console.log('\nChecking capitalized words after Student! or Subject! (e.g. Student! Can/Has/Grew):');
checkPattern('ib_grade.json', ibGradeText, /Student!\s+[A-Z][a-z]+/g);
checkPattern('ib_grade.json', ibGradeText, /Subject!\s+[A-Z][a-z]+/g);
checkPattern('comments.json', commentsText, /Student!\s+[A-Z][a-z]+/g);
checkPattern('comments.json', commentsText, /Subject!\s+[A-Z][a-z]+/g);

console.log('\nChecking misspelled words or style inconsistencies:');
// check for "deepend" vs "deepen"
checkPattern('comments.json', commentsText, /deepend/gi);
checkPattern('ib_grade.json', ibGradeText, /deepend/gi);
// check for "in A!," style commas or duplicate sentences
checkPattern('ib_grade.json', ibGradeText, /solve mathematical/gi);
