import { inject, injectable } from 'tsyringe';

import ICarsRepository from '@modules/cars/repositories/contracts/ICarsRepository';
import Rental from '@modules/rentals/infra/typeorm/entities/Rental';
import IRentalsRepository from '@modules/rentals/repositories/contracts/IRentalsRepository';
import IDateProvider from '@shared/container/providers/DateProvider/contracts/IDateProvider';
import AppError from '@shared/errors/AppError';

interface IRequest {
  id: string;
}

@injectable()
class DevolutionRentalUseCase {
  constructor(
    @inject('RentalsRepository')
    private rentalsRepository: IRentalsRepository,

    @inject('CarsRepository')
    private carsRepository: ICarsRepository,

    @inject('DayjsDateProvider')
    private dateProvider: IDateProvider
  ) {}

  async execute({ id }: IRequest): Promise<Rental> {
    const rental = await this.rentalsRepository.findById(id);
    if (!rental) {
      throw new AppError('Rental does not exists', 644);
    }

    const car = await this.carsRepository.findById(rental.car_id);

    const now = new Date();
    const minimum_daily = 1;

    let total = 0;
    let daily = this.dateProvider.diffInDays(rental.start_date, now);

    if (daily <= 0) {
      daily = minimum_daily;
    }
    total += daily * car.daily_rate;

    const delay = this.dateProvider.diffInDays(
      now,
      rental.expected_return_date
    );
    if (delay > 0) {
      total += delay * car.fine_amount;
    }

    rental.end_date = now;
    rental.total = total;

    await Promise.all([
      this.rentalsRepository.create(rental),
      this.carsRepository.updateAvailability(car.id, true),
    ]);

    return rental;
  }
}

export default DevolutionRentalUseCase;
