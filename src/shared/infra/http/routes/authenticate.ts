import { Router } from 'express';

import AuthenticateUserController from '@modules/accounts/useCases/authenticateUser/AuthenticateUserController';
import RefreshTokenController from '@modules/accounts/useCases/refreshToken/RefreshTokenController';

const app = Router();

const authenticateUserController = new AuthenticateUserController();
const refreshTokenController = new RefreshTokenController();

app.post('/sessions', authenticateUserController.handle);
app.post('/refresh_token', refreshTokenController.handle);

export default app;
