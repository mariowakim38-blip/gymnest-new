import { protectedProcedure } from '../../middleware/auth';
import { requireAdmin } from '../../utils/guards';
import { Database } from '../../../../lib/database.types';

type SessionRow = Database['public']['Tables']['sessions']['Row'];

export const getAllSessionsProcedure = protectedProcedure.query(async ({ ctx }) => {
  requireAdmin(ctx);

  const { data: sessionsData, error } = await ctx.supabase
    .from('sessions')
    .select('*')
    .order('session_date', { ascending: false });

  if (error) throw new Error(error.message);

  const typedSessions = (sessionsData ?? []) as SessionRow[];
  return typedSessions.map((session) => ({
    id: session.id,
    coachId: session.coach_id || '',
    studentId: `${session.profile_id}-${session.child_id}`,
    date: session.session_date || new Date().toISOString(),
    time: new Date(session.session_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    duration: `${session.duration || 60} min`,
    status: (session.status === 'completed' ? 'completed' : session.status === 'cancelled' ? 'cancelled' : 'scheduled') as 'scheduled' | 'completed' | 'cancelled',
  }));
});
