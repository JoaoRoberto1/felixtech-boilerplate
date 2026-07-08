import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../utils/errors.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  expiresInToDate,
} from '../../utils/jwt.js';
import { generateOpaqueToken, hashToken } from '../../utils/tokens.js';
import { sendEmail, passwordResetEmail, verifyEmailEmail } from '../../lib/mailer.js';
import { env } from '../../config/env.js';
import { createTeamWithOwner } from '../teams/team.service.js';

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface RequestMeta {
  userAgent?: string;
  ip?: string;
}

export interface IssuedTokens {
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

async function issueTokens(userId: string, meta: RequestMeta): Promise<IssuedTokens> {
  const refreshTokenExpiresAt = expiresInToDate(env.JWT_REFRESH_EXPIRES_IN);

  // Create the row first so we have an id to embed as the JWT's `jti`.
  const row = await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: 'pending',
      expiresAt: refreshTokenExpiresAt,
      userAgent: meta.userAgent,
      ip: meta.ip,
    },
  });

  const refreshToken = signRefreshToken({ sub: userId, jti: row.id });
  await prisma.refreshToken.update({
    where: { id: row.id },
    data: { tokenHash: hashToken(refreshToken) },
  });

  const accessToken = signAccessToken({ sub: userId });
  const accessTokenExpiresAt = expiresInToDate(env.JWT_ACCESS_EXPIRES_IN);

  return { accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt };
}

export async function register(name: string, email: string, password: string, meta: RequestMeta) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw AppError.conflict('An account with this email already exists');

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });

  await createTeamWithOwner(user.id, `${name}'s Team`);

  const { token, tokenHash } = generateOpaqueToken();
  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
    },
  });
  const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify your email',
    html: verifyEmailEmail(verifyUrl),
  });

  const tokens = await issueTokens(user.id, meta);
  return { user, tokens };
}

export async function login(email: string, password: string, meta: RequestMeta) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw AppError.unauthorized('Invalid email or password');

  const isValid = await verifyPassword(user.passwordHash, password);
  if (!isValid) throw AppError.unauthorized('Invalid email or password');

  const tokens = await issueTokens(user.id, meta);
  return { user, tokens };
}

export async function refresh(oldRefreshToken: string, meta: RequestMeta) {
  let payload;
  try {
    payload = verifyRefreshToken(oldRefreshToken);
  } catch {
    throw AppError.unauthorized('Invalid or expired refresh token');
  }

  const row = await prisma.refreshToken.findUnique({ where: { id: payload.jti } });
  if (!row || row.userId !== payload.sub) {
    throw AppError.unauthorized('Invalid refresh token');
  }

  if (row.revokedAt || row.expiresAt < new Date() || row.tokenHash !== hashToken(oldRefreshToken)) {
    // Reused/stolen refresh token: revoke every active session for this user as a precaution.
    await prisma.refreshToken.updateMany({
      where: { userId: row.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw AppError.unauthorized('Refresh token is no longer valid, please log in again');
  }

  const tokens = await issueTokens(row.userId, meta);

  await prisma.refreshToken.update({
    where: { id: row.id },
    data: { revokedAt: new Date() },
  });

  const user = await prisma.user.findUniqueOrThrow({ where: { id: row.userId } });
  return { user, tokens };
}

export async function logout(refreshTokenValue: string | undefined): Promise<void> {
  if (!refreshTokenValue) return;

  try {
    const payload = verifyRefreshToken(refreshTokenValue);
    await prisma.refreshToken.updateMany({
      where: { id: payload.jti, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  } catch {
    // Token already invalid/expired: nothing to revoke.
  }
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return; // Do not reveal whether the email exists.

  const { token, tokenHash } = generateOpaqueToken();
  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS) },
  });

  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Reset your password',
    html: passwordResetEmail(resetUrl),
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const tokenHash = hashToken(token);
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    throw AppError.badRequest('This password reset link is invalid or has expired');
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: resetToken.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}

export async function verifyEmail(token: string): Promise<void> {
  const tokenHash = hashToken(token);
  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
  });

  if (!verificationToken || verificationToken.usedAt || verificationToken.expiresAt < new Date()) {
    throw AppError.badRequest('This verification link is invalid or has expired');
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: verificationToken.userId }, data: { emailVerified: true } }),
    prisma.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: { usedAt: new Date() },
    }),
  ]);
}
