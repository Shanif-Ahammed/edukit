import React, { useState, useEffect } from 'react';
import {
  Sparkles, Download, FileSpreadsheet, CheckCircle,
  AlertCircle, RefreshCw, BookOpen, Settings2, ChevronDown, ChevronUp, Save, Shuffle, Copy, ArrowLeft
} from 'lucide-react';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';
import { useData } from '../context/DataContext';


const ATL_SKILLS = [
  'Communication',
  'Social',
  'Self-Management',
  'Research',
  'Thinking',
];

const ATL_LEVELS = ['Expert', 'Practitioner', 'Beginner', 'Novice'];

// Maps specific subject display names to their generic MYP subject group configurations
const getGenericSubjectGroup = (sub) => {
  if (!sub) return 'Mathematics';
  const name = sub.toLowerCase();
  if (name.includes('math')) return 'Mathematics';
  if (name.includes('science') || name.includes('biology') || name.includes('physics') || name.includes('chemistry')) return 'Sciences';
  if (name.includes('literature') || name.includes('additional language') || name.includes('language acquisition')) return 'Language & Literature';
  if (name.includes('societies') || name.includes('commerce')) return 'Individuals & Societies';
  if (name.includes('design') || name.includes('technology')) return 'Design';
  if (name.includes('drama') || name.includes('art') || name.includes('music')) return 'Arts';
  if (name.includes('physical') || name.includes('health') || name.includes('phe')) return 'Physical & Health Education';
  return 'Mathematics';
};

/**
 * Resolves 'Double Science' and 'Triple Science' to the actual science subject
 * by inspecting the class name column.
 *
 * Double Science class name patterns:  (Bio) | (Phy) | (Chem)
 * Triple Science class name patterns:  -Bio  | -Phy  | -Chem  (case-insensitive)
 *
 * If the class name does not contain a recognisable science marker the function
 * falls back to 'Integrated Sciences - English' so comments are never left blank.
 *
 * Returns the original subjectName unchanged for all other subjects.
 */
const resolveScience = (subjectName, className) => {
  if (!subjectName) return subjectName;
  const cl = (className || '').toLowerCase();
  if (subjectName === 'Double Science') {
    if (cl.includes('(bio)')) return 'Biology';
    if (cl.includes('(phy)')) return 'Physics';
    if (cl.includes('(chem)')) return 'Chemistry';
    // Class name pattern unrecognised — use general science bank as fallback
    return 'Integrated Sciences - English';
  }
  if (subjectName === 'Triple Science') {
    if (cl.includes('-bio')) return 'Biology';
    if (cl.includes('-phy')) return 'Physics';
    if (cl.includes('-chem')) return 'Chemistry';
    // Class name pattern unrecognised — use general science bank as fallback
    return 'Integrated Sciences - English';
  }
  return subjectName;
};

// ─── Default 3-Group Comment Bank (Mathematics & Generic ATL) ────────────────
const DEFAULT_BANK = {
  ib_grade: {
    7: 'Student! has achieved an outstanding grade of 7 in Subject!, demonstrating exceptional mastery across all areas of the curriculum.',
    6: 'Student! has achieved an excellent grade of 6 in Subject!, showing a thorough understanding of the key concepts and skills covered this term.',
    5: 'Student! has achieved a strong grade of 5 in Subject!, reflecting a solid grasp of the core concepts and an ability to apply them effectively.',
    4: 'Student! has achieved a grade of 4 in Subject!, demonstrating an adequate understanding of the core concepts covered this term.',
    3: 'Student! has achieved a grade of 3 in Subject!, indicating a basic but developing understanding of the material.',
    2: 'Student! has achieved a grade of 2 in Subject!, suggesting that He! would benefit from additional support to consolidate foundational skills.',
    1: 'Student! has achieved a grade of 1 in Subject!, and it is important that He! seeks additional support to strengthen his! understanding of the core concepts.',
  },
  atl: {
    Communication: {
      Expert: [
        "With notable precision, he! adapts communication skills across contexts, demonstrating reflective insight and consistently producing nuanced, high-quality outcomes.",
        "In increasingly complex situations, he! leverages advanced communication strategies, refining approaches independently to extend both understanding and impact.",
        "Consistently and with purpose, he! applies sophisticated communication processes, integrating reflection to enhance clarity, effectiveness, and depth of learning.",
        "Through thoughtful adaptation, he! demonstrates exceptional control of communication, transferring skills fluidly while maintaining accuracy and intellectual rigor.",
        "Marked by independence and insight, his! use of communication elevates both individual performance and collaborative outcomes in meaningful ways.",
        "Whether working independently or collaboratively, he! excels in communication, applying strategies flexibly to navigate complexity with confidence and precision."
      ],
      Practitioner: [
        "In most contexts, he! applies communication skills effectively, demonstrating clear understanding and a growing ability to adapt strategies with purpose.",
        "With consistency, he! uses communication to support learning, organizing ideas and approaches in ways that lead to reliable and appropriate outcomes.",
        "He! demonstrates a secure grasp of communication, selecting and applying strategies that generally align well with task demands and expectations.",
        "Across familiar situations, he! engages competently in communication, showing clarity and structure while continuing to build confidence and flexibility.",
        "By applying learned approaches, he! uses communication in a dependable manner, supporting steady progress and effective task completion.",
        "While still developing greater adaptability, he! shows consistent capability in communication, meeting expectations through thoughtful and organized effort."
      ],
      Beginner: [
        "Although developing, his! use of communication shows emerging understanding, with increasing success when strategies are modeled or supported.",
        "At times, he! applies communication effectively; however, inconsistency remains, and guided practice is needed to strengthen independence.",
        "With support, he! begins to engage more purposefully in communication, though application varies depending on context and task complexity.",
        "His! growing awareness of communication is evident, yet more consistent and independent application is required to meet expectations fully."
      ],
      Novice: [
        "Even with support, his! application of communication remains limited, and he! experiences difficulty using strategies effectively in most contexts.",
        "He! finds it challenging to engage with communication, requiring significant guidance to apply even basic skills with consistency and purpose."
      ]
    },
    Social: {
      Expert: [
        "With notable precision, he! adapts social skills across contexts, demonstrating reflective insight and consistently producing nuanced, high-quality outcomes.",
        "In increasingly complex situations, he! leverages advanced social strategies, refining approaches independently to extend both understanding and impact.",
        "Consistently and with purpose, he! applies sophisticated social processes, integrating reflection to enhance clarity, effectiveness, and depth of learning.",
        "Through thoughtful adaptation, he! demonstrates exceptional control of social, transferring skills fluidly while maintaining accuracy and intellectual rigor.",
        "Marked by independence and insight, his! use of social elevates both individual performance and collaborative outcomes in meaningful ways.",
        "Whether working independently or collaboratively, he! excels in social, applying strategies flexibly to navigate complexity with confidence and precision."
      ],
      Practitioner: [
        "In most contexts, he! applies social skills effectively, demonstrating clear understanding and a growing ability to adapt strategies with purpose.",
        "With consistency, he! uses social to support learning, organizing ideas and approaches in ways that lead to reliable and appropriate outcomes.",
        "He! demonstrates a secure grasp of social, selecting and applying strategies that generally align well with task demands and expectations.",
        "Across familiar situations, he! engages competently in social, showing clarity and structure while continuing to build confidence and flexibility.",
        "By applying learned approaches, he! uses social in a dependable manner, supporting steady progress and effective task completion.",
        "While still developing greater adaptability, he! shows consistent capability in social, meeting expectations through thoughtful and organized effort."
      ],
      Beginner: [
        "Although developing, his! use of social shows emerging understanding, with increasing success when strategies are modeled or supported.",
        "At times, he! applies social effectively; however, inconsistency remains, and guided practice is needed to strengthen independence.",
        "With support, he! begins to engage more purposefully in social, though application varies depending on context and task complexity.",
        "His! growing awareness of social is evident, yet more consistent and independent application is required to meet expectations fully."
      ],
      Novice: [
        "Even with support, his! application of social remains limited, and he! experiences difficulty using strategies effectively in most contexts.",
        "He! finds it challenging to engage with social, requiring significant guidance to apply even basic skills with consistency and purpose."
      ]
    },
    'Self-Management': {
      Expert: [
        "With notable precision, he! adapts self-management skills across contexts, demonstrating reflective insight and consistently producing nuanced, high-quality outcomes.",
        "In increasingly complex situations, he! leverages advanced self-management strategies, refining approaches independently to extend both understanding and impact.",
        "Consistently and with purpose, he! applies sophisticated self-management processes, integrating reflection to enhance clarity, effectiveness, and depth of learning.",
        "Through thoughtful adaptation, he! demonstrates exceptional control of self-management, transferring skills fluidly while maintaining accuracy and intellectual rigor.",
        "Marked by independence and insight, his! use of self-management elevates both individual performance and collaborative outcomes in meaningful ways.",
        "Whether working independently or collaboratively, he! excels in self-management, applying strategies flexibly to navigate complexity with confidence and precision."
      ],
      Practitioner: [
        "In most contexts, he! applies self-management skills effectively, demonstrating clear understanding and a growing ability to adapt strategies with purpose.",
        "With consistency, he! uses self-management to support learning, organizing ideas and approaches in ways that lead to reliable and appropriate outcomes.",
        "He! demonstrates a secure grasp of self-management, selecting and applying strategies that generally align well with task demands and expectations.",
        "Across familiar situations, he! engages competently in self-management, showing clarity and structure while continuing to build confidence and flexibility.",
        "By applying learned approaches, he! uses self-management in a dependable manner, supporting steady progress and effective task completion.",
        "While still developing greater adaptability, he! shows consistent capability in self-management, meeting expectations through thoughtful and organized effort."
      ],
      Beginner: [
        "Although developing, his! use of self-management shows emerging understanding, with increasing success when strategies are modeled or supported.",
        "At times, he! applies self-management effectively; however, inconsistency remains, and guided practice is needed to strengthen independence.",
        "With support, he! begins to engage more purposefully in self-management, though application varies depending on context and task complexity.",
        "His! growing awareness of self-management is evident, yet more consistent and independent application is required to meet expectations fully."
      ],
      Novice: [
        "Even with support, his! application of self-management remains limited, and he! experiences difficulty using strategies effectively in most contexts.",
        "He! finds it challenging to engage with self-management, requiring significant guidance to apply even basic skills with consistency and purpose."
      ]
    },
    Research: {
      Expert: [
        "With notable precision, he! adapts research skills across contexts, demonstrating reflective insight and consistently producing nuanced, high-quality outcomes.",
        "In increasingly complex situations, he! leverages advanced research strategies, refining approaches independently to extend both understanding and impact.",
        "Consistently and with purpose, he! applies sophisticated research processes, integrating reflection to enhance clarity, effectiveness, and depth of learning.",
        "Through thoughtful adaptation, he! demonstrates exceptional control of research, transferring skills fluidly while maintaining accuracy and intellectual rigor.",
        "Marked by independence and insight, his! use of research elevates both individual performance and collaborative outcomes in meaningful ways.",
        "Whether working independently or collaboratively, he! excels in research, applying strategies flexibly to navigate complexity with confidence and precision."
      ],
      Practitioner: [
        "In most contexts, he! applies research skills effectively, demonstrating clear understanding and a growing ability to adapt strategies with purpose.",
        "With consistency, he! uses research to support learning, organizing ideas and approaches in ways that lead to reliable and appropriate outcomes.",
        "He! demonstrates a secure grasp of research, selecting and applying strategies that generally align well with task demands and expectations.",
        "Across familiar situations, he! engages competently in research, showing clarity and structure while continuing to build confidence and flexibility.",
        "By applying learned approaches, he! uses research in a dependable manner, supporting steady progress and effective task completion.",
        "While still developing greater adaptability, he! shows consistent capability in research, meeting expectations through thoughtful and organized effort."
      ],
      Beginner: [
        "Although developing, his! use of research shows emerging understanding, with increasing success when strategies are modeled or supported.",
        "At times, he! applies research effectively; however, inconsistency remains, and guided practice is needed to strengthen independence.",
        "With support, he! begins to engage more purposefully in research, though application varies depending on context and task complexity.",
        "His! growing awareness of research is evident, yet more consistent and independent application is required to meet expectations fully."
      ],
      Novice: [
        "Even with support, his! application of research remains limited, and he! experiences difficulty using strategies effectively in most contexts.",
        "He! finds it challenging to engage with research, requiring significant guidance to apply even basic skills with consistency and purpose."
      ]
    },
    Thinking: {
      Expert: [
        "With notable precision, he! adapts thinking skills across contexts, demonstrating reflective insight and consistently producing nuanced, high-quality outcomes.",
        "In increasingly complex situations, he! leverages advanced thinking strategies, refining approaches independently to extend both understanding and impact.",
        "Consistently and with purpose, he! applies sophisticated thinking processes, integrating reflection to enhance clarity, effectiveness, and depth of learning.",
        "Through thoughtful adaptation, he! demonstrates exceptional control of thinking, transferring skills fluidly while maintaining accuracy and intellectual rigor.",
        "Marked by independence and insight, his! use of thinking elevates both individual performance and collaborative outcomes in meaningful ways.",
        "Whether working independently or collaboratively, he! excels in thinking, applying strategies flexibly to navigate complexity with confidence and precision."
      ],
      Practitioner: [
        "In most contexts, he! applies thinking skills effectively, demonstrating clear understanding and a growing ability to adapt strategies with purpose.",
        "With consistency, he! uses thinking to support learning, organizing ideas and approaches in ways that lead to reliable and appropriate outcomes.",
        "He! demonstrates a secure grasp of thinking, selecting and applying strategies that generally align well with task demands and expectations.",
        "Across familiar situations, he! engages competently in thinking, showing clarity and structure while continuing to build confidence and flexibility.",
        "By applying learned approaches, he! uses thinking in a dependable manner, supporting steady progress and effective task completion.",
        "While still developing greater adaptability, he! shows consistent capability in thinking, meeting expectations through thoughtful and organized effort."
      ],
      Beginner: [
        "Although developing, his! use of thinking shows emerging understanding, with increasing success when strategies are modeled or supported.",
        "At times, he! applies thinking effectively; however, inconsistency remains, and guided practice is needed to strengthen independence.",
        "With support, he! begins to engage more purposefully in thinking, though application varies depending on context and task complexity.",
        "His! growing awareness of thinking is evident, yet more consistent and independent application is required to meet expectations fully."
      ],
      Novice: [
        "Even with support, his! application of thinking remains limited, and he! experiences difficulty using strategies effectively in most contexts.",
        "He! finds it challenging to engage with thinking, requiring significant guidance to apply even basic skills with consistency and purpose."
      ]
    }
  },
  A: {
    strength: {
      8: "Student!'s greatest strength this term has been in A!, where He! achieved an outstanding Grade 8, demonstrating flawless mathematical knowledge and comprehensive understanding.",
      7: "Student!'s greatest strength this term has been in A!, where He! achieved an exceptional Grade 7, showing deep conceptual understanding and consistent precision in solve mathematical models.",
      6: "Student! achieved a strong Grade 6 in A!, proving his! solid capability to solve mathematical models and recall key concepts with confidence.",
      5: "Student! achieved a Grade 5 in A!, showing reliable mathematical knowledge and effective use of appropriate mathematical concepts.",
      4: "Student! achieved a Grade 4 in A!, which reflects adequate understanding and the ability to apply basic mathematical methods in familiar tasks.",
      3: "Student! achieved a Grade 3 in A!, representing developing capability in applying basic mathematical methods with some guidance.",
      2: "Student! achieved a Grade 2 in A!, representing a starting point for skills consolidation under targeted support.",
      1: "Student! achieved a Grade 1 in A!, indicating He! is in the early stages of mathematical knowledge acquisition."
    },
    improvement: {
      8: "Even at Grade 8, Student! is encouraged to continue to seek advanced extensions in A! to push his! boundaries.",
      7: "To continue his! progress in A! (Grade 7), Student! should maintain his! focus on challenging problem contexts and advanced applications.",
      6: "To advance his! progress, Student! should focus on deepening his! skills in A! (Grade 6) through active practice with complex applications.",
      5: "In A! (Grade 5), Student! is encouraged to consolidate his! knowledge to achieve greater consistency in problem contexts.",
      4: "To support his! progress, Student! should dedicate regular review sessions to A! (Grade 4) topics to solidify his! understanding of mathematical concepts.",
      3: "Student! is encouraged to address critical gaps in A! (Grade 3) by seeking additional support to consolidate key foundational concepts.",
      2: "It is important that Student! seeks targeted support to address gaps in A! (Grade 2) to build his! confidence in foundational concepts.",
      1: "Urgent targeted intervention is recommended for Student! to establish foundational skills in A! (Grade 1)."
    }
  },
  B: {
    strength: {
      8: "Student!'s greatest strength this term has been in B!, where He! achieved an outstanding Grade 8, demonstrating flawless pattern analysis and comprehensive understanding.",
      7: "Student!'s greatest strength this term has been in B!, where He! achieved an exceptional Grade 7, showing deep conceptual understanding and consistent precision in investigate patterns systematically.",
      6: "Student! achieved a strong Grade 6 in B!, proving his! solid capability to investigate patterns systematically and recall key concepts with confidence.",
      5: "Student! achieved a Grade 5 in B!, showing reliable pattern analysis and effective use of appropriate investigative concepts.",
      4: "Student! achieved a Grade 4 in B!, which reflects adequate understanding and the ability to apply basic investigation techniques in familiar tasks.",
      3: "Student! achieved a Grade 3 in B!, representing developing capability in applying basic investigation techniques with some guidance.",
      2: "Student! achieved a Grade 2 in B!, representing a starting point for skills consolidation under targeted support.",
      1: "Student! achieved a Grade 1 in B!, indicating He! is in the early stages of pattern analysis acquisition."
    },
    improvement: {
      8: "Even at Grade 8, Student! is encouraged to continue to seek advanced extensions in B! to push his! boundaries.",
      7: "To continue his! progress in B! (Grade 7), Student! should maintain his! focus on challenging investigations and advanced applications.",
      6: "To advance his! progress, Student! should focus on deepening his! skills in B! (Grade 6) through active practice with complex patterns.",
      5: "In B! (Grade 5), Student! is encouraged to consolidate his! knowledge to achieve greater consistency in investigations.",
      4: "To support his! progress, Student! should dedicate regular review sessions to B! (Grade 4) topics to solidify his! understanding of investigative concepts.",
      3: "Student! is encouraged to address critical gaps in B! (Grade 3) by seeking additional support to consolidate key investigation skills.",
      2: "It is important that Student! seeks targeted support to address gaps in B! (Grade 2) to build his! confidence in investigation skills.",
      1: "Urgent targeted intervention is recommended for Student! to establish foundational skills in B! (Grade 1)."
    }
  },
  C: {
    strength: {
      8: "Student!'s greatest strength this term has been in C!, where He! achieved an outstanding Grade 8, demonstrating flawless mathematical communication and comprehensive understanding.",
      7: "Student!'s greatest strength this term has been in C!, where He! achieved an exceptional Grade 7, showing deep conceptual understanding and consistent precision in present mathematical reasoning clearly.",
      6: "Student! achieved a strong Grade 6 in C!, proving his! solid capability to present mathematical reasoning clearly and recall key concepts with confidence.",
      5: "Student! achieved a Grade 5 in C!, showing reliable mathematical communication and effective use of appropriate mathematical language.",
      4: "Student! achieved a Grade 4 in C!, which reflects adequate understanding and the ability to apply basic notation methods in familiar tasks.",
      3: "Student! achieved a Grade 3 in C!, representing developing capability in applying basic notation methods with some guidance.",
      2: "Student! achieved a Grade 2 in C!, representing a starting point for skills consolidation under targeted support.",
      1: "Student! achieved a Grade 1 in C!, indicating He! is in the early stages of mathematical communication acquisition."
    },
    improvement: {
      8: "Even at Grade 8, Student! is encouraged to continue to seek advanced extensions in C! to push his! boundaries.",
      7: "To continue his! progress in C! (Grade 7), Student! should maintain his! focus on challenging structured explanations and advanced applications.",
      6: "To advance his! progress, Student! should focus on deepening his! skills in C! (Grade 6) through active practice with complex explanations.",
      5: "In C! (Grade 5), Student! is encouraged to consolidate his! knowledge to achieve greater consistency in structured explanations.",
      4: "To support his! progress, Student! should dedicate regular review sessions to C! (Grade 4) topics to solidify his! understanding of mathematical language.",
      3: "Student! is encouraged to address critical gaps in C! (Grade 3) by seeking additional support to consolidate key notation and clarity.",
      2: "It is important that Student! seeks targeted support to address gaps in C! (Grade 2) to build his! confidence in notation and clarity.",
      1: "Urgent targeted intervention is recommended for Student! to establish foundational skills in C! (Grade 1)."
    }
  },
  D: {
    strength: {
      8: "Student!'s greatest strength this term has been in D!, where He! achieved an outstanding Grade 8, demonstrating flawless real-life application and comprehensive understanding.",
      7: "Student!'s greatest strength this term has been in D!, where He! achieved an exceptional Grade 7, showing deep conceptual understanding and consistent precision in apply mathematics to real-life contexts.",
      6: "Student! achieved a strong Grade 6 in D!, proving his! solid capability to apply mathematics to real-life contexts and recall key concepts with confidence.",
      5: "Student! achieved a Grade 5 in D!, showing reliable real-life application and effective use of appropriate applied concepts.",
      4: "Student! achieved a Grade 4 in D!, which reflects adequate understanding and the ability to apply basic modeling techniques in familiar tasks.",
      3: "Student! achieved a Grade 3 in D!, representing developing capability in applying basic modeling techniques with some guidance.",
      2: "Student! achieved a Grade 2 in D!, representing a starting point for skills consolidation under targeted support.",
      1: "Student! achieved a Grade 1 in D!, indicating He! is in the early stages of real-life application acquisition."
    },
    improvement: {
      8: "Even at Grade 8, Student! is encouraged to continue to seek advanced extensions in D! to push his! boundaries.",
      7: "To continue his! progress in D! (Grade 7), Student! should maintain his! focus on challenging practical scenarios and advanced applications.",
      6: "To advance his! progress, Student! should focus on deepening his! skills in D! (Grade 6) through active practice with complex applied problems.",
      5: "In D! (Grade 5), Student! is encouraged to consolidate his! knowledge to achieve greater consistency in practical scenarios.",
      4: "To support his! progress, Student! should dedicate regular review sessions to D! (Grade 4) topics to solidify his! understanding of applied concepts.",
      3: "Student! is encouraged to address critical gaps in D! (Grade 3) by seeking additional support to consolidate key practical applications.",
      2: "It is important that Student! seeks targeted support to address gaps in D! (Grade 2) to build his! confidence in practical applications.",
      1: "Urgent targeted intervention is recommended for Student! to establish foundational skills in D! (Grade 1)."
    }
  }
};

const BANK_STORAGE_KEY = 'edukit_comment_bank';

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getBestAndWorst = (critScores) => {
  const entries = Object.entries(critScores).filter(([, v]) => v !== null && v !== undefined && v !== '');
  if (entries.length === 0) return { best: 'A', worst: 'D', bestScore: 4, worstScore: 4 };

  const maxScore = Math.max(...entries.map(([, v]) => Number(v)));
  const minScore = Math.min(...entries.map(([, v]) => Number(v)));

  const bests = entries.filter(([, v]) => Number(v) === maxScore).map(([k]) => k);
  const worsts = entries.filter(([, v]) => Number(v) === minScore).map(([k]) => k);

  const best = pickRandom(bests);
  const worstCandidates = worsts.filter((k) => k !== best);
  const worst = worstCandidates.length > 0 ? pickRandom(worstCandidates) : pickRandom(worsts);

  const bestScore = Math.max(1, Math.min(8, Math.round(maxScore)));
  const worstScore = Math.max(1, Math.min(8, Math.round(minScore)));

  return { best, worst, bestScore, worstScore };
};

const applyPlaceholders = (template, data) => {
  if (!template) return '';
  const names = data.critNames || {};
  const bestLetter = data.best || 'A';
  const worstLetter = data.worst || 'D';

  const getCritString = (letter, rawName) => {
    if (!rawName) return `Crit ${letter}`;
    if (rawName.trim().toLowerCase() === `crit ${letter.toLowerCase()}`) {
      return `Crit ${letter}`;
    }
    return `Crit ${letter}: ${rawName}`;
  };

  const critA = getCritString('A', names.A);
  const critB = getCritString('B', names.B);
  const critC = getCritString('C', names.C);
  const critD = getCritString('D', names.D);
  const critBest = getCritString(bestLetter, names[bestLetter]);
  const critWorst = getCritString(worstLetter, names[worstLetter]);

  // Determine target language based on exact subject name
  // Only the two subjects per language carry non-English ATL comments
  // Normalise whitespace so extra internal spaces (e.g. from iSAMS data) don't cause a miss
  const subjectName = (data.subject || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const isFrench = subjectName === 'language and literature - french' || subjectName === 'individuals & societies - french';
  const isGerman = subjectName === 'language and literature - german' || subjectName === 'individuals & societies - german';

  // Resolve pronouns based on subject language and student gender/pronouns
  // data.pronouns has { subj, obj, poss } in English (e.g. he/him/his or she/her/her)
  let resolvedPronouns = { ...data.pronouns };
  const isMale = data.pronouns.subj === 'he';
  const isFemale = data.pronouns.subj === 'she';

  if (isFrench) {
    resolvedPronouns = {
      subj: isMale ? 'il' : (isFemale ? 'elle' : 'iel'),
      obj: 'lui', // default indirect object in French
      poss: isMale ? 'son' : (isFemale ? 'sa' : 'leur') // default singular possessive adjectives
    };
  } else if (isGerman) {
    resolvedPronouns = {
      subj: isMale ? 'er' : (isFemale ? 'sie' : 'es'),
      obj: isMale ? 'ihn' : (isFemale ? 'sie' : 'es'), // accusative
      poss: isMale ? 'sein' : (isFemale ? 'ihr' : 'sein')
    };
  }

  let resolvedText = template || '';

  // 1. Standard bracket placeholders
  resolvedText = resolvedText
    .replace(/\[Name\]/g, data.forename)
    .replace(/\[He\/She\]/g, resolvedPronouns.subj.charAt(0).toUpperCase() + resolvedPronouns.subj.slice(1))
    .replace(/\[he\/she\]/g, resolvedPronouns.subj)
    .replace(/\[His\/Her\]/g, resolvedPronouns.poss.charAt(0).toUpperCase() + resolvedPronouns.poss.slice(1))
    .replace(/\[his\/her\]/g, resolvedPronouns.poss)
    .replace(/\[Him\/Her\]/g, resolvedPronouns.obj.charAt(0).toUpperCase() + resolvedPronouns.obj.slice(1))
    .replace(/\[him\/her\]/g, resolvedPronouns.obj)
    .replace(/\[Grade\]/g, data.grade)
    .replace(/\[Subject\]/g, data.subject)
    .replace(/\[CritA\]/g, critA)
    .replace(/\[CritB\]/g, critB)
    .replace(/\[CritC\]/g, critC)
    .replace(/\[CritD\]/g, critD)
    .replace(/\[BestCrit\]/g, critBest)
    .replace(/\[WeakCrit\]/g, critWorst)
    .replace(/\[ATL Skill\]/g, data.atlSkill)
    .replace(/\[ATL\]/g, data.atlProgress);

  // 2. Language-specific pronoun replacements
  if (isFrench) {
    resolvedText = resolvedText
      .replace(/\bil!(?!\w)/g, isMale ? 'il' : 'elle')
      .replace(/\bIl!(?!\w)/g, isMale ? 'Il' : 'Elle')
      .replace(/\belle!(?!\w)/g, isMale ? 'il' : 'elle')
      .replace(/\bElle!(?!\w)/g, isMale ? 'Il' : 'Elle')
      .replace(/\bqu'il!(?!\w)/g, isMale ? "qu'il" : "qu'elle")
      .replace(/\bqu'elle!(?!\w)/g, isMale ? "qu'il" : "qu'elle")
      .replace(/\bQu'il!(?!\w)/g, isMale ? "Qu'il" : "Qu'elle")
      .replace(/\bQu'elle!(?!\w)/g, isMale ? "Qu'il" : "Qu'elle")
      .replace(/\bélève!(?!\w)/g, data.forename)
      .replace(/\bÉlève!(?!\w)/g, data.forename);
  } else if (isGerman) {
    resolvedText = resolvedText
      .replace(/\ber!(?!\w)/g, isMale ? 'er' : 'sie')
      .replace(/\bEr!(?!\w)/g, isMale ? 'Er' : 'Sie')
      .replace(/\bsie!(?!\w)/g, isMale ? 'er' : 'sie')
      .replace(/\bSie!(?!\w)/g, isMale ? 'Er' : 'Sie')
      .replace(/\bihn!(?!\w)/g, isMale ? 'ihn' : 'sie')
      .replace(/\bIhn!(?!\w)/g, isMale ? 'Ihn' : 'Sie')
      .replace(/\bseine!(?!\w)/g, isMale ? 'seine' : 'ihre')
      .replace(/\bSeine!(?!\w)/g, isMale ? 'Seine' : 'Ihre')
      .replace(/\bseiner!(?!\w)/g, isMale ? 'seiner' : 'ihrer')
      .replace(/\bSeiner!(?!\w)/g, isMale ? 'Seiner' : 'Ihrer')
      .replace(/\bsein!(?!\w)/g, isMale ? 'sein' : 'ihr')
      .replace(/\bSein!(?!\w)/g, isMale ? 'Sein' : 'Ihr');
  }

  // 3. Custom iSAMS English/generic placeholders
  resolvedText = resolvedText
    .replace(/Student!/g, data.forename)
    .replace(/He!/g, resolvedPronouns.subj.charAt(0).toUpperCase() + resolvedPronouns.subj.slice(1))
    .replace(/he!/g, resolvedPronouns.subj)
    .replace(/His!/g, resolvedPronouns.poss.charAt(0).toUpperCase() + resolvedPronouns.poss.slice(1))
    .replace(/his!/g, resolvedPronouns.poss)
    .replace(/him!/g, resolvedPronouns.obj)
    .replace(/Subject!/g, data.subject)
    .replace(/A!\(?/g, critA)
    .replace(/B!\(?/g, critB)
    .replace(/C!\(?/g, critC)
    .replace(/D!\(?/g, critD)
    .replace(/BestCrit!\(?/g, critBest)
    .replace(/WeakCrit!\(?/g, critWorst);

  return resolvedText;
};

export default function CommentGenerator() {
  const {
    fileConnected,
    students,
    selectedClass,
    missingColumns,
    subject,
    setSubject,
    updateStudent,
    updateStudents
  } = useData();

  const [activeView, setActiveView] = useState('intro'); // 'intro' | 'generator' | 'bank'
  const [atlSkill, setAtlSkill] = useState(''); // Prompt state: empty initially so they choose!
  const [prevClass, setPrevClass] = useState(selectedClass);
  const [bank, setBank] = useState(() => {
    try {
      const saved = localStorage.getItem(BANK_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.atl && parsed.atl.Communication && !Array.isArray(parsed.atl.Communication.Expert)) {
          localStorage.removeItem(BANK_STORAGE_KEY);
          return DEFAULT_BANK;
        }
        return parsed;
      }
      return DEFAULT_BANK;
    } catch { return DEFAULT_BANK; }
  });

  const [expandedSection, setExpandedSection] = useState('ib_grade');
  const [statusMessage, setStatusMessage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [isLoadingBank, setIsLoadingBank] = useState(false);
  const [mypSubjects, setMypSubjects] = useState({});

  // Reset generated comments when switching classes globally from top nav
  useEffect(() => {
    if (selectedClass !== prevClass) {
      setPrevClass(selectedClass);

      const classStudents = students.filter(s => s.className === selectedClass);
      const hasGeneratedComments = classStudents.some(s => s.comment);

      if (hasGeneratedComments) {
        const updatedStudents = students.map(s => {
          if (s.className === selectedClass) {
            return { ...s, comment: '', status: null };
          }
          return s;
        });
        updateStudents(updatedStudents);
        showStatus('warning', `Class changed to ${selectedClass}. Roster comments reset for regeneration.`);
      }
    }
  }, [selectedClass, prevClass, updateStudents]);

  // Dynamic comment bank hydration based on selected subject
  // Re-runs when selectedClass changes so that Double/Triple Science resolves correctly
  useEffect(() => {
    const loadBank = async () => {
      setIsLoadingBank(true);
      try {
        // Resolve Double/Triple Science to the real science subject via the class name
        const rawSubject = subject || 'Mathematics';
        const subjectKey = resolveScience(rawSubject, selectedClass);

        // 1. Fetch ATL bank (universal with English, French, and German language support)
        const atlRes = await fetch('/comment_bank/atl.json');
        if (!atlRes.ok) throw new Error('Failed to fetch ATL bank');
        const atlAllData = await atlRes.json();

        // Detect language based on active subject
        // Normalise whitespace so extra internal spaces (e.g. from iSAMS data) don't cause a miss
        const subjectName = subjectKey.trim().toLowerCase().replace(/\s+/g, ' ');
        const isFrench = subjectName === 'language and literature - french' || subjectName === 'individuals & societies - french';
        const isGerman = subjectName === 'language and literature - german' || subjectName === 'individuals & societies - german';
        const langKey = isFrench ? 'french' : (isGerman ? 'german' : 'english');

        // Extract language-specific ATL data
        const atlData = atlAllData[langKey] || atlAllData['english'] || atlAllData;

        // 2. Fetch consolidated comments bank (all subjects in one file)
        const commentsRes = await fetch('/comment_bank/comments.json');
        if (!commentsRes.ok) throw new Error('Failed to fetch comments bank');
        const commentsAll = await commentsRes.json();

        // 3. Extract subject-specific A, B, C, D criteria blocks
        const subjectComments = commentsAll[subjectKey] || commentsAll['Mathematics'] || {};

        // 4. Fetch IB Grade bank (universal with subject divisions)
        const ibRes = await fetch('/comment_bank/ib_grade.json');
        if (!ibRes.ok) throw new Error('Failed to fetch IB Grade bank');
        const ibAllData = await ibRes.json();
        const ibData = ibAllData[subjectKey] || ibAllData.Mathematics || {};

        const mergedBank = {
          ib_grade: ibData,
          atl: atlData,
          A: subjectComments.A || {},
          B: subjectComments.B || {},
          C: subjectComments.C || {},
          D: subjectComments.D || {}
        };

        setBank(mergedBank);
        localStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(mergedBank));

        // 5. Fetch IB MYP Subject configurations (criteria names)
        try {
          const criteriaRes = await fetch('/comment_bank/criteria.json');
          if (criteriaRes.ok) {
            const criteriaData = await criteriaRes.json();
            setMypSubjects(criteriaData);
          }
        } catch (criteriaErr) {
          console.warn('Could not load criteria configuration dynamically, using fallbacks:', criteriaErr.message);
        }
      } catch (err) {
        console.warn('Could not load bank from files, falling back to local bank state. Details:', err.message);
        const saved = localStorage.getItem(BANK_STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.atl && parsed.atl.Communication && !Array.isArray(parsed.atl.Communication.Expert)) {
              setBank(DEFAULT_BANK);
            } else {
              setBank(parsed);
            }
          }
          catch { setBank(DEFAULT_BANK); }
        } else {
          setBank(DEFAULT_BANK);
        }
      } finally {
        setIsLoadingBank(false);
      }
    };

    loadBank();
  }, [subject, selectedClass]);

  // Filter students to the active class
  const classStudents = students.filter(s => s.className === selectedClass);

  const currentGradeGroup = (() => {
    if (classStudents && classStudents.length > 0 && classStudents[0].gradeLevel) {
      const g = classStudents[0].gradeLevel;
      if (/^\d+$/.test(g)) {
        return `Grade ${g}`;
      }
      return g;
    }
    const match = String(selectedClass || '').match(/\d+/);
    return match ? `Grade ${match[0]}` : 'Grade 7';
  })();

  // Resolve Double/Triple Science for criteria name lookup too
  const resolvedSubjectForCrit = resolveScience(subject, selectedClass);
  const subjectCrit = mypSubjects[resolvedSubjectForCrit] || mypSubjects[getGenericSubjectGroup(resolvedSubjectForCrit)] || mypSubjects.Mathematics || Object.values(mypSubjects)[0];
  
  const critNames = (subjectCrit && typeof subjectCrit.A === 'string')
    ? subjectCrit
    : { A: 'Crit A', B: 'Crit B', C: 'Crit C', D: 'Crit D' };

  // Sync subject if defined in database
  useEffect(() => {
    if (classStudents.length > 0 && classStudents[0].subject) {
      const dbSub = classStudents[0].subject;
      setSubject(dbSub);
    }
  }, [selectedClass]);

  const showStatus = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 6000);
  };

  const saveBank = () => {
    localStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(bank));
    showStatus('success', 'Comment bank saved to your browser successfully!');
  };

  const resetBank = () => {
    if (window.confirm('Reset comment bank to default samples? Your current edits will be lost.')) {
      setBank(DEFAULT_BANK);
      localStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(DEFAULT_BANK));
      showStatus('success', 'Comment bank reset to defaults.');
    }
  };

  // ── Comment Assembly ───────────────────────────────────────────────────────
  const buildComment = (student, overrideAtlIndex = null) => {
    // Resolve Double/Triple Science to the real subject using the student's own class name
    const effectiveSubject = resolveScience(subject, student.className || selectedClass);

    const ibGradeVal = student.ibGrade ? Number(student.ibGrade) : null;
    const hasLowCrit = [student.critA, student.critB, student.critC, student.critD].some(v => {
      if (v === null || v === undefined || v === '') return false;
      const num = Number(v);
      return num === 1 || num === 2;
    });
    const hasMissingCrit = student.critA === null || student.critA === undefined || student.critA === '' ||
                           student.critB === null || student.critB === undefined || student.critB === '' ||
                           student.critC === null || student.critC === undefined || student.critC === '' ||
                           student.critD === null || student.critD === undefined || student.critD === '';

    if (ibGradeVal === 1 || ibGradeVal === 2) {
      return `For a performance grade of ${ibGradeVal} in ${effectiveSubject}, a standard comment has not been generated. The teacher should draft this comment manually to address highly customized support plans and specific academic goals.`;
    }

    if (hasLowCrit) {
      return `For individual criterion scores of 1 or 2 in ${effectiveSubject}, a standard comment has not been generated. The teacher should draft this comment manually to address highly customized support plans and specific academic goals.`;
    }

    if (hasMissingCrit) {
      return '';
    }

    const critScores = { A: student.critA, B: student.critB, C: student.critC, D: student.critD };
    const { best, worst, bestScore, worstScore } = getBestAndWorst(critScores);

    const activeSkill = student.selectedAtlSkill || atlSkill;
    const activeProgress = student.atlProgress || 'Practitioner';

    const data = {
      forename: student.forename,
      pronouns: student.pronouns,
      grade: student.ibGrade || 4,
      subject: effectiveSubject,   // resolved subject used for Subject! placeholder
      critNames,
      best,
      worst,
      atlSkill: activeSkill,
      atlProgress: activeProgress,
    };

    const gradeKey = String(student.ibGrade || 4);
    const s1 = bank.ib_grade[gradeKey] || bank.ib_grade[4];

    let s2 = '';
    if (bank.atl && bank.atl[activeSkill]) {
      const val = bank.atl[activeSkill][activeProgress] || bank.atl[activeSkill]['Good'];
      const totalOptions = Array.isArray(val) ? val.length : 1;
      let optionIndex = student.selectedAtlIndex !== undefined && student.selectedAtlIndex !== null
        ? student.selectedAtlIndex
        : Math.floor(Math.random() * totalOptions);
      if (overrideAtlIndex !== null) {
        optionIndex = overrideAtlIndex;
      }
      s2 = Array.isArray(val) ? val[optionIndex % totalOptions] : (val || '');
    } else if (bank.atl) {
      const val = bank.atl[activeProgress] || bank.atl['Good'];
      const totalOptions = Array.isArray(val) ? val.length : 1;
      let optionIndex = student.selectedAtlIndex !== undefined && student.selectedAtlIndex !== null
        ? student.selectedAtlIndex
        : Math.floor(Math.random() * totalOptions);
      if (overrideAtlIndex !== null) {
        optionIndex = overrideAtlIndex;
      }
      s2 = Array.isArray(val) ? val[optionIndex % totalOptions] : (val || '');
    }

    let s3 = '';
    if (bank[best] && bank[best].strength) {
      s3 = bank[best].strength[bestScore] || bank[best].strength[4];
    }

    let s4 = '';
    if (bank[worst] && bank[worst].improvement) {
      s4 = bank[worst].improvement[worstScore] || bank[worst].improvement[4];
    }

    return [s1, s2, s3, s4].map((s) => applyPlaceholders(s, data)).join(' ');
  };

  const cycleAtlOption = (student, direction) => {
    const activeSkill = student.selectedAtlSkill || atlSkill;
    const activeProgress = student.atlProgress || 'Practitioner';
    
    if (!bank.atl || !bank.atl[activeSkill]) return;
    const val = bank.atl[activeSkill][activeProgress];
    if (!Array.isArray(val)) return;
    
    const totalOptions = val.length;
    let currentIndex = student.selectedAtlIndex !== undefined && student.selectedAtlIndex !== null
      ? student.selectedAtlIndex
      : Math.floor(Math.random() * totalOptions);
      
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % totalOptions;
    } else {
      nextIndex = (currentIndex - 1 + totalOptions) % totalOptions;
    }
    
    try {
      const updatedComment = buildComment(student, nextIndex);
      updateStudent(student.id, { 
        selectedAtlIndex: nextIndex,
        comment: updatedComment, 
        status: 'success' 
      });
    } catch (err) {
      showStatus('error', `Failed to cycle option: ${err.message}`);
    }
  };

  const generateAll = () => {
    if (!classStudents.length) {
      showStatus('error', 'No student roster connected for this class.');
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      let errors = 0;
      const updatedStudents = students.map((s) => {
        if (s.className === selectedClass) {
          try {
            const activeProgress = s.atlProgress || 'Practitioner';
            const activeSkill = s.selectedAtlSkill || atlSkill;
            const val = bank.atl?.[activeSkill]?.[activeProgress];
            const totalOptions = Array.isArray(val) ? val.length : 1;
            
            const selectedAtlIndex = Math.floor(Math.random() * totalOptions);

            const generatedComment = buildComment(s, selectedAtlIndex);
            return { ...s, selectedAtlIndex, comment: generatedComment, status: 'success' };
          } catch (err) {
            errors++;
            return { ...s, comment: `Error: ${err.message}`, status: 'error' };
          }
        }
        return s;
      });

      updateStudents(updatedStudents);
      setIsGenerating(false);
      if (errors === 0) {
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
        showStatus('success', `Generated comments for ${classStudents.length} students instantly!`);
      } else {
        showStatus('warning', `Generated comments with ${errors} error(s). Review raw student rows.`);
      }
    }, 100);
  };

  const regenerateOne = (student) => {
    cycleAtlOption(student, 'next');
  };



  // Copy to clipboard helper
  const copyToClipboard = (text, studentName) => {
    navigator.clipboard.writeText(text);
    showStatus('success', `Copied comment for ${studentName} to clipboard!`);
  };

  // ── Export Excel ─────────────────────────────────────────────────────────
  const exportExcel = () => {
    if (!classStudents.length) return;
    const rows = classStudents.map((s) => {
      const ibGradeVal = s.ibGrade ? Number(s.ibGrade) : null;
      const hasLowCrit = [s.critA, s.critB, s.critC, s.critD].some(v => {
        if (v === null || v === undefined || v === '') return false;
        const num = Number(v);
        return num === 1 || num === 2;
      });
      const hasMissingCrit = s.critA === null || s.critA === undefined || s.critA === '' ||
                             s.critB === null || s.critB === undefined || s.critB === '' ||
                             s.critC === null || s.critC === undefined || s.critC === '' ||
                             s.critD === null || s.critD === undefined || s.critD === '';
      const isManualDraft = ibGradeVal === 1 || ibGradeVal === 2 || hasLowCrit || hasMissingCrit;

      return {
        Forename: s.forename,
        Surname: s.surname,
        Gender: s.gender,
        'IB Grade': s.ibGrade,
        'Crit A': s.critA,
        'Crit B': s.critB,
        'Crit C': s.critC,
        'Crit D': s.critD,
        'ATL Progress': s.atlProgress,
        'Generated Comment': isManualDraft ? '' : s.comment,
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 14 }, { wch: 14 }, { wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 18 }, { wch: 80 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Generated Comments');
    XLSX.writeFile(wb, `sisd_comments_${selectedClass.toLowerCase().replace(/\s+/g, '_')}.xlsx`);
  };

  // Check which important columns are missing
  const isAtlMissing = missingColumns.includes('atl');
  const isCriteriaMissing = missingColumns.includes('critA') || missingColumns.includes('critB') || missingColumns.includes('critC') || missingColumns.includes('critD');
  const isMegMissing = missingColumns.includes('meg');
  const hasMissingGrades = classStudents.some(
    s => s.critA === null || s.critA === undefined || s.critA === '' ||
         s.critB === null || s.critB === undefined || s.critB === '' ||
         s.critC === null || s.critC === undefined || s.critC === '' ||
         s.critD === null || s.critD === undefined || s.critD === ''
  );

  const BankSection = ({ sectionKey, label, entries, keyLabels }) => {
    const isOpen = expandedSection === sectionKey;
    const safeEntries = entries || {};
    const hasSubdivisions = safeEntries.strength || safeEntries.improvement;

    return (
      <div className="glass-panel" style={{ marginBottom: '0.75rem', overflow: 'hidden' }}>
        <button
          onClick={() => setExpandedSection(isOpen ? null : sectionKey)}
          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
            {label}
            {isLoadingBank && sectionKey !== 'atl' && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>(Loading...)</span>}
          </span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isOpen && (
          <div style={{ padding: '0 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {hasSubdivisions ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Strength Column */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#34d399', marginBottom: '1rem', borderBottom: '1px solid rgba(52, 211, 153, 0.2)', paddingBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    💪 Strength Templates
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {Object.entries(safeEntries.strength || {}).map(([key, template]) => (
                      <div key={key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {keyLabels ? keyLabels[key] : key}
                          </label>
                        </div>
                        <textarea
                          value={template}
                          readOnly={true}
                          rows={2}
                          style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem', fontFamily: 'inherit', fontSize: '0.82rem', color: 'var(--text-muted)', resize: 'none', outline: 'none', lineHeight: '1.45', cursor: 'not-allowed' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Improvement Column */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#fbbf24', marginBottom: '1rem', borderBottom: '1px solid rgba(251, 191, 36, 0.2)', paddingBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    📈 Improvement Templates
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {Object.entries(safeEntries.improvement || {}).map(([key, template]) => (
                      <div key={key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {keyLabels ? keyLabels[key] : key}
                          </label>
                        </div>
                        <textarea
                          value={template}
                          readOnly={true}
                          rows={2}
                          style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem', fontFamily: 'inherit', fontSize: '0.82rem', color: 'var(--text-muted)', resize: 'none', outline: 'none', lineHeight: '1.45', cursor: 'not-allowed' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Standard flat list (e.g. ib_grade or atl)
              Object.entries(safeEntries).map(([key, template]) => {
                const isArray = Array.isArray(template);
                return (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {keyLabels ? keyLabels[key] : key} {isArray && `(${template.length} Alternate Options)`}
                      </label>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: '500' }}>
                        🔒 Locked Templates
                      </span>
                    </div>
                    {isArray ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {template.map((opt, idx) => (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Option {idx + 1}:</span>
                            <textarea
                              value={opt}
                              readOnly={true}
                              rows={2}
                              style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem', fontFamily: 'inherit', fontSize: '0.84rem', color: 'var(--text-muted)', resize: 'none', outline: 'none', lineHeight: '1.45', cursor: 'not-allowed' }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        value={template}
                        readOnly={true}
                        rows={3}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.9rem', fontFamily: 'inherit', fontSize: '0.88rem', color: 'var(--text-muted)', resize: 'none', outline: 'none', lineHeight: '1.55', cursor: 'not-allowed' }}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  };

  const inputStyle = { background: 'var(--bg-app)', border: '1px solid var(--primary)', borderRadius: '4px', color: 'var(--text-main)', padding: '0.2rem 0.4rem', fontSize: '0.88rem', width: '100%', outline: 'none', fontFamily: 'inherit' };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>

      {/* ══════════════════ VIEW 1: INTRO VIEW ══════════════════ */}
      {activeView === 'intro' && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '65vh', padding: '1rem 0' }}>
          <div className="glass-panel animate-fade-in" style={{
            maxWidth: '650px',
            width: '100%',
            padding: '3rem 2.5rem',
            textAlign: 'center',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--primary-glow)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              border: '1px solid var(--border-primary)',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)'
            }}>
              <Sparkles size={38} className="animate-pulse" />
            </div>

            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.6rem', color: 'var(--text-main)' }}>
              IB MYP Comment Assistant
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '2rem', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto 2rem' }}>
              Upload your iSAMS file once. Every student comment, ATL description, and criterion strength compiles dynamically on demand.
            </p>

            {/* Auto-selected information */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.2rem 1.5rem',
              marginBottom: '2rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              textAlign: 'left'
            }}>
              <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '1rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Active Class</span>
                <span style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)' }}>
                  {selectedClass || 'No Class Selected'}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--primary)', display: 'block', marginTop: '2px', fontWeight: '500' }}>✓ Auto-selected from nav</span>
              </div>
              <div style={{ paddingLeft: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Resolved Subject</span>
                <span style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block' }}>
                  {subject}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>MYP Criteria Configured</span>
              </div>
            </div>

            {/* ATL Skill prompt */}
            <div style={{ marginBottom: '2.5rem', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Approaches to Learning (ATL) Skill Focus
              </label>
              <select
                value={atlSkill}
                onChange={(e) => setAtlSkill(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-app)',
                  border: atlSkill ? '1px solid var(--primary)' : '1px dashed var(--border-color-hover)',
                  borderRadius: 'var(--radius-sm)',
                  color: atlSkill ? 'var(--text-main)' : 'var(--text-muted)',
                  fontSize: '0.92rem',
                  outline: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  boxShadow: atlSkill ? '0 0 10px rgba(99, 102, 241, 0.1)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <option value="" disabled>-- Select ATL Skill Category --</option>
                {ATL_SKILLS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {!atlSkill && (
                <span style={{ fontSize: '0.72rem', color: 'var(--accent)', marginTop: '0.4rem', display: 'block', fontWeight: '500' }}>
                  * Please select an ATL skill focus to proceed to workspaces
                </span>
              )}
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                className="btn btn-secondary"
                disabled={!atlSkill}
                onClick={() => setActiveView('bank')}
                style={{
                  padding: '0.75rem 2rem',
                  fontSize: '0.95rem',
                  borderRadius: '30px',
                  fontWeight: '600',
                  border: '1px solid var(--border-color)',
                  background: 'transparent',
                  color: atlSkill ? 'var(--text-main)' : 'var(--text-muted)',
                  cursor: atlSkill ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s'
                }}
              >
                📘 Comment Bank
              </button>

              <button
                className="btn btn-primary"
                disabled={!atlSkill}
                onClick={() => setActiveView('generator')}
                style={{
                  padding: '0.75rem 2rem',
                  fontSize: '0.95rem',
                  borderRadius: '30px',
                  fontWeight: '700',
                  boxShadow: atlSkill ? '0 4px 15px rgba(99, 102, 241, 0.4)' : 'none',
                  background: atlSkill ? 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)' : 'rgba(255,255,255,0.02)',
                  border: 'none',
                  color: atlSkill ? '#fff' : 'var(--text-muted)',
                  cursor: atlSkill ? 'pointer' : 'not-allowed',
                  transform: atlSkill ? 'scale(1.02)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                ⚡ Comment Generator
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sub-view Workspace Navigation Header ── */}
      {activeView !== 'intro' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <button
              onClick={() => setActiveView('intro')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                border: '1px solid var(--border-color)',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '20px',
                padding: '0.4rem 1rem',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: '500',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-main)';
                e.currentTarget.style.borderColor = 'var(--border-color-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <ArrowLeft size={13} /> Back to Selection
            </button>
            <h2 style={{ fontSize: '1.75rem', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: '800' }}>
              {activeView === 'generator' ? <Sparkles style={{ color: 'var(--primary)' }} size={24} /> : <BookOpen style={{ color: 'var(--primary)' }} size={24} />}
              {activeView === 'generator' ? 'Roster Comment Generator' : 'Comment Bank Editor'}
            </h2>
          </div>

          {/* Toggle buttons between sub-views */}
          <div className="glass-panel" style={{ display: 'flex', padding: '4px', gap: '4px', borderRadius: '30px' }}>
            <button
              className="btn"
              style={{
                padding: '0.4rem 1.1rem',
                fontSize: '0.85rem',
                borderRadius: '20px',
                background: activeView === 'bank' ? 'var(--primary)' : 'transparent',
                color: activeView === 'bank' ? '#fff' : 'var(--text-main)',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => setActiveView('bank')}
            >
              <BookOpen size={14} /> Comment Bank
            </button>
            <button
              className="btn"
              style={{
                padding: '0.4rem 1.1rem',
                fontSize: '0.85rem',
                borderRadius: '20px',
                background: activeView === 'generator' ? 'var(--primary)' : 'transparent',
                color: activeView === 'generator' ? '#fff' : 'var(--text-main)',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => setActiveView('generator')}
            >
              <Sparkles size={14} /> Comment Generator
            </button>
          </div>
        </div>
      )}

      {/* ── Status / Warning Banners ── */}
      {activeView !== 'intro' && statusMessage && (
        <div className="glass-panel animate-fade-in" style={{ padding: '0.9rem 1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: statusMessage.type === 'error' ? 'rgba(239,68,68,0.1)' : statusMessage.type === 'warning' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', borderColor: statusMessage.type === 'error' ? 'rgba(239,68,68,0.3)' : statusMessage.type === 'warning' ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)', color: statusMessage.type === 'error' ? '#f87171' : statusMessage.type === 'warning' ? '#fbbf24' : '#34d399', zIndex: 10 }}>
          {statusMessage.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span style={{ fontSize: '0.92rem', fontWeight: '500' }}>{statusMessage.text}</span>
        </div>
      )}

      {/* Inline Missing Data Warnings */}
      {activeView !== 'intro' && fileConnected && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {hasMissingGrades && (
            <div className="glass-panel animate-fade-in" style={{ padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--warning)', background: 'var(--warning-bg)', color: 'var(--text-main)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.86rem', lineHeight: '1.5' }}>
              <AlertCircle size={18} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontWeight: '800', color: 'var(--warning-text)' }}>⚠️ ALERT: Missing Student Criterion Grades Detected</strong>
                <p style={{ marginTop: '0.25rem', color: 'var(--text-main)', opacity: 0.9 }}>
                  Some students in the active class roster have blank or missing **Criterion Grades (Crit A, B, C, or D)**.
                  If you recently entered or changed these grades, please verify that your <strong>OAS (Online Assessment System) gradebook is complete, OAS IS SYNCED AND SAVED</strong> before downloading the Excel file. (Most teachers forget to resync the OAS after making changes, which leaves grades blank in the exported roster sheet).
                </p>
                <p style={{ marginTop: '0.5rem', fontWeight: '800', color: 'var(--warning-text)' }}>
                  💡 Solution: Once OAS is synced and saved, download the latest Excel roster file from iSAMS and re-upload/re-connect it inside the Dashboard tab.
                </p>
              </div>
            </div>
          )}
          {isAtlMissing && (
            <div className="glass-panel animate-fade-in" style={{ padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--warning)', background: 'rgba(245,158,11,0.04)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <AlertCircle size={14} style={{ color: 'var(--warning)' }} />
              <span><strong>ATL data not found in your file:</strong> This paragraph section will default to "Good" descriptors.</span>
            </div>
          )}
          {isCriteriaMissing && (
            <div className="glass-panel animate-fade-in" style={{ padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--warning)', background: 'rgba(245,158,11,0.04)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <AlertCircle size={14} style={{ color: 'var(--warning)' }} />
              <span><strong>Criterion A-D scores not found in your file:</strong> Criteria-specific sentences will fall back to default indicators.</span>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════ VIEW 2: COMMENT BANK EDITOR ══════════════════ */}
      {activeView === 'bank' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '2rem' }} className="animate-fade-in">

          {/* Left: Preview of Active Class, Subject, and ATL Focus */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings2 size={18} style={{ color: 'var(--primary)' }} /> Repository Info
              </h2>

              {/* Active Selection Details Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>Active Class</span>
                    <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{selectedClass || 'No Class Selected'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>Subject</span>
                    <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{subject}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>ATL Skill Focus</span>
                    <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{atlSkill || 'None Selected'}</span>
                  </div>
                </div>
              </div>

              {/* Criteria preview */}
              <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', padding: '1rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Auto-loaded Criterion Names</p>
                {Object.entries(critNames || {}).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: '700', minWidth: '60px' }}>Crit {k}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Placeholder guide */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.85rem' }}>📋 Placeholder Reference</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Standard Bracket Tags</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {[
                      ['[Name]', 'Student first name'],
                      ['[He/She] / [he/she]', 'he / she (cased)'],
                      ['[His/Her] / [his/her]', 'his / her (cased)'],
                      ['[Him/Her] / [him/her]', 'him / her (cased)'],
                      ['[Grade]', 'IB Grade (1–7)'],
                      ['[Subject]', 'Subject name'],
                      ['[CritA]–[CritD]', 'Crit [Letter]: [Name]'],
                      ['[BestCrit] / [WeakCrit]', 'Crit [Letter]: [Name] (best/worst)'],
                      ['[ATL Skill]', 'ATL skill category'],
                      ['[ATL]', 'ATL progress level']
                    ].map(([ph, desc]) => (
                      <div key={ph} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                        <code style={{ color: 'var(--accent)', background: 'rgba(255,255,255,0.04)', padding: '0.1rem 0.35rem', borderRadius: '3px', fontSize: '0.72rem' }}>{ph}</code>
                        <span style={{ color: 'var(--text-muted)' }}>{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>iSAMS Custom Tags</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {[
                      ['Student!', 'Student first name'],
                      ['He! / he!', 'he / she (cased)'],
                      ['His! / his!', 'his / her (cased)'],
                      ['him!', 'him / her (lowercase)'],
                      ['Subject!', 'Subject name'],
                      ['A!–D!', 'Crit [Letter]: [Name]'],
                      ['BestCrit! / WeakCrit!', 'Crit [Letter]: [Name] (best/worst)']
                    ].map(([ph, desc]) => (
                      <div key={ph} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                        <code style={{ color: 'var(--primary)', background: 'rgba(79, 70, 229, 0.08)', border: '1px solid rgba(79, 70, 229, 0.15)', padding: '0.1rem 0.35rem', borderRadius: '3px', fontSize: '0.72rem' }}>{ph}</code>
                        <span style={{ color: 'var(--text-muted)' }}>{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {(subject || '').toLowerCase().includes('french') && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>French Custom Tags</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {[
                        ['il! / elle!', 'il / elle (subject pronoun)'],
                        ['Il! / Elle!', 'Il / Elle (capitalized)'],
                        ['qu\'il! / qu\'elle!', 'qu\'il / qu\'elle'],
                        ['Qu\'il! / Qu\'elle!', 'Qu\'il / Qu\'elle'],
                        ['élève! / Élève!', 'Student first name']
                      ].map(([ph, desc]) => (
                        <div key={ph} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                          <code style={{ color: '#10B981', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)', padding: '0.1rem 0.35rem', borderRadius: '3px', fontSize: '0.72rem' }}>{ph}</code>
                          <span style={{ color: 'var(--text-muted)' }}>{desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(subject || '').toLowerCase().includes('german') && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.75rem', color: '#3B82F6', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>German Custom Tags</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {[
                        ['er! / sie!', 'er / sie (subject pronoun)'],
                        ['Er! / Sie!', 'Er / Sie (capitalized)'],
                        ['ihn! / Ihn!', 'ihn / sie (accusative pronoun)'],
                        ['sein! / Sein!', 'sein / ihr (possessive pronoun)'],
                        ['seine! / Seine!', 'seine / ihre (feminine/plural possessive)'],
                        ['seiner! / Seiner!', 'seiner / ihrer (genitive possessive)']
                      ].map(([ph, desc]) => (
                        <div key={ph} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                          <code style={{ color: '#3B82F6', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.15)', padding: '0.1rem 0.35rem', borderRadius: '3px', fontSize: '0.72rem' }}>{ph}</code>
                          <span style={{ color: 'var(--text-muted)' }}>{desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Comment Bank Reference */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.1rem' }}>Comment Bank Reference</h2>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.8rem', borderRadius: '15px', border: '1px solid var(--border-color)' }}>
                <span>🔒 Official Repository: Read-Only</span>
              </div>
            </div>

            <BankSection sectionKey="ib_grade" label="Sentence 1 — IB Grade Comments"
              entries={bank.ib_grade}
              keyLabels={{ 7: 'Grade 7 (Outstanding)', 6: 'Grade 6 (Excellent)', 5: 'Grade 5 (Strong)', 4: 'Grade 4 (Adequate)', 3: 'Grade 3 (Basic)', 2: 'Grade 2 (Limited)', 1: 'Grade 1 (Very Limited)' }}
            />
            <BankSection sectionKey="atl" label={`Sentence 2 — ATL Progress Comments (${atlSkill || 'Self-Management'})`}
              entries={bank.atl?.[atlSkill] || bank.atl?.[atlSkill || 'Self-Management'] || bank.atl}
              keyLabels={{ Expert: 'Expert', Practitioner: 'Practitioner', Beginner: 'Beginner', Novice: 'Novice' }}
              isNestedAtl={true}
            />
            <BankSection sectionKey="A" label="Criterion A (Sentence 3 Strength & Sentence 4 Improvement)"
              entries={bank.A}
              keyLabels={{
                8: 'Grade 8 (Outstanding)',
                7: 'Grade 7 (Excellent)',
                6: 'Grade 6 (Very Good)',
                5: 'Grade 5 (Good)',
                4: 'Grade 4 (Satisfactory)',
                3: 'Grade 3 (Basic)',
                2: 'Grade 2 (Limited)',
                1: 'Grade 1 (Very Limited)'
              }}
            />
            <BankSection sectionKey="B" label="Criterion B (Sentence 3 Strength & Sentence 4 Improvement)"
              entries={bank.B}
              keyLabels={{
                8: 'Grade 8 (Outstanding)',
                7: 'Grade 7 (Excellent)',
                6: 'Grade 6 (Very Good)',
                5: 'Grade 5 (Good)',
                4: 'Grade 4 (Satisfactory)',
                3: 'Grade 3 (Basic)',
                2: 'Grade 2 (Limited)',
                1: 'Grade 1 (Very Limited)'
              }}
            />
            <BankSection sectionKey="C" label="Criterion C (Sentence 3 Strength & Sentence 4 Improvement)"
              entries={bank.C}
              keyLabels={{
                8: 'Grade 8 (Outstanding)',
                7: 'Grade 7 (Excellent)',
                6: 'Grade 6 (Very Good)',
                5: 'Grade 5 (Good)',
                4: 'Grade 4 (Satisfactory)',
                3: 'Grade 3 (Basic)',
                2: 'Grade 2 (Limited)',
                1: 'Grade 1 (Very Limited)'
              }}
            />
            <BankSection sectionKey="D" label="Criterion D (Sentence 3 Strength & Sentence 4 Improvement)"
              entries={bank.D}
              keyLabels={{
                8: 'Grade 8 (Outstanding)',
                7: 'Grade 7 (Excellent)',
                6: 'Grade 6 (Very Good)',
                5: 'Grade 5 (Good)',
                4: 'Grade 4 (Satisfactory)',
                3: 'Grade 3 (Basic)',
                2: 'Grade 2 (Limited)',
                1: 'Grade 1 (Very Limited)'
              }}
            />
          </div>
        </div>
      )}

      {/* ══════════════════ VIEW 3: COMMENT GENERATOR WORKSPACE ══════════════════ */}
      {activeView === 'generator' && (
        <div className="animate-fade-in">

          {/* Prominent Regeneration Option Banner (Empty Roster State) */}
          {fileConnected && classStudents.length > 0 && !classStudents.some(s => s.comment) && (
            <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '2rem', background: 'rgba(99, 102, 241, 0.03)', borderColor: 'rgba(99, 102, 241, 0.2)', borderStyle: 'dashed', borderRadius: 'var(--radius-md)' }}>
              <Sparkles size={38} style={{ color: 'var(--primary)', marginBottom: '0.75rem', opacity: 0.8 }} />
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '700' }}>Ready to generate report comments?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
                Class roster and academic scores are loaded. Click below to automatically compile four-sentence comments for {selectedClass} using the active <strong>{atlSkill || 'Self-Management'}</strong> ATL templates.
              </p>
              <button className="btn btn-primary" onClick={generateAll} style={{ padding: '0.65rem 2.25rem', borderRadius: '30px', fontWeight: '700', fontSize: '0.92rem', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }}>
                ⚡ Generate Comments Now
              </button>
            </div>
          )}

          {/* Controls bar */}
          <div className="glass-panel" style={{ padding: '1.1rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Active Class Roster: <strong style={{ color: 'var(--text-main)' }}>{selectedClass || 'No Class Selected'}</strong>
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                className="btn btn-primary"
                style={{ padding: '0.55rem 1.25rem', fontSize: '0.9rem' }}
                onClick={generateAll}
                disabled={isGenerating || !classStudents.length}
              >
                {isGenerating ? <><RefreshCw size={15} className="animate-spin" /> Generating...</> : <><Sparkles size={15} /> {classStudents.some(s => s.comment) ? 'Regenerate All Comments' : 'Generate All Comments'}</>}
              </button>
              <button
                className="btn btn-accent"
                style={{ padding: '0.55rem 1.1rem', fontSize: '0.9rem' }}
                onClick={exportExcel}
                disabled={!classStudents.some((s) => s.comment)}
              >
                <Download size={15} /> Export Excel
              </button>
            </div>
          </div>

          {/* Empty state */}
          {!fileConnected && (
            <div
              className="glass-panel"
              style={{ padding: '4.5rem 2rem', textAlign: 'center', border: '2px dashed var(--border-color-hover)' }}
            >
              <FileSpreadsheet size={48} style={{ color: 'var(--primary)', marginBottom: '1rem', opacity: 0.6 }} />
              <h3 style={{ marginBottom: '0.5rem' }}>No student database connected yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
                Please click the <strong>"⚡ Connect Your Data"</strong> button in the top navigation bar to upload your Swiss International School Dubai iSAMS Excel file.
              </p>
            </div>
          )}

          {/* Student Grid */}
          {fileConnected && classStudents.length > 0 && (
            <div className="glass-panel" style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '0.85rem 1rem', width: '40px', color: 'var(--text-muted)' }}>#</th>
                    <th style={{ padding: '0.85rem 1rem', width: '150px' }}>Student</th>
                    <th style={{ padding: '0.85rem 1rem', width: '65px', textAlign: 'center' }}>Grade</th>
                    <th style={{ padding: '0.85rem 1rem', width: '45px', textAlign: 'center' }}>A</th>
                    <th style={{ padding: '0.85rem 1rem', width: '45px', textAlign: 'center' }}>B</th>
                    <th style={{ padding: '0.85rem 1rem', width: '45px', textAlign: 'center' }}>C</th>
                    <th style={{ padding: '0.85rem 1rem', width: '45px', textAlign: 'center' }}>D</th>
                    <th style={{ padding: '0.85rem 1rem', width: '150px' }}>ATL Skill / Progress</th>
                    <th style={{ padding: '0.85rem 1rem', background: 'rgba(99,102,241,0.04)' }}>Generated Comment</th>
                    <th style={{ padding: '0.85rem 1rem', width: '80px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map((s, idx) => {
                    const scores = [s.critA, s.critB, s.critC, s.critD].filter(v => v !== null);
                    const max = scores.length > 0 ? Math.max(...scores) : null;
                    const min = scores.length > 0 ? Math.min(...scores) : null;

                    const cellColor = (v) => {
                      if (v === null || v === undefined) return {};
                      if (v === max && scores.length > 1) return { color: '#34d399', fontWeight: '700' };
                      if (v === min && scores.length > 1) return { color: '#f87171', fontWeight: '700' };
                      return {};
                    };

                    const hasLowCrit = [s.critA, s.critB, s.critC, s.critD].some(v => {
                      if (v === null || v === undefined || v === '') return false;
                      const num = Number(v);
                      return num === 1 || num === 2;
                    });
                    const hasMissingCrit = s.critA === null || s.critA === undefined || s.critA === '' ||
                                           s.critB === null || s.critB === undefined || s.critB === '' ||
                                           s.critC === null || s.critC === undefined || s.critC === '' ||
                                           s.critD === null || s.critD === undefined || s.critD === '';
                    const isManualDraft = s.ibGrade === 1 || s.ibGrade === 2 || String(s.ibGrade) === '1' || String(s.ibGrade) === '2' || hasLowCrit || hasMissingCrit;

                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)', background: s.status === 'success' ? 'rgba(16,185,129,0.02)' : s.status === 'error' ? 'rgba(239,68,68,0.03)' : 'transparent', transition: 'background 0.2s' }}>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{idx + 1}</td>

                        <td style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>
                          {s.name}
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '400', display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                            <span style={{ textTransform: 'capitalize' }}>{s.gender}</span>
                            {s.tags.map(tag => (
                              <span key={tag} style={{ background: 'rgba(255,255,255,0.06)', padding: '0px 4px', borderRadius: '3px', fontSize: '0.65rem' }}>{tag}</span>
                            ))}
                          </div>
                        </td>

                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          <span style={{ background: 'var(--primary-glow)', color: 'var(--primary)', borderRadius: '6px', padding: '0.15rem 0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>
                            {s.ibGrade ?? '—'}
                          </span>
                        </td>

                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center', ...cellColor(s.critA) }}>{s.critA ?? '—'}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center', ...cellColor(s.critB) }}>{s.critB ?? '—'}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center', ...cellColor(s.critC) }}>{s.critC ?? '—'}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center', ...cellColor(s.critD) }}>{s.critD ?? '—'}</td>

                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '5px' }}>
                            {s.selectedAtlSkill || atlSkill || 'Self-Management'}
                          </div>
                          <span style={{
                            background: s.atlProgress === 'Expert' || s.atlProgress === 'Excellent' ? 'rgba(16,185,129,0.1)' : s.atlProgress === 'Practitioner' || s.atlProgress === 'Good' ? 'rgba(99,102,241,0.1)' : s.atlProgress === 'Beginner' || s.atlProgress === 'Satisfactory' || s.atlProgress === 'Developing' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                            border: '1px solid ' + (s.atlProgress === 'Expert' || s.atlProgress === 'Excellent' ? 'rgba(16,185,129,0.2)' : s.atlProgress === 'Practitioner' || s.atlProgress === 'Good' ? 'rgba(99,102,241,0.2)' : s.atlProgress === 'Beginner' || s.atlProgress === 'Satisfactory' || s.atlProgress === 'Developing' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'),
                            color: s.atlProgress === 'Expert' || s.atlProgress === 'Excellent' ? '#34d399' : s.atlProgress === 'Practitioner' || s.atlProgress === 'Good' ? 'var(--primary)' : s.atlProgress === 'Beginner' || s.atlProgress === 'Satisfactory' || s.atlProgress === 'Developing' ? '#fbbf24' : '#f87171',
                            borderRadius: '4px',
                            padding: '0.2rem 0.5rem',
                            fontWeight: '600',
                            fontSize: '0.8rem',
                            display: 'inline-block'
                          }}>
                            {s.atlProgress || 'Practitioner'}
                          </span>
                        </td>

                        <td style={{ 
                          padding: '0.75rem 1rem', 
                          background: hasMissingCrit
                            ? 'rgba(239, 68, 68, 0.03)'
                            : isManualDraft
                            ? 'rgba(245, 158, 11, 0.04)' 
                            : 'rgba(99,102,241,0.02)', 
                          borderLeft: hasMissingCrit
                            ? '3px solid #ef4444'
                            : isManualDraft
                            ? '3px solid #fbbf24'
                            : 'none'
                        }}>
                          <div
                            style={{ 
                              lineHeight: '1.6', 
                              color: s.comment ? 'var(--text-main)' : 'var(--text-muted)', 
                              fontStyle: s.comment ? 'normal' : 'italic', 
                              fontSize: '0.86rem' 
                            }}
                          >
                            {isManualDraft && (
                              <div style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '4px', 
                                color: hasMissingCrit ? '#ef4444' : '#fbbf24', 
                                fontSize: '0.72rem', 
                                fontWeight: '700', 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.05em',
                                background: hasMissingCrit ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                marginBottom: '6px'
                              }}>
                                ⚠️ {hasMissingCrit ? 'Missing Grades' : 'Manual Draft'}
                              </div>
                            )}
                            <div>
                              {hasMissingCrit && !s.comment ? (
                                <span 
                                  style={{ color: '#ef4444', fontWeight: '600', fontStyle: 'normal', cursor: 'help' }} 
                                  title="Please verify that your OAS (Online Assessment System) gradebook is complete, synced, and saved. Most teachers forget to resync the OAS after making changes, which results in incorrect or blank grades in downloaded sheets. Once resynced, download the latest Excel file from iSAMS and re-upload."
                                >
                                  ⚠️ Criterion grades are missing. Comment cannot be generated. (Verify OAS Sync & Re-upload)
                                </span>
                              ) : (
                                s.comment || 'Click Generate Comments Now to create comment…'
                              )}
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                            {s.comment && !isManualDraft && (
                              <>
                                <button
                                  title="Copy Comment"
                                  onClick={() => copyToClipboard(s.comment, s.name)}
                                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.35rem' }}
                                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                                >
                                  <Copy size={13} />
                                </button>
                                <button
                                  title="Regenerate single comment"
                                  onClick={() => regenerateOne(s)}
                                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.35rem' }}
                                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                                >
                                  <Shuffle size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {fileConnected && classStudents.length === 0 && (
            <div className="glass-panel" style={{ padding: '4.5rem 2rem', textAlign: 'center' }}>
              <AlertCircle size={40} style={{ color: 'var(--warning)', marginBottom: '1rem', opacity: 0.8 }} />
              <h3>No students found in the active class</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.5rem' }}>
                There are no students listed under <strong>"{selectedClass}"</strong> in your Excel file.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
