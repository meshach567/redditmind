/**
 * Rate limiting utility using Upstash Redis
 * Provides rate limiting for API routes to prevent abuse
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// Initialize Redis client (works without Redis in development)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

/**
 * Standard rate limiter: 10 requests per 10 seconds
 * Suitable for most API endpoints
 */
export const standardLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
      prefix: '@upstash/ratelimit',
    })
  : null;

/**
 * Strict rate limiter: 5 requests per minute
 * For expensive operations like calendar generation
 */
export const strictLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: true,
      prefix: '@upstash/ratelimit/strict',
    })
  : null;

/**
 * Apply rate limiting to a request
 * @param request - Next.js request object
 * @param limiter - Rate limiter instance (optional, defaults to standard)
 * @returns Response if rate limited, null if allowed
 */
export async function checkRateLimit(
  request: Request,
  limiter: Ratelimit | null = standardLimiter
): Promise<NextResponse | null> {
  // Skip rate limiting in development if Redis is not configured
  if (!limiter || process.env.NODE_ENV === 'development') {
    return null;
  }

  try {
    // Get identifier from request (IP address or user ID)
    const identifier = getIdentifier(request);
    const { success, limit, remaining, reset } = await limiter.limit(identifier);

    if (!success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: reset,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': reset.toString(),
          },
        }
      );
    }

    return null; // Request allowed
  } catch (error) {
    // If rate limiting fails, allow the request (fail open)
    // Import logger dynamically to avoid circular dependencies
    const { logger } = await import('./logger');
    logger.error('Rate limiting error', error as Error);
    return null;
  }
}

/**
 * Get identifier for rate limiting (IP address or user ID)
 */
function getIdentifier(request: Request): string {
  // Try to get IP from headers (works with most proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';

  return ip;
}