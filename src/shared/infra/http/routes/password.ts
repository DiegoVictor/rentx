import { Router } from 'express';

import SendForgotPasswordMailController from '@modules/accounts/useCases/sendForgotPasswordMail/SendForgotPasswordMailController';
import ResetUserPasswordController from '@modules/accounts/useCases/resetUserPassword/ResetUserPasswordController';
import { emailValidator } from '../validators/emailValidator';
import { tokenAndPasswordValidator } from '../validators/tokenAndPasswordValidator';

const app = Router();

const sendForgotPasswordMailController = new SendForgotPasswordMailController();
const resetUserPasswordController = new ResetUserPasswordController();

app.post('/forgot', emailValidator, sendForgotPasswordMailController.handle);
app.post(
  '/reset',
  tokenAndPasswordValidator,
  resetUserPasswordController.handle
);

export default app;
