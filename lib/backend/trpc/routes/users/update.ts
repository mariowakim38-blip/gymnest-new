import { z } from 'zod';
import { protectedProcedure } from '../../middleware/auth';
import { requireAdmin } from '../../utils/guards';
import { Database } from '../../../../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Child = Database['public']['Tables']['children']['Row'];

export const updateUserProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
    name: z.string().optional(),
    email: z.string().email().optional(),
    phoneNumber: z.string().optional(),
    children: z.array(z.object({
      id: z.string(),
      name: z.string(),
      age: z.number(),
    })).optional(),
    role: z.enum(['parent', 'coach', 'admin']).optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    requireAdmin(ctx);

    const updateData: Database['public']['Tables']['profiles']['Update'] = {};
    if (input.name) updateData.name = input.name;
    if (input.phoneNumber) updateData.phone_number = input.phoneNumber;
    if (input.role) updateData.role = input.role;

    const { data: profile, error: profileError } = await ctx.supabase
      .from('profiles')
      .update(updateData)
      .eq('id', input.id)
      .select()
      .single();

    if (profileError || !profile) {
      throw new Error(profileError?.message || 'Failed to update profile');
    }

    const typedProfile = profile as Profile;

    if (input.children) {
      await ctx.supabase.from('children').delete().eq('profile_id', input.id);
      if (input.children.length > 0) {
        await ctx.supabase.from('children').insert(
          input.children.map((child) => ({
            profile_id: input.id,
            name: child.name,
            age: child.age,
          }))
        );
      }
    }

    const { data: children } = await ctx.supabase
      .from('children')
      .select('*')
      .eq('profile_id', input.id);

    const typedChildren = (children ?? []) as Child[];

    return {
      success: true,
      user: {
        id: typedProfile.id,
        name: typedProfile.name,
        username: typedProfile.username,
        email: input.email || '',
        phoneNumber: typedProfile.phone_number,
        password: '',
        role: typedProfile.role,
        children: typedChildren.map((c) => ({ id: c.id, name: c.name, age: c.age })),
      },
    };
  });
