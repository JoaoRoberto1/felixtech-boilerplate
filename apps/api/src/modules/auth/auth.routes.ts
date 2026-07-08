import { Router } from 'express';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '@felix/shared';
import { validate } from '../../middlewares/validate.js';
import { authRateLimiter } from '../../middlewares/rate-limit.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as controller from './auth.controller.js';

export const authRouter = Router();

authRouter.post(
  '/register',
  authRateLimiter,
  validate({ body: registerSchema }),
  asyncHandler(controller.register),
);

authRouter.post(
  '/login',
  authRateLimiter,
  validate({ body: loginSchema }),
  asyncHandler(controller.login),
);

authRouter.post('/refresh', asyncHandler(controller.refresh));

authRouter.post('/logout', asyncHandler(controller.logout));

authRouter.post(
  '/forgot-password',
  authRateLimiter,
  validate({ body: forgotPasswordSchema }),
  asyncHandler(controller.forgotPassword),
);

authRouter.post(
  '/reset-password',
  authRateLimiter,
  validate({ body: resetPasswordSchema }),
  asyncHandler(controller.resetPassword),
);

authRouter.post(
  '/verify-email',
  validate({ body: verifyEmailSchema }),
  asyncHandler(controller.verifyEmail),
);
