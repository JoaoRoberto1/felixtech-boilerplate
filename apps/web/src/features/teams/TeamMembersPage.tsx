import { useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserPlus, Crown, Mail, X, Clock } from 'lucide-react';
import { PERMISSIONS } from '@felix/shared';
import {
  useTeamMembers,
  useRoles,
  useInvitations,
  useRemoveMember,
  useUpdateMemberRole,
  useRevokeInvitation,
  useTeam,
} from '../../hooks/useTeamQueries';
import { usePermission } from '../../hooks/usePermission';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { getInitials } from '../../lib/initials';
import { InviteMemberDialog } from './InviteMemberDialog';
import { getApiErrorMessage } from '../../api/client';

export function TeamMembersPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const { data: team } = useTeam(teamId);
  const { data: members, isLoading } = useTeamMembers(teamId);
  const { data: roles } = useRoles(teamId);
  const { data: invitations } = useInvitations(teamId);
  const removeMember = useRemoveMember(teamId!);
  const updateMemberRole = useUpdateMemberRole(teamId!);
  const revokeInvitation = useRevokeInvitation(teamId!);
  const [inviteOpen, setInviteOpen] = useState(false);

  const canInvite = usePermission(teamId, PERMISSIONS.TEAM_MEMBERS_INVITE);
  const canRemove = usePermission(teamId, PERMISSIONS.TEAM_MEMBERS_REMOVE);
  const canUpdateRole = usePermission(teamId, PERMISSIONS.TEAM_MEMBERS_UPDATE_ROLE);

  const pendingInvitations = invitations?.filter((inv) => inv.status === 'PENDING') ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Members</h1>
          <p className="mt-1 text-sm text-slate-500">Manage who has access to this team.</p>
        </div>
        {canInvite && (
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4" strokeWidth={2.5} />
            Invite member
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team members</CardTitle>
          <CardDescription>
            {members?.length ?? 0} member{members?.length === 1 ? '' : 's'}
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-slate-100 p-0">
          {members?.map((member) => {
            const isOwner = member.userId === team?.ownerId;
            return (
              <div key={member.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                  {getInitials(member.user.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {member.user.name}
                    </p>
                    {isOwner && (
                      <Crown className="h-3.5 w-3.5 shrink-0 text-amber-500" strokeWidth={2} />
                    )}
                  </div>
                  <p className="truncate text-xs text-slate-500">{member.user.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {canUpdateRole && !isOwner ? (
                    <select
                      value={member.role.id}
                      onChange={(e) =>
                        updateMemberRole.mutate(
                          { userId: member.userId, roleId: e.target.value },
                          {
                            onError: (err) =>
                              toast.error(getApiErrorMessage(err, 'Could not update role')),
                          },
                        )
                      }
                      className="rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {roles?.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Badge>{member.role.name}</Badge>
                  )}
                  {canRemove && !isOwner && (
                    <button
                      title="Remove member"
                      aria-label="Remove member"
                      onClick={() =>
                        removeMember.mutate(member.userId, {
                          onError: (err) =>
                            toast.error(getApiErrorMessage(err, 'Could not remove member')),
                        })
                      }
                      className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <X className="h-4 w-4" strokeWidth={2} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {pendingInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending invitations</CardTitle>
            <CardDescription>{pendingInvitations.length} awaiting response</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100 p-0">
            {pendingInvitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Mail className="h-4 w-4" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{invitation.email}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-slate-500">
                    <Clock className="h-3 w-3" strokeWidth={2} />
                    Invited as {invitation.role.name}
                  </p>
                </div>
                {canInvite && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => revokeInvitation.mutate(invitation.id)}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {teamId && (
        <InviteMemberDialog
          teamId={teamId}
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
        />
      )}
    </div>
  );
}
