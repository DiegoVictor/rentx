import CarsRepositoryInMemory from '@modules/cars/repositories/in-memory/CarsRepositoryInMemory';
import ListAvailableCarsUseCase from './ListAvailableCarsUseCase';

describe('List Available Cars', () => {
  let listAvailableCarsUseCase: ListAvailableCarsUseCase;
  let carsRepositoryInMemory: CarsRepositoryInMemory;

  beforeEach(() => {
    carsRepositoryInMemory = new CarsRepositoryInMemory();
    listAvailableCarsUseCase = new ListAvailableCarsUseCase(
      carsRepositoryInMemory
    );
  });

  it('should be able to list all available cars', async () => {
    const car = await carsRepositoryInMemory.create({
      name: 'Car Name',
      description: 'Lorem Ipsum Dolor Sit Amet',
      daily_rate: 140.0,
      license_plate: 'XYZ1234',
      fine_amount: 100,
      brand: 'Brand',
      category_id: 'category_id',
    });

    const cars = await listAvailableCarsUseCase.execute();
    expect(cars).toContainEqual(car);
  });

  it('should be able to list all available cars by brand', async () => {
    const brand = 'Brand';
    const car = await carsRepositoryInMemory.create({
      name: 'Car Name',
      description: 'Lorem Ipsum Dolor Sit Amet',
      daily_rate: 140.0,
      license_plate: 'XYZ1234',
      fine_amount: 100,
      brand,
      category_id: 'category_id',
    });

    const cars = await listAvailableCarsUseCase.execute({ brand });
    expect(cars).toContainEqual(car);
  });

  it('should be able to list all available cars by name', async () => {
    const name = 'Car Name';
    const car = await carsRepositoryInMemory.create({
      name,
      description: 'Lorem Ipsum Dolor Sit Amet',
      daily_rate: 140.0,
      license_plate: 'XYZ1234',
      fine_amount: 100,
      brand: 'Brand',
      category_id: 'category_id',
    });

    const cars = await listAvailableCarsUseCase.execute({ name });
    expect(cars).toContainEqual(car);
  });

  it('should be able to list all available cars by category', async () => {
    const category_id = 'category_id';
    const car = await carsRepositoryInMemory.create({
      name: 'Car Name',
      description: 'Lorem Ipsum Dolor Sit Amet',
      daily_rate: 140.0,
      license_plate: 'XYZ1234',
      fine_amount: 100,
      brand: 'Brand',
      category_id,
    });

    const cars = await listAvailableCarsUseCase.execute({ category_id });
    expect(cars).toContainEqual(car);
  });
});
