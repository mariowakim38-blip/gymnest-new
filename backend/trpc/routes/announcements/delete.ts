import { z } from 'zod';
import { protectedProcedure } from '../../middleware/auth';

export const deleteAnnouncementProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string().min(1),
    })
  )
  .mutation(async ({ input, ctx }) => {
    if (ctx.profile?.role !== 'admin') {
      throw new Error('Only admins can delete announcements');
    }

    const { error } = await ctx.supabase
      .from('announcements')
      .delete()
      .eq('id', input.id);

    if (error) {
      throw new Error(`Failed to delete announcement: ${error.message}`);
    }

    return {
      success: true,
      id: input.id,
    };
  });
