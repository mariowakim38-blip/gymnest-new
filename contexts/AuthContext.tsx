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

type AuthResult = {
  success: boolean;
  error?: string;
  user?: User | null;
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);

  const clearSupabaseStorage = useCallback(() => {
    if (typeof window === 'undefined') return;

    Object.keys(window.localStorage).forEach((key) => {
      if (
        key.includes('supabase') ||
        key.includes('sb-') ||
        key.includes('auth-token')
      ) {
        window.localStorage.removeItem(key);
      }
    });

    window.localStorage.removeItem('users');
    window.localStorage.removeItem('currentUser');
    window.sessionStorage.clear();
  }, []);

  const loadUserProfile = useCallback(async (userId: string): Promise<User | null> => {
    try {
      console.log('Loading profile for user ID:', userId);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Profile error:', profileError);
        setUser(null);
        return null;
      }

      if (!profileData) {
        console.log('No profile found for user ID:', userId);
        setUser(null);
        return null;
      }

      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .eq('profile_id', profileData.id);

      if (childrenError) {
        console.error('Children load error:', childrenError);
      }

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      const role: User['role'] =
        profileData.role === 'admin' || profileData.role === 'coach'
          ? profileData.role
          : 'parent';

      const userData: User = {
        id: profileData.id,
        name: profileData.name || '',
        username: profileData.username || '',
        email: authUser?.email || '',
        phoneNumber: profileData.phone_number || '',
        password: '',
        role,
        children: childrenData || [],
      };

      console.log('Setting user with role:', userData.role);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        setIsLoading(true);

        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        setSession(currentSession);

        if (currentSession?.user) {
          await loadUserProfile(currentSession.user.id);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth init error:', error);
        setUser(null);
        setSession(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('AUTH EVENT:', event);

      if (!isMounted) return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        clearSupabaseStorage();
        setIsLoading(false);
        return;
      }

      setSession(newSession);

      if (newSession?.user) {
        setIsLoading(true);
        await loadUserProfile(newSession.user.id);
        if (isMounted) setIsLoading(false);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [clearSupabaseStorage, loadUserProfile]);

  const initializeAdminAccount = useCallback(async () => {
    console.log('Admin account must be created in Supabase dashboard.');
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      setIsLoading(true);
      console.log('Login - Attempting login for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.log('Login error:', error.message);
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Login failed' };
      }

      setSession(data.session);

      const loadedUser = await loadUserProfile(data.user.id);

      if (!loadedUser) {
        await supabase.auth.signOut({ scope: 'global' });
        clearSupabaseStorage();
        return {
          success: false,
          error: 'No profile found for this account. Create a row in the profiles table.',
        };
      }

      console.log('Login successful for:', email, 'role:', loadedUser.role);
      return { success: true, user: loadedUser };
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed. Please try again.',
      };
    } finally {
      setIsLoading(false);
    }
  }, [clearSupabaseStorage, loadUserProfile]);

  const logout = useCallback(async (): Promise<{ success: boolean }> => {
    try {
      console.log('FORCE LOGOUT START');
      setIsLoading(true);

      await supabase.auth.signOut({ scope: 'global' });

      setUser(null);
      setSession(null);
      clearSupabaseStorage();

      if (typeof window !== 'undefined') {
        window.location.replace('/auth/login');
      }

      console.log('FORCE LOGOUT SUCCESS');
      return { success: true };
    } catch (error) {
      console.log('FORCE LOGOUT ERROR:', error);

      setUser(null);
      setSession(null);
      clearSupabaseStorage();

      if (typeof window !== 'undefined') {
        window.location.replace('/auth/login');
      }

      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [clearSupabaseStorage]);

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
  ): Promise<AuthResult> => {
    setIsLoading(true);

    try {
      console.log('Registration - Attempting registration for:', username);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Registration failed' };
      }

      const children: { name: string; age: number }[] = [];

      if (childName && childAge) {
        children.push({ name: childName, age: childAge });
      }

      if (secondChildName && secondChildAge) {
        children.push({ name: secondChildName, age: secondChildAge });
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
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        await supabase.auth.signOut({ scope: 'global' });
        clearSupabaseStorage();
        return { success: false, error: profileError.message || 'Failed to create profile' };
      }

      if (children.length > 0) {
        const childrenInserts = children.map((child) => ({
          profile_id: profileData.id,
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

      const loadedUser = await loadUserProfile(authData.user.id);
      console.log('Registration successful for:', username);
      return { success: true, user: loadedUser };
    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed. Please try again.',
      };
    } finally {
      setIsLoading(false);
    }
  }, [clearSupabaseStorage, loadUserProfile]);

  const updateProfile = useCallback(async (
    name: string,
    email: string,
    phoneNumber: string,
    children: { id: string; name: string; age: number }[]
  ) => {
    try {
      if (!user) return { success: false, error: 'No user logged in' };

      const cleanPhoneNumber = phoneNumber.startsWith('+961') ? phoneNumber : `+961${phoneNumber}`;

      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          phone_number: cleanPhoneNumber,
        })
        .eq('id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      const { data: existingChildren } = await supabase
        .from('children')
        .select('*')
        .eq('profile_id', user.id);

      const existingIds = (existingChildren || []).map((c) => c.id);
      const newIds = children.map((c) => c.id);

      const toDelete = existingIds.filter((id) => !newIds.includes(id));
      const toUpdate = children.filter((c) => existingIds.includes(c.id));
      const toInsert = children.filter((c) => !existingIds.includes(c.id));

      if (toDelete.length > 0) {
        await supabase.from('children').delete().in('id', toDelete);
      }

      for (const child of toUpdate) {
        await supabase
          .from('children')
          .update({ name: child.name, age: child.age })
          .eq('id', child.id);
      }

      if (toInsert.length > 0) {
        const childrenInserts = toInsert.map((child) => ({
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
        phoneNumber: cleanPhoneNumber,
        children,
      });

      return { success: true };
    } catch (error) {
      console.error('Update profile failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Update failed',
      };
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
  }), [
    user,
    isLoading,
    session,
    login,
    logout,
    register,
    updateProfile,
    initializeAdminAccount,
  ]);
});
