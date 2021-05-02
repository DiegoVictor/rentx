import { getRepository, Repository } from 'typeorm';

import ICreateRentalDTO from '@modules/rentals/dtos/ICreateRentalDTO';
import IRentalsRepository from '@modules/rentals/repositories/contracts/IRentalsRepository';
import Rental from '../entities/Rental';

class RentalsRepository implements IRentalsRepository {
  private repository: Repository<Rental>;

  constructor() {
    this.repository = getRepository(Rental);
  }

  async create({
    id,
    user_id,
    car_id,
    end_date,
    total,
    expected_return_date,
  }: ICreateRentalDTO): Promise<Rental> {
    const rental = this.repository.create({
      id,
      user_id,
      car_id,
      end_date,
      total,
      expected_return_date,
    });

    await this.repository.save(rental);

    return rental;
  }

  async findOpenRentalByCarId(car_id: string): Promise<Rental> {
    return await this.repository.findOne({ where: { car_id, end_date: null } });
  }

  async findOpenRentalByUserId(user_id: string): Promise<Rental> {
    return await this.repository.findOne({
      where: { user_id, end_date: null },
    });
  }

  async findById(id: string): Promise<Rental> {
    return await this.repository.findOne(id);
  }

  async findByUserId(user_id: string): Promise<Rental[]> {
    return await this.repository.find({
      where: { user_id },
      relations: ['car'],
    });
  }
}

export default RentalsRepository;
