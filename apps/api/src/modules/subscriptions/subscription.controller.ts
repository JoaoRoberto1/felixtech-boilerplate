import type { Request, Response } from 'express';
import type { SubscriptionDto } from '@felix/shared';
import * as subscriptionService from './subscription.service.js';

function toDto(sub: {
  id: string;
  teamId: string;
  status: string;
  planName: string | null;
  stripePriceId: string | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}): SubscriptionDto {
  return {
    id: sub.id,
    teamId: sub.teamId,
    status: sub.status as SubscriptionDto['status'],
    planName: sub.planName,
    priceId: sub.stripePriceId,
    currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
  };
}

export async function getSubscription(req: Request, res: Response): Promise<void> {
  const subscription = await subscriptionService.getSubscription(req.params.teamId!);
  res.json({ subscription: subscription ? toDto(subscription) : null });
}

export async function createCheckoutSession(req: Request, res: Response): Promise<void> {
  const url = await subscriptionService.createCheckoutSession(req.params.teamId!, req.body.priceId);
  res.json({ url });
}

export async function createPortalSession(req: Request, res: Response): Promise<void> {
  const url = await subscriptionService.createPortalSession(req.params.teamId!);
  res.json({ url });
}
