import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi, setAccessToken, BASE_URL, saveRefreshToken, clearRefreshToken, type UserDTO } from './api';

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
  // Retries up to 5 times to handle server cold start on free Render tier
  useEffect(() => {
    const tryRefresh = async (retries = 5, delay = 3000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const r = await authApi.refresh();
          setAccessToken(r.data.accessToken);
          saveRefreshToken(r.data.refreshToken);
          const me = await authApi.me();
          setState({ user: me.data.user, loading: false });
          return;
        } catch (err: unknown) {
          // 401 means no valid cookie — not logged in, stop retrying
          const status = (err as { response?: { status?: number } })?.response?.status;
          if (status === 401 || status === 403) {
            setState({ user: null, loading: false });
            return;
          }
          // Network error / server sleeping — retry
          if (i < retries - 1) await new Promise(res => setTimeout(res, delay));
        }
      }
      setState({ user: null, loading: false });
    };
    tryRefresh();
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
    saveRefreshToken(r.data.refreshToken);
    setTokenAndUser(r.data.accessToken, r.data.user);
  }, [setTokenAndUser]);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const r = await authApi.register(email, password, name);
    saveRefreshToken(r.data.refreshToken);
    setTokenAndUser(r.data.accessToken, r.data.user);
  }, [setTokenAndUser]);

  const loginWithGoogle = useCallback(() => {
    window.location.href = `${BASE_URL}/auth/google`;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => null);
    setAccessToken(null);
    clearRefreshToken();
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
