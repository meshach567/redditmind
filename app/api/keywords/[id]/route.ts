import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/api-helpers';
import { requireAuth } from '@/lib/auth-helpers';
import { validateParams, uuidSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

async function handleDelete(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const { user, supabase } = auth;

  // Validate UUID parameter
  const { id } = validateParams(params, uuidSchema);

  // Verify keyword belongs to user
  const { data: keyword } = await supabase
    .from('keywords')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!keyword || keyword.user_id !== user.id) {
    return NextResponse.json(
      { error: 'Keyword not found' },
      { status: 404 }
    );
  }

  const { error } = await supabase
    .from('keywords')
    .delete()
    .eq('id', id);

  if (error) {
    logger.error('Error deleting keyword', error);
    throw error;
  }

  return NextResponse.json({ success: true });
}

export const DELETE = createApiHandler(handleDelete, {
  rateLimit: 'standard',
  cors: true,
});
