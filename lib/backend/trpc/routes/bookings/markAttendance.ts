import { z } from 'zod';
import { protectedProcedure } from '../../middleware/auth';
import { requireAdmin } from '../../utils/guards';

export const markAttendanceProcedure = protectedProcedure
  .input(z.object({
    bookingId: z.string(),
    attended: z.boolean(),
  }))
  .mutation(async ({ input, ctx }) => {
    requireAdmin(ctx);

    const { error } = await ctx.supabase
      .from('bookings')
      .update({ attended: input.attended, updated_at: new Date().toISOString() })
      .eq('id', input.bookingId);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  });
