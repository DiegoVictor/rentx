import { Router } from 'express';

import SendForgotPasswordMailController from '@modules/accounts/useCases/sendForgotPasswordMail/SendForgotPasswordMailController';
const app = Router();

const sendForgotPasswordMailController = new SendForgotPasswordMailController();
app.post('/forgot', sendForgotPasswordMailController.handle);

export default app;
