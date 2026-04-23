import { z } from 'zod';
import { protectedProcedure } from '../../middleware/auth';

export const createCoachProcedure = protectedProcedure
  .input(
    z.object({
      name: z.string().min(1),
      specialization: z.string().min(1),
      experience: z.string().min(1),
      bio: z.string().min(1),
      imageUrl: z.string().url(),
      rating: z.number().min(0).max(5).optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log('[createCoach] Creating coach:', input);

    if (ctx.profile?.role !== 'admin') {
      throw new Error('Only admins can create coaches');
    }

    const { data, error } = await ctx.supabase
      .from('coaches')
      .insert([{
        name: input.name,
        specialization: input.specialization,
        experience: input.experience,
        bio: input.bio,
        image_url: input.imageUrl,
        rating: input.rating,
      }])
      .select()
      .single();

    if (error) {
      console.error('[createCoach] Error:', error);
      throw new Error(`Failed to create coach: ${error.message}`);
    }

    console.log('[createCoach] Created:', data);
    return data;
  });
