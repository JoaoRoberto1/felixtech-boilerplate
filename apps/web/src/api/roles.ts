import type { RoleDto, CreateRoleInput, UpdateRoleInput } from '@felix/shared';
import { apiClient } from './client';

export async function listRoles(teamId: string): Promise<RoleDto[]> {
  const { data } = await apiClient.get<{ roles: RoleDto[] }>(`/teams/${teamId}/roles`);
  return data.roles;
}

export async function createRole(teamId: string, input: CreateRoleInput): Promise<RoleDto> {
  const { data } = await apiClient.post<{ role: RoleDto }>(`/teams/${teamId}/roles`, input);
  return data.role;
}

export async function updateRole(
  teamId: string,
  roleId: string,
  input: UpdateRoleInput,
): Promise<RoleDto> {
  const { data } = await apiClient.patch<{ role: RoleDto }>(
    `/teams/${teamId}/roles/${roleId}`,
    input,
  );
  return data.role;
}

export async function deleteRole(teamId: string, roleId: string): Promise<void> {
  await apiClient.delete(`/teams/${teamId}/roles/${roleId}`);
}
