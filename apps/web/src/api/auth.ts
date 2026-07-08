import type {
  AuthResponseDto,
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from '@felix/shared';
import { apiClient } from './client';

export async function login(input: LoginInput): Promise<AuthResponseDto> {
  const { data } = await apiClient.post<AuthResponseDto>('/auth/login', input);
  return data;
}

export async function register(input: RegisterInput): Promise<AuthResponseDto> {
  const { data } = await apiClient.post<AuthResponseDto>('/auth/register', input);
  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function forgotPassword(input: ForgotPasswordInput): Promise<void> {
  await apiClient.post('/auth/forgot-password', input);
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  await apiClient.post('/auth/reset-password', input);
}

export async function verifyEmail(input: VerifyEmailInput): Promise<void> {
  await apiClient.post('/auth/verify-email', input);
}
