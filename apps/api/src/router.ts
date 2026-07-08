import { Router } from 'express';
import { authRouter } from './modules/auth/auth.routes.js';
import { userRouter } from './modules/users/user.routes.js';
import { teamRouter } from './modules/teams/team.routes.js';
import { invitationAcceptRouter } from './modules/invitations/invitation.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/teams', teamRouter);
apiRouter.use('/invitations', invitationAcceptRouter);
