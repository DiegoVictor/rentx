import { Router } from 'express';

import ensureAuthenticated from '@shared/infra/http/middlewares/ensureAuthenticated';
import CreateSpecificationController from '@modules/cars/useCases/createSpecification/CreateSpecificationController';
import ensureAdmin from '../middlewares/ensureAdmin';
import { nameAndDescriptionValidator } from '../validators/nameAndDescriptionValidator';

const app = Router();

const createSpecificationController = new CreateSpecificationController();

app.post(
  '/',
  ensureAuthenticated,
  ensureAdmin,
  nameAndDescriptionValidator,
  createSpecificationController.handle
);

export default app;
