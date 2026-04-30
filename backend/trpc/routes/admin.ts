import { z } from 'zod';
import { protectedProcedure, router } from '../create-context';
import { supabaseAdmin } from '../../supabaseAdmin';

export const adminRouter = router({
  createParentAccount: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(1),
        username: z.string().min(1),
        phoneNumber: z.string().min(1),
        childName: z.string().min(1),
        childAge: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Admin access required');
      }

      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email: input.email.trim(),
          password: input.password,
          email_confirm: true,
        });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Failed to create auth user');

      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          name: input.name.trim(),
          username: input.username.trim(),
          phone_number: input.phoneNumber.startsWith('+961')
            ? input.phoneNumber
            : `+961${input.phoneNumber}`,
          role: 'parent',
        })
        .select()
        .single();

      if (profileError) throw new Error(profileError.message);

      const { error: childError } = await supabaseAdmin.from('children').insert({
        profile_id: profileData.id,
        name: input.childName.trim(),
        age: input.childAge,
      });

      if (childError) throw new Error(childError.message);

      return { success: true };
    }),
});
