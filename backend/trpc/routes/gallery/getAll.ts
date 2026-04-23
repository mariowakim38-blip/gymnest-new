import { publicProcedure } from '../../create-context';

export const getAllGalleryItemsProcedure = publicProcedure.query(async ({ ctx }) => {
  const { data, error } = await ctx.supabase
    .from('gallery_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch gallery items: ${error.message}`);
  }

  return data ?? [];
});
