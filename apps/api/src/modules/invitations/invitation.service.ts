import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../utils/errors.js';
import { generateOpaqueToken, hashToken } from '../../utils/tokens.js';
import { sendEmail, teamInvitationEmail } from '../../lib/mailer.js';
import { env } from '../../config/env.js';

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function createInvitation(
  teamId: string,
  invitedById: string,
  email: string,
  roleId: string,
) {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role || role.teamId !== teamId) {
    throw AppError.badRequest('Role does not belong to this team');
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existingMember = await prisma.teamMember.findFirst({
    where: { teamId, user: { email: normalizedEmail } },
  });
  if (existingMember) throw AppError.conflict('This person is already a member of the team');

  const existingPending = await prisma.invitation.findUnique({
    where: { teamId_email_status: { teamId, email: normalizedEmail, status: 'PENDING' } },
  });
  if (existingPending) throw AppError.conflict('An invitation is already pending for this email');

  const { token, tokenHash } = generateOpaqueToken();
  const team = await prisma.team.findUniqueOrThrow({ where: { id: teamId } });

  const invitation = await prisma.invitation.create({
    data: {
      teamId,
      email: normalizedEmail,
      roleId,
      invitedById,
      tokenHash,
      expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
    },
    include: { role: true },
  });

  const acceptUrl = `${env.CLIENT_URL}/invitations/accept?token=${token}`;
  await sendEmail({
    to: normalizedEmail,
    subject: `You've been invited to join ${team.name} on Felix`,
    html: teamInvitationEmail(team.name, acceptUrl),
  });

  return invitation;
}

export async function listInvitations(teamId: string) {
  return prisma.invitation.findMany({
    where: { teamId },
    include: { role: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function revokeInvitation(teamId: string, invitationId: string) {
  const invitation = await prisma.invitation.findUnique({ where: { id: invitationId } });
  if (!invitation || invitation.teamId !== teamId) throw AppError.notFound('Invitation not found');
  if (invitation.status !== 'PENDING')
    throw AppError.badRequest('Only pending invitations can be revoked');

  await prisma.invitation.update({ where: { id: invitationId }, data: { status: 'REVOKED' } });
}

export async function acceptInvitation(token: string, userId: string) {
  const tokenHash = hashToken(token);
  const invitation = await prisma.invitation.findUnique({
    where: { tokenHash },
    include: { team: true },
  });

  if (!invitation || invitation.status !== 'PENDING') {
    throw AppError.badRequest('This invitation is invalid or has already been used');
  }
  if (invitation.expiresAt < new Date()) {
    await prisma.invitation.update({ where: { id: invitation.id }, data: { status: 'EXPIRED' } });
    throw AppError.badRequest('This invitation has expired');
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.email !== invitation.email) {
    throw AppError.forbidden('This invitation was sent to a different email address');
  }

  return prisma.$transaction(async (tx) => {
    await tx.teamMember.upsert({
      where: { teamId_userId: { teamId: invitation.teamId, userId } },
      update: {},
      create: { teamId: invitation.teamId, userId, roleId: invitation.roleId },
    });
    await tx.invitation.update({ where: { id: invitation.id }, data: { status: 'ACCEPTED' } });
    return invitation.team;
  });
}
