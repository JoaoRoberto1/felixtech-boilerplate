import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { passwordSchema } from '@felix/shared';
import { AuthLayout } from './AuthLayout';
import { Label } from '../../components/ui/Label';
import { Input } from '../../components/ui/Input';
import { FieldError } from '../../components/ui/FieldError';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import * as authApi from '../../api/auth';
import { getApiErrorMessage } from '../../api/client';

const formSchema = z.object({ password: passwordSchema });
type FormInput = z.infer<typeof formSchema>;

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>({ resolver: zodResolver(formSchema) });

  const mutation = useMutation({
    mutationFn: (data: FormInput) =>
      authApi.resetPassword({ token: token!, password: data.password }),
    onSuccess: () => {
      toast.success('Password updated, please sign in');
      navigate('/login', { replace: true });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not reset your password')),
  });

  if (!token) {
    return (
      <AuthLayout title="Invalid link">
        <Alert variant="error">This password reset link is missing its token.</Alert>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Choose a new password">
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <div>
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register('password')}
          />
          <FieldError message={errors.password?.message} />
        </div>
        <Button type="submit" className="w-full" isLoading={mutation.isPending}>
          Reset password
        </Button>
      </form>
    </AuthLayout>
  );
}
