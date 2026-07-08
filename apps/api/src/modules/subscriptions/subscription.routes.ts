import { Router } from 'express';
import { z } from 'zod';
import { PERMISSIONS } from '@felix/shared';
import { loadTeamContext, requirePermission } from '../../middlewares/rbac.js';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as controller from './subscription.controller.js';

const checkoutSchema = z.object({ priceId: z.string().min(1) });

export const subscriptionRouter = Router({ mergeParams: true });

subscriptionRouter.use(loadTeamContext);

subscriptionRouter.get(
  '/',
  requirePermission(PERMISSIONS.TEAM_BILLING_VIEW),
  asyncHandler(controller.getSubscription),
);

subscriptionRouter.post(
  '/checkout-session',
  validate({ body: checkoutSchema }),
  requirePermission(PERMISSIONS.TEAM_BILLING_MANAGE),
  asyncHandler(controller.createCheckoutSession),
);

subscriptionRouter.post(
  '/portal-session',
  requirePermission(PERMISSIONS.TEAM_BILLING_MANAGE),
  asyncHandler(controller.createPortalSession),
);
