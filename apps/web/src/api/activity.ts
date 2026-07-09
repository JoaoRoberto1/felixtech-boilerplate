import type { ActivityLogDto } from '@felix/shared';
import { apiClient } from './client';

interface ActivityPage {
  entries: ActivityLogDto[];
  nextCursor: string | null;
}

export async function listActivity(teamId: string, cursor?: string): Promise<ActivityPage> {
  const { data } = await apiClient.get<ActivityPage>(`/teams/${teamId}/activity`, {
    params: cursor ? { cursor } : undefined,
  });
  return data;
}
