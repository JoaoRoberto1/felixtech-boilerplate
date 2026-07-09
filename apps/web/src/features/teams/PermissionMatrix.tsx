import { Fragment, useState } from 'react';
import toast from 'react-hot-toast';
import { Lock } from 'lucide-react';
import type { RoleDto } from '@felix/shared';
import { PERMISSION_GROUPS, PERMISSION_LABELS } from './permission-groups';
import { Switch } from '../../components/ui/Switch';
import { useUpdateRole } from '../../hooks/useTeamQueries';
import { getApiErrorMessage } from '../../api/client';

export function PermissionMatrix({
  teamId,
  roles,
  canManage,
}: {
  teamId: string;
  roles: RoleDto[];
  canManage: boolean;
}) {
  const updateRole = useUpdateRole(teamId);
  const [pendingCell, setPendingCell] = useState<string | null>(null);

  const toggle = (role: RoleDto, permissionKey: string, checked: boolean) => {
    const nextPermissions = new Set(role.permissions.map((p) => p.key));
    if (checked) nextPermissions.add(permissionKey);
    else nextPermissions.delete(permissionKey);

    const cellKey = `${role.id}:${permissionKey}`;
    setPendingCell(cellKey);
    updateRole.mutate(
      { roleId: role.id, input: { permissionKeys: [...nextPermissions] } },
      {
        onError: (err) => toast.error(getApiErrorMessage(err, 'Could not update permission')),
        onSettled: () => setPendingCell(null),
      },
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-white px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Permission
            </th>
            {roles.map((role) => (
              <th key={role.id} className="px-4 py-3 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-semibold text-slate-900">{role.name}</span>
                  {role.isSystem && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Lock className="h-3 w-3" strokeWidth={2} />
                      Locked
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERMISSION_GROUPS.map((group) => (
            <Fragment key={group.label}>
              <tr>
                <td
                  colSpan={roles.length + 1}
                  className="bg-slate-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {group.label}
                </td>
              </tr>
              {group.permissions.map((permissionKey) => (
                <tr key={permissionKey} className="border-b border-slate-100 last:border-0">
                  <td className="sticky left-0 z-10 bg-white px-4 py-2.5 text-slate-700">
                    {PERMISSION_LABELS[permissionKey]}
                  </td>
                  {roles.map((role) => {
                    const checked = role.permissions.some((p) => p.key === permissionKey);
                    const cellKey = `${role.id}:${permissionKey}`;
                    return (
                      <td key={role.id} className="px-4 py-2.5 text-center">
                        <Switch
                          checked={checked}
                          disabled={!canManage || role.isSystem || pendingCell === cellKey}
                          onChange={(next) => toggle(role, permissionKey, next)}
                          label={`${role.name} — ${PERMISSION_LABELS[permissionKey]}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
