import { Router } from 'express';
import {
  PERMISSIONS,
  createTeamSchema,
  updateTeamSchema,
  updateMemberRoleSchema,
} from '@felix/shared';
import { z } from 'zod';
import { requireAuth } from '../../middlewares/auth.js';
import { loadTeamContext, requirePermission } from '../../middlewares/rbac.js';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as controller from './team.controller.js';
import { roleRouter } from '../roles/role.routes.js';
import { invitationRouter } from '../invitations/invitation.routes.js';
import { subscriptionRouter } from '../subscriptions/subscription.routes.js';

const teamIdParamSchema = z.object({ teamId: z.string().cuid() });
const memberParamSchema = z.object({ teamId: z.string().cuid(), userId: z.string().cuid() });

export const teamRouter = Router();

teamRouter.use(requireAuth);

teamRouter.post('/', validate({ body: createTeamSchema }), asyncHandler(controller.createTeam));
teamRouter.get('/', asyncHandler(controller.listMyTeams));

teamRouter.get(
  '/:teamId',
  validate({ params: teamIdParamSchema }),
  loadTeamContext,
  requirePermission(PERMISSIONS.TEAM_VIEW),
  asyncHandler(controller.getTeam),
);

teamRouter.patch(
  '/:teamId',
  validate({ params: teamIdParamSchema, body: updateTeamSchema }),
  loadTeamContext,
  requirePermission(PERMISSIONS.TEAM_MANAGE),
  asyncHandler(controller.updateTeam),
);

teamRouter.delete(
  '/:teamId',
  validate({ params: teamIdParamSchema }),
  loadTeamContext,
  requirePermission(PERMISSIONS.TEAM_DELETE),
  asyncHandler(controller.deleteTeam),
);

teamRouter.get(
  '/:teamId/members',
  validate({ params: teamIdParamSchema }),
  loadTeamContext,
  requirePermission(PERMISSIONS.TEAM_MEMBERS_VIEW),
  asyncHandler(controller.listMembers),
);

teamRouter.delete(
  '/:teamId/members/:userId',
  validate({ params: memberParamSchema }),
  loadTeamContext,
  requirePermission(PERMISSIONS.TEAM_MEMBERS_REMOVE),
  asyncHandler(controller.removeMember),
);

teamRouter.patch(
  '/:teamId/members/:userId',
  validate({ params: memberParamSchema, body: updateMemberRoleSchema }),
  loadTeamContext,
  requirePermission(PERMISSIONS.TEAM_MEMBERS_UPDATE_ROLE),
  asyncHandler(controller.updateMemberRole),
);

teamRouter.get(
  '/:teamId/my-permissions',
  validate({ params: teamIdParamSchema }),
  loadTeamContext,
  asyncHandler(controller.listMyPermissionsForTeam),
);

// Nested resource routers (each re-applies loadTeamContext + its own permission checks)
teamRouter.use('/:teamId/roles', roleRouter);
teamRouter.use('/:teamId/invitations', invitationRouter);
teamRouter.use('/:teamId/subscription', subscriptionRouter);
