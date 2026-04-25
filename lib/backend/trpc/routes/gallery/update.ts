import { z } from 'zod';
import { protectedProcedure } from '../../middleware/auth';

export const updateGalleryItemProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      url: z.string().url().optional(),
      caption: z.string().min(1).optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log('[updateGalleryItem] Updating gallery item:', input);

    if (ctx.profile?.role !== 'admin') {
      throw new Error('Only admins can update gallery items');
    }

    const { id, ...updates } = input;

    const { data, error } = await ctx.supabase
      .from('gallery_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[updateGalleryItem] Error:', error);
      throw new Error(`Failed to update gallery item: ${error.message}`);
    }

    console.log('[updateGalleryItem] Updated:', data);
    return data;
  });
