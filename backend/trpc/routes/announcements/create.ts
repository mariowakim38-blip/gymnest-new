import { z } from 'zod';
import { protectedProcedure } from '../../middleware/auth';

export const createAnnouncementProcedure = protectedProcedure
  .input(
    z.object({
      title: z.string().min(1),
      message: z.string().min(1),
      type: z.enum(['promotion', 'event', 'info']),
      date: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log('[createAnnouncement] Creating announcement:', input);
    console.log('[createAnnouncement] User role:', ctx.profile?.role);

    if (ctx.profile?.role !== 'admin') {
      throw new Error('Only admins can create announcements');
    }

    const { data, error } = await ctx.supabase
      .from('announcements')
      .insert([{
        title: input.title,
        message: input.message,
        type: input.type,
        date: input.date,
      }])
      .select()
      .single();

    if (error) {
      console.error('[createAnnouncement] Error:', error);
      throw new Error(`Failed to create announcement: ${error.message}`);
    }

    console.log('[createAnnouncement] Created:', data);
    return data;
  });
