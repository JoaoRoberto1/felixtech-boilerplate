import type { NextFunction, Request, Response } from 'express';
import type { PermissionKey } from '@felix/shared';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';

export interface TeamContext {
  teamId: string;
  roleId: string;
  roleName: string;
  permissions: Set<string>;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      teamContext?: TeamContext;
    }
  }
}

/**
 * Loads the caller's membership + effective permissions for `req.params.teamId`
 * and attaches it as `req.teamContext`. Must run after `requireAuth`.
 */
export async function loadTeamContext(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const teamId = req.params.teamId;
    if (!teamId) {
      next(AppError.badRequest('Missing teamId route parameter'));
      return;
    }
    if (!req.userId) {
      next(AppError.unauthorized());
      return;
    }

    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: req.userId } },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });

    if (!membership) {
      next(AppError.forbidden('You are not a member of this team'));
      return;
    }

    req.teamContext = {
      teamId,
      roleId: membership.roleId,
      roleName: membership.role.name,
      permissions: new Set(membership.role.permissions.map((rp) => rp.permission.key)),
    };
    next();
  } catch (err) {
    next(err);
  }
}

/** Requires `loadTeamContext` to have run first. */
export function requirePermission(...permissionKeys: PermissionKey[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const ctx = req.teamContext;
    if (!ctx) {
      next(AppError.forbidden('Team context not loaded'));
      return;
    }

    const hasAll = permissionKeys.every((key) => ctx.permissions.has(key));
    if (!hasAll) {
      next(AppError.forbidden('You do not have permission to perform this action'));
      return;
    }
    next();
  };
}
