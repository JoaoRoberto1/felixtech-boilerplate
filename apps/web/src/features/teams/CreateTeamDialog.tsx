import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { createTeamSchema, type CreateTeamInput } from '@felix/shared';
import { Dialog } from '../../components/ui/Dialog';
import { Label } from '../../components/ui/Label';
import { Input } from '../../components/ui/Input';
import { FieldError } from '../../components/ui/FieldError';
import { Button } from '../../components/ui/Button';
import { useCreateTeam } from '../../hooks/useTeamQueries';
import { getApiErrorMessage } from '../../api/client';

export function CreateTeamDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTeamInput>({ resolver: zodResolver(createTeamSchema) });
  const createTeam = useCreateTeam();

  const onSubmit = (data: CreateTeamInput) => {
    createTeam.mutate(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
      onError: (err) => toast.error(getApiErrorMessage(err, 'Could not create team')),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} title="Create a new team">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Team name</Label>
          <Input id="name" autoFocus {...register('name')} />
          <FieldError message={errors.name?.message} />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createTeam.isPending}>
            Create team
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
