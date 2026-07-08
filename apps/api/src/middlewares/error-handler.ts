import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/errors.js';
import { logger } from '../lib/logger.js';
import { isProduction } from '../config/env.js';

export function notFoundHandler(req: Request, res: Response): void {
  res
    .status(404)
    .json({ error: { message: `Route not found: ${req.method} ${req.path}`, code: 'NOT_FOUND' } });
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res
      .status(err.statusCode)
      .json({ error: { message: err.message, code: err.code, details: err.details } });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res
        .status(409)
        .json({ error: { message: 'A record with this value already exists', code: 'CONFLICT' } });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ error: { message: 'Record not found', code: 'NOT_FOUND' } });
      return;
    }
  }

  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');

  res.status(500).json({
    error: {
      message: isProduction ? 'Internal server error' : (err as Error)?.message,
      code: 'INTERNAL_ERROR',
    },
  });
}
