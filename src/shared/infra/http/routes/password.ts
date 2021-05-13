import { Router } from 'express';

import SendForgotPasswordMailController from '@modules/accounts/useCases/sendForgotPasswordMail/SendForgotPasswordMailController';
import ResetUserPasswordController from '@modules/accounts/useCases/resetUserPassword/ResetUserPasswordController';
const app = Router();

const sendForgotPasswordMailController = new SendForgotPasswordMailController();
const resetUserPasswordController = new ResetUserPasswordController();

app.post('/reset', resetUserPasswordController.handle);

export default app;
