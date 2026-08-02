import { z } from 'zod';

export const STUDENT_ID_PATTERN = /^\d{2}[A-Z]{3}\d{4}$/;
export const STUDENT_ID_EXAMPLE = '22CIS0279';

const studentIdSchema = z
  .string()
  .trim()
  .min(1, 'Student ID is required')
  .refine(
    (value) => STUDENT_ID_PATTERN.test(value.toUpperCase()),
    `Enter a valid Student ID, for example ${STUDENT_ID_EXAMPLE}`
  );

export const signInSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Email or Student ID is required')
    .refine(
      (value) =>
        z.email().safeParse(value).success ||
        STUDENT_ID_PATTERN.test(value.toUpperCase()),
      `Enter a valid email or Student ID, for example ${STUDENT_ID_EXAMPLE}`
    ),
  password: z.string().min(1, 'Password is required'),
});

export const signUpSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required'),
    lastName: z.string().trim().min(1, 'Last name is required'),
    studentId: studentIdSchema,
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordEmailSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
});

export const newPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

/**
 * Validates `values` against `schema` and returns a flat { field: message } error map.
 * Returns an empty object when validation passes.
 */
export function validate(schema, values) {
  const result = schema.safeParse(values);
  if (result.success) return {};

  const fieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}
