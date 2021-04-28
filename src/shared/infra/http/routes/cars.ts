import { Router } from 'express';
import multer from 'multer';

import uploadConfig from '@config/upload';
import CreateCarController from '@modules/cars/useCases/createCar/CreateCarController';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';
import ensureAdmin from '../middlewares/ensureAdmin';
import ListAvailableCarsController from '@modules/cars/useCases/listAvailableCars/ListAvailableCarsController';
import CreateCarSpecificationController from '@modules/cars/useCases/createCarSpecification/CreateCarSpecificationController';
import UploadCarImagesController from '@modules/cars/useCases/uploadCarImages/UploadCarImagesController';

const app = Router();
const uploadCarImage = multer(uploadConfig);

const createCarController = new CreateCarController();
const listAvailableCarsController = new ListAvailableCarsController();
const createCarSpecificationController = new CreateCarSpecificationController();
const uploadCarImagesController = new UploadCarImagesController();

app.post('/', ensureAuthenticated, ensureAdmin, createCarController.handle);
app.post(
  '/:id/specifications',
  ensureAuthenticated,
  ensureAdmin,
  createCarSpecificationController.handle
);

app.post(
  '/:id/images',
  ensureAuthenticated,
  ensureAdmin,
  uploadCarImage.array('car_images'),
  uploadCarImagesController.handle
);
app.get('/availables', listAvailableCarsController.handle);

export default app;
