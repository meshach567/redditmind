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

  // Verify persona belongs to user
  const { data: persona } = await supabase
    .from('personas')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!persona || persona.user_id !== user.id) {
    return NextResponse.json(
      { error: 'Persona not found' },
      { status: 404 }
    );
  }

  const { error } = await supabase
    .from('personas')
    .delete()
    .eq('id', id);

  if (error) {
    logger.error('Error deleting persona', error);
    throw error;
  }

  return NextResponse.json({ success: true });
}

export const DELETE = createApiHandler(handleDelete, {
  rateLimit: 'standard',
  cors: true,
});
