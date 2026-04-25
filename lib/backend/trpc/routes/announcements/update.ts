import { z } from 'zod';
import { protectedProcedure } from '../../middleware/auth';

export const updateAnnouncementProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      title: z.string().min(1).optional(),
      message: z.string().min(1).optional(),
      type: z.enum(['promotion', 'event', 'info']).optional(),
      date: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log('[updateAnnouncement] Updating announcement:', input);

    if (ctx.profile?.role !== 'admin') {
      throw new Error('Only admins can update announcements');
    }

    const { id, ...updates } = input;

    const { data, error } = await ctx.supabase
      .from('announcements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[updateAnnouncement] Error:', error);
      throw new Error(`Failed to update announcement: ${error.message}`);
    }

    console.log('[updateAnnouncement] Updated:', data);
    return data;
  });
