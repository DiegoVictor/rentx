import request from 'supertest';
import { Connection, Repository } from 'typeorm';
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

    carsRepository = connection.getRepository(Car);
    rentalsRepository = connection.getRepository(Rental);
    usersRepository = connection.getRepository(User);
  });

  beforeEach(async () => {
    await connection.query('DELETE FROM rentals');
    await connection.query('DELETE FROM cars');
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create a new rental', async () => {
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

    const rental = await factory.attrs<Rental>('Rental', {
      car_id,
      expected_return_date: dayjs().add(25, 'hours').utc().local().toDate(),
    });
    delete rental.user_id;

    const {
      body: { token },
    } = await request(app)
      .post('/v1/sessions')
      .send({ email: user.email, password: user.password });

    const response = await request(app)
      .post('/v1/rentals')
      .set({ Authorization: `Bearer ${token}` })
      .expect(201)
      .send(rental);

    expect(response.body).toStrictEqual({
      id: expect.any(String),
      user_id,
      car_id,
      created_at: expect.any(String),
      updated_at: expect.any(String),
      expected_return_date: rental.expected_return_date.toISOString(),
    });
  });

  it('should not be able to rent twice to a car', async () => {
    const user = await factory.attrs<User>('User');
    const car = await factory.attrs<Car>('Car');

    const [, { id: car_id }] = await Promise.all([
      usersRepository.save(
        usersRepository.create({
          ...user,
          password: await hash(user.password, 8),
        })
      ),
      carsRepository.save(carsRepository.create(car)),
    ]);

    const rental = await factory.attrs<Rental>('Rental', {
      car_id,
      expected_return_date: dayjs().add(25, 'hours').utc().local().toDate(),
    });
    delete rental.user_id;

    const {
      body: { token },
    } = await request(app)
      .post('/v1/sessions')
      .send({ email: user.email, password: user.password });

    await request(app)
      .post('/v1/rentals')
      .set({ Authorization: `Bearer ${token}` })
      .expect(201)
      .send(rental);

    const response = await request(app)
      .post('/v1/rentals')
      .set({ Authorization: `Bearer ${token}` })
      .expect(400)
      .send(rental);

    expect(response.body).toStrictEqual({
      message: 'Car is unavailable',
    });
  });

  it('should not be able to rent twice to an user', async () => {
    const user = await factory.attrs<User>('User');
    const [carA, carB] = await factory.attrsMany<Car>('Car', 2);

    const [, { id: carA_id }, { id: carB_id }] = await Promise.all([
      usersRepository.save(
        usersRepository.create({
          ...user,
          password: await hash(user.password, 8),
        })
      ),
      carsRepository.save(carsRepository.create(carA)),
      carsRepository.save(carsRepository.create(carB)),
    ]);

    const rental = await factory.attrs<Rental>('Rental', {
      car_id: carA_id,
      expected_return_date: dayjs().add(25, 'hours').utc().local().toDate(),
    });
    delete rental.user_id;

    const {
      body: { token },
    } = await request(app)
      .post('/v1/sessions')
      .send({ email: user.email, password: user.password });

    await request(app)
      .post('/v1/rentals')
      .set({ Authorization: `Bearer ${token}` })
      .expect(201)
      .send(rental);

    const response = await request(app)
      .post('/v1/rentals')
      .set({ Authorization: `Bearer ${token}` })
      .expect(400)
      .send({ ...rental, car_id: carB_id });

    expect(response.body).toStrictEqual({
      message: "There's a rental in progress for this user",
    });
  });

  it('should not be able to create a new rental to a unavailable car', async () => {
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

    const rental = await factory.attrs<Rental>('Rental', {
      car_id,
      expected_return_date: dayjs().add(25, 'hours').utc().local().toDate(),
    });
    delete rental.user_id;

    await rentalsRepository.save(
      rentalsRepository.create({
        ...rental,
        user_id,
      })
    );

    const {
      body: { token },
    } = await request(app)
      .post('/v1/sessions')
      .send({ email: user.email, password: user.password });

    const response = await request(app)
      .post('/v1/rentals')
      .set({ Authorization: `Bearer ${token}` })
      .expect(400)
      .send(rental);

    expect(response.body).toStrictEqual({
      message: 'Car is unavailable',
    });
  });

  it('should not be able to create a new rental with less than 24 hours of duration', async () => {
    const user = await factory.attrs<User>('User');

    await usersRepository.save(
      usersRepository.create({
        ...user,
        password: await hash(user.password, 8),
      })
    );

    const rental = await factory.attrs<Rental>('Rental', {
      expected_return_date: dayjs().add(2, 'hours').utc().local().toDate(),
    });
    delete rental.user_id;

    const {
      body: { token },
    } = await request(app)
      .post('/v1/sessions')
      .send({ email: user.email, password: user.password });

    const response = await request(app)
      .post('/v1/rentals')
      .set({ Authorization: `Bearer ${token}` })
      .expect(400)
      .send(rental);

    expect(response.body).toStrictEqual({
      message: 'A rental must have at least 24 hours of duration',
    });
  });
});
