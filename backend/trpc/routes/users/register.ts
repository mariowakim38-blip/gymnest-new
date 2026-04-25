import { publicProcedure } from "../../create-context";
import { z } from "zod";
import { Database } from "../../../../lib/database.types";

type Profile = Database['public']['Tables']['profiles']['Row'];
type Child = Database['public']['Tables']['children']['Row'];

export const registerProcedure = publicProcedure
  .input(z.object({
    name: z.string(),
    username: z.string(),
    email: z.string().email(),
    password: z.string(),
    phoneNumber: z.string(),
    childName: z.string(),
    childAge: z.number(),
    secondChildName: z.string().optional(),
    secondChildAge: z.number().optional(),
    isAdmin: z.boolean().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    console.log('Register procedure called with:', {
      username: input.username,
      email: input.email,
      name: input.name,
    });

    const { data: existingProfile } = await ctx.supabase
      .from('profiles')
      .select('username')
      .eq('username', input.username)
      .maybeSingle();

    if (existingProfile) {
      console.log('Username already exists:', input.username);
      throw new Error('Username already exists');
    }

    const { data: authData, error: authError } = await ctx.supabase.auth.signUp({
      email: input.email,
      password: input.password,
    });

    if (authError || !authData.user) {
      console.error('Auth signup error:', authError);
      throw new Error(authError?.message || 'Failed to create account');
    }

    const profileData: Database['public']['Tables']['profiles']['Insert'] = {
      user_id: authData.user.id,
      name: input.name,
      username: input.username,
      phone_number: input.phoneNumber,
      role: (input.isAdmin ? 'admin' : 'parent') as 'parent' | 'coach' | 'admin',
    };

    const { data: profile, error: profileError } = await ctx.supabase
      .from('profiles')
      .insert(profileData as any)
      .select();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      console.error('Profile error details:', JSON.stringify(profileError, null, 2));
      await ctx.supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error('Failed to create profile');
    }

    if (!profile || profile.length === 0) {
      console.error('No profile data returned after insert');
      await ctx.supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error('Failed to create profile - no data returned');
    }

    const typedProfile = profile[0] as Profile;

    const childrenToInsert = [
      {
        profile_id: typedProfile.id,
        name: input.childName,
        age: input.childAge,
      },
    ];

    if (input.secondChildName && input.secondChildAge) {
      childrenToInsert.push({
        profile_id: typedProfile.id,
        name: input.secondChildName,
        age: input.secondChildAge,
      });
    }

    const { data: children, error: childrenError } = await ctx.supabase
      .from('children')
      .insert(childrenToInsert as any)
      .select();

    if (childrenError) {
      console.error('Children creation error:', childrenError);
    }

    const typedChildren = (children || []) as Child[];

    const user = {
      id: typedProfile.id,
      name: typedProfile.name,
      username: typedProfile.username,
      email: input.email,
      phoneNumber: typedProfile.phone_number,
      password: '',
      role: typedProfile.role,
      children: typedChildren.map(c => ({
        id: c.id,
        name: c.name,
        age: c.age,
      })),
    };

    console.log('User registered successfully:', user.username);
    
    return { 
      success: true, 
      user,
      session: authData.session,
    };
  });
