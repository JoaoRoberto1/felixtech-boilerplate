import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth-store';
import { useMyTeams } from '../../hooks/useTeamQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: teams, isLoading } = useMyTeams();
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        Welcome back, {user?.name?.split(' ')[0]}
      </h1>
      <p className="mt-1 text-sm text-slate-500">Here are the teams you belong to.</p>

      <div className="mt-6">
        {isLoading && <Spinner />}

        {!isLoading && teams?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm text-slate-500">You don&apos;t belong to any team yet.</p>
              <Button onClick={() => navigate('/teams')}>Create a team</Button>
            </CardContent>
          </Card>
        )}

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
    </div>
  );
}
