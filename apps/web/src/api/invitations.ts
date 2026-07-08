import type { InvitationDto, InviteMemberInput, AcceptInvitationInput } from '@felix/shared';
import { apiClient } from './client';

export async function listInvitations(teamId: string): Promise<InvitationDto[]> {
  const { data } = await apiClient.get<{ invitations: InvitationDto[] }>(
    `/teams/${teamId}/invitations`,
  );
  return data.invitations;
}

export async function inviteMember(
  teamId: string,
  input: InviteMemberInput,
): Promise<InvitationDto> {
  const { data } = await apiClient.post<{ invitation: InvitationDto }>(
    `/teams/${teamId}/invitations`,
    input,
  );
  return data.invitation;
}

export async function revokeInvitation(teamId: string, invitationId: string): Promise<void> {
  await apiClient.delete(`/teams/${teamId}/invitations/${invitationId}`);
}

export async function acceptInvitation(
  input: AcceptInvitationInput,
): Promise<{ id: string; name: string; slug: string }> {
  const { data } = await apiClient.post('/invitations/accept', input);
  return data.team;
}
