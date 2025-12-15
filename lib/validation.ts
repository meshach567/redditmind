import { z } from 'zod';

/**
 * Intent categories allowed in the system
 */
const IntentCategory = z.enum([
  'comparison',
  'recommendation',
  'how-to',
  'problem-driven',
  'general',
]);

/**
 * Keyword creation/update schema
 */
export const keywordSchema = z.object({
  keyword: z
    .string()
    .min(1, 'Keyword is required')
    .max(200, 'Keyword must be less than 200 characters')
    .trim(),
  search_intent: z
    .string()
    .max(500, 'Search intent must be less than 500 characters')
    .optional()
    .nullable(),
  intent_category: IntentCategory.optional().default('general'),
});

/**
 * Persona creation/update schema
 */
export const personaSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .max(50, 'Username must be less than 50 characters')
    .trim()
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .nullable(),
  subreddits: z
    .array(z.string().min(1).max(100))
    .max(20, 'Maximum 20 subreddits allowed')
    .optional()
    .default([]),
});

/**
 * Calendar generation schema
 */
export const generateCalendarSchema = z.object({
  weekStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'weekStart must be in YYYY-MM-DD format')
    .refine(
      (date) => {
        const d = new Date(date);
        return !isNaN(d.getTime());
      },
      { message: 'Invalid date format' }
    ),
  postsPerWeek: z
    .number()
    .int('postsPerWeek must be an integer')
    .min(1, 'At least 1 post per week required')
    .max(10, 'Maximum 10 posts per week allowed')
    .optional()
    .default(3),
});

/**
 * UUID parameter schema (for route params)
 */
export const uuidSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

/**
 * Query parameters for calendar listing
 */
export const calendarQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().int().min(1).max(100)),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0))
    .pipe(z.number().int().min(0)),
});

/**
 * Validate request body with a Zod schema
 * Returns parsed data or throws validation error
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        'Validation failed',
        error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }))
      );
    }
    throw error;
  }
}

/**
 * Validate route parameters with a Zod schema
 */
export function validateParams<T>(
  params: Record<string, string | string[] | undefined>,
  schema: z.ZodSchema<T>
): T {
  try {
    return schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        'Invalid route parameters',
        error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }))
      );
    }
    throw error;
  }
}

/**
 * Validate query parameters with a Zod schema
 */
export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): T {
  try {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        'Invalid query parameters',
        error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }))
      );
    }
    throw error;
  }
}

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Array<{ path: string; message: string }>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

