import type { PermissionKey } from '@felix/shared';
import type { ReactNode } from 'react';
import { usePermission } from '../hooks/usePermission';

interface PermissionGateProps {
  teamId: string | undefined;
  permission: PermissionKey;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({
  teamId,
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  const allowed = usePermission(teamId, permission);
  return <>{allowed ? children : fallback}</>;
}
