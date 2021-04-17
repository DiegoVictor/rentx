import ICreateCarDTO from '@modules/cars/dtos/ICreateCarDTO';
import IFindAvailableCarsDTO from '@modules/cars/dtos/IFindAvailableCarsDTO';
import Car from '@modules/cars/infra/typeorm/entities/Car';

export default interface ICarsRepository {
  create(data: ICreateCarDTO): Promise<Car>;
  findByLicensePlate(license_plate: string): Promise<Car>;
  findAvailable(options?: IFindAvailableCarsDTO): Promise<Car[]>;
  findById(id: string): Promise<Car>;
  updateAvailability(id: string, available: boolean): Promise<void>;
}
