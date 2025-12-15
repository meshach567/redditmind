/**
 * CORS configuration utility
 * Handles Cross-Origin Resource Sharing for API routes
 */

import { NextResponse } from "next/server";

export interface CorsOptions {
  origin?: string | string[] | ((origin: string | null) => boolean);
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * Default CORS configuration
 * Allows requests from same origin and configured allowed origins
 */
const defaultOptions: CorsOptions = {
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : ["http://localhost:3000"], // Allow same-origin by default
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: [
    "X-RateLimit-Limit",
    "X-RateLimit-Remaining",
    "X-RateLimit-Reset",
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
};

/**
 * Check if origin is allowed
 */
function isOriginAllowed(
  origin: string | null,
  allowedOrigins:
    | string
    | string[]
    | ((origin: string | null) => boolean)
    | boolean
): boolean {
  if (!origin) {
    // Same-origin requests don't have an Origin header
    return true;
  }

  if (allowedOrigins === true) {
    return true; // Allow all origins
  }

  if (typeof allowedOrigins === "function") {
    return allowedOrigins(origin);
  }

  if (typeof allowedOrigins === "string") {
    return allowedOrigins === origin;
  }

  if (Array.isArray(allowedOrigins)) {
    return allowedOrigins.includes(origin);
  }

  return false;
}

/**
 * Create CORS headers for a response
 */
export function createCorsHeaders(
  request: Request,
  options: CorsOptions = {}
): Record<string, string> {
  const config = { ...defaultOptions, ...options };
  const origin = request.headers.get("origin");
  const isAllowed = isOriginAllowed(origin, config.origin ?? true);

  const headers: Record<string, string> = {};

  if (isAllowed && origin) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  if (config.credentials) {
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  if (config.methods) {
    headers["Access-Control-Allow-Methods"] = config.methods.join(", ");
  }

  if (config.allowedHeaders) {
    headers["Access-Control-Allow-Headers"] = config.allowedHeaders.join(", ");
  }

  if (config.exposedHeaders) {
    headers["Access-Control-Expose-Headers"] = config.exposedHeaders.join(", ");
  }

  if (config.maxAge) {
    headers["Access-Control-Max-Age"] = config.maxAge.toString();
  }

  return headers;
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreflight(
  request: Request,
  options: CorsOptions = {}
): NextResponse | null {
  if (request.method === "OPTIONS") {
    const headers = createCorsHeaders(request, options);
    return new NextResponse(null, {
      status: 204,
      headers,
    });
  }

  return null;
}

/**
 * Add CORS headers to a response
 */
export function withCors(
  response: NextResponse,
  request: Request,
  options: CorsOptions = {}
): NextResponse {
  const headers = createCorsHeaders(request, options);
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}
