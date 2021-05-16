import { inject, injectable } from 'tsyringe';

import IStorageProvider from '@shared/container/providers/StorageProvider/contracts/IStorageProvider';
import ICarsImagesRepository from '../../repositories/contracts/ICarsImagesRepository';

interface IRequest {
  car_id: string;
  images_name: string[];
}

@injectable()
class UploadCarImagesUseCase {
  constructor(
    @inject('CarsImagesRepository')
    private carsImagesRepository: ICarsImagesRepository,

    @inject('StorageProvider')
    private storageProvider: IStorageProvider
  ) {}

  async execute({ car_id, images_name }: IRequest): Promise<void> {
    const promises = images_name.map(
      (image) =>
        new Promise((resolve, reject) => {
          Promise.all([
            this.carsImagesRepository.create(car_id, image),
            this.storageProvider.save(image, 'cars_images'),
          ])
            .then(resolve)
            .catch(reject);
        })
    );

    await Promise.all(promises);
  }
}

export default UploadCarImagesUseCase;
