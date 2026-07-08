import { Router } from 'express';
import { z } from 'zod';
import { PERMISSIONS, createRoleSchema, updateRoleSchema } from '@felix/shared';
import { loadTeamContext, requirePermission } from '../../middlewares/rbac.js';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as controller from './role.controller.js';

const roleParamSchema = z.object({ teamId: z.string().cuid(), roleId: z.string().cuid() });

export const roleRouter = Router({ mergeParams: true });

roleRouter.use(loadTeamContext);

roleRouter.get(
  '/',
  requirePermission(PERMISSIONS.TEAM_MEMBERS_VIEW),
  asyncHandler(controller.listRoles),
);

roleRouter.post(
  '/',
  validate({ body: createRoleSchema }),
  requirePermission(PERMISSIONS.TEAM_ROLES_MANAGE),
  asyncHandler(controller.createRole),
);

roleRouter.patch(
  '/:roleId',
  validate({ params: roleParamSchema, body: updateRoleSchema }),
  requirePermission(PERMISSIONS.TEAM_ROLES_MANAGE),
  asyncHandler(controller.updateRole),
);

roleRouter.delete(
  '/:roleId',
  validate({ params: roleParamSchema }),
  requirePermission(PERMISSIONS.TEAM_ROLES_MANAGE),
  asyncHandler(controller.deleteRole),
);
