import { Router } from 'express';
import CreateCarController from '@modules/cars/useCases/createCar/CreateCarController';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';
import ensureAdmin from '../middlewares/ensureAdmin';
import ListAvailableCarsController from '@modules/cars/useCases/listAvailableCars/ListAvailableCarsController';
import CreateCarSpecificationController from '@modules/cars/useCases/createCarSpecification/CreateCarSpecificationController';

const app = Router();
const listAvailableCarsController = new ListAvailableCarsController();
const createCarSpecificationController = new CreateCarSpecificationController();
app.post('/', ensureAuthenticated, ensureAdmin, createCarController.handle);
app.post(
  '/:id/specifications',
  ensureAuthenticated,
  ensureAdmin,
  createCarSpecificationController.handle
);

app.get('/availables', listAvailableCarsController.handle);

export default app;
