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

describe('Devolution Rental Controller', () => {
  let connection: Connection;
  let rentalsRepository: Repository<Rental>;
  let usersRepository: Repository<User>;
  let carsRepository: Repository<Car>;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    carsRepository = connection.getRepository(Car);
    rentalsRepository = connection.getRepository(Rental);
    usersRepository = connection.getRepository(User);
  });

  beforeEach(async () => {
    await connection.query('DELETE FROM users_tokens');
    await connection.query('DELETE FROM rentals');
    await connection.query('DELETE FROM users');
    await connection.query('DELETE FROM cars');
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to give back a rental before 24 hours', async () => {
    const user = await factory.attrs<User>('User');
    const car = await factory.attrs<Car>('Car');

    const [{ id: user_id }, { id: car_id }] = await Promise.all([
      usersRepository.save(
        usersRepository.create({
          ...user,
          password: await hash(user.password, 8),
        })
      ),
      carsRepository.save(carsRepository.create(car)),
    ]);

    const rental = await rentalsRepository.save(
      rentalsRepository.create({
        user_id,
        car_id,
        start_date: dayjs().subtract(2, 'hours').utc().local().toDate(),
        expected_return_date: dayjs().utc().local().toDate(),
      })
    );

    const {
      body: { token },
    } = await request(app)
      .post('/v1/sessions')
      .send({ email: user.email, password: user.password });

    const response = await request(app)
      .post(`/v1/rentals/${rental.id}/devolution`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .send();

    let total = 0;
    let daily = dayjs(rental.start_date).diff(new Date(), 'days');
    if (daily <= 0) {
      daily = 1;
    }
    total += daily * car.daily_rate;

    expect(response.body).toStrictEqual({
      id: expect.any(String),
      user_id,
      car_id,
      created_at: rental.created_at.toISOString(),
      start_date: rental.start_date.toISOString(),
      end_date: expect.any(String),
      updated_at: expect.any(String),
      total,
      expected_return_date: rental.expected_return_date.toISOString(),
    });
  });

  it('should be able to give back a rental after 24 hours', async () => {
    const user = await factory.attrs<User>('User');
    const car = await factory.attrs<Car>('Car');

    const [{ id: user_id }, { id: car_id }] = await Promise.all([
      usersRepository.save(
        usersRepository.create({
          ...user,
          password: await hash(user.password, 8),
        })
      ),
      carsRepository.save(carsRepository.create(car)),
    ]);

    const rental = await rentalsRepository.save(
      rentalsRepository.create({
        user_id,
        car_id,
        start_date: dayjs().subtract(72, 'hours').utc().local().toDate(),
        expected_return_date: dayjs().add(25, 'hours').utc().local().toDate(),
      })
    );

    const {
      body: { token },
    } = await request(app)
      .post('/v1/sessions')
      .send({ email: user.email, password: user.password });

    const response = await request(app)
      .post(`/v1/rentals/${rental.id}/devolution`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .send();

    let total = 0;
    let daily = dayjs(response.body.end_date).diff(rental.start_date, 'days');
    if (daily <= 0) {
      daily = 1;
    }

    total += daily * car.daily_rate + car.fine_amount;

    expect(response.body).toStrictEqual({
      id: expect.any(String),
      user_id,
      car_id,
      created_at: rental.created_at.toISOString(),
      start_date: rental.start_date.toISOString(),
      end_date: expect.any(String),
      updated_at: expect.any(String),
      total,
      expected_return_date: rental.expected_return_date.toISOString(),
    });
  });

  it('should be able to give back a rental before expected', async () => {
    const user = await factory.attrs<User>('User');
    const car = await factory.attrs<Car>('Car');

    const [{ id: user_id }, { id: car_id }] = await Promise.all([
      usersRepository.save(
        usersRepository.create({
          ...user,
          password: await hash(user.password, 8),
        })
      ),
      carsRepository.save(carsRepository.create(car)),
    ]);

    const rental = await rentalsRepository.save(
      rentalsRepository.create({
        user_id,
        car_id,
        start_date: new Date(),
        expected_return_date: dayjs()
          .subtract(25, 'hours')
          .utc()
          .local()
          .toDate(),
      })
    );

    const {
      body: { token },
    } = await request(app)
      .post('/v1/sessions')
      .send({ email: user.email, password: user.password });

    const response = await request(app)
      .post(`/v1/rentals/${rental.id}/devolution`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .send();

    let total = 0;
    let daily = dayjs(rental.start_date).diff(new Date(), 'days');
    if (daily <= 0) {
      daily = 1;
    }
    total += daily * car.daily_rate;

    expect(response.body).toStrictEqual({
      id: expect.any(String),
      user_id,
      car_id,
      created_at: rental.created_at.toISOString(),
      start_date: rental.start_date.toISOString(),
      end_date: expect.any(String),
      updated_at: expect.any(String),
      total,
      expected_return_date: rental.expected_return_date.toISOString(),
    });
  });

  it('should not be able to give back a non existing rental', async () => {
    const user = await factory.attrs<User>('User');

    await Promise.all([
      usersRepository.save(
        usersRepository.create({
          ...user,
          password: await hash(user.password, 8),
        })
      ),
    ]);

    const {
      body: { token },
    } = await request(app)
      .post('/v1/sessions')
      .send({ email: user.email, password: user.password });

    const response = await request(app)
      .post(`/v1/rentals/${faker.datatype.uuid()}/devolution`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(400)
      .send();

    expect(response.body).toStrictEqual({
      message: 'Rental does not exists',
    });
  });
});
