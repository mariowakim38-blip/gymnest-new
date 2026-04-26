import { z } from 'zod';
import { protectedProcedure } from '../../middleware/auth';

export const updateAnnouncementProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      message: z.string().min(1),
      type: z.enum(['promotion', 'event', 'info']),
      date: z.string().min(1),
    })
  )
  .mutation(async ({ input, ctx }) => {
    if (ctx.profile?.role !== 'admin') {
      throw new Error('Only admins can update announcements');
    }

    const { data, error } = await ctx.supabase
      .from('announcements')
      .update({
        title: input.title.trim(),
        message: input.message.trim(),
        type: input.type,
        date: input.date,
      })
      .eq('id', input.id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update announcement: ${error.message}`);
    }

    return {
      success: true,
      announcement: data,
    };
  });
