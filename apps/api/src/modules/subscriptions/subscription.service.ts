import type Stripe from 'stripe';
import { SubscriptionStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { stripe } from '../../lib/stripe.js';
import { AppError } from '../../utils/errors.js';
import { env } from '../../config/env.js';

async function getOrCreateStripeCustomer(teamId: string): Promise<string> {
  const existing = await prisma.subscription.findUnique({ where: { teamId } });
  if (existing) return existing.stripeCustomerId;

  const team = await prisma.team.findUniqueOrThrow({
    where: { id: teamId },
    include: { owner: true },
  });

  const customer = await stripe.customers.create({
    name: team.name,
    email: team.owner.email,
    metadata: { teamId },
  });

  await prisma.subscription.create({
    data: { teamId, stripeCustomerId: customer.id, status: SubscriptionStatus.INCOMPLETE },
  });

  return customer.id;
}

export async function createCheckoutSession(teamId: string, priceId: string): Promise<string> {
  const customerId = await getOrCreateStripeCustomer(teamId);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.CLIENT_URL}/settings/billing?checkout=success`,
    cancel_url: `${env.CLIENT_URL}/settings/billing?checkout=cancelled`,
    client_reference_id: teamId,
    subscription_data: { metadata: { teamId } },
  });

  if (!session.url) throw AppError.badRequest('Failed to create checkout session');
  return session.url;
}

export async function createPortalSession(teamId: string): Promise<string> {
  const subscription = await prisma.subscription.findUnique({ where: { teamId } });
  if (!subscription) throw AppError.notFound('No billing account found for this team yet');

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${env.CLIENT_URL}/settings/billing`,
  });

  return session.url;
}

export async function getSubscription(teamId: string) {
  return prisma.subscription.findUnique({ where: { teamId } });
}

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  const map: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
    trialing: SubscriptionStatus.TRIALING,
    active: SubscriptionStatus.ACTIVE,
    past_due: SubscriptionStatus.PAST_DUE,
    canceled: SubscriptionStatus.CANCELED,
    unpaid: SubscriptionStatus.UNPAID,
    incomplete: SubscriptionStatus.INCOMPLETE,
    incomplete_expired: SubscriptionStatus.INCOMPLETE_EXPIRED,
    paused: SubscriptionStatus.CANCELED,
  };
  return map[status] ?? SubscriptionStatus.INCOMPLETE;
}

export async function upsertSubscriptionFromStripe(
  subscription: Stripe.Subscription,
): Promise<void> {
  const teamId = subscription.metadata?.teamId;
  if (!teamId) return;

  const price = subscription.items.data[0]?.price;
  const periodEnd = subscription.current_period_end;

  await prisma.subscription.upsert({
    where: { teamId },
    create: {
      teamId,
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
      stripePriceId: price?.id,
      status: mapStripeStatus(subscription.status),
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    update: {
      stripeSubscriptionId: subscription.id,
      stripePriceId: price?.id,
      status: mapStripeStatus(subscription.status),
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}
