import { useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PERMISSIONS, type RoleDto } from '@felix/shared';
import { useRoles, useDeleteRole } from '../../hooks/useTeamQueries';
import { usePermission } from '../../hooks/usePermission';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { RoleFormDialog } from './RoleFormDialog';
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

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Roles</h1>
          <p className="mt-1 text-sm text-slate-500">
            Define what each role can do within this team.
          </p>
        </div>
        {canManageRoles && <Button onClick={openCreate}>New role</Button>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All roles</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-slate-100 p-0">
          {roles?.map((role) => (
            <div key={role.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-900">{role.name}</p>
                  {role.isSystem && <Badge>System</Badge>}
                </div>
                <p className="text-xs text-slate-500">{role.permissions.length} permission(s)</p>
              </div>
              {canManageRoles && !role.isSystem && (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(role)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      deleteRole.mutate(role.id, {
                        onError: (err) =>
                          toast.error(getApiErrorMessage(err, 'Could not delete role')),
                      })
                    }
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

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
