import { inject, injectable } from 'tsyringe';

import Car from '@modules/cars/infra/typeorm/entities/Car';
import ICarsRepository from '@modules/cars/repositories/contracts/ICarsRepository';
import { ISpecificationsRepository } from '@modules/cars/repositories/contracts/ISpecificationsRepository';
import AppError from '@shared/errors/AppError';

interface IRequest {
  car_id: string;
  specifications_id: string[];
}

@injectable()
class CreateCarSpecificationUseCase {
  constructor(
    @inject('CarsRepository')
    private carsRepository: ICarsRepository,

    @inject('SpecificationsRepository')
    private specificationsRepository: ISpecificationsRepository
  ) {}

  async execute({ car_id, specifications_id }: IRequest): Promise<Car> {
    const car = await this.carsRepository.findById(car_id);
    if (!car) {
      throw new AppError('Car does not exists', 344);
    }

    const specifications = await this.specificationsRepository.findByIds(
      specifications_id
    );
    car.specifications = specifications;

    await this.carsRepository.create(car);

    return car;
  }
}

export default CreateCarSpecificationUseCase;
