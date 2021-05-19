import CarImage from '@modules/cars/infra/typeorm/entities/CarImage';
import ICarsImagesRepository from '../contracts/ICarsImagesRepository';

class CarsImagesRepositoryInMemory implements ICarsImagesRepository {
  carsImage: CarImage[] = [];

  async create(car_id: string, image_name: string): Promise<CarImage> {
    const carImage = new CarImage();

    Object.assign(carImage, { car_id, image_name });
    this.carsImage.push(carImage);

    return carImage;
  }
}

export default CarsImagesRepositoryInMemory;
