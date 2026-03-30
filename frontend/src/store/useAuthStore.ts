import { create } from 'zustand';
import Cookies from 'js-cookie';

interface User {
  id: number;
  email: string;
  name: string;
  roles?: { id: number; name: string; permissions?: any[] }[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User, token: string) => void;
  logout: () => void;
}

const getUserFromCookie = () => {
  const userStr = Cookies.get('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

const getTokenFromCookie = () => {
  return Cookies.get('token') || null;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getUserFromCookie(),
  token: getTokenFromCookie(),
  isAuthenticated: !!getTokenFromCookie(),
  setUser: (user, token) => {
    Cookies.set('token', token, { expires: 1 });
    Cookies.set('user', JSON.stringify(user), { expires: 1 });
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    Cookies.remove('token');
    Cookies.remove('user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
