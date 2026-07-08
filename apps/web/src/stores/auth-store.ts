import { create } from 'zustand';
import type { UserDto } from '@felix/shared';

interface AuthState {
  user: UserDto | null;
  accessToken: string | null;
  /** True until the initial silent refresh on app load has resolved. */
  isInitializing: boolean;
  setSession: (user: UserDto, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clearSession: () => void;
  finishInitializing: () => void;
}

/**
 * The access token lives only in memory (never localStorage) so it can't be
 * read by injected scripts; the refresh token is a separate httpOnly cookie
 * the browser attaches automatically, invisible to JS entirely.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isInitializing: true,
  setSession: (user, accessToken) => set({ user, accessToken }),
  setAccessToken: (accessToken) => set({ accessToken }),
  clearSession: () => set({ user: null, accessToken: null }),
  finishInitializing: () => set({ isInitializing: false }),
}));
