import { Router } from 'express';
import multer from 'multer';
import CreateUserController from '@modules/accounts/useCases/createUser/CreateUserController';
import uploadConfig from '@config/upload';
const app = Router();
const uploadAvatar = multer(uploadConfig.upload('./tmp/avatar'));

const createUserController = new CreateUserController();
app.post('/', createUserController.handle);
export default app;
