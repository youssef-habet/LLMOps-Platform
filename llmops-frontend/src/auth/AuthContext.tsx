import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi, type AuthUser } from '../api/authApi';
import { AuthContext } from './authContextValue';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('llmops_token');
      const cachedUser = localStorage.getItem('llmops_user');

      if (!token || !cachedUser) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await authApi.me();
        localStorage.setItem('llmops_user', JSON.stringify(currentUser));
        setUser(currentUser);
      } catch {
        localStorage.removeItem('llmops_token');
        localStorage.removeItem('llmops_user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const persistSession = useCallback((token: string, nextUser: AuthUser) => {
    localStorage.setItem('llmops_token', token);
    localStorage.setItem('llmops_user', JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    persistSession(response.access_token, response.user);
  }, [persistSession]);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    const response = await authApi.register(email, password, fullName);
    persistSession(response.access_token, response.user);
  }, [persistSession]);

  const loginWithGoogle = useCallback((next = '/models') => {
    window.location.href = authApi.getGoogleLoginUrl(next);
  }, []);

  const updateProfile = useCallback(async (fullName: string) => {
    const updatedUser = await authApi.updateProfile(fullName);
    localStorage.setItem('llmops_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('llmops_token');
    localStorage.removeItem('llmops_user');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      loginWithGoogle,
      updateProfile,
      logout,
    }),
    [user, isLoading, login, register, loginWithGoogle, updateProfile, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
