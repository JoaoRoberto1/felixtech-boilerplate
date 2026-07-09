import { Link, useNavigate } from 'react-router-dom';
import { Building2, Users2, Crown, ArrowRight, Plus } from 'lucide-react';
import { useAuthStore } from '../../stores/auth-store';
import { useMyTeams } from '../../hooks/useTeamQueries';
import { Card, CardContent } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { StatTile } from '../../components/ui/StatTile';

function teamInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: teams, isLoading } = useMyTeams();
  const navigate = useNavigate();

  const totalMembers = teams?.reduce((sum, t) => sum + (t.memberCount ?? 0), 0) ?? 0;
  const ownedCount = teams?.filter((t) => t.ownerId === user?.id).length ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s what&apos;s happening across your teams.
          </p>
        </div>
        <Button onClick={() => navigate('/teams')}>
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          New team
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {!isLoading && teams && teams.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatTile label="Teams" value={teams.length} icon={Building2} />
          <StatTile label="Total members" value={totalMembers} icon={Users2} />
          <StatTile label="Teams you own" value={ownedCount} icon={Crown} />
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
            <Button className="mt-2" onClick={() => navigate('/teams')}>
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Create a team
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && teams && teams.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Your teams
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {teams.map((team) => (
              <Link key={team.id} to={`/teams/${team.id}`}>
                <Card className="group h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <CardContent className="flex items-center gap-4 py-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-base font-bold text-white">
                      {teamInitial(team.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">{team.name}</p>
                      <p className="mt-0.5 truncate text-sm text-slate-500">
                        {team.myRole?.name} · {team.memberCount ?? 0} member
                        {team.memberCount === 1 ? '' : 's'}
                      </p>
                    </div>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600"
                      strokeWidth={2}
                    />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
