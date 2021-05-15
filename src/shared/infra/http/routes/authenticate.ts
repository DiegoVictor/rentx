import { Router } from 'express';

import AuthenticateUserController from '@modules/accounts/useCases/authenticateUser/AuthenticateUserController';
import RefreshTokenController from '@modules/accounts/useCases/refreshToken/RefreshTokenController';
import { emailAndPasswordValidator } from '../validators/emailAndPasswordValidator';
import { refreshTokenValidator } from '../validators/refreshTokenValidator';

const app = Router();

const authenticateUserController = new AuthenticateUserController();
const refreshTokenController = new RefreshTokenController();

app.post(
  '/sessions',
  emailAndPasswordValidator,
  authenticateUserController.handle
);
app.post(
  '/refresh_token',
  refreshTokenValidator,
  refreshTokenController.handle
);

export default app;
