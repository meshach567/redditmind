/**
 * API route helper utilities
 * Provides common middleware and error handling for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, strictLimiter, standardLimiter } from './rate-limit';
import { handleCorsPreflight, withCors } from './cors';
import { ValidationError } from './validation';
import { logger } from './logger';

/**
 * API route handler options
 */
export interface ApiHandlerOptions {
  rateLimit?: 'standard' | 'strict' | 'none';
  requireAuth?: boolean;
  cors?: boolean;
}

/**
 * Wrapper for API route handlers with common middleware
 */
export function createApiHandler(
  handler: (request: NextRequest, context?: Record<string, unknown>) => Promise<NextResponse>,
  options: ApiHandlerOptions = {}
) {
  return async (request: NextRequest, context?: Record<string, unknown>): Promise<NextResponse> => {
    try {
      // Handle CORS preflight
      if (options.cors !== false) {
        const preflight = handleCorsPreflight(request);
        if (preflight) return preflight;
      }

      // Apply rate limiting
      if (options.rateLimit !== 'none') {
        const limiter = options.rateLimit === 'strict' ? strictLimiter : standardLimiter;
        const rateLimitResponse = await checkRateLimit(request, limiter);
        if (rateLimitResponse) {
          return withCors(rateLimitResponse, request);
        }
      }

      // Execute handler
      const response = await handler(request, context);

      // Add CORS headers if enabled
      if (options.cors !== false) {
        return withCors(response, request);
      }

      return response;
    } catch (error) {
      // Handle validation errors
      if (error instanceof ValidationError) {
        logger.warn('Validation error', { errors: error.errors });
        return NextResponse.json(
          {
            error: error.message,
            details: error.errors,
          },
          { status: 400 }
        );
      }

      // Handle other errors
      logger.error('API route error', error as Error, {
        path: request.url,
        method: request.method,
      });

      return NextResponse.json(
        {
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'development' 
            ? error instanceof Error ? error.message : String(error)
            : 'An unexpected error occurred',
        },
        { status: 500 }
      );
    }
  };
}

