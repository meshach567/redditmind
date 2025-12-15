/**
 * Authentication helper utilities
 * Provides common auth functions for API routes
 */

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { logger } from "./logger";

/**
 * Get authenticated user from request
 * Returns user or null if not authenticated
 */
export async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Handle errors gracefully
            }
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    return { user, supabase };
  } catch (error) {
    logger.error("Error getting authenticated user", error as Error);
    return null;
  }
}

/**
 * Require authentication - returns user or 401 response
 */
export async function requireAuth() {
  const auth = await getAuthenticatedUser();

  if (!auth) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return auth;
}
