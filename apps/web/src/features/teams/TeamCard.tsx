import { Link } from 'react-router-dom';
import { ArrowRight, Crown } from 'lucide-react';
import type { TeamDto } from '@felix/shared';
import { Card, CardContent } from '../../components/ui/Card';

function teamInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export function TeamCard({ team, isOwner }: { team: TeamDto; isOwner?: boolean }) {
  return (
    <Link to={`/teams/${team.id}`}>
      <Card className="group h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
        <CardContent className="flex items-center gap-4 py-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-base font-bold text-white">
            {teamInitial(team.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate font-semibold text-slate-900">{team.name}</p>
              {isOwner && <Crown className="h-3.5 w-3.5 shrink-0 text-amber-500" strokeWidth={2} />}
            </div>
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
  );
}
