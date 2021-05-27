import faker from 'faker';

import CarsRepositoryInMemory from '@modules/cars/repositories/in-memory/CarsRepositoryInMemory';
import SpecificationsRepositoryInMemory from '@modules/cars/repositories/in-memory/SpecificationsRepositoryInMemory';
import AppError from '@shared/errors/AppError';
import CreateCarSpecificationUseCase from './CreateCarSpecificationUseCase';
import factory from '../../../../../tests/utils/factory';
import Car from '@modules/cars/infra/typeorm/entities/Car';
import Specification from '@modules/cars/infra/typeorm/entities/Specification';

describe('Create Car Specification', () => {
  let createCarSpecificationUseCase: CreateCarSpecificationUseCase;
  let carsRepositoryInMemory: CarsRepositoryInMemory;
  let specificationsRepositoryInMemory: SpecificationsRepositoryInMemory;

  beforeEach(() => {
    carsRepositoryInMemory = new CarsRepositoryInMemory();
    specificationsRepositoryInMemory = new SpecificationsRepositoryInMemory();
    createCarSpecificationUseCase = new CreateCarSpecificationUseCase(
      carsRepositoryInMemory,
      specificationsRepositoryInMemory
    );
  });

  it('should be able to add a new specification to a car', async () => {
    const {
      name,
      description,
      daily_rate,
      license_plate,
      fine_amount,
      brand,
      category_id,
    } = await factory.attrs<Car>('Car');
    const car = await carsRepositoryInMemory.create({
      name,
      description,
      daily_rate,
      license_plate,
      fine_amount,
      brand,
      category_id,
    });

    const specification = await specificationsRepositoryInMemory.create(
      await factory.attrs<Specification>('Specification')
    );
    const specifications_id = [specification.id];

    const carWithSpecifications = await createCarSpecificationUseCase.execute({
      car_id: car.id,
      specifications_id,
    });

    expect(carWithSpecifications).toHaveProperty('specifications');
    expect(carWithSpecifications.specifications.length).toBe(1);
    expect(carWithSpecifications.specifications).toContainEqual(specification);
  });

  it('should not be able to add a new specification to a non existing car', async () => {
    const car_id = faker.datatype.uuid();
    const specifications_id = [faker.datatype.uuid()];

    await expect(
      createCarSpecificationUseCase.execute({
        car_id,
        specifications_id,
      })
    ).rejects.toEqual(new AppError('Car does not exists', 344));
  });
});
