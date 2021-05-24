import request from 'supertest';
import { Connection, Repository } from 'typeorm';
import faker from 'faker';
import { hash } from 'bcrypt';

import app from '@shared/infra/http/app';
import createConnection from '@shared/infra/typeorm';
import Car from '@modules/cars/infra/typeorm/entities/Car';
import User from '@modules/accounts/infra/typeorm/entities/User';
import factory from '../../../../../tests/utils/factory';

describe('Create Car Controller', () => {
  let connection: Connection;
  let carsRepository: Repository<Car>;
  let usersRepository: Repository<User>;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    carsRepository = connection.getRepository(Car);
    usersRepository = connection.getRepository(User);
  });

  beforeEach(async () => {
    await connection.query('DELETE FROM cars');
    await connection.query('DELETE FROM users_tokens');
    await connection.query('DELETE FROM users');
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create a new car', async () => {
    const user = await factory.attrs<User>('User', { isAdmin: true });

    await usersRepository.save(
      usersRepository.create({
        ...user,
        password: await hash(user.password, 8),
      })
    );

    const car = await factory.attrs<Car>('Car');

    const {
      body: { token },
    } = await request(app)
      .post('/v1/sessions')
      .send({ email: user.email, password: user.password });

    const response = await request(app)
      .post('/v1/cars')
      .set({ Authorization: `Bearer ${token}` })
      .expect(201)
      .send(car);

    expect(response.body).toStrictEqual({
      id: expect.any(String),
      available: true,
      ...car,
      created_at: expect.any(String),
    });
  });

  it('should not be able to create a car with duplicated license plate', async () => {
    const user = await factory.attrs<User>('User', { isAdmin: true });
    const car = await factory.attrs<Car>('Car');

    await Promise.all([
      usersRepository.save(
        usersRepository.create({
          ...user,
          password: await hash(user.password, 8),
        })
      ),
      carsRepository.save(carsRepository.create(car)),
    ]);

    const {
      body: { token },
    } = await request(app)
      .post('/v1/sessions')
      .send({ email: user.email, password: user.password });

    const response = await request(app)
      .post('/v1/cars')
      .set({ Authorization: `Bearer ${token}` })
      .expect(400)
      .send(car);

    expect(response.body).toStrictEqual({
      message: 'Car already exists',
    });
  });
});
