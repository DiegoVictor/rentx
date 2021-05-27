import request from 'supertest';
import { Connection, Repository } from 'typeorm';
import faker from 'faker';
import { hash } from 'bcrypt';

import app from '@shared/infra/http/app';
import createConnection from '@shared/infra/typeorm';
import Car from '@modules/cars/infra/typeorm/entities/Car';
import User from '@modules/accounts/infra/typeorm/entities/User';
import Specification from '@modules/cars/infra/typeorm/entities/Specification';
import factory from '../../../../../tests/utils/factory';

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
    const user = await factory.attrs<User>('User', { isAdmin: true });
    let specification = await factory.attrs<Specification>('Specification');
    let car = await factory.attrs<Car>('Car');

    [, car, specification] = await Promise.all([
      usersRepository.save(
        usersRepository.create({
          ...user,
          password: await hash(user.password, 8),
        })
      ),
      carsRepository.save(carsRepository.create(car)),
      specificationsRepository.save(
        specificationsRepository.create(specification)
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
    const user = await factory.attrs<User>('User', { isAdmin: true });
    const specification = await factory.attrs<Specification>('Specification');
    const [, { id }] = await Promise.all([
      usersRepository.save(
        usersRepository.create({
          ...user,
          password: await hash(user.password, 8),
        })
      ),
      specificationsRepository.save(
        specificationsRepository.create(specification)
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
      .send({ specifications_id: [id] });

    expect(response.body).toStrictEqual({ message: 'Car does not exists' });
  });
});
