import { create } from 'zustand';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';
import type { User, AuthTokens } from '@/types';

interface AuthStore {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, string>) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: FormData | Record<string, unknown>) => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.login(email, password);
      Cookies.set('access_token', data.access, { expires: 1 });
      Cookies.set('refresh_token', data.refresh, { expires: 7 });
      set({
        user: data.user,
        tokens: { access: data.access, refresh: data.refresh },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const { data: res } = await authApi.register(data);
      Cookies.set('access_token', res.tokens.access, { expires: 1 });
      Cookies.set('refresh_token', res.tokens.refresh, { expires: 7 });
      set({
        user: res.user,
        tokens: res.tokens,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    const tokens = get().tokens;
    try {
      if (tokens?.refresh) await authApi.logout(tokens.refresh);
    } catch {}
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    set({ user: null, tokens: null, isAuthenticated: false });
  },

  fetchProfile: async () => {
    try {
      const { data } = await authApi.getProfile();
      set({ user: data, isAuthenticated: true });
    } catch {
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      set({ user: null, isAuthenticated: false });
    }
  },

  updateProfile: async (data) => {
    const { data: updated } = await authApi.updateProfile(data);
    set({ user: updated });
  },

  setUser: (user) => set({ user }),
}));
