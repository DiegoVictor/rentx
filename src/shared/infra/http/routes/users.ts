import { Router } from 'express';
import CreateUserController from '@modules/accounts/useCases/createUser/CreateUserController';
const app = Router();
const createUserController = new CreateUserController();
app.post('/', createUserController.handle);
export default app;
