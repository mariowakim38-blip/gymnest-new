import { z } from 'zod';
import { protectedProcedure } from '../../middleware/auth';
import { Database } from '../../../../lib/database.types';

type SessionRow = Database['public']['Tables']['sessions']['Row'];

export const getStudentSessionsProcedure = protectedProcedure
  .input(z.object({
    studentId: z.string(),
  }))
  .query(async ({ input, ctx }) => {
    const [profileId, childId] = input.studentId.split('-');
    if (!profileId || !childId) return [];

    const canView = ctx.profile?.role === 'admin' || ctx.profile?.id === profileId;
    if (!canView) {
      throw new Error('You can only view your own sessions');
    }

    const { data: sessionsData, error } = await ctx.supabase
      .from('sessions')
      .select('*')
      .eq('profile_id', profileId)
      .eq('child_id', childId)
      .neq('status', 'cancelled')
      .order('session_date', { ascending: false });

    if (error) throw new Error(error.message);

    const typedSessions = (sessionsData ?? []) as SessionRow[];
    return typedSessions.map((session) => ({
      id: session.id,
      coachId: session.coach_id,
      studentId: `${session.profile_id}-${session.child_id}`,
      date: session.session_date,
      time: new Date(session.session_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      duration: `${session.duration} min`,
      status: (session.status === 'completed' ? 'completed' : session.status === 'cancelled' ? 'cancelled' : 'scheduled') as 'scheduled' | 'completed' | 'cancelled',
    }));
  });
