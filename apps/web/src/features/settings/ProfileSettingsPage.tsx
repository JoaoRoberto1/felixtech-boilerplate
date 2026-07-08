import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { updateProfileSchema, type UpdateProfileInput } from '@felix/shared';
import { useAuthStore } from '../../stores/auth-store';
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
import * as usersApi from '../../api/users';
import { getApiErrorMessage } from '../../api/client';

export function ProfileSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const accessToken = useAuthStore((s) => s.accessToken);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user?.name },
  });

  const mutation = useMutation({
    mutationFn: usersApi.updateProfile,
    onSuccess: (updatedUser) => {
      if (accessToken) setSession(updatedUser, accessToken);
      toast.success('Profile updated');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not update profile')),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your personal information.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription>{user?.email}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
          <CardContent>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" {...register('name')} />
            <FieldError message={errors.name?.message} />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" isLoading={mutation.isPending}>
              Save changes
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
