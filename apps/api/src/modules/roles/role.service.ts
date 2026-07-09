import { ACTIVITY_ACTIONS } from '@felix/shared';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../utils/errors.js';
import { logActivity } from '../activity/activity.service.js';

export async function listRoles(teamId: string) {
  return prisma.role.findMany({
    where: { teamId },
    include: { permissions: { include: { permission: true } } },
    orderBy: { createdAt: 'asc' },
  });
}

export async function createRole(
  teamId: string,
  data: { name: string; description?: string; permissionKeys: string[] },
  actorId: string,
) {
  const permissions = await prisma.permission.findMany({
    where: { key: { in: data.permissionKeys } },
  });

  const role = await prisma.role.create({
    data: {
      teamId,
      name: data.name,
      description: data.description,
      isSystem: false,
      permissions: { create: permissions.map((p) => ({ permissionId: p.id })) },
    },
    include: { permissions: { include: { permission: true } } },
  });

  await logActivity({
    teamId,
    actorId,
    action: ACTIVITY_ACTIONS.ROLE_CREATED,
    metadata: { roleName: role.name },
  });

  return role;
}

async function getEditableRoleOrThrow(teamId: string, roleId: string) {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role || role.teamId !== teamId) throw AppError.notFound('Role not found');
  if (role.isSystem) throw AppError.badRequest('System roles cannot be modified');
  return role;
}

export async function updateRole(
  teamId: string,
  roleId: string,
  data: { name?: string; description?: string; permissionKeys?: string[] },
  actorId: string,
) {
  await getEditableRoleOrThrow(teamId, roleId);

  if (data.permissionKeys) {
    const permissions = await prisma.permission.findMany({
      where: { key: { in: data.permissionKeys } },
    });
    await prisma.rolePermission.deleteMany({ where: { roleId } });
    await prisma.rolePermission.createMany({
      data: permissions.map((p) => ({ roleId, permissionId: p.id })),
    });
  }

  const role = await prisma.role.update({
    where: { id: roleId },
    data: { name: data.name, description: data.description },
    include: { permissions: { include: { permission: true } } },
  });

  await logActivity({
    teamId,
    actorId,
    action: ACTIVITY_ACTIONS.ROLE_UPDATED,
    metadata: { roleName: role.name },
  });

  return role;
}

export async function deleteRole(teamId: string, roleId: string, actorId: string) {
  const role = await getEditableRoleOrThrow(teamId, roleId);

  const membersWithRole = await prisma.teamMember.count({ where: { roleId } });
  if (membersWithRole > 0) {
    throw AppError.badRequest('Cannot delete a role that is assigned to members');
  }

  await prisma.role.delete({ where: { id: roleId } });

  await logActivity({
    teamId,
    actorId,
    action: ACTIVITY_ACTIONS.ROLE_DELETED,
    metadata: { roleName: role.name },
  });
}
