import request from 'supertest';
import { Connection, Repository } from 'typeorm';
import faker from 'faker';
import { hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';

import app from '@shared/infra/http/app';
import User from '@modules/accounts/infra/typeorm/entities/User';
import createConnection from '@shared/infra/typeorm';
import auth from '@config/auth';
import factory from '../../../../../tests/utils/factory';

describe('Refresh Token Controller', () => {
  let connection: Connection;
  let usersRepository: Repository<User>;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    usersRepository = connection.getRepository(User);
  });

  beforeEach(async () => {
    await connection.query('DELETE FROM users_tokens');
    await connection.query('DELETE FROM users');
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to retrieve a new token and refresh token sending old refresh token at the body', async () => {
    const user = await factory.attrs<User>('User');

    await usersRepository.save(
      usersRepository.create({
        ...user,
        password: await hash(user.password, 8),
      })
    );

    const {
      body: { refresh_token: token },
    } = await request(app).post('/v1/sessions').send({
      email: user.email,
      password: user.password,
    });

    const response = await request(app)
      .post('/v1/refresh_token')
      .expect(200)
      .send({ token });

    expect(response.body).toStrictEqual({
      token: expect.any(String),
      refresh_token: expect.any(String),
    });
  });

  it('should be able to retrieve a new token and refresh token sending old refresh token in headers', async () => {
    const user = await factory.attrs<User>('User');

    await usersRepository.save(
      usersRepository.create({
        ...user,
        password: await hash(user.password, 8),
      })
    );

    const {
      body: { refresh_token: token },
    } = await request(app).post('/v1/sessions').send({
      email: user.email,
      password: user.password,
    });

    const response = await request(app)
      .post('/v1/refresh_token')
      .set('x-access-token', token)
      .expect(200)
      .send();

    expect(response.body).toStrictEqual({
      token: expect.any(String),
      refresh_token: expect.any(String),
    });
  });

  it('should be able to retrieve a new token and refresh token sending old refresh token in query parameters', async () => {
    const user = await factory.attrs<User>('User');

    await usersRepository.save(
      usersRepository.create({
        ...user,
        password: await hash(user.password, 8),
      })
    );

    const {
      body: { refresh_token: token },
    } = await request(app).post('/v1/sessions').send({
      email: user.email,
      password: user.password,
    });

    const response = await request(app)
      .post(`/v1/refresh_token?token=${token}`)
      .expect(200)
      .send();

    expect(response.body).toStrictEqual({
      token: expect.any(String),
      refresh_token: expect.any(String),
    });
  });

  it('should not be able to retrieve a new token and refresh token with non existing refresh token', async () => {
    const refresh_token = sign(
      { email: faker.internet.email() },
      auth.secret_refresh_token,
      {
        subject: faker.datatype.uuid(),
        expiresIn: auth.expires_in_refresh_token,
      }
    );

    const response = await request(app)
      .post('/v1/refresh_token')
      .expect(400)
      .send({ token: refresh_token });

    expect(response.body).toStrictEqual({
      message: 'Refresh Token does not exists',
    });
  });
});
