import type { UserDto, UpdateProfileInput, ChangePasswordInput } from '@felix/shared';
import { apiClient } from './client';

export async function getMe(): Promise<UserDto> {
  const { data } = await apiClient.get<{ user: UserDto }>('/users/me');
  return data.user;
}

export async function updateProfile(input: UpdateProfileInput): Promise<UserDto> {
  const { data } = await apiClient.patch<{ user: UserDto }>('/users/me', input);
  return data.user;
}

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  await apiClient.post('/users/me/change-password', input);
}
