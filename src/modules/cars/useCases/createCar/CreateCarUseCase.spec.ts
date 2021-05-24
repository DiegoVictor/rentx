import Car from '@modules/cars/infra/typeorm/entities/Car';
import CarsRepositoryInMemory from '@modules/cars/repositories/in-memory/CarsRepositoryInMemory';
import AppError from '@shared/errors/AppError';
import CreateCarUseCase from './CreateCarUseCase';
import factory from '../../../../../tests/utils/factory';

describe('Create Car', () => {
  let createCarUseCase: CreateCarUseCase;
  let carsRepositoryInMemory: CarsRepositoryInMemory;

  beforeEach(() => {
    carsRepositoryInMemory = new CarsRepositoryInMemory();
    createCarUseCase = new CreateCarUseCase(carsRepositoryInMemory);
  });

  it('should be able to create a new car', async () => {
    const {
      name,
      description,
      daily_rate,
      license_plate,
      fine_amount,
      brand,
      category_id,
    } = await factory.attrs<Car>('Car');
    const car = await createCarUseCase.execute({
      name,
      description,
      daily_rate,
      license_plate,
      fine_amount,
      brand,
      category_id,
    });

    expect(car).toHaveProperty('id');
  });

  it('should not be able to create a car with duplicated license plate', async () => {
    const {
      name,
      description,
      daily_rate,
      license_plate,
      fine_amount,
      brand,
      category_id,
    } = await factory.attrs<Car>('Car');
    const car = {
      name,
      description,
      daily_rate,
      license_plate,
      fine_amount,
      brand,
      category_id,
    };

    await createCarUseCase.execute(car);

    await expect(createCarUseCase.execute(car)).rejects.toEqual(
      new AppError('Car already exists', 340)
    );
  });
});
