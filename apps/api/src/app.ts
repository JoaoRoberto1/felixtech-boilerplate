import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { apiRouter } from './router.js';
import { stripeWebhookRouter } from './modules/stripe/webhook.routes.js';
import { apiRateLimiter } from './middlewares/rate-limit.js';
import { errorHandler, notFoundHandler } from './middlewares/error-handler.js';

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(pinoHttp({ logger, autoLogging: env.NODE_ENV !== 'test' }));

  // Stripe needs the raw request body to verify webhook signatures, so this
  // must be registered before the JSON body parser below.
  app.use('/api/webhooks/stripe', stripeWebhookRouter);

  app.use(express.json());
  app.use(cookieParser());
  app.use(apiRateLimiter);

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
