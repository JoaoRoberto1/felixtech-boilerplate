import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyTeams } from '../../hooks/useTeamQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { CreateTeamDialog } from './CreateTeamDialog';

export function TeamsPage() {
  const { data: teams, isLoading } = useMyTeams();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Teams</h1>
          <p className="mt-1 text-sm text-slate-500">Teams you own or are a member of.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>New team</Button>
      </div>

      <div className="mt-6">
        {isLoading && <Spinner />}

        <div className="grid gap-4 sm:grid-cols-2">
          {teams?.map((team) => (
            <Link key={team.id} to={`/teams/${team.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle>{team.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-500">
                  {team.myRole?.name} · {team.memberCount ?? '—'} member
                  {team.memberCount === 1 ? '' : 's'}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <CreateTeamDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
