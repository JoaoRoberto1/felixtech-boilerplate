/**
 * Canonical activity-log action keys, stored verbatim in `ActivityLog.action`.
 * Shared so the frontend can map each key to an icon/label without guessing.
 */
export const ACTIVITY_ACTIONS = {
  TEAM_CREATED: 'team.created',
  TEAM_UPDATED: 'team.updated',
  MEMBER_INVITED: 'member.invited',
  MEMBER_INVITE_REVOKED: 'member.invite_revoked',
  MEMBER_JOINED: 'member.joined',
  MEMBER_REMOVED: 'member.removed',
  MEMBER_ROLE_UPDATED: 'member.role_updated',
  ROLE_CREATED: 'role.created',
  ROLE_UPDATED: 'role.updated',
  ROLE_DELETED: 'role.deleted',
  SUBSCRIPTION_UPDATED: 'subscription.updated',
} as const;

export type ActivityAction = (typeof ACTIVITY_ACTIONS)[keyof typeof ACTIVITY_ACTIONS];
