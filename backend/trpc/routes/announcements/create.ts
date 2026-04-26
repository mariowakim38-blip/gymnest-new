import { z } from 'zod';
import { protectedProcedure } from '../../middleware/auth';

export const createAnnouncementProcedure = protectedProcedure
  .input(
    z.object({
      title: z.string().min(1),
      message: z.string().min(1),
      type: z.enum(['promotion', 'event', 'info']),
      date: z.string().min(1),
    })
  )
  .mutation(async ({ input, ctx }) => {
    if (ctx.profile?.role !== 'admin') {
      throw new Error('Only admins can create announcements');
    }

    const { data, error } = await ctx.supabase
      .from('announcements')
      .insert({
        title: input.title.trim(),
        message: input.message.trim(),
        type: input.type,
        date: input.date,
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create announcement: ${error.message}`);
    }

    return {
      success: true,
      announcement: data,
    };
  });
