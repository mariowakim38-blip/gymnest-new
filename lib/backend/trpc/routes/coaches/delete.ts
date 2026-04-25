import { z } from 'zod';
import { protectedProcedure } from '../../middleware/auth';

export const deleteCoachProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log('[deleteCoach] Deleting coach:', input.id);

    if (ctx.profile?.role !== 'admin') {
      throw new Error('Only admins can delete coaches');
    }

    const { error } = await ctx.supabase
      .from('coaches')
      .delete()
      .eq('id', input.id);

    if (error) {
      console.error('[deleteCoach] Error:', error);
      throw new Error(`Failed to delete coach: ${error.message}`);
    }

    console.log('[deleteCoach] Deleted:', input.id);
    return { success: true };
  });
