import { useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Shield, Lock, Pencil, Trash2, Plus } from 'lucide-react';
import { PERMISSIONS, type RoleDto } from '@felix/shared';
import { useRoles, useDeleteRole } from '../../hooks/useTeamQueries';
import { usePermission } from '../../hooks/usePermission';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { RoleFormDialog } from './RoleFormDialog';
import { PermissionMatrix } from './PermissionMatrix';
import { getApiErrorMessage } from '../../api/client';

export function RolesPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const { data: roles, isLoading } = useRoles(teamId);
  const deleteRole = useDeleteRole(teamId!);
  const canManageRoles = usePermission(teamId, PERMISSIONS.TEAM_ROLES_MANAGE);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDto | undefined>(undefined);

  const openCreate = () => {
    setEditingRole(undefined);
    setDialogOpen(true);
  };
  const openEdit = (role: RoleDto) => {
    setEditingRole(role);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Roles</h1>
          <p className="mt-1 text-sm text-slate-500">
            Define what each role can do within this team.
          </p>
        </div>
        {canManageRoles && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            New role
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All roles</CardTitle>
          <CardDescription>{roles?.length ?? 0} roles configured</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-slate-100 p-0">
          {roles?.map((role) => (
            <div key={role.id} className="flex items-center gap-3 px-5 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <Shield className="h-4 w-4" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-slate-900">{role.name}</p>
                  {role.isSystem && (
                    <Badge className="flex items-center gap-1">
                      <Lock className="h-3 w-3" strokeWidth={2} />
                      System
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500">{role.permissions.length} permission(s)</p>
              </div>
              {canManageRoles && !role.isSystem && (
                <div className="flex shrink-0 gap-1">
                  <button
                    title="Edit role"
                    aria-label="Edit role"
                    onClick={() => openEdit(role)}
                    className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    <Pencil className="h-4 w-4" strokeWidth={2} />
                  </button>
                  <button
                    title="Delete role"
                    aria-label="Delete role"
                    onClick={() =>
                      deleteRole.mutate(role.id, {
                        onError: (err) =>
                          toast.error(getApiErrorMessage(err, 'Could not delete role')),
                      })
                    }
                    className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {roles && roles.length > 0 && teamId && (
        <Card>
          <CardHeader>
            <CardTitle>Permission matrix</CardTitle>
            <CardDescription>
              Toggle what each role can do. System roles are locked and can&apos;t be changed.
            </CardDescription>
          </CardHeader>
          <PermissionMatrix teamId={teamId} roles={roles} canManage={canManageRoles} />
        </Card>
      )}

      {teamId && (
        <RoleFormDialog
          teamId={teamId}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          role={editingRole}
        />
      )}
    </div>
  );
}
