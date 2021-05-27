import request from 'supertest';
import { Connection, Repository } from 'typeorm';
import faker from 'faker';

import app from '@shared/infra/http/app';
import createConnection from '@shared/infra/typeorm';
import Car from '@modules/cars/infra/typeorm/entities/Car';
import User from '@modules/accounts/infra/typeorm/entities/User';
import Category from '@modules/cars/infra/typeorm/entities/Category';
import factory from '../../../../../tests/utils/factory';

describe('List Available Cars Controller', () => {
  let connection: Connection;
  let carsRepository: Repository<Car>;
  let usersRepository: Repository<User>;
  let categoriesRepository: Repository<Category>;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    carsRepository = connection.getRepository(Car);
    usersRepository = connection.getRepository(User);
    categoriesRepository = connection.getRepository(Category);
  });

  beforeEach(async () => {
    await connection.query('DELETE FROM users_tokens');
    await connection.query('DELETE FROM users');
    await connection.query('DELETE FROM cars');
    await connection.query('DELETE FROM categories');
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to list all available cars', async () => {
    const user = await factory.attrs<User>('User');
    const car = await factory.attrs<Car>('Car');

    await Promise.all([
      usersRepository.save(usersRepository.create(user)),
      carsRepository.save(carsRepository.create(car)),
    ]);

    const {
      body: { token },
    } = await request(app)
      .post('/v1/sessions')
      .send({ email: user.email, password: user.password });

    const response = await request(app)
      .get(`/v1/cars/availables`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .send();

    expect(response.body).toContainEqual({
      id: expect.any(String),
      ...car,
      daily_rate: car.daily_rate.toString(),
      fine_amount: car.fine_amount.toString(),
      created_at: expect.any(String),
    });
  });

  it('should be able to list all available cars by brand', async () => {
    const user = await factory.attrs<User>('User');
    const car = await factory.attrs<Car>('Car');

    await Promise.all([
      usersRepository.save(usersRepository.create(user)),
      carsRepository.save(carsRepository.create(car)),
    ]);

    const {
      body: { token },
    } = await request(app)
      .post('/v1/sessions')
      .send({ email: user.email, password: user.password });

    const response = await request(app)
      .get(`/v1/cars/availables?brand=${car.brand}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .send();

    expect(response.body).toContainEqual({
      id: expect.any(String),
      ...car,
      daily_rate: car.daily_rate.toString(),
      fine_amount: car.fine_amount.toString(),
      created_at: expect.any(String),
    });
  });

  it('should be able to list all available cars by name', async () => {
    const user = await factory.attrs<User>('User');

    const car = await factory.attrs<Car>('Car');

    await Promise.all([
      usersRepository.save(usersRepository.create(user)),
      carsRepository.save(carsRepository.create(car)),
    ]);

    const {
      body: { token },
    } = await request(app)
      .post('/v1/sessions')
      .send({ email: user.email, password: user.password });

    const response = await request(app)
      .get(`/v1/cars/availables?name=${car.name}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .send();

    expect(response.body).toContainEqual({
      id: expect.any(String),
      ...car,
      daily_rate: car.daily_rate.toString(),
      fine_amount: car.fine_amount.toString(),
      created_at: expect.any(String),
    });
  });

  it('should be able to list all available cars by category', async () => {
    const user = await factory.attrs<User>('User');
    const category = await factory.attrs<Category>('Category');

    const { id: category_id } = await categoriesRepository.save(
      categoriesRepository.create(category)
    );
    const car = await factory.attrs<Car>('Car', { category_id });

    await Promise.all([
      usersRepository.save(usersRepository.create(user)),
      carsRepository.save(carsRepository.create(car)),
    ]);

    const {
      body: { token },
    } = await request(app)
      .post('/v1/sessions')
      .send({ email: user.email, password: user.password });

    const response = await request(app)
      .get(`/v1/cars/availables?category_id=${category_id}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .send();

    expect(response.body).toContainEqual({
      id: expect.any(String),
      ...car,
      daily_rate: car.daily_rate.toString(),
      fine_amount: car.fine_amount.toString(),
      created_at: expect.any(String),
    });
  });
});
