import { z } from 'zod';

// Preprocessor to coerce Yes/No string values to strict boolean true/false
const yesNoBooleanSchema = z.preprocess((val) => {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    if (s === 'yes' || s === 'true' || s === 'y' || s === '1') return true;
    if (s === 'no' || s === 'false' || s === 'n' || s === '0' || s === '') return false;
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
  gender: z.preprocess((val) => {
    if (typeof val === 'string') {
      const s = val.trim().toLowerCase();
      if (s === 'm' || s === 'male' || s === 'boy') return 'M';
      if (s === 'f' || s === 'female' || s === 'girl') return 'F';
    }
    return val;
  }, z.enum(['M', 'F'], { invalid_type_error: "Gender must be 'M' or 'F'" })),

  // Student Demographic & Status Flags
  emirati: yesNoBooleanSchema.optional().default(false),
  eal: yesNoBooleanSchema.optional().default(false),
  gifted: yesNoBooleanSchema.optional().default(false),
  sen: yesNoBooleanSchema.optional().default(false),
  boarding: yesNoBooleanSchema.optional().default(false),

  // CAT4 Scores & Summary Comments
  cat4Verbal: integerCoerceSchema(0, 200, "Verbal SAS").optional().nullable().default(null),
  cat4Quantitative: integerCoerceSchema(0, 200, "Quantitative SAS").optional().nullable().default(null),
  cat4Spatial: integerCoerceSchema(0, 200, "Spatial SAS").optional().nullable().default(null),
  cat4NonVerbal: integerCoerceSchema(0, 200, "Non-Verbal SAS").optional().nullable().default(null),
  cat4Mean: integerCoerceSchema(0, 200, "Mean SAS").optional().nullable().default(null),
  cat4Comment: z.preprocess((val) => (val === null || val === undefined ? '' : String(val)), z.string()).optional().nullable().default(''),

  // Class & Teacher Details
  className: z.preprocess((val) => (val ? String(val).trim() : 'General Class'), z.string().default('General Class')),
  teacherName: z.preprocess((val) => (val ? String(val).trim() : 'Teacher'), z.string().optional().nullable().default('Teacher')),

  // Academic Grade Details (Optional)
  gradeLevel: z.string().optional().nullable().default(''),
  subject: z.string().optional().nullable().default(''),
  atlProgress: z.preprocess((val) => {
    if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) {
      return 'Practitioner';
    }
    return String(val);
  }, z.string().default('Practitioner')),
  attitude: z.preprocess((val) => {
    if (typeof val === 'string') {
      const s = val.trim().toUpperCase();
      if (s === 'ME' || s === 'AE' || s === 'EE' || s === 'BE') return s;
    }
    return val;
  }, z.enum(['ME', 'AE', 'EE', 'BE'], { invalid_type_error: "Attitude must be ME or AE" }).optional().default('ME')),
  cpt: integerCoerceSchema(0, 32, "CPT").optional().nullable().default(null),
  critA: integerCoerceSchema(0, 8, "Criterion A").optional().nullable().default(null),
  critB: integerCoerceSchema(0, 8, "Criterion B").optional().nullable().default(null),
  critC: integerCoerceSchema(0, 8, "Criterion C").optional().nullable().default(null),
  critD: integerCoerceSchema(0, 8, "Criterion D").optional().nullable().default(null),
  ibGrade: integerCoerceSchema(1, 7, "IB Grade").optional().nullable().default(null),
  meg: integerCoerceSchema(0, 32, "MEG").optional().nullable().default(null),
  formGroup: z.string().optional().nullable().default(null)
});
