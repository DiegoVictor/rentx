import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import RentalsRepositoryInMemory from '@modules/rentals/repositories/in-memory/RentalsRepositoryInMemory';
import AppError from '@shared/errors/AppError';
import CreateRentalUseCase from './CreateRentalUseCase';
import DayjsDateProvider from '@shared/container/providers/DateProvider/implementations/DayjsDateProvider';
import CarsRepositoryInMemory from '@modules/cars/repositories/in-memory/CarsRepositoryInMemory';

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
    const car = await carsRepositoryInMemory.create({
      brand: 'Brand',
      category_id: '1',
      daily_rate: 100,
      description: 'Lorem Ipsum Dolor Sit Amer',
      fine_amount: 100,
      license_plate: 'XYZ1234',
      name: 'Car A',
    });
    const rental = await createRentalUseCase.execute({
      user_id: '1',
      car_id: car.id,
      expected_return_date: dayjs().add(25, 'hours').utc().local().toDate(),
    });

    expect(rental).toHaveProperty('id');
    expect(rental).toHaveProperty('start_date');
  });

  it('should not be able to rent twice to an user', async () => {
    const car = await carsRepositoryInMemory.create({
      brand: 'Brand',
      category_id: '1',
      daily_rate: 100,
      description: 'Lorem Ipsum Dolor Sit Amer',
      fine_amount: 100,
      license_plate: 'XYZ1234',
      name: 'Car A',
    });
    const rental = {
      user_id: '1',
      car_id: car.id,
      expected_return_date: dayjs().add(25, 'hours').utc().local().toDate(),
    };

    await createRentalUseCase.execute(rental);

    await expect(createRentalUseCase.execute(rental)).rejects.toEqual(
      new AppError('Car is unavailable')
    );
  });

  it('should not be able to create a new rental to a unavailable car', async () => {
    const car = await carsRepositoryInMemory.create({
      brand: 'Brand',
      category_id: '1',
      daily_rate: 100,
      description: 'Lorem Ipsum Dolor Sit Amer',
      fine_amount: 100,
      license_plate: 'XYZ1234',
      name: 'Car A',
    });
    await carsRepositoryInMemory.updateAvailability(car.id, false);
    const rental = {
      user_id: '1',
      car_id: car.id,
      expected_return_date: dayjs().add(25, 'hours').utc().local().toDate(),
    };

    await createRentalUseCase.execute(rental);

    await expect(
      createRentalUseCase.execute({ ...rental, user_id: '2' })
    ).rejects.toEqual(new AppError('Car is unavailable'));
  });

  it('should not be able to create a new rental with less than 24 hours of duration', async () => {
    const rental = {
      user_id: '1',
      car_id: '1',
      expected_return_date: new Date(),
    };

    await expect(createRentalUseCase.execute(rental)).rejects.toEqual(
      new AppError('A rental must have at least 24 hours of duration')
    );
  });
});
