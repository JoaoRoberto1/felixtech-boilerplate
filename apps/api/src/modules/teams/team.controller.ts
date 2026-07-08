import type { Request, Response } from 'express';
import { AppError } from '../../utils/errors.js';
import * as teamService from './team.service.js';
import { toTeamDto, toTeamMemberDto } from './team.mappers.js';

export async function createTeam(req: Request, res: Response): Promise<void> {
  const team = await teamService.createTeamWithOwner(req.userId!, req.body.name);
  res.status(201).json({ team: toTeamDto(team, { memberCount: 1 }) });
}

export async function listMyTeams(req: Request, res: Response): Promise<void> {
  const memberships = await teamService.listTeamsForUser(req.userId!);
  res.json({
    teams: memberships.map(({ team, role }) =>
      toTeamDto(team, {
        myRole: { id: role.id, name: role.name },
        myPermissions: role.permissions.map((rp) => rp.permission.key),
      }),
    ),
  });
}

export async function getTeam(req: Request, res: Response): Promise<void> {
  const team = await teamService.getTeamOrThrow(req.params.teamId!);
  const memberCount = await teamService.countMembers(team.id);
  const ctx = req.teamContext!;
  res.json({
    team: toTeamDto(team, {
      memberCount,
      myRole: { id: ctx.roleId, name: ctx.roleName },
      myPermissions: [...ctx.permissions] as never,
    }),
  });
}

export async function updateTeam(req: Request, res: Response): Promise<void> {
  const team = await teamService.updateTeam(req.params.teamId!, req.body);
  res.json({ team: toTeamDto(team) });
}

export async function deleteTeam(req: Request, res: Response): Promise<void> {
  const team = await teamService.getTeamOrThrow(req.params.teamId!);
  if (team.ownerId !== req.userId) {
    throw AppError.forbidden('Only the team owner can delete the team');
  }
  await teamService.deleteTeam(team.id);
  res.status(204).send();
}

export async function listMembers(req: Request, res: Response): Promise<void> {
  const members = await teamService.listMembers(req.params.teamId!);
  res.json({ members: members.map(toTeamMemberDto) });
}

export async function removeMember(req: Request, res: Response): Promise<void> {
  await teamService.removeMember(req.params.teamId!, req.params.userId!);
  res.status(204).send();
}

export async function updateMemberRole(req: Request, res: Response): Promise<void> {
  const member = await teamService.updateMemberRole(
    req.params.teamId!,
    req.params.userId!,
    req.body.roleId,
  );
  res.json({ member: toTeamMemberDto(member) });
}

export async function listMyPermissionsForTeam(req: Request, res: Response): Promise<void> {
  const ctx = req.teamContext!;
  res.json({ permissions: [...ctx.permissions] });
}
