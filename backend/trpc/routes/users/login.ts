import { publicProcedure } from "../../create-context";
import { z } from "zod";
import { Database } from "../../../../lib/database.types";

type Profile = Database['public']['Tables']['profiles']['Row'];
type Child = Database['public']['Tables']['children']['Row'];

export const loginProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    console.log('Login attempt for:', input.email);
    
    const { data, error } = await ctx.supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error || !data.user) {
      console.error('Login error:', error);
      throw new Error('Invalid email or password');
    }

    const { data: profile, error: profileError } = await ctx.supabase
      .from('profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      console.error('Profile error details:', JSON.stringify(profileError, null, 2));
      throw new Error('Profile lookup failed');
    }

    if (!profile) {
      console.error('No profile found for user:', data.user.id);
      throw new Error('Profile not found');
    }

    const typedProfile = profile as Profile;
    
    const { data: children } = await ctx.supabase
      .from('children')
      .select('*')
      .eq('profile_id', typedProfile.id);

    const typedChildren = (children || []) as Child[];

    const user = {
      id: typedProfile.id,
      name: typedProfile.name,
      username: typedProfile.username,
      email: data.user.email || '',
      phoneNumber: typedProfile.phone_number,
      password: '',
      role: typedProfile.role,
      children: typedChildren.map(c => ({
        id: c.id,
        name: c.name,
        age: c.age,
      })),
    };

    console.log('Login successful for:', input.email);
    return { 
      success: true, 
      user,
      session: data.session,
    };
  });
