import CarsRepositoryInMemory from '@modules/cars/repositories/in-memory/CarsRepositoryInMemory';
import AppError from '@shared/errors/AppError';
import CreateCarUseCase from './CreateCarUseCase';

describe('Create Car', () => {
  let createCarUseCase: CreateCarUseCase;
  let carsRepositoryInMemory: CarsRepositoryInMemory;

  beforeEach(() => {
    carsRepositoryInMemory = new CarsRepositoryInMemory();
    createCarUseCase = new CreateCarUseCase(carsRepositoryInMemory);
  });

  it('should be able to create a new car', async () => {
    const car = await createCarUseCase.execute({
      name: 'Car',
      description: 'Lorem Ipsum',
      daily_rate: 100,
      license_plate: 'XYZ1234',
      fine_amount: 60,
      brand: 'Brand',
      category_id: 'category_id',
    });

    expect(car).toHaveProperty('id');
  });

  it('should not be able to create a car with duplicated license plate', async () => {
    const car = {
      name: 'Car',
      description: 'Lorem Ipsum',
      daily_rate: 100,
      license_plate: 'XYZ1234',
      fine_amount: 60,
      brand: 'Brand',
      category_id: 'category_id',
    };

    await createCarUseCase.execute(car);

    await expect(createCarUseCase.execute(car)).rejects.toEqual(
      new AppError('Car already exists', 340)
    );
  });

  it('should be able to create a new car', async () => {
    const car = await createCarUseCase.execute({
      name: 'Car',
      description: 'Lorem Ipsum',
      daily_rate: 100,
      license_plate: 'XYZ1234',
      fine_amount: 60,
      brand: 'Brand',
      category_id: 'category_id',
    });

    expect(car.available).toBeTruthy();
  });
});
