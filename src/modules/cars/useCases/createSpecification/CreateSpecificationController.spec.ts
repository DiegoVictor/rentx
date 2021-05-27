import request from 'supertest';
import { Connection, Repository } from 'typeorm';
import { hash } from 'bcrypt';

import app from '@shared/infra/http/app';
import createConnection from '@shared/infra/typeorm';
import User from '@modules/accounts/infra/typeorm/entities/User';
import Specification from '@modules/cars/infra/typeorm/entities/Specification';
import factory from '../../../../../tests/utils/factory';

describe('Create Specification Controller', () => {
  let connection: Connection;
  let specificationsRepository: Repository<Specification>;
  let usersRepository: Repository<User>;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    specificationsRepository = connection.getRepository(Specification);
    usersRepository = connection.getRepository(User);
  });

  beforeEach(async () => {
    await connection.query('DELETE FROM specifications');
    await connection.query('DELETE FROM users_tokens');
    await connection.query('DELETE FROM users');
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create a new specification', async () => {
    const user = await factory.attrs<User>('User', { isAdmin: true });

    await usersRepository.save(
      usersRepository.create({
        ...user,
        password: await hash(user.password, 8),
      })
    );

    const specification = await factory.attrs<Specification>('Specification');

    const {
      body: { token },
    } = await request(app)
      .post('/v1/sessions')
      .send({ email: user.email, password: user.password });

    const response = await request(app)
      .post('/v1/specifications')
      .set({ Authorization: `Bearer ${token}` })
      .expect(201)
      .send(specification);

    expect(response.body).toStrictEqual({
      id: expect.any(String),
      ...specification,
      created_at: expect.any(String),
    });
  });

  it('should not be able to create a duplicated specification', async () => {
    const user = await factory.attrs<User>('User', { isAdmin: true });
    const specification = await factory.attrs<Specification>('Specification');

    await Promise.all([
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

    const {
      body: { token },
    } = await request(app)
      .post('/v1/sessions')
      .send({ email: user.email, password: user.password });

    const response = await request(app)
      .post('/v1/specifications')
      .set({ Authorization: `Bearer ${token}` })
      .expect(400)
      .send(specification);

    expect(response.body).toStrictEqual({
      message: 'Specification already exists',
    });
  });
});
