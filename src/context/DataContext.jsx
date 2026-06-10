import React, { createContext, useContext, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const DataContext = createContext();

// Exact iSAMS Column Mappings & Fallbacks (Stable & Resilient)
const COLUMN_KEYS = {
  name: [/student\s*name/i, /full\s*name/i, /^name$/i, /student/i, /forename/i, /first\s*name/i],
  surname: [/surname/i, /last\s*name/i],
  class: [/class/i, /form\s*group/i, /group/i, /section/i],
  subject: [/subject/i, /course/i, /discipline/i],
  teacherName: [/teacher\s*name/i, /teacher/i, /tutor/i, /instructor/i],
  meg: [/meg/i, /minimum\s*expected\s*grade/i, /target\s*grade/i, /expected\s*grade/i, /expected/i],
  critA: [/crit\s*a/i, /criterion\s*a/i, /crita/i],
  critB: [/crit\s*b/i, /criterion\s*b/i, /critb/i],
  critC: [/crit\s*c/i, /criterion\s*c/i, /critc/i],
  critD: [/crit\s*d/i, /criterion\s*d/i, /critd/i],
  cpt: [/cpt/i, /criterion\s*point\s*total/i, /total\s*points/i, /points/i, /score/i],
  gradeLevel: [/grade\s*level/i, /^grade$/i, /year\s*group/i, /year$/i, /academic\s*year/i],
  ibGrade: [/ib\s*grade/i, /attainment\s*grade/i, /myp\s*grade/i, /level/i, /attainment/i],
  atl: [/atl/i, /approach\s*to\s*learning/i, /atl\s*progress/i, /atl\s*level/i],
  gender: [/gender/i, /sex/i, /pronoun/i],
  eal: [/eal\s*status/i, /eal/i, /english\s*as\s*additional\s*language/i],
  sen: [/sen\s*\/\s*learning\s*support\s*flag/i, /sen/i, /learning\s*support/i, /inclusion/i, /support\s*flag/i],
  gifted: [/gifted\s*&\s*talented\s*flag/i, /gifted/i, /g\s*&\s*t/i, /magt/i, /talented/i],
  formGroup: [/form\s*group/i, /form/i, /registration\s*group/i, /advisor/i],
  emirati: [/emirati/i, /uae\s*national/i, /nationality/i]
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
        // Mark missing fields
        missing.push(standardKey);
      }
    });

    // Check if name is present. Surname could be split or integrated inside full name.
    if (!matchedHeaders.name) {
      return { 
        success: false, 
        error: "Could not identify Student Name or Name column in the uploaded file. Please review column headers."
      };
    }

    // Process and enrich each row
    let detectedSubject = '';
    let detectedTeacher = '';
    const parsedStudents = rawRows.map((row, index) => {
      // Get student names
      const rawNameValue = row[matchedHeaders.name] || '';
      let forename = '';
      let surname = '';

      if (matchedHeaders.surname && row[matchedHeaders.surname]) {
        const parts = String(rawNameValue).trim().split(/\s+/);
        forename = parts[0] || '';
        surname = String(row[matchedHeaders.surname]).trim();
      } else {
        // Split student name if single field
        const parts = String(rawNameValue).trim().split(/\s+/);
        forename = parts[0] || '';
        surname = parts.slice(1).join(' ') || '';
      }

      // Read values safely
      const className = String(row[matchedHeaders.class] || 'Class Unknown').trim();
      const studentSubject = String(row[matchedHeaders.subject] || '').trim();
      const teacher = String(row[matchedHeaders.teacherName] || '').trim();
      
      if (studentSubject && !detectedSubject) detectedSubject = studentSubject;
      if (teacher && !detectedTeacher) detectedTeacher = teacher;

      const critA = row[matchedHeaders.critA] !== undefined ? Number(row[matchedHeaders.critA]) : null;
      const critB = row[matchedHeaders.critB] !== undefined ? Number(row[matchedHeaders.critB]) : null;
      const critC = row[matchedHeaders.critC] !== undefined ? Number(row[matchedHeaders.critC]) : null;
      const critD = row[matchedHeaders.critD] !== undefined ? Number(row[matchedHeaders.critD]) : null;

      // CPT is sum of A+B+C+D
      let cpt = null;
      if (row[matchedHeaders.cpt] !== undefined) {
        cpt = Number(row[matchedHeaders.cpt]);
      } else if (critA !== null || critB !== null || critC !== null || critD !== null) {
        cpt = (critA || 0) + (critB || 0) + (critC || 0) + (critD || 0);
      }

      const rawGender = String(row[matchedHeaders.gender] || '').trim();
      const pronouns = resolvePronouns(rawGender);

      // Parse tags
      const tags = [];
      const ealVal = String(row[matchedHeaders.eal] || '').trim().toLowerCase();
      const senVal = String(row[matchedHeaders.sen] || '').trim().toLowerCase();
      const giftedVal = String(row[matchedHeaders.gifted] || '').trim().toLowerCase();
      const emiratiVal = String(row[matchedHeaders.emirati] || '').trim().toLowerCase();

      if (ealVal === 'yes' || ealVal === 'y' || ealVal === 'true' || ealVal === 'eal') tags.push('EAL');
      if (senVal === 'yes' || senVal === 'y' || senVal === 'true' || senVal === 'sen' || senVal === 'support') tags.push('Inclusion');
      if (giftedVal === 'yes' || giftedVal === 'y' || giftedVal === 'true' || giftedVal === 'gifted' || giftedVal === 'magt') tags.push('MAGT');
      if (emiratiVal === 'yes' || emiratiVal === 'y' || emiratiVal === 'true' || emiratiVal === 'emirati') tags.push('Emirati');

      let gradeLevel = row[matchedHeaders.gradeLevel] !== undefined ? String(row[matchedHeaders.gradeLevel]).trim() : '';
      if (!gradeLevel) {
        const match = className.match(/\d+/);
        gradeLevel = match ? `Grade ${match[0]}` : '';
      }

      return {
        id: index + 1,
        forename,
        surname,
        name: `${forename} ${surname}`.trim(),
        gender: rawGender || 'other',
        pronouns,
        className,
        subject: studentSubject,
        teacherName: teacher,
        meg: row[matchedHeaders.meg] !== undefined ? Number(row[matchedHeaders.meg]) : null,
        critA,
        critB,
        critC,
        critD,
        cpt,
        ibGrade: row[matchedHeaders.ibGrade] !== undefined ? Number(row[matchedHeaders.ibGrade]) : null,
        gradeLevel,
        atlProgress: String(row[matchedHeaders.atl] || '').trim() || 'Practitioner',
        eal: ealVal === 'yes' || ealVal === 'y',
        sen: senVal === 'yes' || senVal === 'y',
        gifted: giftedVal === 'yes' || giftedVal === 'y',
        emirati: emiratiVal === 'yes' || emiratiVal === 'y',
        formGroup: String(row[matchedHeaders.formGroup] || className).trim(),
        tags,
        comment: '',
        status: 'idle'
      };
    });

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
