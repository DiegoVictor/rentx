import request from 'supertest';
import { Connection, Repository } from 'typeorm';
import faker from 'faker';
import { hash } from 'bcrypt';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import app from '@shared/infra/http/app';
import createConnection from '@shared/infra/typeorm';
import Car from '@modules/cars/infra/typeorm/entities/Car';
import User from '@modules/accounts/infra/typeorm/entities/User';
import Rental from '@modules/rentals/infra/typeorm/entities/Rental';
import factory from '../../../../../tests/utils/factory';

dayjs.extend(utc);

describe('Create Rental Controller', () => {
  let connection: Connection;
  let rentalsRepository: Repository<Rental>;
  let usersRepository: Repository<User>;
  let carsRepository: Repository<Car>;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    rentalsRepository = connection.getRepository(Rental);
    usersRepository = connection.getRepository(User);
    carsRepository = connection.getRepository(Car);
  });

  beforeEach(async () => {
    await connection.query('DELETE FROM rentals');
    await connection.query('DELETE FROM users_tokens');
    await connection.query('DELETE FROM users');
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to retrieve my rentals', async () => {
    const user = await factory.attrs<User>('User');
    const {
      brand,
      daily_rate,
      description,
      fine_amount,
      license_plate,
      name,
      available,
    } = await factory.attrs<Car>('Car');
    const [{ id: user_id }, car] = await Promise.all([
      usersRepository.save(
        usersRepository.create({
          ...user,
          password: await hash(user.password, 8),
        })
      ),
      carsRepository.save(
        carsRepository.create({
          brand,
          category_id: null,
          daily_rate,
          description,
          fine_amount,
          license_plate,
          name,
          available,
        })
      ),
    ]);

    const rental = await rentalsRepository.save(
      rentalsRepository.create({
        user_id,
        car_id: car.id,
        expected_return_date: dayjs().add(25, 'hours').utc().local().toDate(),
      })
    );

    const {
      body: { token },
    } = await request(app)
      .post('/v1/sessions')
      .send({ email: user.email, password: user.password });

    const response = await request(app)
      .get('/v1/rentals/user')
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .send();

    expect(response.body).toContainEqual({
      ...rental,
      created_at: rental.created_at.toISOString(),
      end_date: null,
      expected_return_date: rental.expected_return_date.toISOString(),
      start_date: rental.created_at.toISOString(),
      total: null,
      updated_at: rental.updated_at.toISOString(),
      car: {
        ...car,
        created_at: car.created_at.toISOString(),
        daily_rate: car.daily_rate.toString(),
        fine_amount: car.fine_amount.toString(),
      },
    });
  });
});
