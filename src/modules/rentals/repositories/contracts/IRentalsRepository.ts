import ICreateRentalDTO from '@modules/rentals/dtos/ICreateRentalDTO';
import Rental from '../../infra/typeorm/entities/Rental';

export default interface IRentalsRepository {
  create(data: ICreateRentalDTO): Promise<Rental>;
  findOpenRentalByCarId(car_id: string): Promise<Rental>;
  findOpenRentalByUserId(user_id: string): Promise<Rental>;
  findById(id: string): Promise<Rental>;
  findByUserId(user_id: string): Promise<Rental[]>;
}
