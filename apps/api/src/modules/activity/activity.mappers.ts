import type { Prisma } from '@prisma/client';
import type { ActivityLogDto } from '@felix/shared';

type ActivityLogWithActor = Prisma.ActivityLogGetPayload<{ include: { actor: true } }>;

export function toActivityLogDto(entry: ActivityLogWithActor): ActivityLogDto {
  return {
    id: entry.id,
    teamId: entry.teamId,
    actor: entry.actor
      ? {
          id: entry.actor.id,
          name: entry.actor.name,
          email: entry.actor.email,
          avatarUrl: entry.actor.avatarUrl,
        }
      : null,
    action: entry.action,
    metadata: (entry.metadata as ActivityLogDto['metadata']) ?? null,
    createdAt: entry.createdAt.toISOString(),
  };
}
