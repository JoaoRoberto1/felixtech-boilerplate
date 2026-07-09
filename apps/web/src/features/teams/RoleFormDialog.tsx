import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { RoleDto } from '@felix/shared';
import { Dialog } from '../../components/ui/Dialog';
import { Label } from '../../components/ui/Label';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useCreateRole, useUpdateRole } from '../../hooks/useTeamQueries';
import { getApiErrorMessage } from '../../api/client';

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
  const createRole = useCreateRole(teamId);
  const updateRole = useUpdateRole(teamId);

  useEffect(() => {
    if (open) setName(role?.name ?? '');
  }, [open, role]);

  const onSubmit = () => {
    // New roles start with zero permissions; grant them from the matrix below.
    const mutation = role
      ? updateRole.mutateAsync({ roleId: role.id, input: { name } })
      : createRole.mutateAsync({ name, permissionKeys: [] });

    mutation
      .then(() => onClose())
      .catch((err) => toast.error(getApiErrorMessage(err, 'Could not save role')));
  };

  const isPending = createRole.isPending || updateRole.isPending;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={role ? 'Rename role' : 'Create role'}
      description={role ? undefined : "You'll grant permissions from the matrix after creating it."}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="role-name">Role name</Label>
          <Input id="role-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
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
