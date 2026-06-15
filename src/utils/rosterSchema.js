import { z } from 'zod';

// Preprocessor to coerce Yes/No string values to strict boolean true/false
const yesNoBooleanSchema = z.preprocess((val) => {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    if (s === 'yes' || s === 'true' || s === 'y') return true;
    if (s === 'no' || s === 'false' || s === 'n' || s === '') return false;
  }
  if (val === null || val === undefined) return false;
  return undefined;
}, z.boolean({ invalid_type_error: "Must be 'Yes' or 'No'" }));

// Preprocessor to coerce strings or floats to strict integers or null
const integerCoerceSchema = (min, max, name) => z.preprocess((val) => {
  if (val === null || val === undefined || val === '') return null;
  const num = Number(val);
  return isNaN(num) ? null : Math.round(num);
}, z.number().int().min(min, `${name} must be at least ${min}`).max(max, `${name} must be at most ${max}`).nullable());

export const StudentRowSchema = z.object({
  forename: z.string({ required_error: "Forename is required" }).min(1, "Forename is required"),
  surname: z.string({ required_error: "Surname is required" }).min(1, "Surname is required"),
  className: z.string({ required_error: "Class is required" }).min(1, "Class is required"),
  gradeLevel: z.string({ required_error: "Grade is required" }).min(1, "Grade is required"),
  subject: z.string({ required_error: "Subject is required" }).min(1, "Subject is required"),
  teacherName: z.string({ required_error: "Teacher Name is required" }).min(1, "Teacher Name is required"),
  gender: z.preprocess((val) => {
    if (typeof val === 'string') {
      const s = val.trim().toLowerCase();
      if (s === 'm' || s === 'male' || s === 'boy') return 'M';
      if (s === 'f' || s === 'female' || s === 'girl') return 'F';
    }
    return val;
  }, z.enum(['M', 'F'], { invalid_type_error: "Gender must be 'M' or 'F'" })),
  eal: yesNoBooleanSchema,
  sen: yesNoBooleanSchema,
  gifted: yesNoBooleanSchema,
  emirati: yesNoBooleanSchema,
  atlProgress: z.string().default('Practitioner'),
  attitude: z.preprocess((val) => {
    if (typeof val === 'string') {
      const s = val.trim().toUpperCase();
      if (s === 'ME' || s === 'AE' || s === 'EE' || s === 'BE') return s;
    }
    return val;
  }, z.enum(['ME', 'AE', 'EE', 'BE'], { invalid_type_error: "Attitude must be ME or AE" }).optional().default('ME')),
  cpt: integerCoerceSchema(0, 32, "CPT"),
  critA: integerCoerceSchema(0, 8, "Criterion A"),
  critB: integerCoerceSchema(0, 8, "Criterion B"),
  critC: integerCoerceSchema(0, 8, "Criterion C"),
  critD: integerCoerceSchema(0, 8, "Criterion D"),
  ibGrade: integerCoerceSchema(1, 7, "IB Grade"),
  meg: integerCoerceSchema(0, 32, "MEG").optional().nullable().default(null),
  formGroup: z.string().optional().nullable().default(null)
});
