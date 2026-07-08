import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ALL_PERMISSIONS, type PermissionKey, type RoleDto } from '@felix/shared';
import { Dialog } from '../../components/ui/Dialog';
import { Label } from '../../components/ui/Label';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useCreateRole, useUpdateRole } from '../../hooks/useTeamQueries';
import { getApiErrorMessage } from '../../api/client';

const PERMISSION_LABELS: Record<PermissionKey, string> = {
  'team:view': 'View team',
  'team:manage': 'Manage team settings',
  'team:delete': 'Delete team',
  'team:members:view': 'View members',
  'team:members:invite': 'Invite members',
  'team:members:remove': 'Remove members',
  'team:members:update_role': "Change members' roles",
  'team:roles:manage': 'Manage custom roles',
  'team:billing:view': 'View billing',
  'team:billing:manage': 'Manage billing',
};

export function RoleFormDialog({
  teamId,
  open,
  onClose,
  role,
}: {
  teamId: string;
  open: boolean;
  onClose: () => void;
  role?: RoleDto;
}) {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const createRole = useCreateRole(teamId);
  const updateRole = useUpdateRole(teamId);

  useEffect(() => {
    if (open) {
      setName(role?.name ?? '');
      setSelected(new Set(role?.permissions.map((p) => p.key) ?? []));
    }
  }, [open, role]);

  const togglePermission = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const onSubmit = () => {
    const payload = { name, permissionKeys: [...selected] };
    const mutation = role
      ? updateRole.mutateAsync({ roleId: role.id, input: payload })
      : createRole.mutateAsync(payload);

    mutation
      .then(() => onClose())
      .catch((err) => toast.error(getApiErrorMessage(err, 'Could not save role')));
  };

  const isPending = createRole.isPending || updateRole.isPending;

  return (
    <Dialog open={open} onClose={onClose} title={role ? 'Edit role' : 'Create role'}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="role-name">Role name</Label>
          <Input id="role-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div>
          <Label>Permissions</Label>
          <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border border-slate-200 p-3">
            {ALL_PERMISSIONS.map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={selected.has(key)}
                  onChange={() => togglePermission(key)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                {PERMISSION_LABELS[key]}
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={onSubmit} isLoading={isPending} disabled={!name.trim()}>
            {role ? 'Save changes' : 'Create role'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
