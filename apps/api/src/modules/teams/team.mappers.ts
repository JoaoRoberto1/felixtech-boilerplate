import type { Prisma } from '@prisma/client';
import type { RoleDto, TeamDto, TeamMemberDto } from '@felix/shared';

type RoleWithPermissions = Prisma.RoleGetPayload<{
  include: { permissions: { include: { permission: true } } };
}>;

export function toRoleDto(role: RoleWithPermissions): RoleDto {
  return {
    id: role.id,
    teamId: role.teamId,
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    permissions: role.permissions.map((rp) => ({
      id: rp.permission.id,
      key: rp.permission.key,
      description: rp.permission.description,
    })),
  };
}

type TeamMemberWithRelations = Prisma.TeamMemberGetPayload<{
  include: { user: true; role: true };
}>;

export function toTeamMemberDto(member: TeamMemberWithRelations): TeamMemberDto {
  return {
    id: member.id,
    userId: member.userId,
    user: {
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      avatarUrl: member.user.avatarUrl,
    },
    role: { id: member.role.id, name: member.role.name, isSystem: member.role.isSystem },
    createdAt: member.createdAt.toISOString(),
  };
}

export function toTeamDto(
  team: Prisma.TeamGetPayload<Record<string, never>>,
  extras?: {
    memberCount?: number;
    myRole?: { id: string; name: string };
    myPermissions?: string[];
  },
): TeamDto {
  return {
    id: team.id,
    name: team.name,
    slug: team.slug,
    ownerId: team.ownerId,
    createdAt: team.createdAt.toISOString(),
    memberCount: extras?.memberCount,
    myRole: extras?.myRole,
    myPermissions: extras?.myPermissions as TeamDto['myPermissions'],
  };
}
