import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@felix/shared';
import { AuthLayout } from './AuthLayout';
import { Label } from '../../components/ui/Label';
import { Input } from '../../components/ui/Input';
import { FieldError } from '../../components/ui/FieldError';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import * as authApi from '../../api/auth';

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });
  const mutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => setSent(true),
  });

  return (
    <AuthLayout
      title="Reset your password"
      subtitle={
        <>
          Remembered it?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <Alert variant="success">
          If an account exists for that email, we&apos;ve sent a link to reset your password.
        </Alert>
      ) : (
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
            <FieldError message={errors.email?.message} />
          </div>
          <Button type="submit" className="w-full" isLoading={mutation.isPending}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
