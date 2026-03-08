import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi, setAccessToken, BASE_URL, type UserDTO } from './api';

interface AuthState {
  user: UserDTO | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  setTokenAndUser: (token: string, user: UserDTO) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  // Try to restore session on mount via refresh cookie
  useEffect(() => {
    authApi.refresh()
      .then(r => {
        setAccessToken(r.data.accessToken);
        return authApi.me();
      })
      .then(r => setState({ user: r.data.user, loading: false }))
      .catch(() => setState({ user: null, loading: false }));
  }, []);

  // Listen for forced logout (401 with no refresh)
  useEffect(() => {
    const handler = () => setState(s => ({ ...s, user: null }));
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const setTokenAndUser = useCallback((token: string, user: UserDTO) => {
    setAccessToken(token);
    setState({ user, loading: false });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const r = await authApi.login(email, password);
    setTokenAndUser(r.data.accessToken, r.data.user);
  }, [setTokenAndUser]);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const r = await authApi.register(email, password, name);
    setTokenAndUser(r.data.accessToken, r.data.user);
  }, [setTokenAndUser]);

  const loginWithGoogle = useCallback(() => {
    window.location.href = `${BASE_URL}/auth/google`;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => null);
    setAccessToken(null);
    setState({ user: null, loading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, loginWithGoogle, logout, setTokenAndUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
