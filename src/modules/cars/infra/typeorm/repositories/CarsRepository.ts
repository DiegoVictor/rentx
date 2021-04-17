import { getRepository, Repository } from 'typeorm';

import ICreateCarDTO from '@modules/cars/dtos/ICreateCarDTO';
import IFindAvailableCarsDTO from '@modules/cars/dtos/IFindAvailableCarsDTO';
import ICarsRepository from '@modules/cars/repositories/contracts/ICarsRepository';
import Car from '../entities/Car';

class CarsRepository implements ICarsRepository {
  private repository: Repository<Car>;

  constructor() {
    this.repository = getRepository(Car);
  }

  async create({
    id,
    name,
    description,
    daily_rate,
    license_plate,
    fine_amount,
    brand,
    category_id,
    specifications,
  }: ICreateCarDTO): Promise<Car> {
    const car = this.repository.create({
      id,
      name,
      description,
      daily_rate,
      license_plate,
      fine_amount,
      brand,
      category_id,
      specifications,
    });

    await this.repository.save(car);

    return car;
  }

  async findByLicensePlate(license_plate: string): Promise<Car> {
    return await this.repository.findOne({ license_plate });
  }

  async findAvailable(options?: IFindAvailableCarsDTO): Promise<Car[]> {
    const carsQuery = this.repository
      .createQueryBuilder('cars')
      .where('available = :available', { available: true });

    if (
      options &&
      Object.values(options).filter((value) => !!value).length > 0
    ) {
      Object.keys(options).forEach((field) => {
        if (options[field]) {
          carsQuery.andWhere(`cars.${field} = :${field}`, {
            [field]: options[field],
          });
        }
      });
    }

    return await carsQuery.getMany();
  }

  async findById(id: string): Promise<Car> {
    return await this.repository.findOne(id);
  }

  async updateAvailability(id: string, available: boolean): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update()
      .set({ available })
      .where('id = :id')
      .setParameters({ id })
      .execute();
  }
}

export default CarsRepository;
