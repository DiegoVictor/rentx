import { Router } from 'express';

import CreateRentalController from '@modules/rentals/useCases/createRental/CreateRentalController';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';
import DevolutionRentalController from '@modules/rentals/useCases/devolutionRental/DevolutionRentalController';
import ListRentalsByUserController from '@modules/rentals/useCases/listByUser/ListRentalsByUserController';

const app = Router();

const listRentalsByUserController = new ListRentalsByUserController();
const createRentalController = new CreateRentalController();
const devolutionRentalController = new DevolutionRentalController();

app.get('/user', ensureAuthenticated, listRentalsByUserController.handle);
app.post('/', ensureAuthenticated, createRentalController.handle);
app.post(
  '/:id/devolution',
  ensureAuthenticated,
  devolutionRentalController.handle
);

export default app;
