import { PERMISSIONS, type PermissionKey } from '@felix/shared';

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  [PERMISSIONS.TEAM_VIEW]: 'View team',
  [PERMISSIONS.TEAM_MANAGE]: 'Manage team settings',
  [PERMISSIONS.TEAM_DELETE]: 'Delete team',
  [PERMISSIONS.TEAM_MEMBERS_VIEW]: 'View members',
  [PERMISSIONS.TEAM_MEMBERS_INVITE]: 'Invite members',
  [PERMISSIONS.TEAM_MEMBERS_REMOVE]: 'Remove members',
  [PERMISSIONS.TEAM_MEMBERS_UPDATE_ROLE]: "Change members' roles",
  [PERMISSIONS.TEAM_ROLES_MANAGE]: 'Manage custom roles',
  [PERMISSIONS.TEAM_BILLING_VIEW]: 'View billing',
  [PERMISSIONS.TEAM_BILLING_MANAGE]: 'Manage billing',
};

export const PERMISSION_GROUPS: { label: string; permissions: PermissionKey[] }[] = [
  {
    label: 'Team',
    permissions: [PERMISSIONS.TEAM_VIEW, PERMISSIONS.TEAM_MANAGE, PERMISSIONS.TEAM_DELETE],
  },
  {
    label: 'Members',
    permissions: [
      PERMISSIONS.TEAM_MEMBERS_VIEW,
      PERMISSIONS.TEAM_MEMBERS_INVITE,
      PERMISSIONS.TEAM_MEMBERS_REMOVE,
      PERMISSIONS.TEAM_MEMBERS_UPDATE_ROLE,
    ],
  },
  { label: 'Roles', permissions: [PERMISSIONS.TEAM_ROLES_MANAGE] },
  {
    label: 'Billing',
    permissions: [PERMISSIONS.TEAM_BILLING_VIEW, PERMISSIONS.TEAM_BILLING_MANAGE],
  },
];
