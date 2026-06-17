import React, { createContext, useContext, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { StudentRowSchema } from '../utils/rosterSchema';

const DataContext = createContext();

// Exact iSAMS Column Mappings & Fallbacks (Stable & Resilient)
const COLUMN_KEYS = {
  name: [/student\s*name/i, /full\s*name/i, /^name$/i, /student/i],
  forename: [/^forename$/i, /first\s*name/i],
  surname: [/^surname$/i, /last\s*name/i],
  class: [/^class$/i, /form\s*group/i, /group/i, /section/i],
  subject: [/^subject$/i, /course/i, /discipline/i],
  teacherName: [/^teacher\s*name$/i, /teacher/i, /tutor/i, /instructor/i],
  meg: [/meg/i, /minimum\s*expected\s*grade/i, /target\s*grade/i, /expected\s*grade/i, /expected/i],
  critA: [/^criterion\s*a$/i, /crit\s*a/i, /crita/i],
  critB: [/^criterion\s*b$/i, /crit\s*b/i, /critb/i],
  critC: [/^criterion\s*c$/i, /crit\s*c/i, /critc/i],
  critD: [/^criterion\s*d$/i, /crit\s*d/i, /critd/i],
  cpt: [/^cpt$/i, /criterion\s*point\s*total/i, /total\s*points/i, /points/i, /score/i],
  gradeLevel: [/^grade$/i, /grade\s*level/i, /year\s*group/i, /year$/i, /academic\s*year/i],
  ibGrade: [/^ib\s*grade$/i, /attainment\s*grade/i, /myp\s*grade/i, /level/i, /attainment/i],
  atl: [/^approaches$/i, /atl\s*progress/i, /atl\s*level/i, /approach\s*to\s*learning/i, /^atl$/i, /atl\s*skill$/i, /atl\s*skil$/i],
  gender: [/^gender$/i, /sex/i, /pronoun/i],
  eal: [/^eal$/i, /eal\s*status/i, /english\s*as\s*additional\s*language/i],
  sen: [/^sen$/i, /sen\s*\/\s*learning\s*support\s*flag/i, /learning\s*support/i, /inclusion/i, /support\s*flag/i],
  gifted: [/^ma\s*gt$/i, /gifted\s*&\s*talented\s*flag/i, /gifted/i, /g\s*&\s*t/i, /magt/i, /talented/i],
  formGroup: [/form\s*group/i, /form/i, /registration\s*group/i, /advisor/i],
  emirati: [/^emirati$/i, /uae\s*national/i, /nationality/i]
};

const PERSIST_PREFIX = 'edukit_mis_';

const STORAGE_FULL_WARNING = "This file is too large to save on this device, so your data is loaded for this session only. For a faster, saveable setup, filter the export down to just your classes.";

const clearPersistedData = () => {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(PERSIST_PREFIX))
    .forEach((key) => localStorage.removeItem(key));
};

// Writes all entries to localStorage; if any write throws (e.g. QuotaExceededError
// on a large roster), rolls back every edukit_mis_* key so we never leave
// half-written state, and returns false.
const safePersist = (entries) => {
  try {
    Object.entries(entries).forEach(([key, value]) => localStorage.setItem(key, value));
    return true;
  } catch (e) {
    console.warn('localStorage persistence failed, rolling back saved data:', e);
    try {
      clearPersistedData();
    } catch (cleanupErr) {
      console.warn('Failed to roll back saved data:', cleanupErr);
    }
    return false;
  }
};

// Best-effort single-key write for incremental updates — an edit must never
// crash just because storage is full.
const tryPersist = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`localStorage write failed for ${key}:`, e);
  }
};

// Resolve pronouns based on gender string
const resolvePronouns = (gender) => {
  const g = (gender || '').trim().toLowerCase();
  if (g === 'male' || g === 'm' || g === 'boy' || g === 'he') {
    return { subj: 'he', obj: 'him', poss: 'his' };
  }
  if (g === 'female' || g === 'f' || g === 'girl' || g === 'she') {
    return { subj: 'she', obj: 'her', poss: 'her' };
  }
  return { subj: 'they', obj: 'them', poss: 'their' };
};

export const DataProvider = ({ children }) => {
  const [fileConnected, setFileConnected] = useState(false);
  const [fileName, setFileName] = useState('');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [missingColumns, setMissingColumns] = useState([]);
  const [subject, setSubject] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [teacherName, setTeacherName] = useState('');
  const [schoolName, setSchoolName] = useState('Swiss International Scientific School Dubai');

  // Load state from localStorage on startup for persistent sessions
  useEffect(() => {
    try {
      const savedConnected = localStorage.getItem('edukit_mis_connected');
      if (savedConnected === 'true') {
        const savedFileName = localStorage.getItem('edukit_mis_filename') || '';
        const savedStudents = JSON.parse(localStorage.getItem('edukit_mis_students') || '[]');
        const savedClasses = JSON.parse(localStorage.getItem('edukit_mis_classes') || '[]');
        const savedSelClass = localStorage.getItem('edukit_mis_selected_class') || '';
        const savedSubject = localStorage.getItem('edukit_mis_subject') || '';
        const savedSubjects = JSON.parse(localStorage.getItem('edukit_mis_subjects') || '[]');
        const savedTeacher = localStorage.getItem('edukit_mis_teacher') || '';
        const savedMissing = JSON.parse(localStorage.getItem('edukit_mis_missing') || '[]');

        if (savedStudents.length > 0) {
          setStudents(savedStudents);
          setClasses(savedClasses);
          setSelectedClass(savedSelClass || savedClasses[0] || '');
          setFileName(savedFileName);
          setSubject(savedSubject);
          setSubjects(savedSubjects);
          setTeacherName(savedTeacher);
          setMissingColumns(savedMissing);
          setFileConnected(true);
        }
      }
    } catch (e) {
      console.error("Failed to load state from localStorage:", e);
    }
  }, []);

  const changeFile = () => {
    setFileConnected(false);
    setFileName('');
    setStudents([]);
    setClasses([]);
    setSelectedClass('');
    setMissingColumns([]);
    setSubject('');
    setSubjects([]);
    setTeacherName('');
    
    clearPersistedData();
  };

  const connectData = (name, rawRows) => {
    if (!rawRows || rawRows.length === 0) return { success: false, error: "No records found in the uploaded file." };

    // Get the headers from the first row
    const firstRowKeys = Object.keys(rawRows[0]);
    const matchedHeaders = {};
    const missing = [];

    // Map columns using regex fuzzy dictionary
    Object.entries(COLUMN_KEYS).forEach(([standardKey, regexes]) => {
      const match = firstRowKeys.find(header => 
        regexes.some(rx => rx.test(header.trim()))
      );

      if (match !== undefined) {
        matchedHeaders[standardKey] = match;
      } else {
        // Mark missing fields (ignoring non-critical optional columns in the missing lists)
        if (standardKey !== 'meg' && standardKey !== 'formGroup' && standardKey !== 'surname' && standardKey !== 'forename') {
          missing.push(standardKey);
        }
      }
    });

    // Check if name or forename/surname are present
    if (!matchedHeaders.forename && !matchedHeaders.name) {
      return { 
        success: false, 
        error: "Could not identify student name columns (either separate 'Forename' or a single 'Student Name' column) in the uploaded file. Please review column headers."
      };
    }

    // Process, validate, and enrich each row
    let detectedSubject = '';
    let detectedTeacher = '';
    const validationErrors = [];
    const parsedStudents = [];

    rawRows.forEach((row, index) => {
      // Get student names
      let rawForename = '';
      let rawSurname = '';
      if (matchedHeaders.forename) {
        rawForename = String(row[matchedHeaders.forename] || '').trim();
      }
      if (matchedHeaders.surname) {
        rawSurname = String(row[matchedHeaders.surname] || '').trim();
      }
      if (!rawForename && matchedHeaders.name) {
        const rawNameValue = row[matchedHeaders.name] || '';
        const parts = String(rawNameValue).trim().split(/\s+/);
        rawForename = parts[0] || '';
        if (!rawSurname) {
          rawSurname = parts.slice(1).join(' ') || '';
        }
      }

      // Check if CPT should be calculated dynamically if it's missing in row but criteria are present
      let rawCpt = row[matchedHeaders.cpt];
      if (rawCpt === undefined || rawCpt === null || rawCpt === '') {
        const cA = row[matchedHeaders.critA];
        const cB = row[matchedHeaders.critB];
        const cC = row[matchedHeaders.critC];
        const cD = row[matchedHeaders.critD];
        if (cA !== undefined || cB !== undefined || cC !== undefined || cD !== undefined) {
          const nA = cA !== undefined && cA !== '' && !isNaN(Number(cA)) ? Number(cA) : 0;
          const nB = cB !== undefined && cB !== '' && !isNaN(Number(cB)) ? Number(cB) : 0;
          const nC = cC !== undefined && cC !== '' && !isNaN(Number(cC)) ? Number(cC) : 0;
          const nD = cD !== undefined && cD !== '' && !isNaN(Number(cD)) ? Number(cD) : 0;
          rawCpt = nA + nB + nC + nD;
        }
      }

      // Derive grade level fallback
      let rawGradeLevel = row[matchedHeaders.gradeLevel] !== undefined ? String(row[matchedHeaders.gradeLevel]).trim() : '';
      if (!rawGradeLevel) {
        const className = String(row[matchedHeaders.class] || '').trim();
        const match = className.match(/\d+/);
        rawGradeLevel = match ? `G${match[0]}` : '';
      }

      const mappedData = {
        forename: rawForename,
        surname: rawSurname,
        className: row[matchedHeaders.class] !== undefined ? String(row[matchedHeaders.class]).trim() : undefined,
        gradeLevel: rawGradeLevel,
        subject: row[matchedHeaders.subject] !== undefined ? String(row[matchedHeaders.subject]).trim() : undefined,
        teacherName: row[matchedHeaders.teacherName] !== undefined ? String(row[matchedHeaders.teacherName]).trim() : undefined,
        gender: row[matchedHeaders.gender] !== undefined ? String(row[matchedHeaders.gender]).trim() : undefined,
        eal: row[matchedHeaders.eal],
        sen: row[matchedHeaders.sen],
        gifted: row[matchedHeaders.gifted],
        emirati: row[matchedHeaders.emirati],
        atlProgress: row[matchedHeaders.atl] !== undefined ? String(row[matchedHeaders.atl]).trim() : undefined,
        cpt: rawCpt,
        critA: row[matchedHeaders.critA],
        critB: row[matchedHeaders.critB],
        critC: row[matchedHeaders.critC],
        critD: row[matchedHeaders.critD],
        ibGrade: row[matchedHeaders.ibGrade],
        meg: row[matchedHeaders.meg],
        formGroup: row[matchedHeaders.formGroup]
      };

      // Zod Validation & Transformation
      const result = StudentRowSchema.safeParse(mappedData);
      if (!result.success) {
        const rowNum = index + 2; // Row index is 0-based, first data is Row 2 (row 1 is headers)
        const issues = result.error.issues.map(iss => `${iss.path.join('.')}: ${iss.message}`).join(', ');
        validationErrors.push(`Row ${rowNum} (${rawForename || 'Unknown Student'}): ${issues}`);
      } else {
        const data = result.data;
        
        if (data.subject && !detectedSubject) detectedSubject = data.subject;
        if (data.teacherName && !detectedTeacher) detectedTeacher = data.teacherName;

        const pronouns = resolvePronouns(data.gender);
        
        const tags = [];
        if (data.eal) tags.push('EAL');
        if (data.sen) tags.push('Inclusion');
        if (data.gifted) tags.push('MAGT');
        if (data.emirati) tags.push('Emirati');

        parsedStudents.push({
          id: index + 1,
          forename: data.forename,
          surname: data.surname,
          name: `${data.forename} ${data.surname}`.trim(),
          gender: data.gender === 'M' ? 'Male' : 'Female',
          pronouns,
          className: data.className,
          subject: data.subject,
          teacherName: data.teacherName,
          meg: data.meg,
          critA: data.critA,
          critB: data.critB,
          critC: data.critC,
          critD: data.critD,
          cpt: data.cpt,
          ibGrade: data.ibGrade,
          gradeLevel: data.gradeLevel,
          atlProgress: data.atlProgress,
          eal: data.eal,
          sen: data.sen,
          gifted: data.gifted,
          emirati: data.emirati,
          formGroup: data.formGroup || data.className,
          tags,
          comment: '',
          status: 'idle'
        });
      }
    });

    if (validationErrors.length > 0) {
      const limit = 10;
      const list = validationErrors.slice(0, limit).join('\n');
      const total = validationErrors.length;
      const suffix = total > limit ? `\n...and ${total - limit} more errors.` : '';
      return {
        success: false,
        error: `Roster file validation failed. Please check the spreadsheet data:\n\n${list}${suffix}`
      };
    }

    // Extract unique classes
    const uniqueClasses = Array.from(new Set(parsedStudents.map(s => s.className)))
      .filter(c => c && c !== 'Class Unknown' && c !== 'undefined')
      .sort();
    
    if (uniqueClasses.length === 0 && parsedStudents.length > 0) {
      uniqueClasses.push('General Class');
      parsedStudents.forEach(s => s.className = 'General Class');
    }

    const defaultClass = uniqueClasses[0] || '';
    const finalSubject = detectedSubject || 'Mathematics';
    const finalTeacher = detectedTeacher || 'Mr. Anderson';

    // Extract unique subjects
    const uniqueSubjects = Array.from(new Set(parsedStudents.map(s => s.subject)))
      .filter(subj => subj && subj.trim() !== '' && subj !== 'undefined')
      .sort();
    
    if (uniqueSubjects.length === 0) {
      uniqueSubjects.push(finalSubject);
    }

    const defaultClassStudent = parsedStudents.find(s => s.className === defaultClass);
    const initialSubject = (defaultClassStudent && defaultClassStudent.subject) ? defaultClassStudent.subject : finalSubject;

    setStudents(parsedStudents);
    setClasses(uniqueClasses);
    setSelectedClass(defaultClass);
    setFileName(name);
    setSubject(initialSubject);
    setSubjects(uniqueSubjects);
    setTeacherName(finalTeacher);
    setMissingColumns(missing);
    setFileConnected(true);

    // Save persistence — data stays loaded in React state for this session
    // even if the roster is too large to fit in localStorage.
    const persisted = safePersist({
      edukit_mis_connected: 'true',
      edukit_mis_filename: name,
      edukit_mis_students: JSON.stringify(parsedStudents),
      edukit_mis_classes: JSON.stringify(uniqueClasses),
      edukit_mis_selected_class: defaultClass,
      edukit_mis_subject: initialSubject,
      edukit_mis_teacher: finalTeacher,
      edukit_mis_missing: JSON.stringify(missing)
    });

    if (!persisted) {
      return { success: true, warning: STORAGE_FULL_WARNING };
    }

    return { success: true };
  };

  const updateStudent = (id, fields) => {
    const updated = students.map(s => {
      if (s.id === id) {
        const up = { ...s, ...fields };
        // Sync full name if first or last name changes
        if (fields.forename !== undefined || fields.surname !== undefined) {
          up.name = `${up.forename} ${up.surname}`.trim();
        }
        return up;
      }
      return s;
    });
    setStudents(updated);
    tryPersist('edukit_mis_students', JSON.stringify(updated));
  };

  const updateStudents = (updatedList) => {
    setStudents(updatedList);
    tryPersist('edukit_mis_students', JSON.stringify(updatedList));
  };

  const handleSetSelectedClass = (clsName) => {
    setSelectedClass(clsName);
    tryPersist('edukit_mis_selected_class', clsName);

    // Dynamically update the active subject based on the selected class
    const classStudent = students.find(s => s.className === clsName);
    if (classStudent && classStudent.subject) {
      setSubject(classStudent.subject);
      tryPersist('edukit_mis_subject', classStudent.subject);
    }
  };

  return (
    <DataContext.Provider value={{
      fileConnected,
      fileName,
      students,
      classes,
      selectedClass,
      setSelectedClass: handleSetSelectedClass,
      missingColumns,
      subject,
      setSubject,
      subjects,
      setSubjects,
      teacherName,
      setTeacherName,
      schoolName,
      connectData,
      changeFile,
      updateStudent,
      updateStudents
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within a DataProvider");
  return context;
};
