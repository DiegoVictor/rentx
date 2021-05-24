import Car from '@modules/cars/infra/typeorm/entities/Car';
import CarsRepositoryInMemory from '@modules/cars/repositories/in-memory/CarsRepositoryInMemory';
import factory from '../../../../../tests/utils/factory';
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

    const cars = await listAvailableCarsUseCase.execute();
    expect(cars).toContainEqual(car);
  });

  it('should be able to list all available cars by brand', async () => {
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

    const cars = await listAvailableCarsUseCase.execute({ brand });
    expect(cars).toContainEqual(car);
  });

  it('should be able to list all available cars by name', async () => {
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

    const cars = await listAvailableCarsUseCase.execute({ name });
    expect(cars).toContainEqual(car);
  });

  it('should be able to list all available cars by category', async () => {
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

    const cars = await listAvailableCarsUseCase.execute({ category_id });
    expect(cars).toContainEqual(car);
  });
});
