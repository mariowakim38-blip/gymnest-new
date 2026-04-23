import { publicProcedure } from '../../create-context';

export const getAllCoachesProcedure = publicProcedure.query(async ({ ctx }) => {
  const { data, error } = await ctx.supabase
    .from('coaches')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch coaches: ${error.message}`);
  }

  return data ?? [];
});
