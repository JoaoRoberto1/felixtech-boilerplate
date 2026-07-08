import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../utils/errors.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';

export async function getUserOrThrow(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound('User not found');
  return user;
}

export async function updateProfile(
  userId: string,
  data: { name?: string; avatarUrl?: string | null },
) {
  return prisma.user.update({ where: { id: userId }, data });
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await getUserOrThrow(userId);

  const isValid = await verifyPassword(user.passwordHash, currentPassword);
  if (!isValid) throw AppError.badRequest('Current password is incorrect');

  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}
