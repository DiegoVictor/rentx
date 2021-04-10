import { Router } from 'express';
import CreateCategoryController from '@modules/cars/useCases/createCategory/CreateCategoryController';
import ListCategoriesController from '@modules/cars/useCases/listCategories/ListCategoriesController';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';
import ensureAdmin from '../middlewares/ensureAdmin';
const app = Router();
const createCategoryController = new CreateCategoryController();
const listCategoriesController = new ListCategoriesController();

app.get('/', listCategoriesController.handle);
app.post(
  '/',
  ensureAuthenticated,
  ensureAdmin,
  createCategoryController.handle
);

export default app;
