import type { Response } from 'express';
import { env, isProduction } from '../config/env.js';

export const REFRESH_TOKEN_COOKIE = 'felix_rt';

export function setRefreshTokenCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    domain: env.COOKIE_DOMAIN,
    path: '/api/auth',
    expires: expiresAt,
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    domain: env.COOKIE_DOMAIN,
    path: '/api/auth',
  });
}
