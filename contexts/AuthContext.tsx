import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: 'parent' | 'coach' | 'admin';
  children?: {
    id: string;
    name: string;
    age: number;
  }[];
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Loading profile for user ID:', userId);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Profile error:', profileError);
        try {
          const serialized = JSON.stringify(profileError, Object.getOwnPropertyNames(profileError));
          console.error('Profile error details:', serialized);
        } catch (e) {
          console.error('Profile error stringify failed:', e instanceof Error ? e.message : String(e));
        }
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (!profileData) {
        console.log('No profile found for user ID:', userId);
        console.log('This user exists in Auth but has no profile in the profiles table.');
        console.log('Please create a profile for this user in Supabase or register through the app.');
        setUser(null);
        setIsLoading(false);
        return;
      }

      console.log('Profile loaded:', { id: profileData.id, name: profileData.name, role: profileData.role });
      const { data: childrenData } = await supabase
        .from('children')
        .select('*')
        .eq('profile_id', profileData.id);

      const { data: { user: authUser } } = await supabase.auth.getUser();

      const userData = {
        id: profileData.id,
        name: profileData.name,
        username: profileData.username,
        email: authUser?.email || '',
        phoneNumber: profileData.phone_number,
        password: '',
        role: profileData.role,
        children: childrenData || [],
      };
      console.log('Setting user with role:', userData.role);
      setUser(userData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to load user profile:', errorMessage);
      console.error('Full error object:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeAdminAccount = useCallback(async () => {
    console.log('Admin account should be created in Supabase dashboard');
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log('Login - Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log('Login error:', error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        await loadUserProfile(data.user.id);
        console.log('Login successful for:', email);
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }, []);

 const logout = async () => {
  try {
    await supabase.auth.signOut();

    setUser(null);
    setIsAuthenticated(false);

    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }

    router.replace('/auth/login');
  } catch (error) {
    console.log('Logout error:', error);
  }
};

  const register = useCallback(async (
    name: string,
    username: string,
    email: string,
    password: string,
    phoneNumber: string,
    childName: string,
    childAge: number,
    secondChildName?: string,
    secondChildAge?: number,
    isAdmin?: boolean
  ) => {
    setIsLoading(true);
    try {
      console.log('Registration - Attempting registration for:', username);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Registration failed' };
      }

      const children = [];
      if (childName && childAge) {
        children.push({ id: `child-${Date.now()}`, name: childName, age: childAge });
      }
      if (secondChildName && secondChildAge) {
        children.push({ id: `child-${Date.now()}-2`, name: secondChildName, age: secondChildAge });
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          name,
          username,
          phone_number: phoneNumber.startsWith('+961') ? phoneNumber : `+961${phoneNumber}`,
          role: isAdmin ? 'admin' : 'parent',
        })
        .select();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        console.error('Profile error details:', JSON.stringify(profileError, null, 2));
        await supabase.auth.signOut();
        return { success: false, error: profileError.message || 'Failed to create profile' };
      }

      if (!profileData || profileData.length === 0) {
        console.error('No profile data returned from insert');
        await supabase.auth.signOut();
        return { success: false, error: 'Failed to create profile - no data returned' };
      }

      const profile = profileData[0];

      if (children.length > 0) {
        const childrenInserts = children.map(child => ({
          profile_id: profile.id,
          name: child.name,
          age: child.age,
        }));

        const { error: childrenError } = await supabase
          .from('children')
          .insert(childrenInserts);

        if (childrenError) {
          console.error('Failed to add children:', childrenError);
        }
      }

      await loadUserProfile(authData.user.id);
      console.log('Registration successful for:', username);
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed. Please try again.'
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (
    name: string,
    email: string,
    phoneNumber: string,
    children: { id: string; name: string; age: number }[]
  ) => {
    try {
      if (!user) return { success: false, error: 'No user logged in' };
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          phone_number: phoneNumber.startsWith('+961') ? phoneNumber : `+961${phoneNumber}`,
        })
        .eq('id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      const { data: existingChildren } = await supabase
        .from('children')
        .select('*')
        .eq('profile_id', user.id);

      const existingIds = (existingChildren || []).map(c => c.id);
      const newIds = children.map(c => c.id);

      const toDelete = existingIds.filter(id => !newIds.includes(id));
      const toUpdate = children.filter(c => existingIds.includes(c.id));
      const toInsert = children.filter(c => !existingIds.includes(c.id));

      if (toDelete.length > 0) {
        await supabase.from('children').delete().in('id', toDelete);
      }

      if (toUpdate.length > 0) {
        for (const child of toUpdate) {
          await supabase
            .from('children')
            .update({ name: child.name, age: child.age })
            .eq('id', child.id);
        }
      }

      if (toInsert.length > 0) {
        const childrenInserts = toInsert.map(child => ({
          profile_id: user.id,
          name: child.name,
          age: child.age,
        }));
        await supabase.from('children').insert(childrenInserts);
      }

      setUser({
        ...user,
        name,
        email,
        phoneNumber: phoneNumber.startsWith('+961') ? phoneNumber : `+961${phoneNumber}`,
        children,
      });
      console.log('Profile updated for:', user.username);
      return { success: true };
    } catch (error) {
      console.error('Update profile failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Update failed' };
    }
  }, [user]);

  return useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user && !!session,
    session,
    login,
    logout,
    register,
    updateProfile,
    initializeAdminAccount,
  }), [user, isLoading, session, login, logout, register, updateProfile, initializeAdminAccount]);
});
