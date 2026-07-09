import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as teamsApi from '../api/teams';
import * as rolesApi from '../api/roles';
import * as invitationsApi from '../api/invitations';
import * as subscriptionsApi from '../api/subscriptions';
import * as activityApi from '../api/activity';
import type {
  CreateTeamInput,
  UpdateTeamInput,
  CreateRoleInput,
  UpdateRoleInput,
  InviteMemberInput,
} from '@felix/shared';

export function useMyTeams() {
  return useQuery({ queryKey: ['teams'], queryFn: teamsApi.listMyTeams });
}

export function useTeam(teamId: string | undefined) {
  return useQuery({
    queryKey: ['team', teamId],
    queryFn: () => teamsApi.getTeam(teamId!),
    enabled: Boolean(teamId),
  });
}

export function useTeamMembers(teamId: string | undefined) {
  return useQuery({
    queryKey: ['team', teamId, 'members'],
    queryFn: () => teamsApi.listMembers(teamId!),
    enabled: Boolean(teamId),
  });
}

export function useRoles(teamId: string | undefined) {
  return useQuery({
    queryKey: ['team', teamId, 'roles'],
    queryFn: () => rolesApi.listRoles(teamId!),
    enabled: Boolean(teamId),
  });
}

export function useInvitations(teamId: string | undefined) {
  return useQuery({
    queryKey: ['team', teamId, 'invitations'],
    queryFn: () => invitationsApi.listInvitations(teamId!),
    enabled: Boolean(teamId),
  });
}

export function useActivity(teamId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ['team', teamId, 'activity'],
    queryFn: ({ pageParam }) => activityApi.listActivity(teamId!, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(teamId),
  });
}

export function useSubscription(teamId: string | undefined) {
  return useQuery({
    queryKey: ['team', teamId, 'subscription'],
    queryFn: () => subscriptionsApi.getSubscription(teamId!),
    enabled: Boolean(teamId),
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTeamInput) => teamsApi.createTeam(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export function useUpdateTeam(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateTeamInput) => teamsApi.updateTeam(teamId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useDeleteTeam(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => teamsApi.deleteTeam(teamId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export function useRemoveMember(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => teamsApi.removeMember(teamId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team', teamId, 'members'] }),
  });
}

export function useUpdateMemberRole(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      teamsApi.updateMemberRole(teamId, userId, roleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team', teamId, 'members'] }),
  });
}

export function useCreateRole(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRoleInput) => rolesApi.createRole(teamId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team', teamId, 'roles'] }),
  });
}

export function useUpdateRole(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, input }: { roleId: string; input: UpdateRoleInput }) =>
      rolesApi.updateRole(teamId, roleId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team', teamId, 'roles'] }),
  });
}

export function useDeleteRole(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleId: string) => rolesApi.deleteRole(teamId, roleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team', teamId, 'roles'] }),
  });
}

export function useInviteMember(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: InviteMemberInput) => invitationsApi.inviteMember(teamId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team', teamId, 'invitations'] }),
  });
}

export function useRevokeInvitation(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => invitationsApi.revokeInvitation(teamId, invitationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team', teamId, 'invitations'] }),
  });
}
