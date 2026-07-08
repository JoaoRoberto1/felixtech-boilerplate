import { useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { PERMISSIONS } from '@felix/shared';
import { useSubscription } from '../../hooks/useTeamQueries';
import { usePermission } from '../../hooks/usePermission';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import * as subscriptionsApi from '../../api/subscriptions';
import { getApiErrorMessage } from '../../api/client';

const PLANS = [
  { name: 'Pro', priceId: import.meta.env.VITE_STRIPE_PRICE_ID_PRO, blurb: 'For growing teams' },
  {
    name: 'Team',
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID_TEAM,
    blurb: 'For larger organizations',
  },
].filter((p): p is { name: string; priceId: string; blurb: string } => Boolean(p.priceId));

export function BillingPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const { data: subscription, isLoading } = useSubscription(teamId);
  const canManageBilling = usePermission(teamId, PERMISSIONS.TEAM_BILLING_MANAGE);

  const checkout = useMutation({
    mutationFn: (priceId: string) => subscriptionsApi.createCheckoutSession(teamId!, priceId),
    onSuccess: (url) => window.location.assign(url),
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not start checkout')),
  });

  const portal = useMutation({
    mutationFn: () => subscriptionsApi.createPortalSession(teamId!),
    onSuccess: (url) => window.location.assign(url),
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not open billing portal')),
  });

  if (isLoading) return <Spinner />;

  const isActive = subscription && ['ACTIVE', 'TRIALING'].includes(subscription.status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your team&apos;s subscription.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="flex items-center gap-2">
              <Badge variant={isActive ? 'success' : 'warning'}>{subscription.status}</Badge>
              {subscription.currentPeriodEnd && (
                <span className="text-sm text-slate-500">
                  {subscription.cancelAtPeriodEnd ? 'Cancels' : 'Renews'} on{' '}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No active subscription.</p>
          )}
        </CardContent>
        {canManageBilling && subscription && (
          <CardFooter className="flex justify-end">
            <Button
              variant="secondary"
              onClick={() => portal.mutate()}
              isLoading={portal.isPending}
            >
              Manage billing
            </Button>
          </CardFooter>
        )}
      </Card>

      {canManageBilling && !isActive && (
        <div className="grid gap-4 sm:grid-cols-2">
          {PLANS.map((plan) => (
            <Card key={plan.priceId}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.blurb}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-end">
                <Button
                  onClick={() => checkout.mutate(plan.priceId)}
                  isLoading={checkout.isPending}
                >
                  Subscribe
                </Button>
              </CardFooter>
            </Card>
          ))}
          {PLANS.length === 0 && (
            <p className="text-sm text-slate-500">
              No plans configured. Set VITE_STRIPE_PRICE_ID_PRO / VITE_STRIPE_PRICE_ID_TEAM.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
