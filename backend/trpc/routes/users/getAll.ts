import { protectedProcedure } from '../../middleware/auth';
import { getServerSupabaseAdminClient } from '../../utils/server-client';
import { requireAdmin } from '../../utils/guards';
import { Database } from '../../../../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Child = Database['public']['Tables']['children']['Row'];

export const getAllUsersProcedure = protectedProcedure.query(async ({ ctx }) => {
  requireAdmin(ctx);

  const adminClient = getServerSupabaseAdminClient();
  const { data, error } = await adminClient.auth.admin.listUsers();

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  const users = await Promise.all(
    (data.users ?? []).map(async (authUser) => {
      const { data: profile } = await ctx.supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle();

      const typedProfile = profile as Profile | null;
      const { data: children } = await ctx.supabase
        .from('children')
        .select('*')
        .eq('profile_id', typedProfile?.id ?? '');

      const typedChildren = (children ?? []) as Child[];

      return {
        id: typedProfile?.id ?? authUser.id,
        name: typedProfile?.name ?? '',
        username: typedProfile?.username ?? '',
        email: authUser.email ?? '',
        phoneNumber: typedProfile?.phone_number ?? '',
        password: '',
        role: typedProfile?.role ?? 'parent',
        children: typedChildren.map((child) => ({
          id: child.id,
          name: child.name ?? '',
          age: child.age ?? 0,
        })),
      };
    })
  );

  return users;
});
