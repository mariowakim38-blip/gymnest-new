import { z } from 'zod';
import { protectedProcedure } from '../../middleware/auth';
import { requireAdmin } from '../../utils/guards';

export const deleteClassProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    requireAdmin(ctx);
    const { error } = await ctx.supabase.from('classes').delete().eq('id', input.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });
