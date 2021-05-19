import request from 'supertest';
import { Connection, Repository } from 'typeorm';
import faker from 'faker';
import { hash } from 'bcrypt';

import app from '@shared/infra/http/app';
import createConnection from '@shared/infra/typeorm';
import Car from '@modules/cars/infra/typeorm/entities/Car';
import User from '@modules/accounts/infra/typeorm/entities/User';
import Specification from '@modules/cars/infra/typeorm/entities/Specification';

describe('Create Car Specification Controller', () => {
  let connection: Connection;
  let carsRepository: Repository<Car>;
  let usersRepository: Repository<User>;
  let specificationsRepository: Repository<Specification>;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    carsRepository = connection.getRepository(Car);
    usersRepository = connection.getRepository(User);
    specificationsRepository = connection.getRepository(Specification);
  });

  beforeEach(async () => {
    await connection.query('DELETE FROM users_tokens');
    await connection.query('DELETE FROM specifications_cars');
    await connection.query('DELETE FROM cars');
    await connection.query('DELETE FROM specifications');
    await connection.query('DELETE FROM users');
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to add a new specification to a car', async () => {
    const user = {
      email: faker.internet.email(),
      name: faker.name.findName(),
      driver_license: faker.random.alphaNumeric(11),
      password: faker.internet.password(),
      username: faker.internet.userName(),
      isAdmin: true,
    };
    const [, car, specification] = await Promise.all([
      usersRepository.save(
        usersRepository.create({
          ...user,
          password: await hash(user.password, 8),
        })
      ),
      carsRepository.save(
        carsRepository.create({
          brand: faker.vehicle.manufacturer(),
          category_id: null,
          daily_rate: Number(faker.finance.amount()),
          description: faker.lorem.sentence(),
          fine_amount: Number(faker.finance.amount()),
          license_plate: faker.vehicle.vrm(),
          name: faker.vehicle.vehicle(),
          available: true,
        })
      ),
      specificationsRepository.save(
        specificationsRepository.create({
          name: faker.lorem.word(),
          description: faker.lorem.sentence(),
        })
      ),
    ]);

    const {
      body: { token },
    } = await request(app)
      .post('/v1/sessions')
      .send({ email: user.email, password: user.password });

    const response = await request(app)
      .post(`/v1/cars/${car.id}/specifications`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(201)
      .send({ specifications_id: [specification.id] });

    expect(response.body).toStrictEqual({
      ...car,
      fine_amount: car.fine_amount.toString(),
      daily_rate: car.daily_rate.toString(),
      created_at: car.created_at.toISOString(),
      specifications: [
        {
          ...specification,
          created_at: specification.created_at.toISOString(),
        },
      ],
    });
  });

  it('should not be able to add a new specification to a non existing car', async () => {
    const user = {
      email: faker.internet.email(),
      name: faker.name.findName(),
      driver_license: faker.random.alphaNumeric(11),
      password: faker.internet.password(),
      username: faker.internet.userName(),
      isAdmin: true,
    };
    const [, specification] = await Promise.all([
      usersRepository.save(
        usersRepository.create({
          ...user,
          password: await hash(user.password, 8),
        })
      ),
      specificationsRepository.save(
        specificationsRepository.create({
          name: faker.lorem.word(),
          description: faker.lorem.sentence(),
        })
      ),
    ]);
    const car_id = faker.datatype.uuid();

    const {
      body: { token },
    } = await request(app)
      .post('/v1/sessions')
      .send({ email: user.email, password: user.password });

    const response = await request(app)
      .post(`/v1/cars/${car_id}/specifications`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(400)
      .send({ specifications_id: [specification.id] });

    expect(response.body).toStrictEqual({ message: 'Car does not exists' });
  });
});