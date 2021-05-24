import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import faker from 'faker';

import RentalsRepositoryInMemory from '@modules/rentals/repositories/in-memory/RentalsRepositoryInMemory';
import AppError from '@shared/errors/AppError';
import CreateRentalUseCase from './CreateRentalUseCase';
import DayjsDateProvider from '@shared/container/providers/DateProvider/implementations/DayjsDateProvider';
import CarsRepositoryInMemory from '@modules/cars/repositories/in-memory/CarsRepositoryInMemory';
import Car from '@modules/cars/infra/typeorm/entities/Car';
import factory from '../../../../../tests/utils/factory';
import Rental from '@modules/rentals/infra/typeorm/entities/Rental';

dayjs.extend(utc);

describe('Create Rental', () => {
  let createRentalUseCase: CreateRentalUseCase;
  let rentalsRepositoryInMemory: RentalsRepositoryInMemory;
  let carsRepositoryInMemory: CarsRepositoryInMemory;
  let dayjsDateProvider: DayjsDateProvider;

  beforeEach(() => {
    dayjsDateProvider = new DayjsDateProvider();
    rentalsRepositoryInMemory = new RentalsRepositoryInMemory();
    carsRepositoryInMemory = new CarsRepositoryInMemory();
    createRentalUseCase = new CreateRentalUseCase(
      rentalsRepositoryInMemory,
      dayjsDateProvider,
      carsRepositoryInMemory
    );
  });

  it('should be able to create a new rental', async () => {
    const {
      brand,
      category_id,
      daily_rate,
      description,
      fine_amount,
      license_plate,
      name,
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
    } = await factory.attrs<Rental>('Rental', { car_id: car.id });
    const rental = await createRentalUseCase.execute({
      user_id,
      car_id,
      expected_return_date: dayjs(expected_return_date)
        .add(25, 'hours')
        .utc()
        .local()
        .toDate(),
    });

    expect(rental).toHaveProperty('id');
    expect(rental).toHaveProperty('start_date');
  });

  it('should not be able to rent twice to a car', async () => {
    const {
      brand,
      category_id,
      daily_rate,
      description,
      fine_amount,
      license_plate,
      name,
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
    } = await factory.attrs<Rental>('Rental', { car_id: car.id });
    const rental = {
      user_id,
      car_id,
      expected_return_date: dayjs(expected_return_date)
        .add(25, 'hours')
        .utc()
        .local()
        .toDate(),
    };

    await createRentalUseCase.execute(rental);

    await expect(createRentalUseCase.execute(rental)).rejects.toEqual(
      new AppError('Car is unavailable', 341)
    );
  });

  it('should not be able to rent twice to an user', async () => {
    const cars = await factory.attrsMany<Car>('Car', 2);
    const [carA, carB] = await Promise.all(
      cars.map((car) => {
        return carsRepositoryInMemory.create({
          id: faker.datatype.uuid(),
          ...car,
        });
      })
    );
    const expected_return_date = dayjs()
      .add(25, 'hours')
      .utc()
      .local()
      .toDate();

    await createRentalUseCase.execute({
      user_id: '1',
      car_id: carA.id,
      expected_return_date,
    });

    await expect(
      createRentalUseCase.execute({
        user_id: '1',
        car_id: carB.id,
        expected_return_date,
      })
    ).rejects.toEqual(
      new AppError("There's a rental in progress for this user", 640)
    );
  });

  it('should not be able to create a new rental to a unavailable car', async () => {
    const {
      brand,
      category_id,
      daily_rate,
      description,
      fine_amount,
      license_plate,
      name,
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
    await carsRepositoryInMemory.updateAvailability(car.id, false);

    const {
      user_id,
      car_id,
      expected_return_date,
    } = await factory.attrs<Rental>('Rental', { car_id: car.id });
    const rental = {
      user_id,
      car_id,
      expected_return_date: dayjs(expected_return_date)
        .add(25, 'hours')
        .utc()
        .local()
        .toDate(),
    };

    await createRentalUseCase.execute(rental);

    await expect(
      createRentalUseCase.execute({ ...rental, user_id: '2' })
    ).rejects.toEqual(new AppError('Car is unavailable', 341));
  });

  it('should not be able to create a new rental with less than 24 hours of duration', async () => {
    const rental = await factory.attrs<Rental>('Rental', {
      expected_return_date: new Date(),
    });

    await expect(createRentalUseCase.execute(rental)).rejects.toEqual(
      new AppError('A rental must have at least 24 hours of duration', 641)
    );
  });
});
