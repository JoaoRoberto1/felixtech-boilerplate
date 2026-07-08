import type { Request, Response } from 'express';
import type { AuthResponseDto } from '@felix/shared';
import * as authService from './auth.service.js';
import { toUserDto } from '../users/user.mappers.js';
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  REFRESH_TOKEN_COOKIE,
} from '../../utils/cookies.js';
import { AppError } from '../../utils/errors.js';
import type { RequestMeta } from './auth.service.js';

function getMeta(req: Request): RequestMeta {
  return { userAgent: req.headers['user-agent'], ip: req.ip };
}

function respondWithAuth(
  res: Response,
  status: number,
  user: Parameters<typeof toUserDto>[0],
  tokens: authService.IssuedTokens,
): void {
  setRefreshTokenCookie(res, tokens.refreshToken, tokens.refreshTokenExpiresAt);
  const body: AuthResponseDto = {
    user: toUserDto(user),
    tokens: {
      accessToken: tokens.accessToken,
      expiresAt: tokens.accessTokenExpiresAt.toISOString(),
    },
  };
  res.status(status).json(body);
}

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body;
  const { user, tokens } = await authService.register(name, email, password, getMeta(req));
  respondWithAuth(res, 201, user, tokens);
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  const { user, tokens } = await authService.login(email, password, getMeta(req));
  respondWithAuth(res, 200, user, tokens);
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
  if (!refreshToken) throw AppError.unauthorized('Missing refresh token');

  const { user, tokens } = await authService.refresh(refreshToken, getMeta(req));
  respondWithAuth(res, 200, user, tokens);
}

export async function logout(req: Request, res: Response): Promise<void> {
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
  await authService.logout(refreshToken);
  clearRefreshTokenCookie(res);
  res.status(204).send();
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  await authService.forgotPassword(req.body.email);
  res.status(204).send();
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  await authService.resetPassword(req.body.token, req.body.password);
  res.status(204).send();
}

export async function verifyEmail(req: Request, res: Response): Promise<void> {
  await authService.verifyEmail(req.body.token);
  res.status(204).send();
}
