import { z } from 'zod';
import { protectedProcedure } from '../../middleware/auth';

export const updateCoachProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      specialization: z.string().min(1).optional(),
      experience: z.string().min(1).optional(),
      bio: z.string().min(1).optional(),
      imageUrl: z.string().url().optional(),
      rating: z.number().min(0).max(5).optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log('[updateCoach] Updating coach:', input);

    if (ctx.profile?.role !== 'admin') {
      throw new Error('Only admins can update coaches');
    }

    const { id, imageUrl, ...updates } = input;
    const updateData: Record<string, any> = { ...updates };
    if (imageUrl !== undefined) {
      updateData.image_url = imageUrl;
    }

    const { data, error } = await ctx.supabase
      .from('coaches')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[updateCoach] Error:', error);
      throw new Error(`Failed to update coach: ${error.message}`);
    }

    console.log('[updateCoach] Updated:', data);
    return data;
  });
