import { Router } from 'express';
import { updateProfileSchema, changePasswordSchema } from '@felix/shared';
import { requireAuth } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as controller from './user.controller.js';

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get('/me', asyncHandler(controller.getMe));
userRouter.patch(
  '/me',
  validate({ body: updateProfileSchema }),
  asyncHandler(controller.updateProfile),
);
userRouter.post(
  '/me/change-password',
  validate({ body: changePasswordSchema }),
  asyncHandler(controller.changePassword),
);
