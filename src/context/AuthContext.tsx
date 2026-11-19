import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { AuthState } from '../types';

// ─── API Configuration ──────────────────────────────────────────────────────
const API_URL   = 'http://localhost:3001/api';
const TOKEN_KEY = 'zentro_auth_token';   // Only the JWT is stored — NOT password, NOT user data

interface AuthContextType extends AuthState {
  login:         (email: string, password: string)              => Promise<{ error?: string }>;
  signup:        (email: string, password: string, name: string) => Promise<{ error?: string }>;
  logout:        ()                                              => void;
  resetPassword: (email: string)                                => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Token helpers ──────────────────────────────────────────────────────────
function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
function saveToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else       localStorage.removeItem(TOKEN_KEY);
  } catch { /* ignore */ }
}

// ─── API helper ─────────────────────────────────────────────────────────────
async function apiPost(path: string, body: object, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, {
    method:  'POST',
    headers,
    body:    JSON.stringify(body),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

async function apiGet(path: string, token: string) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

// ─── Provider ───────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user:            null,
    isAuthenticated: false,
    isLoading:       true,   // loading while we verify the saved token
  });

  // ── On mount: verify any saved JWT ────────────────────────────────────────
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    apiGet('/auth/me', token)
      .then(({ ok, data }) => {
        if (ok && data.user) {
          setAuthState({ user: data.user, isAuthenticated: true, isLoading: false });
        } else {
          saveToken(null);
          setAuthState({ user: null, isAuthenticated: false, isLoading: false });
        }
      })
      .catch(() => {
        // Backend might be offline — clear token and go to login
        saveToken(null);
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      });
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const { ok, data } = await apiPost('/auth/login', { email, password });
      if (!ok) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { error: data.error || 'Login failed. Please try again.' };
      }
      saveToken(data.token);
      setAuthState({ user: data.user, isAuthenticated: true, isLoading: false });
      return {};
    } catch {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { error: 'Cannot connect to server. Make sure the backend is running.' };
    }
  }, []);

  // ── Signup ─────────────────────────────────────────────────────────────────
  const signup = useCallback(async (email: string, password: string, name: string): Promise<{ error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const { ok, data } = await apiPost('/auth/register', { name, email, password });
      setAuthState(prev => ({ ...prev, isLoading: false }));
      if (!ok) {
        return { error: data.error || 'Registration failed. Please try again.' };
      }
      return {};
    } catch {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { error: 'Cannot connect to server. Make sure the backend is running.' };
    }
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    const token = getToken();
    if (token) {
      // Fire-and-forget logout notification to backend
      apiPost('/auth/logout', {}, token).catch(() => {});
    }
    saveToken(null);
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  // ── Reset Password ─────────────────────────────────────────────────────────
  const resetPassword = useCallback(async (email: string): Promise<{ error?: string }> => {
    try {
      const { ok, data } = await apiPost('/auth/forgot-password', { email });
      if (!ok) return { error: data.error };
      return {};
    } catch {
      return { error: 'Cannot connect to server. Please try again.' };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, signup, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
