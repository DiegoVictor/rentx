import { Router } from 'express';
import multer from 'multer';

import CreateUserController from '@modules/accounts/useCases/createUser/CreateUserController';
import UpdateUserAvatarController from '@modules/accounts/useCases/updateUserAvatar/UpdateUserAvatarController';
import uploadConfig from '@config/upload';
import ensureAuthenticated from '@shared/infra/http/middlewares/ensureAuthenticated';
import ProfileUserController from '@modules/accounts/useCases/profileUser/ProfileUserController';
import { nameEmailDriverLicensePasswordValidator } from '../validators/nameEmailDriverLicensePasswordValidator';
import { fileUploadValidator } from '../validators/fileUploadValidator';

const app = Router();
const uploadAvatar = multer(uploadConfig);

const createUserController = new CreateUserController();
const updateUserAvatarController = new UpdateUserAvatarController();
const profileUserController = new ProfileUserController();

app.get('/', ensureAuthenticated, profileUserController.handle);
app.post(
  '/',
  nameEmailDriverLicensePasswordValidator,
  createUserController.handle
);
app.patch(
  '/avatar',
  ensureAuthenticated,
  uploadAvatar.single('avatar'),
  fileUploadValidator('avatar'),
  updateUserAvatarController.handle
);

export default app;
