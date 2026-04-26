const register = async (
  parentFullName: string,
  username: string,
  email: string,
  password: string,
  phoneNumber: string,
  childFullName: string,
  childAge: number,
  secondChildFullName?: string,
  secondChildAge?: number
) => {
  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    const userId = authData.user?.id;

    if (!userId) {
      return { success: false, error: 'User creation failed' };
    }

    // 2. Create profile (parent)
    const { error: profileError } = await supabase.from('profiles').insert({
      user_id: userId,
      name: parentFullName, // ✅ FULL NAME SAVED
      email,
      phone_number: phoneNumber,
      role: 'parent',
      username,
    });

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    // 3. Get profile id
    const { data: profileData, error: fetchProfileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (fetchProfileError || !profileData) {
      return { success: false, error: 'Failed to fetch profile' };
    }

    const profileId = profileData.id;

    // 4. Insert first child
    const { error: childError } = await supabase.from('children').insert({
      profile_id: profileId,
      name: childFullName, // ✅ FULL CHILD NAME
      age: childAge,
    });

    if (childError) {
      return { success: false, error: childError.message };
    }

    // 5. Insert second child (optional)
    if (secondChildFullName && secondChildAge) {
      const { error: secondChildError } = await supabase.from('children').insert({
        profile_id: profileId,
        name: secondChildFullName, // ✅ FULL CHILD NAME
        age: secondChildAge,
      });

      if (secondChildError) {
        return { success: false, error: secondChildError.message };
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Register error:', error);
    return { success: false, error: error.message };
  }
};
