import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import type { AuthResponseDto } from '@felix/shared';
import { useAuthStore } from '../stores/auth-store';
import * as authApi from '../api/auth';

/** Attempts a silent refresh on first load so a page reload doesn't force a re-login. */
export function useAuthBootstrap(): void {
  const setSession = useAuthStore((s) => s.setSession);
  const finishInitializing = useAuthStore((s) => s.finishInitializing);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const { data } = await axios.post<AuthResponseDto>(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        if (!cancelled) setSession(data.user, data.tokens.accessToken);
      } catch {
        // No valid session cookie; user needs to log in.
      } finally {
        if (!cancelled) finishInitializing();
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => setSession(data.user, data.tokens.accessToken),
  });
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => setSession(data.user, data.tokens.accessToken),
  });
}

export function useLogout() {
  const clearSession = useAuthStore((s) => s.clearSession);
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => clearSession(),
  });
}
