import { inject, injectable } from 'tsyringe';

import Rental from '@modules/rentals/infra/typeorm/entities/Rental';
import IRentalsRepository from '@modules/rentals/repositories/contracts/IRentalsRepository';
import IDateProvider from '@shared/container/providers/DateProvider/contracts/IDateProvider';
import AppError from '@shared/errors/AppError';
import ICarsRepository from '@modules/cars/repositories/contracts/ICarsRepository';

interface IRequest {
  user_id: string;
  car_id: string;
  expected_return_date: Date;
}

@injectable()
class CreateRentalUseCase {
  constructor(
    @inject('RentalsRepository')
    private rentalsRepository: IRentalsRepository,

    @inject('DayjsDateProvider')
    private dateProvider: IDateProvider,

    @inject('CarsRepository')
    private carsRepository: ICarsRepository
  ) {}

  async execute({
    user_id,
    car_id,
    expected_return_date,
  }: IRequest): Promise<Rental> {
    const [hasCarOpenRental, hasOpenUserRental] = await Promise.all([
      this.rentalsRepository.findOpenRentalByCarId(car_id),
      this.rentalsRepository.findOpenRentalByUserId(user_id),
    ]);

    if (hasCarOpenRental) {
      throw new AppError('Car is unavailable', 341);
    }

    if (hasOpenUserRental) {
      throw new AppError("There's a rental in progress for this user", 640);
    }

    const minimumDuration = this.dateProvider.add(new Date(), 24, 'hours');
    if (this.dateProvider.isBefore(expected_return_date, minimumDuration)) {
      throw new AppError(
        'A rental must have at least 24 hours of duration',
        641
      );
    }

    const [rental] = await Promise.all([
      this.rentalsRepository.create({
        user_id,
        car_id,
        expected_return_date,
      }),
      this.carsRepository.updateAvailability(car_id, false),
    ]);

    return rental;
  }
}

export default CreateRentalUseCase;
