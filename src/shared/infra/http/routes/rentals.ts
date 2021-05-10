import { Router } from 'express';

import CreateRentalController from '@modules/rentals/useCases/createRental/CreateRentalController';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const app = Router();

const createRentalController = new CreateRentalController();
app.post('/', ensureAuthenticated, createRentalController.handle);

export default app;
