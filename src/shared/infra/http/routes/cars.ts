import { Router } from 'express';
import CreateCarController from '@modules/cars/useCases/createCar/CreateCarController';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';
import ensureAdmin from '../middlewares/ensureAdmin';
import ListAvailableCarsController from '@modules/cars/useCases/listAvailableCars/ListAvailableCarsController';

const app = Router();
const listAvailableCarsController = new ListAvailableCarsController();
const createCarController = new CreateCarController();
app.post('/', ensureAuthenticated, ensureAdmin, createCarController.handle);
app.get('/availables', listAvailableCarsController.handle);

export default app;
