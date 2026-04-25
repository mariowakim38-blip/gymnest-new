import { z } from 'zod';
import { protectedProcedure } from '../../middleware/auth';

export const deleteAnnouncementProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log('[deleteAnnouncement] Deleting announcement:', input.id);

    if (ctx.profile?.role !== 'admin') {
      throw new Error('Only admins can delete announcements');
    }

    const { error } = await ctx.supabase
      .from('announcements')
      .delete()
      .eq('id', input.id);

    if (error) {
      console.error('[deleteAnnouncement] Error:', error);
      throw new Error(`Failed to delete announcement: ${error.message}`);
    }

    console.log('[deleteAnnouncement] Deleted:', input.id);
    return { success: true };
  });
