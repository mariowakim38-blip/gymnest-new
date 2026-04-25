import { z } from 'zod';
import { protectedProcedure } from '../../middleware/auth';
import { Database } from '../../../../lib/database.types';

type SessionInsert = Database['public']['Tables']['sessions']['Insert'];

export const bookPrivateSessionProcedure = protectedProcedure
  .input(z.object({
    coachId: z.string(),
    studentId: z.string(),
    date: z.string(),
    time: z.string(),
    duration: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    const bookingsEnabled = process.env.ENABLE_BOOKINGS === 'true';
    const [profileId, childId] = input.studentId.split('-');
    if (!profileId || !childId) {
      throw new Error('Invalid studentId format. Expected format: profileId-childId');
    }
    if (ctx.profile?.role !== 'admin' && ctx.profile?.id !== profileId) {
      throw new Error('You can only create sessions for your own children');
    }

    if (!bookingsEnabled) {
      return {
        success: true,
        session: {
          id: `mock-${Date.now()}`,
          profile_id: profileId,
          coach_id: input.coachId,
          child_id: childId,
          session_date: input.date,
          duration: parseInt(input.duration.replace(/\D/g, ''), 10) || 60,
          status: 'confirmed' as const,
          created_at: new Date().toISOString(),
        },
      };
    }

    const durationMinutes = parseInt(input.duration.replace(/\D/g, ''), 10) || 60;
    const sessionToInsert: SessionInsert = {
      profile_id: profileId,
      coach_id: input.coachId,
      child_id: childId,
      session_date: input.date,
      duration: durationMinutes,
      status: 'confirmed',
    };

    const { data, error } = await ctx.supabase.from('sessions').insert(sessionToInsert).select().single();
    if (error || !data) throw new Error(error?.message || 'Failed to create session');
    return { success: true, session: data };
  });
