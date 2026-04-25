import { z } from 'zod';
import { protectedProcedure } from '../../middleware/auth';

export const deleteGalleryItemProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log('[deleteGalleryItem] Deleting gallery item:', input.id);

    if (ctx.profile?.role !== 'admin') {
      throw new Error('Only admins can delete gallery items');
    }

    const { error } = await ctx.supabase
      .from('gallery_items')
      .delete()
      .eq('id', input.id);

    if (error) {
      console.error('[deleteGalleryItem] Error:', error);
      throw new Error(`Failed to delete gallery item: ${error.message}`);
    }

    console.log('[deleteGalleryItem] Deleted:', input.id);
    return { success: true };
  });
