import path from 'path';
import fs from 'fs';
import faker from 'faker';

import upload from '@config/upload';
import LocalStorageProvider from '@shared/container/providers/StorageProvider/implementations/LocalStorageProvider';
import CarsImagesRepositoryInMemory from '@modules/cars/repositories/in-memory/CarsImagesRepositoryInMemory';
import UploadCarImagesUseCase from './UploadCarImagesUseCase';

describe('Upload Car Images', () => {
  let uploadCarImagesUseCase: UploadCarImagesUseCase;
  let storageProvider: LocalStorageProvider;
  let carsImagesRepositoryInMemory: CarsImagesRepositoryInMemory;

  beforeEach(() => {
    carsImagesRepositoryInMemory = new CarsImagesRepositoryInMemory();
    storageProvider = new LocalStorageProvider();
    uploadCarImagesUseCase = new UploadCarImagesUseCase(
      carsImagesRepositoryInMemory,
      storageProvider
    );
  });

  it('should be able to add an image to a car', async () => {
    const carImageFile = `${faker.datatype.uuid()}.png`;
    const filePath = path.resolve(upload.tmpFolder, carImageFile).toString();

    await fs.promises.writeFile(
      filePath,
      'iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAARElEQVR42u3PMREAAAgEoDe50TWDqwcNqGQ6D5SIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIyMUCOcRKz8cX394AAAAASUVORK5CYII='
    );

    await uploadCarImagesUseCase.execute({
      car_id: faker.datatype.uuid(),
      images_name: [carImageFile],
    });

    const carImagePath = path
      .resolve(upload.tmpFolder, 'cars_images', carImageFile)
      .toString();
    expect(await fs.promises.stat(carImagePath)).toBeTruthy();

    await fs.promises.unlink(carImagePath);
  });
});
