import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import * as invitationsApi from '../../api/invitations';
import { getApiErrorMessage } from '../../api/client';

export function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const mutation = useMutation({ mutationFn: invitationsApi.acceptInvitation });

  useEffect(() => {
    if (token) mutation.mutate({ token });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="mx-auto max-w-md py-16">
      <h1 className="mb-4 text-xl font-bold text-slate-900">Team invitation</h1>
      {!token && <Alert variant="error">This invitation link is missing its token.</Alert>}
      {token && mutation.isPending && (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      )}
      {mutation.isSuccess && mutation.data && (
        <Alert variant="success">
          You&apos;ve joined <strong>{mutation.data.name}</strong>.{' '}
          <Link to={`/teams/${mutation.data.id}`} className="font-medium underline">
            Go to team
          </Link>
        </Alert>
      )}
      {mutation.isError && (
        <Alert variant="error">
          {getApiErrorMessage(mutation.error, 'Could not accept this invitation')}
        </Alert>
      )}
    </div>
  );
}
