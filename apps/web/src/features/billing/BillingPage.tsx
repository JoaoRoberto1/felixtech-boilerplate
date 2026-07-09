import { useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CreditCard, Settings2, Zap, Rocket, Check } from 'lucide-react';
import { PERMISSIONS, type SubscriptionStatus } from '@felix/shared';
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
  {
    name: 'Pro',
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID_PRO,
    blurb: 'For growing teams',
    icon: Zap,
    features: ['Unlimited members', 'Custom roles & permissions', 'Priority support'],
  },
  {
    name: 'Team',
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID_TEAM,
    blurb: 'For larger organizations',
    icon: Rocket,
    features: ['Everything in Pro', 'SSO & advanced security', 'Dedicated onboarding'],
  },
].filter(
  (
    p,
  ): p is { name: string; priceId: string; blurb: string; icon: typeof Zap; features: string[] } =>
    Boolean(p.priceId),
);

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  TRIALING: 'Trial',
  ACTIVE: 'Active',
  PAST_DUE: 'Past due',
  CANCELED: 'Canceled',
  UNPAID: 'Unpaid',
  INCOMPLETE: 'Incomplete',
  INCOMPLETE_EXPIRED: 'Expired',
};

const STATUS_VARIANTS: Record<SubscriptionStatus, 'success' | 'warning' | 'danger' | 'default'> = {
  TRIALING: 'success',
  ACTIVE: 'success',
  PAST_DUE: 'warning',
  CANCELED: 'danger',
  UNPAID: 'danger',
  INCOMPLETE: 'warning',
  INCOMPLETE_EXPIRED: 'danger',
};

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

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  const isActive = subscription && ['ACTIVE', 'TRIALING'].includes(subscription.status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your team&apos;s subscription.</p>
      </div>

      <Card>
        <CardContent className="flex items-center gap-4 py-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <CreditCard className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900">Current plan</p>
            {subscription ? (
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge variant={STATUS_VARIANTS[subscription.status]}>
                  {STATUS_LABELS[subscription.status]}
                </Badge>
                {subscription.currentPeriodEnd && (
                  <span className="text-sm text-slate-500">
                    {subscription.cancelAtPeriodEnd ? 'Cancels' : 'Renews'} on{' '}
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                )}
              </div>
            ) : (
              <p className="mt-1 text-sm text-slate-500">No active subscription.</p>
            )}
          </div>
          {canManageBilling && subscription && (
            <Button
              variant="secondary"
              onClick={() => portal.mutate()}
              isLoading={portal.isPending}
            >
              <Settings2 className="h-4 w-4" strokeWidth={2} />
              Manage billing
            </Button>
          )}
        </CardContent>
      </Card>

      {canManageBilling && !isActive && (
        <div>
          {PLANS.length > 0 && (
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Choose a plan
            </h2>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {PLANS.map((plan) => (
              <Card key={plan.priceId} className="flex flex-col">
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-700 text-white">
                    <plan.icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <CardTitle className="mt-3">{plan.name}</CardTitle>
                  <CardDescription>{plan.blurb}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check className="h-4 w-4 shrink-0 text-brand-600" strokeWidth={2.5} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    className="w-full"
                    onClick={() => checkout.mutate(plan.priceId)}
                    isLoading={checkout.isPending}
                  >
                    Subscribe to {plan.name}
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
        </div>
      )}
    </div>
  );
}
