import { Router, raw } from 'express';
import type Stripe from 'stripe';
import { stripe } from '../../lib/stripe.js';
import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import { upsertSubscriptionFromStripe } from '../subscriptions/subscription.service.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { AppError } from '../../utils/errors.js';

export const stripeWebhookRouter = Router();

/**
 * Mounted with express.raw() so the exact request bytes (not the parsed
 * JSON) are available for Stripe's signature verification. Must be
 * registered BEFORE the app-wide express.json() body parser.
 */
stripeWebhookRouter.post(
  '/',
  raw({ type: 'application/json' }),
  asyncHandler(async (req, res) => {
    const signature = req.headers['stripe-signature'];
    if (!signature || typeof signature !== 'string') {
      throw AppError.badRequest('Missing Stripe signature header');
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body as Buffer,
        signature,
        env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      logger.warn({ err }, 'Stripe webhook signature verification failed');
      throw AppError.badRequest('Invalid webhook signature');
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (typeof session.subscription === 'string') {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          await upsertSubscriptionFromStripe(subscription);
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await upsertSubscriptionFromStripe(subscription);
        break;
      }
      default:
        logger.debug({ type: event.type }, 'Unhandled Stripe webhook event');
    }

    res.json({ received: true });
  }),
);
