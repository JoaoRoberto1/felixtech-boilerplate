/**
 * Canonical permission keys. Stored verbatim in the `Permission.key` column
 * and referenced from both API guards and frontend UI gating, so this file
 * is the single source of truth for what actions exist in the system.
 */
export const PERMISSIONS = {
  TEAM_VIEW: 'team:view',
  TEAM_MANAGE: 'team:manage',
  TEAM_DELETE: 'team:delete',
  TEAM_MEMBERS_VIEW: 'team:members:view',
  TEAM_MEMBERS_INVITE: 'team:members:invite',
  TEAM_MEMBERS_REMOVE: 'team:members:remove',
  TEAM_MEMBERS_UPDATE_ROLE: 'team:members:update_role',
  TEAM_ROLES_MANAGE: 'team:roles:manage',
  TEAM_BILLING_VIEW: 'team:billing:view',
  TEAM_BILLING_MANAGE: 'team:billing:manage',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: PermissionKey[] = Object.values(PERMISSIONS);

/** Built-in, non-deletable roles seeded for every team. */
export const SYSTEM_ROLES = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MEMBER: 'Member',
} as const;

export type SystemRoleName = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];

/** Default permission grants used when seeding each system role for a new team. */
export const DEFAULT_ROLE_PERMISSIONS: Record<SystemRoleName, PermissionKey[]> = {
  [SYSTEM_ROLES.OWNER]: [...ALL_PERMISSIONS],
  [SYSTEM_ROLES.ADMIN]: [
    PERMISSIONS.TEAM_VIEW,
    PERMISSIONS.TEAM_MANAGE,
    PERMISSIONS.TEAM_MEMBERS_VIEW,
    PERMISSIONS.TEAM_MEMBERS_INVITE,
    PERMISSIONS.TEAM_MEMBERS_REMOVE,
    PERMISSIONS.TEAM_MEMBERS_UPDATE_ROLE,
    PERMISSIONS.TEAM_BILLING_VIEW,
  ],
  [SYSTEM_ROLES.MEMBER]: [PERMISSIONS.TEAM_VIEW, PERMISSIONS.TEAM_MEMBERS_VIEW],
};
