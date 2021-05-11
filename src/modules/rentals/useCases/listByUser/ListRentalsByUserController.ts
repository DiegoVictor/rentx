import { Request, Response } from 'express';
import { container } from 'tsyringe';

import ListRentalsByUserUseCase from './ListRentalsByUserUseCase';

class ListRentalsByUserController {
  async handle(request: Request, response: Response) {
    const { id } = request.user;

    const listRentalsByUseUseCase = container.resolve(ListRentalsByUserUseCase);
    const rentals = await listRentalsByUseUseCase.execute(id);

    return response.json(rentals);
  }
}

export default ListRentalsByUserController;
