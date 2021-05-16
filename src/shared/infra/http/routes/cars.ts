import { Router } from 'express';
import multer from 'multer';

import uploadConfig from '@config/upload';
import CreateCarController from '@modules/cars/useCases/createCar/CreateCarController';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';
import ensureAdmin from '../middlewares/ensureAdmin';
import ListAvailableCarsController from '@modules/cars/useCases/listAvailableCars/ListAvailableCarsController';
import CreateCarSpecificationController from '@modules/cars/useCases/createCarSpecification/CreateCarSpecificationController';
import UploadCarImagesController from '@modules/cars/useCases/uploadCarImages/UploadCarImagesController';
import { idValidator } from '../validators/idValidator';
import { specificationsIdValidator } from '../validators/specificationsIdValidator';
import { brandNameAndCategoryIdValidator } from '../validators/brandNameAndCategoryIdValidator';
import { fileUploadValidator } from '../validators/fileUploadValidator';

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
  idValidator,
  specificationsIdValidator,
  createCarSpecificationController.handle
);

app.post(
  '/:id/images',
  ensureAuthenticated,
  ensureAdmin,
  idValidator,
  uploadCarImage.array('car_images'),
  fileUploadValidator('car_images', true),
  uploadCarImagesController.handle
);
app.get(
  '/availables',
  brandNameAndCategoryIdValidator,
  listAvailableCarsController.handle
);

export default app;
