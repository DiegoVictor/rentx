import { Router } from 'express';

import AuthenticateUserController from '@modules/accounts/useCases/authenticateUser/AuthenticateUserController';
const app = Router();

const authenticateUserController = new AuthenticateUserController();
app.post('/sessions', authenticateUserController.handle);
export default app;
