import { useParams } from 'react-router-dom';
import { Activity as ActivityIcon } from 'lucide-react';
import { useActivity } from '../../hooks/useTeamQueries';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { relativeTime } from '../../lib/relativeTime';
import { describeActivity } from './activity-helpers';

export function ActivityPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useActivity(teamId);

  const entries = data?.pages.flatMap((page) => page.entries) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Activity</h1>
        <p className="mt-1 text-sm text-slate-500">
          A timeline of what&apos;s happened in this team.
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {!isLoading && entries.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
              <ActivityIcon className="h-6 w-6" strokeWidth={2} />
            </div>
            <p className="text-sm text-slate-500">No activity recorded yet.</p>
          </CardContent>
        </Card>
      )}

      {entries.length > 0 && (
        <Card>
          <CardContent className="py-5">
            <ol>
              {entries.map((entry, index) => {
                const { icon: Icon, message } = describeActivity(entry);
                const isLast = index === entries.length - 1;
                return (
                  <li key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                        <Icon className="h-4 w-4" strokeWidth={2} />
                      </div>
                      {!isLast && <div className="w-px flex-1 bg-slate-200" />}
                    </div>
                    <div className={isLast ? 'pb-0' : 'pb-6'}>
                      <p className="pt-1 text-sm text-slate-700">
                        <span className="font-medium text-slate-900">
                          {entry.actor?.name ?? 'System'}
                        </span>{' '}
                        {message}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {relativeTime(entry.createdAt)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            {hasNextPage && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fetchNextPage()}
                  isLoading={isFetchingNextPage}
                >
                  Load more
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
