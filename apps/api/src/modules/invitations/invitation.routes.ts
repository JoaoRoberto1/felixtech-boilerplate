import { Router } from 'express';
import { z } from 'zod';
import { PERMISSIONS, inviteMemberSchema, acceptInvitationSchema } from '@felix/shared';
import { requireAuth } from '../../middlewares/auth.js';
import { loadTeamContext, requirePermission } from '../../middlewares/rbac.js';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as controller from './invitation.controller.js';

const invitationParamSchema = z.object({
  teamId: z.string().cuid(),
  invitationId: z.string().cuid(),
});

/** Nested under /teams/:teamId/invitations — team-scoped invitation management. */
export const invitationRouter = Router({ mergeParams: true });

invitationRouter.use(loadTeamContext);

invitationRouter.get(
  '/',
  requirePermission(PERMISSIONS.TEAM_MEMBERS_VIEW),
  asyncHandler(controller.listInvitations),
);

invitationRouter.post(
  '/',
  validate({ body: inviteMemberSchema }),
  requirePermission(PERMISSIONS.TEAM_MEMBERS_INVITE),
  asyncHandler(controller.createInvitation),
);

invitationRouter.delete(
  '/:invitationId',
  validate({ params: invitationParamSchema }),
  requirePermission(PERMISSIONS.TEAM_MEMBERS_INVITE),
  asyncHandler(controller.revokeInvitation),
);

/** Top-level route: any authenticated user can accept an invitation addressed to their email. */
export const invitationAcceptRouter = Router();
invitationAcceptRouter.use(requireAuth);
invitationAcceptRouter.post(
  '/accept',
  validate({ body: acceptInvitationSchema }),
  asyncHandler(controller.acceptInvitation),
);
