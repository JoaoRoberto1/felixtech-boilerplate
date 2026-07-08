import type { PermissionKey } from '@felix/shared';
import { useTeam } from './useTeamQueries';

/** Reads the caller's effective permissions for a team from the already-fetched team query. */
export function usePermission(teamId: string | undefined, permission: PermissionKey): boolean {
  const { data: team } = useTeam(teamId);
  return Boolean(team?.myPermissions?.includes(permission));
}
