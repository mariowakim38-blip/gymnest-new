import { publicProcedure } from '../../create-context';

export const getAllAnnouncementsProcedure = publicProcedure.query(async ({ ctx }) => {
  const { data, error } = await ctx.supabase
    .from('announcements')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch announcements: ${error.message}`);
  }

  return data ?? [];
});
