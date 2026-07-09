import { useState } from 'react';
import { Building2, Plus } from 'lucide-react';
import { useAuthStore } from '../../stores/auth-store';
import { useMyTeams } from '../../hooks/useTeamQueries';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { CreateTeamDialog } from './CreateTeamDialog';
import { TeamCard } from './TeamCard';

export function TeamsPage() {
  const user = useAuthStore((s) => s.user);
  const { data: teams, isLoading } = useMyTeams();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Teams</h1>
          <p className="mt-1 text-sm text-slate-500">Teams you own or are a member of.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          New team
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {!isLoading && teams?.length === 0 && (
        <Card className="mt-6 border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
              <Building2 className="h-6 w-6" strokeWidth={2} />
            </div>
            <div>
              <p className="font-medium text-slate-900">You don&apos;t belong to any team yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Create one to start inviting teammates and managing access.
              </p>
            </div>
            <Button className="mt-2" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Create a team
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && teams && teams.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} isOwner={team.ownerId === user?.id} />
          ))}
        </div>
      )}

      <CreateTeamDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
