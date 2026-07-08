import type { SubscriptionDto } from '@felix/shared';
import { apiClient } from './client';

export async function getSubscription(teamId: string): Promise<SubscriptionDto | null> {
  const { data } = await apiClient.get<{ subscription: SubscriptionDto | null }>(
    `/teams/${teamId}/subscription`,
  );
  return data.subscription;
}

export async function createCheckoutSession(teamId: string, priceId: string): Promise<string> {
  const { data } = await apiClient.post<{ url: string }>(
    `/teams/${teamId}/subscription/checkout-session`,
    {
      priceId,
    },
  );
  return data.url;
}

export async function createPortalSession(teamId: string): Promise<string> {
  const { data } = await apiClient.post<{ url: string }>(
    `/teams/${teamId}/subscription/portal-session`,
  );
  return data.url;
}
