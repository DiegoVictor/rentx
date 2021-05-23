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

describe('Profile User Controller', () => {
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

  it('should be able to retrieve profile', async () => {
    const user = await factory.attrs<User>('User');

    await usersRepository.save(
      usersRepository.create({
        ...user,
        password: await hash(user.password, 8),
      })
    );

    const {
      body: { token },
    } = await request(app).post('/v1/sessions').send({
      email: user.email,
      password: user.password,
    });

    const response = await request(app)
      .get('/v1/users')
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .send();

    delete user.password;

    expect(response.body).toStrictEqual({
      id: expect.any(String),
      avatar_url: expect.any(String),
      avatar: null,
      ...user,
    });
  });

  it('should not be able to retrieve profile from an non existing user', async () => {
    const token = sign({}, auth.secret_token, {
      subject: faker.datatype.uuid(),
      expiresIn: auth.expires_in_token,
    });
    const response = await request(app)
      .get('/v1/users')
      .set({ Authorization: `Bearer ${token}` })
      .expect(400)
      .send();

    expect(response.body).toStrictEqual({
      message: 'User does not exists',
    });
  });
});
