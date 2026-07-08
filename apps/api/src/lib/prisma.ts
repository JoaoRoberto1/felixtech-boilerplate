import { PrismaClient } from '@prisma/client';
import { isProduction } from '../config/env.js';

declare global {
  var __prisma__: PrismaClient | undefined;
}

/**
 * Reuse a single PrismaClient across hot reloads in dev (tsx watch) to avoid
 * exhausting the Postgres connection pool with each restart.
 */
export const prisma =
  globalThis.__prisma__ ??
  new PrismaClient({
    log: isProduction ? ['error', 'warn'] : ['error', 'warn'],
  });

if (!isProduction) {
  globalThis.__prisma__ = prisma;
}
