import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginSchema, type LoginInput } from '@felix/shared';
import { AuthLayout } from './AuthLayout';
import { Label } from '../../components/ui/Label';
import { Input } from '../../components/ui/Input';
import { FieldError } from '../../components/ui/FieldError';
import { Button } from '../../components/ui/Button';
import { useLogin } from '../../hooks/useAuth';
import { getApiErrorMessage } from '../../api/client';

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });
  const login = useLogin();
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = (data: LoginInput) => {
    login.mutate(data, {
      onSuccess: () => {
        const from = (location.state as { from?: Location })?.from?.pathname ?? '/';
        navigate(from, { replace: true });
      },
      onError: (err) => toast.error(getApiErrorMessage(err, 'Could not sign in')),
    });
  };

  return (
    <AuthLayout
      title="Sign in to Felix"
      subtitle={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-brand-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
          />
          <FieldError message={errors.password?.message} />
        </div>
        <Button type="submit" className="w-full" isLoading={login.isPending}>
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
