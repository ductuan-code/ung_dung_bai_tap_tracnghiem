import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken, removeToken } from '../services/apiClient';
import type { User } from '../types';

const USER_KEY = 'auth_user';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khôi phục session từ storage khi app khởi động
  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          getToken(),
          AsyncStorage.getItem(USER_KEY),
        ]);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser) as User);
        }
      } catch {
        // storage lỗi → coi như chưa đăng nhập
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (userData: User, authToken: string) => {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    setToken(authToken);
  }, []);

  const signOut = useCallback(async () => {
    await Promise.all([removeToken(), AsyncStorage.removeItem(USER_KEY)]);
    setUser(null);
    setToken(null);
  }, []);

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    signIn,
    signOut,
  };
}
