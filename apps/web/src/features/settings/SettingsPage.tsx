import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { updateProfileSchema, passwordSchema, type UpdateProfileInput } from '@felix/shared';
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
import { Badge } from '../../components/ui/Badge';
import { getInitials } from '../../lib/initials';
import * as usersApi from '../../api/users';
import { getApiErrorMessage } from '../../api/client';

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});
type PasswordFormInput = z.infer<typeof passwordFormSchema>;

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const accessToken = useAuthStore((s) => s.accessToken);

  const profileForm = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user?.name },
  });

  const updateProfile = useMutation({
    mutationFn: usersApi.updateProfile,
    onSuccess: (updatedUser) => {
      if (accessToken) setSession(updatedUser, accessToken);
      toast.success('Profile updated');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not update profile')),
  });

  const passwordForm = useForm<PasswordFormInput>({ resolver: zodResolver(passwordFormSchema) });

  const changePassword = useMutation({
    mutationFn: usersApi.changePassword,
    onSuccess: () => {
      toast.success('Password changed');
      passwordForm.reset();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not change password')),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-700 text-lg font-bold text-white">
          {getInitials(user?.name)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            <span>{user?.email}</span>
            {user?.emailVerified ? (
              <Badge variant="success" className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" strokeWidth={2} />
                Email verified
              </Badge>
            ) : (
              <Badge variant="warning" className="flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" strokeWidth={2} />
                Email not verified
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription>Update your name.</CardDescription>
        </CardHeader>
        <form onSubmit={profileForm.handleSubmit((data) => updateProfile.mutate(data))}>
          <CardContent>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" {...profileForm.register('name')} />
            <FieldError message={profileForm.formState.errors.name?.message} />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" isLoading={updateProfile.isPending}>
              Save changes
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>
            Changing your password signs you out of all other devices.
          </CardDescription>
        </CardHeader>
        <form onSubmit={passwordForm.handleSubmit((data) => changePassword.mutate(data))}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                {...passwordForm.register('currentPassword')}
              />
              <FieldError message={passwordForm.formState.errors.currentPassword?.message} />
            </div>
            <div>
              <Label htmlFor="newPassword">New password</Label>
              <Input id="newPassword" type="password" {...passwordForm.register('newPassword')} />
              <FieldError message={passwordForm.formState.errors.newPassword?.message} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" isLoading={changePassword.isPending}>
              Update password
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
