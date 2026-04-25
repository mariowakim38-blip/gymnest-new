import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_STORAGE_KEY = '@gymnest_users';

const defaultUsers: User[] = [
  {
    id: 'admin-001',
    name: 'Administrator',
    username: 'admin',
    email: 'admin@gymnest.com',
    password: 'admin',
    phoneNumber: '+96100000000',
    role: 'admin',
    children: [],
  }
];

export const [AdminProvider, useAdmin] = createContextHook(() => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAllUsers();
  }, []);

  const loadAllUsers = async () => {
    try {
      const stored = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        const users = JSON.parse(stored);
        console.log('Loaded users from storage:', users.length);
        setAllUsers(users);
      } else {
        console.log('No users in storage, using defaults');
        setAllUsers(defaultUsers);
        await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      setAllUsers(defaultUsers);
    } finally {
      setIsLoading(false);
    }
  };

  const getAllUsers = useCallback(() => {
    return allUsers;
  }, [allUsers]);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      const updated = allUsers.filter(u => u.id !== userId);
      setAllUsers(updated);
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
      console.log('User deleted:', userId);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete user:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Delete failed' };
    }
  }, [allUsers]);

  const updateUser = useCallback(async (userId: string, updates: Partial<User>) => {
    try {
      const updated = allUsers.map(u => 
        u.id === userId ? { ...u, ...updates } : u
      );
      setAllUsers(updated);
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
      console.log('User updated:', userId);
      return { success: true };
    } catch (error) {
      console.error('Failed to update user:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Update failed' };
    }
  }, [allUsers]);

  const addUserToList = useCallback(async (user: User) => {
    try {
      const exists = allUsers.find(u => u.id === user.id);
      if (!exists) {
        const updated = [...allUsers, user];
        setAllUsers(updated);
        await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
        console.log('User added to list:', user.id);
      }
      return { success: true };
    } catch (error) {
      console.error('Failed to add user:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Add failed' };
    }
  }, [allUsers]);

  const refreshUsers = useCallback(() => {
    loadAllUsers();
  }, []);

  return useMemo(() => ({
    allUsers,
    isLoading,
    getAllUsers,
    deleteUser,
    updateUser,
    addUserToList,
    refreshUsers,
  }), [allUsers, isLoading, getAllUsers, deleteUser, updateUser, addUserToList, refreshUsers]);
});
