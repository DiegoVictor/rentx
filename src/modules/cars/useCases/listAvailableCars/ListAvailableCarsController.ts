import { Request, Response } from 'express';
import { container } from 'tsyringe';

import ListAvailableCarsUseCase from './ListAvailableCarsUseCase';

interface CustomQueryParams {
  query: {
    brand: string;
    name: string;
    category_id: string;
  };
}

class ListAvailableCarsController {
  async handle(
    request: Request & CustomQueryParams,
    response: Response
  ): Promise<Response> {
    const { brand, name, category_id } = request.query;
    const listAvailableUseCase = container.resolve(ListAvailableCarsUseCase);

    const cars = await listAvailableUseCase.execute({
      brand,
      name,
      category_id,
    });

    return response.json(cars);
  }
}

export default ListAvailableCarsController;
