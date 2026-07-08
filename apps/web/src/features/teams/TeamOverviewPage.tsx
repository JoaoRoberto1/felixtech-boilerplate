import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PERMISSIONS, updateTeamSchema, type UpdateTeamInput } from '@felix/shared';
import { useTeam, useUpdateTeam, useDeleteTeam } from '../../hooks/useTeamQueries';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../components/ui/Card';
import { Label } from '../../components/ui/Label';
import { Input } from '../../components/ui/Input';
import { FieldError } from '../../components/ui/FieldError';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { PermissionGate } from '../../components/PermissionGate';
import { getApiErrorMessage } from '../../api/client';

export function TeamOverviewPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const { data: team, isLoading } = useTeam(teamId);
  const updateTeam = useUpdateTeam(teamId!);
  const deleteTeam = useDeleteTeam(teamId!);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateTeamInput>({ resolver: zodResolver(updateTeamSchema) });

  useEffect(() => {
    if (team) reset({ name: team.name, slug: team.slug });
  }, [team, reset]);

  if (isLoading || !team) return <Spinner />;

  const onSubmit = (data: UpdateTeamInput) => {
    updateTeam.mutate(data, {
      onSuccess: () => toast.success('Team updated'),
      onError: (err) => toast.error(getApiErrorMessage(err, 'Could not update team')),
    });
  };

  const onDelete = () => {
    if (!confirm(`Delete "${team.name}"? This cannot be undone.`)) return;
    deleteTeam.mutate(undefined, {
      onSuccess: () => navigate('/teams', { replace: true }),
      onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete team')),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{team.name}</h1>
        <p className="mt-1 text-sm text-slate-500">Team overview and general settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Update your team&apos;s name and URL slug.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Team name</Label>
              <Input id="name" disabled={!canManage(team)} {...register('name')} />
              <FieldError message={errors.name?.message} />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" disabled={!canManage(team)} {...register('slug')} />
              <FieldError message={errors.slug?.message} />
            </div>
          </CardContent>
          <PermissionGate teamId={teamId} permission={PERMISSIONS.TEAM_MANAGE}>
            <CardFooter className="flex justify-end">
              <Button type="submit" isLoading={updateTeam.isPending}>
                Save changes
              </Button>
            </CardFooter>
          </PermissionGate>
        </form>
      </Card>

      <PermissionGate teamId={teamId} permission={PERMISSIONS.TEAM_DELETE}>
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">Danger zone</CardTitle>
            <CardDescription>
              Deleting a team removes all its members, roles and data.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-end">
            <Button variant="danger" onClick={onDelete} isLoading={deleteTeam.isPending}>
              Delete team
            </Button>
          </CardFooter>
        </Card>
      </PermissionGate>
    </div>
  );
}

function canManage(team: { myPermissions?: string[] }): boolean {
  return Boolean(team.myPermissions?.includes(PERMISSIONS.TEAM_MANAGE));
}
