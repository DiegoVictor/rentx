import request from 'supertest';
import { Connection, Repository } from 'typeorm';
import faker from 'faker';
import { hash } from 'bcrypt';
import path from 'path';
import fs from 'fs';

import app from '@shared/infra/http/app';
import createConnection from '@shared/infra/typeorm';
import User from '@modules/accounts/infra/typeorm/entities/User';
import upload from '@config/upload';
import CarImage from '@modules/cars/infra/typeorm/entities/CarImage';
import Car from '@modules/cars/infra/typeorm/entities/Car';

describe('Upload Car Images Controller', () => {
  let connection: Connection;
  let carsImagesRepository: Repository<CarImage>;
  let carsRepository: Repository<Car>;
  let usersRepository: Repository<User>;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    carsImagesRepository = connection.getRepository(CarImage);
    carsRepository = connection.getRepository(Car);
    usersRepository = connection.getRepository(User);
  });

  beforeEach(async () => {
    await connection.query('DELETE FROM car_images');
    await connection.query('DELETE FROM cars');
    await connection.query('DELETE FROM users_tokens');
    await connection.query('DELETE FROM users');
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to add an image to a car', async () => {
    const user = {
      email: faker.internet.email(),
      name: faker.name.findName(),
      driver_license: faker.random.alphaNumeric(11),
      password: faker.internet.password(),
      username: faker.internet.userName(),
      isAdmin: true,
    };

    const [, car] = await Promise.all([
      usersRepository.save(
        usersRepository.create({
          ...user,
          password: await hash(user.password, 8),
        })
      ),
      carsRepository.save(
        carsRepository.create({
          name: faker.vehicle.model(),
          brand: faker.vehicle.manufacturer(),
          license_plate: faker.vehicle.vrm(),
          description: faker.lorem.sentence(),
          daily_rate: Number(faker.finance.amount()),
          fine_amount: Number(faker.finance.amount()),
        })
      ),
    ]);

    const carImageFile = `${faker.datatype.uuid()}.png`;
    const filePath = path
      .resolve(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        '..',
        'tests',
        'files',
        carImageFile
      )
      .toString();

    await fs.promises.writeFile(
      filePath,
      'iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAARElEQVR42u3PMREAAAgEoDe50TWDqwcNqGQ6D5SIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIyMUCOcRKz8cX394AAAAASUVORK5CYII='
    );

    const {
      body: { token },
    } = await request(app)
      .post('/v1/sessions')
      .send({ email: user.email, password: user.password });

    await request(app)
      .post(`/v1/cars/${car.id}/images`)
      .set({ Authorization: `Bearer ${token}` })
      .attach('car_images', filePath)
      .expect(201);

    const carImage = await carsImagesRepository.findOne({
      car_id: car.id,
    });

    const avatarPath = path
      .resolve(upload.tmpFolder, 'cars_images', carImage.image_name)
      .toString();
    expect(await fs.promises.stat(avatarPath)).toBeTruthy();

    await Promise.all([
      fs.promises.unlink(filePath),
      fs.promises.unlink(avatarPath),
    ]);
  });
});
