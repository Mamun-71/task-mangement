'use client';
import { create } from 'zustand';
import Cookies from 'js-cookie';

interface UserRole {
  id: number;
  name: string;
  permissions?: { id: number; name: string }[];
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  roles?: UserRole[];
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  _hydrated: boolean;

  hydrate: () => void;
  setTokens: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const readUser = (): AuthUser | null => {
  try {
    const raw = Cookies.get('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ── Store ─────────────────────────────────────────────────────────────────────
// IMPORTANT: Initialize with empty/false values so SSR and first client render
// agree. `hydrate()` is called in HydrationProvider (client-only useEffect)
// and fills state from cookies. This eliminates the SSR/client mismatch that
// causes the "tree hydrated but attributes didn't match" React warning.
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  _hydrated: false,

  hydrate: () => {
    const user = readUser();
    const accessToken = Cookies.get('access_token') || null;
    set({ user, accessToken, isAuthenticated: !!accessToken, _hydrated: true });
  },

  setTokens: (user, accessToken, refreshToken) => {
    Cookies.set('access_token', accessToken, { expires: 1 / 96 }); // ~15 min
    Cookies.set('refresh_token', refreshToken, { expires: 7 });
    Cookies.set('user', JSON.stringify(user), { expires: 7 });
    set({ user, accessToken, isAuthenticated: true });
  },

  logout: () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    Cookies.remove('user');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  hasRole: (role) => get().user?.roles?.some((r) => r.name === role) ?? false,

  hasPermission: (permission) =>
    get().user?.roles?.some((r) =>
      r.permissions?.some((p) => p.name === permission),
    ) ?? false,
}));
