import ICreateCarDTO from '@modules/cars/dtos/ICreateCarDTO';
import IFindAvailableCarsDTO from '@modules/cars/dtos/IFindAvailableCarsDTO';
import Car from '@modules/cars/infra/typeorm/entities/Car';
import ICarsRepository from '../contracts/ICarsRepository';

class CarsRepositoryInMemory implements ICarsRepository {
  cars: Car[] = [];

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
    const car = new Car();

    Object.assign(car, {
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

    this.cars.push(car);
    return car;
  }

  async findByLicensePlate(license_plate: string): Promise<Car> {
    return this.cars.find((car) => car.license_plate === license_plate);
  }

  async findAvailable(options?: IFindAvailableCarsDTO): Promise<Car[]> {
    const cars = this.cars.filter((car) => car.available);

    if (
      options &&
      Object.values(options).filter((value) => !!value).length > 0
    ) {
      return cars.filter((car) => {
        return !Object.keys(options).every((field) => {
          if (car[field] === options[field]) {
            return false;
          }
          return true;
        });
      });
    }

    return cars;
  }

  async findById(id: string): Promise<Car> {
    return this.cars.find((car) => car.id === id);
  }

  async updateAvailability(id: string, available: boolean): Promise<void> {
    const index = this.cars.findIndex((car) => car.id === id);
    this.cars[index].available = available;
  }
}

export default CarsRepositoryInMemory;
