import type { Request, Response } from 'express';
import * as activityService from './activity.service.js';
import { toActivityLogDto } from './activity.mappers.js';

export async function listActivity(req: Request, res: Response): Promise<void> {
  const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
  const { entries, nextCursor } = await activityService.listActivity(req.params.teamId!, cursor);
  res.json({ entries: entries.map(toActivityLogDto), nextCursor });
}
