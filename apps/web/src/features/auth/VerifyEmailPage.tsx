import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import * as authApi from '../../api/auth';
import { getApiErrorMessage } from '../../api/client';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const mutation = useMutation({ mutationFn: authApi.verifyEmail });

  useEffect(() => {
    if (token) mutation.mutate({ token });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <AuthLayout title="Email verification">
      {!token && <Alert variant="error">This verification link is missing its token.</Alert>}
      {token && mutation.isPending && (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      )}
      {mutation.isSuccess && (
        <Alert variant="success">
          Your email has been verified.{' '}
          <Link to="/" className="font-medium underline">
            Continue to the dashboard
          </Link>
        </Alert>
      )}
      {mutation.isError && (
        <Alert variant="error">
          {getApiErrorMessage(mutation.error, 'Could not verify your email')}
        </Alert>
      )}
    </AuthLayout>
  );
}
