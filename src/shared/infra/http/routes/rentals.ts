import { Router } from 'express';

import CreateRentalController from '@modules/rentals/useCases/createRental/CreateRentalController';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';
import ListRentalsByUserController from '@modules/rentals/useCases/listByUser/ListRentalsByUserController';

const app = Router();

const listRentalsByUserController = new ListRentalsByUserController();
const createRentalController = new CreateRentalController();

app.get('/user', ensureAuthenticated, listRentalsByUserController.handle);
app.post('/', ensureAuthenticated, createRentalController.handle);

export default app;
