import { Router } from 'express';
import { PERMISSIONS } from '@felix/shared';
import { loadTeamContext, requirePermission } from '../../middlewares/rbac.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as controller from './activity.controller.js';

export const activityRouter = Router({ mergeParams: true });

activityRouter.use(loadTeamContext);

activityRouter.get(
  '/',
  requirePermission(PERMISSIONS.TEAM_VIEW),
  asyncHandler(controller.listActivity),
);
