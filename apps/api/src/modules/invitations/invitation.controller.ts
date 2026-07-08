import type { Request, Response } from 'express';
import type { InvitationDto } from '@felix/shared';
import * as invitationService from './invitation.service.js';

function toDto(invitation: {
  id: string;
  teamId: string;
  email: string;
  role: { id: string; name: string };
  status: string;
  expiresAt: Date;
  createdAt: Date;
}): InvitationDto {
  return {
    id: invitation.id,
    teamId: invitation.teamId,
    email: invitation.email,
    role: { id: invitation.role.id, name: invitation.role.name },
    status: invitation.status as InvitationDto['status'],
    expiresAt: invitation.expiresAt.toISOString(),
    createdAt: invitation.createdAt.toISOString(),
  };
}

export async function createInvitation(req: Request, res: Response): Promise<void> {
  const invitation = await invitationService.createInvitation(
    req.params.teamId!,
    req.userId!,
    req.body.email,
    req.body.roleId,
  );
  res.status(201).json({ invitation: toDto(invitation) });
}

export async function listInvitations(req: Request, res: Response): Promise<void> {
  const invitations = await invitationService.listInvitations(req.params.teamId!);
  res.json({ invitations: invitations.map(toDto) });
}

export async function revokeInvitation(req: Request, res: Response): Promise<void> {
  await invitationService.revokeInvitation(req.params.teamId!, req.params.invitationId!);
  res.status(204).send();
}

export async function acceptInvitation(req: Request, res: Response): Promise<void> {
  const team = await invitationService.acceptInvitation(req.body.token, req.userId!);
  res.json({ team: { id: team.id, name: team.name, slug: team.slug } });
}
