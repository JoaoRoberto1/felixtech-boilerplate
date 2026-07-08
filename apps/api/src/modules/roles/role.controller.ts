import type { Request, Response } from 'express';
import * as roleService from './role.service.js';
import { toRoleDto } from '../teams/team.mappers.js';

export async function listRoles(req: Request, res: Response): Promise<void> {
  const roles = await roleService.listRoles(req.params.teamId!);
  res.json({ roles: roles.map(toRoleDto) });
}

export async function createRole(req: Request, res: Response): Promise<void> {
  const role = await roleService.createRole(req.params.teamId!, req.body);
  res.status(201).json({ role: toRoleDto(role) });
}

export async function updateRole(req: Request, res: Response): Promise<void> {
  const role = await roleService.updateRole(req.params.teamId!, req.params.roleId!, req.body);
  res.json({ role: toRoleDto(role) });
}

export async function deleteRole(req: Request, res: Response): Promise<void> {
  await roleService.deleteRole(req.params.teamId!, req.params.roleId!);
  res.status(204).send();
}
