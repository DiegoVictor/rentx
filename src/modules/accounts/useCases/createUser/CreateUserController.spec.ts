import request from 'supertest';
import { Connection, Repository } from 'typeorm';

import app from '@shared/infra/http/app';
import User from '@modules/accounts/infra/typeorm/entities/User';
import createConnection from '@shared/infra/typeorm';
import factory from '../../../../../tests/utils/factory';

describe('Create User Controller', () => {
  let connection: Connection;
  let usersRepository: Repository<User>;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    usersRepository = connection.getRepository(User);
  });

  beforeEach(async () => {
    await connection.query('DELETE FROM users');
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create a new user', async () => {
    const { driver_license, email, password, name } = await factory.attrs<User>(
      'User'
    );
    const response = await request(app).post('/v1/users').expect(201).send({
      email,
      name,
      driver_license,
      password,
    });

    expect(response.body).toStrictEqual({
      id: expect.any(String),
      avatar_url: expect.any(String),
      email,
      name,
      driver_license,
    });
  });

  it('should not be able to create a new user', async () => {
    const user = await factory.attrs<User>('User');

    await usersRepository.save(usersRepository.create(user));

    const response = await request(app)
      .post('/v1/users')
      .expect(400)
      .send(user);

    expect(response.body).toStrictEqual({
      message: 'User already exists',
    });
  });
});
