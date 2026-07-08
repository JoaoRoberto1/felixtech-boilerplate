import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { passwordSchema } from '@felix/shared';
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

const formSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});
type FormInput = z.infer<typeof formSchema>;

export function SecuritySettingsPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput>({ resolver: zodResolver(formSchema) });

  const mutation = useMutation({
    mutationFn: usersApi.changePassword,
    onSuccess: () => {
      toast.success('Password changed');
      reset();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not change password')),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Security</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your password and active sessions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>
            Changing your password signs you out of all other devices.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current password</Label>
              <Input id="currentPassword" type="password" {...register('currentPassword')} />
              <FieldError message={errors.currentPassword?.message} />
            </div>
            <div>
              <Label htmlFor="newPassword">New password</Label>
              <Input id="newPassword" type="password" {...register('newPassword')} />
              <FieldError message={errors.newPassword?.message} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" isLoading={mutation.isPending}>
              Update password
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
