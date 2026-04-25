import { z } from 'zod';
import { protectedProcedure } from '../../middleware/auth';
import { requireAdmin } from '../../utils/guards';
import { getServerSupabaseAdminClient } from '../../utils/server-client';

export const deleteUserProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    requireAdmin(ctx);

    const { data: profile } = await ctx.supabase
      .from('profiles')
      .select('user_id')
      .eq('id', input.id)
      .single();

    if (!profile) {
      throw new Error('User not found');
    }

    await ctx.supabase.from('children').delete().eq('profile_id', input.id);
    await ctx.supabase.from('bookings').delete().eq('profile_id', input.id);
    await ctx.supabase.from('sessions').delete().eq('profile_id', input.id);

    const { error: profileError } = await ctx.supabase
      .from('profiles')
      .delete()
      .eq('id', input.id);

    if (profileError) {
      throw new Error(profileError.message || 'Failed to delete profile');
    }

    const adminClient = getServerSupabaseAdminClient();
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(profile.user_id);
    if (deleteAuthError) {
      throw new Error(deleteAuthError.message || 'Failed to delete auth user');
    }

    return { success: true };
  });
