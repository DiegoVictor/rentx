import CarsRepositoryInMemory from '@modules/cars/repositories/in-memory/CarsRepositoryInMemory';
import SpecificationsRepositoryInMemory from '@modules/cars/repositories/in-memory/SpecificationsRepositoryInMemory';
import AppError from '@shared/errors/AppError';
import CreateCarSpecificationUseCase from './CreateCarSpecificationUseCase';

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
    const car = await carsRepositoryInMemory.create({
      name: 'Car',
      description: 'Lorem Ipsum',
      daily_rate: 100,
      license_plate: 'XYZ1234',
      fine_amount: 60,
      brand: 'Brand',
      category_id: 'category_id',
    });
    const specification = await specificationsRepositoryInMemory.create({
      name: 'Specification',
      description: 'Lorem Ipsum Dolor Sit Amet',
    });
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
    const car_id = '1';
    const specifications_id = ['1'];

    await expect(
      createCarSpecificationUseCase.execute({
        car_id,
        specifications_id,
      })
    ).rejects.toEqual(new AppError('Car does not exists'));
  });
});
