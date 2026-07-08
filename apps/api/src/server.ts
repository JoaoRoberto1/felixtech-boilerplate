import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Felix API listening on ${env.API_URL} (${env.NODE_ENV})`);
});

function shutdown(signal: string): void {
  logger.info(`${signal} received, shutting down gracefully`);
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
