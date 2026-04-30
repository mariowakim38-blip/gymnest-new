import { z } from 'zod';
import { publicProcedure, router } from './trpc';
import { supabaseAdmin } from '../supabaseAdmin'; // service role client

export const adminRouter = router({
  createUser: publicProcedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
        name: z.string(),
        username: z.string(),
        phone: z.string(),
        childName: z.string(),
        childAge: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      // 1. Create auth user
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
      });

      if (error) throw new Error(error.message);

      const userId = data.user.id;

      // 2. Create profile
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: userId,
          name: input.name,
          username: input.username,
          phone_number: input.phone,
          role: 'parent',
        })
        .select()
        .single();

      // 3. Create child
      await supabaseAdmin.from('children').insert({
        profile_id: profile.id,
        name: input.childName,
        age: input.childAge,
      });

      return { success: true };
    }),
});
