import type { PermissionKey } from '../constants/permissions';
import type { SubscriptionStatus, InvitationStatus } from '../constants';

export interface UserDto {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export interface PermissionDto {
  id: string;
  key: PermissionKey | string;
  description: string | null;
}

export interface RoleDto {
  id: string;
  teamId: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: PermissionDto[];
}

export interface TeamMemberDto {
  id: string;
  userId: string;
  user: Pick<UserDto, 'id' | 'name' | 'email' | 'avatarUrl'>;
  role: Pick<RoleDto, 'id' | 'name' | 'isSystem'>;
  createdAt: string;
}

export interface TeamDto {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
  memberCount?: number;
  myRole?: Pick<RoleDto, 'id' | 'name'>;
  myPermissions?: PermissionKey[];
}

export interface InvitationDto {
  id: string;
  teamId: string;
  email: string;
  role: Pick<RoleDto, 'id' | 'name'>;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
}

export interface SubscriptionDto {
  id: string;
  teamId: string;
  status: SubscriptionStatus;
  planName: string | null;
  priceId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface AuthTokensDto {
  accessToken: string;
  expiresAt: string;
}

export interface AuthResponseDto {
  user: UserDto;
  tokens: AuthTokensDto;
}

export interface ApiErrorBody {
  error: {
    message: string;
    code?: string;
    details?: Record<string, string[]>;
  };
}
