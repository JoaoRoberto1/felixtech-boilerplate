import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../utils/errors.js';
import { DEFAULT_ROLE_PERMISSIONS, SYSTEM_ROLES, type SystemRoleName } from '@felix/shared';
import type { Prisma } from '@prisma/client';

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'team'
  );
}

async function generateUniqueSlug(baseName: string): Promise<string> {
  const base = slugify(baseName);
  let slug = base;
  let suffix = 1;

  while (true) {
    const existing = await prisma.team.findUnique({ where: { slug } });
    if (!existing) return slug;
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
}

/** Seeds Owner/Admin/Member system roles (with their default permissions) for a team. */
async function seedSystemRoles(
  tx: Prisma.TransactionClient,
  teamId: string,
): Promise<Record<SystemRoleName, string>> {
  const roleIds = {} as Record<SystemRoleName, string>;

  for (const roleName of Object.values(SYSTEM_ROLES)) {
    const permissionKeys = DEFAULT_ROLE_PERMISSIONS[roleName];
    const permissions = await tx.permission.findMany({ where: { key: { in: permissionKeys } } });

    const role = await tx.role.create({
      data: {
        teamId,
        name: roleName,
        isSystem: true,
        permissions: {
          create: permissions.map((permission) => ({ permissionId: permission.id })),
        },
      },
    });

    roleIds[roleName] = role.id;
  }

  return roleIds;
}

export async function createTeamWithOwner(userId: string, name: string) {
  const slug = await generateUniqueSlug(name);

  return prisma.$transaction(async (tx) => {
    const team = await tx.team.create({ data: { name, slug, ownerId: userId } });
    const roleIds = await seedSystemRoles(tx, team.id);

    await tx.teamMember.create({
      data: { teamId: team.id, userId, roleId: roleIds[SYSTEM_ROLES.OWNER] },
    });

    return team;
  });
}

export async function listTeamsForUser(userId: string) {
  const memberships = await prisma.teamMember.findMany({
    where: { userId },
    include: {
      team: true,
      role: { include: { permissions: { include: { permission: true } } } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return memberships.map((m) => ({ team: m.team, role: m.role }));
}

export async function getTeamOrThrow(teamId: string) {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) throw AppError.notFound('Team not found');
  return team;
}

export async function updateTeam(teamId: string, data: { name?: string; slug?: string }) {
  if (data.slug) {
    const existing = await prisma.team.findUnique({ where: { slug: data.slug } });
    if (existing && existing.id !== teamId) {
      throw AppError.conflict('This slug is already in use');
    }
  }
  return prisma.team.update({ where: { id: teamId }, data });
}

export async function deleteTeam(teamId: string) {
  await prisma.team.delete({ where: { id: teamId } });
}

export async function listMembers(teamId: string) {
  return prisma.teamMember.findMany({
    where: { teamId },
    include: { user: true, role: true },
    orderBy: { createdAt: 'asc' },
  });
}

export async function countMembers(teamId: string): Promise<number> {
  return prisma.teamMember.count({ where: { teamId } });
}

export async function removeMember(teamId: string, targetUserId: string) {
  const team = await getTeamOrThrow(teamId);
  if (team.ownerId === targetUserId) {
    throw AppError.badRequest('The team owner cannot be removed');
  }
  await prisma.teamMember.delete({ where: { teamId_userId: { teamId, userId: targetUserId } } });
}

export async function updateMemberRole(teamId: string, targetUserId: string, roleId: string) {
  const team = await getTeamOrThrow(teamId);
  if (team.ownerId === targetUserId) {
    throw AppError.badRequest("The team owner's role cannot be changed");
  }

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role || role.teamId !== teamId) {
    throw AppError.badRequest('Role does not belong to this team');
  }

  return prisma.teamMember.update({
    where: { teamId_userId: { teamId, userId: targetUserId } },
    data: { roleId },
    include: { user: true, role: true },
  });
}
