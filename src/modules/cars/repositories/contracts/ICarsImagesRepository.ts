import CarImage from '@modules/cars/infra/typeorm/entities/CarImage';

export default interface ICarsImagesRepository {
  create(car_id: string, image_name: string): Promise<CarImage>;
}
