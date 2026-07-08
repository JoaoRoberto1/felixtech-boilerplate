import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { inviteMemberSchema, type InviteMemberInput } from '@felix/shared';
import { Dialog } from '../../components/ui/Dialog';
import { Label } from '../../components/ui/Label';
import { Input } from '../../components/ui/Input';
import { FieldError } from '../../components/ui/FieldError';
import { Button } from '../../components/ui/Button';
import { useInviteMember, useRoles } from '../../hooks/useTeamQueries';
import { getApiErrorMessage } from '../../api/client';

export function InviteMemberDialog({
  teamId,
  open,
  onClose,
}: {
  teamId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { data: roles } = useRoles(teamId);
  const inviteMember = useInviteMember(teamId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteMemberInput>({ resolver: zodResolver(inviteMemberSchema) });

  const onSubmit = (data: InviteMemberInput) => {
    inviteMember.mutate(data, {
      onSuccess: () => {
        toast.success('Invitation sent');
        reset();
        onClose();
      },
      onError: (err) => toast.error(getApiErrorMessage(err, 'Could not send invitation')),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Invite a member"
      description="They'll receive an email with a link to join."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoFocus {...register('email')} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="roleId">Role</Label>
          <select
            id="roleId"
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            {...register('roleId')}
          >
            <option value="">Select a role</option>
            {roles?.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.roleId?.message} />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={inviteMember.isPending}>
            Send invitation
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
