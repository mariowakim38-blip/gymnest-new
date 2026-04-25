import { z } from 'zod';
import { protectedProcedure } from '../../middleware/auth';

export const createGalleryItemProcedure = protectedProcedure
  .input(
    z.object({
      url: z.string().url(),
      caption: z.string().min(1),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log('[createGalleryItem] Creating gallery item:', input);

    if (ctx.profile?.role !== 'admin') {
      throw new Error('Only admins can create gallery items');
    }

    const { data, error } = await ctx.supabase
      .from('gallery_items')
      .insert([{
        url: input.url,
        caption: input.caption,
      }])
      .select()
      .single();

    if (error) {
      console.error('[createGalleryItem] Error:', error);
      throw new Error(`Failed to create gallery item: ${error.message}`);
    }

    console.log('[createGalleryItem] Created:', data);
    return data;
  });
