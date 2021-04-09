import { Router } from 'express';
import CreateCategoryController from '@modules/cars/useCases/createCategory/CreateCategoryController';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';
import ensureAdmin from '../middlewares/ensureAdmin';
const app = Router();
const createCategoryController = new CreateCategoryController();
app.post(
  '/',
  ensureAuthenticated,
  ensureAdmin,
  createCategoryController.handle
);

export default app;
