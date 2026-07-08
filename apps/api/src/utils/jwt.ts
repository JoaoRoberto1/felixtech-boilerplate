import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AccessTokenPayload {
  sub: string; // userId
}

export interface RefreshTokenPayload {
  sub: string; // userId
  jti: string; // RefreshToken row id, used to look up/revoke the stored hash
}

// env vars are validated at startup to match /^\d+[smhd]$/, but come through as
// a generic `string` — cast once here to satisfy jsonwebtoken's branded type.
const accessTokenTtl = env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'];
const refreshTokenTtl = env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'];

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: accessTokenTtl });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: refreshTokenTtl });
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}

/** Converts a "15m" / "7d" style duration string to a future Date. */
export function expiresInToDate(duration: string): Date {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) throw new Error(`Invalid duration format: ${duration}`);

  const value = Number(match[1]);
  const unit = match[2] as 's' | 'm' | 'h' | 'd';
  const unitMs: Record<'s' | 'm' | 'h' | 'd', number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };

  return new Date(Date.now() + value * unitMs[unit]);
}
