import type { ActivityAction } from '@felix/shared';
import { prisma } from '../../lib/prisma.js';
import { logger } from '../../lib/logger.js';

interface LogActivityInput {
  teamId: string;
  actorId?: string | null;
  action: ActivityAction;
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Audit logging is best-effort: a failure here must never break the request
 * that triggered it, so errors are swallowed and reported to the app logger
 * instead of propagated.
 */
export async function logActivity({
  teamId,
  actorId,
  action,
  metadata,
}: LogActivityInput): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: { teamId, actorId: actorId ?? null, action, metadata: metadata ?? undefined },
    });
  } catch (err) {
    logger.warn({ err, teamId, action }, 'Failed to record activity log entry');
  }
}

const PAGE_SIZE = 30;

export async function listActivity(teamId: string, cursor?: string) {
  const entries = await prisma.activityLog.findMany({
    where: { teamId },
    include: { actor: true },
    orderBy: { createdAt: 'desc' },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = entries.length > PAGE_SIZE;
  const page = hasMore ? entries.slice(0, PAGE_SIZE) : entries;

  return { entries: page, nextCursor: hasMore ? page[page.length - 1]!.id : null };
}
