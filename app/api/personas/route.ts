import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/api-helpers';
import { requireAuth } from '@/lib/auth-helpers';
import { validateRequestBody, personaSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

async function handleGet() {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const { user, supabase } = auth;

  const { data: personas, error } = await supabase
    .from('personas')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error fetching personas', error);
    throw error;
  }

  return NextResponse.json({
    success: true,
    personas: personas || [],
  });
}

/**
 * POST /api/personas
 * Creates a new persona for authenticated user
 */
async function handlePost(request: NextRequest) {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const { user, supabase } = auth;

  // Validate request body
  const body = await validateRequestBody(request, personaSchema);

  const { data: persona, error } = await supabase
    .from('personas')
    .insert({
      user_id: user.id,
      username: body.username,
      bio: body.bio || null,
      subreddits: body.subreddits || [],
    })
    .select()
    .single();

  if (error) {
    logger.error('Error creating persona', error);
    throw error;
  }

  return NextResponse.json(
    {
      success: true,
      persona,
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
