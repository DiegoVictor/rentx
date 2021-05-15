import { Router } from 'express';
import multer from 'multer';

import CreateCategoryController from '@modules/cars/useCases/createCategory/CreateCategoryController';
import ImportCategoryController from '@modules/cars/useCases/importCategory/ImportCategoryController';
import ListCategoriesController from '@modules/cars/useCases/listCategories/ListCategoriesController';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';
import ensureAdmin from '../middlewares/ensureAdmin';
import { nameAndDescriptionValidator } from '../validators/nameAndDescriptionValidator';
import { fileUploadValidator } from '../validators/fileUploadValidator';

const app = Router();
const upload = multer({
  dest: './tmp',
});

const createCategoryController = new CreateCategoryController();
const importCategoryController = new ImportCategoryController();
const listCategoriesController = new ListCategoriesController();

app.get('/', listCategoriesController.handle);
app.post(
  '/',
  ensureAuthenticated,
  ensureAdmin,
  nameAndDescriptionValidator,
  createCategoryController.handle
);

app.post(
  '/import',
  ensureAuthenticated,
  ensureAdmin,
  upload.single('file'),
  fileUploadValidator('file'),
  importCategoryController.handle
);

export default app;
