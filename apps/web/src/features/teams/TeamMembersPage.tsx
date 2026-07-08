import { useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
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
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
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

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Members</h1>
          <p className="mt-1 text-sm text-slate-500">Manage who has access to this team.</p>
        </div>
        {canInvite && <Button onClick={() => setInviteOpen(true)}>Invite member</Button>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team members</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-slate-100 p-0">
          {members?.map((member) => (
            <div key={member.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{member.user.name}</p>
                <p className="text-xs text-slate-500">{member.user.email}</p>
              </div>
              <div className="flex items-center gap-3">
                {canUpdateRole && member.userId !== team?.ownerId ? (
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
                    className="rounded-md border border-slate-300 px-2 py-1 text-sm"
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
                {canRemove && member.userId !== team?.ownerId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      removeMember.mutate(member.userId, {
                        onError: (err) =>
                          toast.error(getApiErrorMessage(err, 'Could not remove member')),
                      })
                    }
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {invitations && invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending invitations</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100 p-0">
            {invitations
              .filter((inv) => inv.status === 'PENDING')
              .map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{invitation.email}</p>
                    <p className="text-xs text-slate-500">Invited as {invitation.role.name}</p>
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
