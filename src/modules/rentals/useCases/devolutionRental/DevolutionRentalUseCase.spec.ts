import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import faker from 'faker';

import RentalsRepositoryInMemory from '@modules/rentals/repositories/in-memory/RentalsRepositoryInMemory';
import DayjsDateProvider from '@shared/container/providers/DateProvider/implementations/DayjsDateProvider';
import CarsRepositoryInMemory from '@modules/cars/repositories/in-memory/CarsRepositoryInMemory';
import DevolutionRentalUseCase from './DevolutionRentalUseCase';
import AppError from '@shared/errors/AppError';
import Car from '@modules/cars/infra/typeorm/entities/Car';
import Rental from '@modules/rentals/infra/typeorm/entities/Rental';
import factory from '../../../../../tests/utils/factory';

dayjs.extend(utc);

describe('Devolution Rental', () => {
  let devolutionRentalUseCase: DevolutionRentalUseCase;
  let rentalsRepositoryInMemory: RentalsRepositoryInMemory;
  let carsRepositoryInMemory: CarsRepositoryInMemory;
  let dayjsDateProvider: DayjsDateProvider;

  beforeEach(() => {
    dayjsDateProvider = new DayjsDateProvider();
    rentalsRepositoryInMemory = new RentalsRepositoryInMemory();
    carsRepositoryInMemory = new CarsRepositoryInMemory();
    devolutionRentalUseCase = new DevolutionRentalUseCase(
      rentalsRepositoryInMemory,
      carsRepositoryInMemory,
      dayjsDateProvider
    );
  });

  it('should be able to give back a rental before 24 hours', async () => {
    const {
      brand,
      daily_rate,
      description,
      fine_amount,
      license_plate,
      name,
      category_id,
    } = await factory.attrs<Car>('Car');
    const car = await carsRepositoryInMemory.create({
      brand,
      category_id,
      daily_rate,
      description,
      fine_amount,
      license_plate,
      name,
    });

    const {
      user_id,
      car_id,
      expected_return_date,
    } = await factory.attrs<Rental>('Rental', {
      car_id: car.id,
      expected_return_date: dayjs().add(25, 'hours').utc().local().toDate(),
    });
    const rental = await rentalsRepositoryInMemory.create({
      user_id,
      car_id,
      expected_return_date,
    });

    const devolution = await devolutionRentalUseCase.execute({ id: rental.id });

    expect(devolution).toMatchObject(rental);
  });

  it('should be able to give back a rental after 24 hours', async () => {
    const {
      brand,
      daily_rate,
      description,
      fine_amount,
      license_plate,
      name,
      category_id,
    } = await factory.attrs<Car>('Car');
    const car = await carsRepositoryInMemory.create({
      brand,
      category_id,
      daily_rate,
      description,
      fine_amount,
      license_plate,
      name,
    });

    const {
      user_id,
      car_id,
      expected_return_date,
    } = await factory.attrs<Rental>('Rental', {
      car_id: car.id,
      expected_return_date: dayjs().add(25, 'hours').utc().local().toDate(),
    });
    const rental = await rentalsRepositoryInMemory.create({
      user_id,
      car_id,
      expected_return_date,
    });

    const devolution = await devolutionRentalUseCase.execute({ id: rental.id });

    expect(devolution).toMatchObject(rental);
  });

  it('should be able to give back a rental before expected', async () => {
    const {
      brand,
      daily_rate,
      description,
      fine_amount,
      license_plate,
      name,
      category_id,
    } = await factory.attrs<Car>('Car');
    const car = await carsRepositoryInMemory.create({
      brand,
      category_id,
      daily_rate,
      description,
      fine_amount,
      license_plate,
      name,
    });

    const {
      user_id,
      car_id,
      expected_return_date,
    } = await factory.attrs<Rental>('Rental', {
      car_id: car.id,
      expected_return_date: dayjs()
        .subtract(25, 'hours')
        .utc()
        .local()
        .toDate(),
    });
    const rental = await rentalsRepositoryInMemory.create({
      user_id,
      car_id,
      expected_return_date,
    });

    const devolution = await devolutionRentalUseCase.execute({ id: rental.id });

    expect(devolution).toMatchObject(rental);
  });

  it('should not be able to give back a non existing rental', async () => {
    await expect(
      devolutionRentalUseCase.execute({
        id: faker.datatype.uuid(),
      })
    ).rejects.toEqual(new AppError('Rental does not exists', 644));
  });
});
