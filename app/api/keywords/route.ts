import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/api-helpers';
import { requireAuth } from '@/lib/auth-helpers';
import { validateRequestBody, keywordSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

async function handleGet() {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const { user, supabase } = auth;

  const { data: keywords, error } = await supabase
    .from('keywords')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error fetching keywords', error);
    throw error;
  }

  return NextResponse.json({
    success: true,
    keywords: keywords || [],
  });
}

/**
 * POST /api/keywords
 * Creates a new keyword for authenticated user
 */
async function handlePost(request: NextRequest) {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const { user, supabase } = auth;

  // Validate request body
  const body = await validateRequestBody(request, keywordSchema);

  const { data: newKeyword, error } = await supabase
    .from('keywords')
    .insert({
      user_id: user.id,
      keyword: body.keyword,
      search_intent: body.search_intent || null,
      intent_category: body.intent_category || 'general',
    })
    .select()
    .single();

  if (error) {
    logger.error('Error creating keyword', error);
    throw error;
  }

  return NextResponse.json(
    {
      success: true,
      keyword: newKeyword,
    },
    { status: 201 }
  );
}

export const GET = createApiHandler(handleGet, {
  rateLimit: 'standard',
  cors: true,
});

export const POST = createApiHandler(handlePost, {
  rateLimit: 'standard',
  cors: true,
});
