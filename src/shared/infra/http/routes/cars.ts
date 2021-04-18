import { Router } from 'express';
import CreateCarController from '@modules/cars/useCases/createCar/CreateCarController';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';
import ensureAdmin from '../middlewares/ensureAdmin';

const app = Router();
const createCarController = new CreateCarController();
app.post('/', ensureAuthenticated, ensureAdmin, createCarController.handle);

export default app;
