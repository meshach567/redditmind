import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/api-helpers';
import { requireAuth } from '@/lib/auth-helpers';
import { validateQuery, calendarQuerySchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

async function handleGet(request: NextRequest) {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const { user, supabase } = auth;

  try {
    // Validate and parse query parameters
    const { searchParams } = new URL(request.url);
    const { limit, offset } = validateQuery(searchParams, calendarQuerySchema);

    // Fetch calendars with posts and comments
    const { data: calendars, error: calendarError } = await supabase
      .from('content_calendars')
      .select(
        `
        *,
        posts(
          *,
          comments(*)
        )
      `
      )
      .eq('user_id', user.id)
      .order('week_start', { ascending: false })
      .range(offset, offset + limit - 1);

    if (calendarError) {
      logger.error('Error fetching calendars', calendarError, {
        userId: user.id,
      });
      throw calendarError;
    }

    return NextResponse.json({
      success: true,
      calendars: calendars || [],
      count: calendars?.length || 0,
    });
  } catch (error) {
    logger.error('Error fetching calendars', error as Error, {
      userId: user.id,
    });
    throw error; // Let api-helpers handle the response
  }
}

export const GET = createApiHandler(handleGet, {
  rateLimit: 'standard',
  cors: true,
});
