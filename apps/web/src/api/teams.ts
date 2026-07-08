import type { TeamDto, TeamMemberDto, CreateTeamInput, UpdateTeamInput } from '@felix/shared';
import { apiClient } from './client';

export async function listMyTeams(): Promise<TeamDto[]> {
  const { data } = await apiClient.get<{ teams: TeamDto[] }>('/teams');
  return data.teams;
}

export async function createTeam(input: CreateTeamInput): Promise<TeamDto> {
  const { data } = await apiClient.post<{ team: TeamDto }>('/teams', input);
  return data.team;
}

export async function getTeam(teamId: string): Promise<TeamDto> {
  const { data } = await apiClient.get<{ team: TeamDto }>(`/teams/${teamId}`);
  return data.team;
}

export async function updateTeam(teamId: string, input: UpdateTeamInput): Promise<TeamDto> {
  const { data } = await apiClient.patch<{ team: TeamDto }>(`/teams/${teamId}`, input);
  return data.team;
}

export async function deleteTeam(teamId: string): Promise<void> {
  await apiClient.delete(`/teams/${teamId}`);
}

export async function listMembers(teamId: string): Promise<TeamMemberDto[]> {
  const { data } = await apiClient.get<{ members: TeamMemberDto[] }>(`/teams/${teamId}/members`);
  return data.members;
}

export async function removeMember(teamId: string, userId: string): Promise<void> {
  await apiClient.delete(`/teams/${teamId}/members/${userId}`);
}

export async function updateMemberRole(
  teamId: string,
  userId: string,
  roleId: string,
): Promise<TeamMemberDto> {
  const { data } = await apiClient.patch<{ member: TeamMemberDto }>(
    `/teams/${teamId}/members/${userId}`,
    {
      roleId,
    },
  );
  return data.member;
}
