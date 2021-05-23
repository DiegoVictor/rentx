import request from 'supertest';
import { Connection, Repository } from 'typeorm';
import faker from 'faker';
import { compare, hash } from 'bcrypt';
import dayjs from 'dayjs';

import app from '@shared/infra/http/app';
import User from '@modules/accounts/infra/typeorm/entities/User';
import createConnection from '@shared/infra/typeorm';
import UserToken from '@modules/accounts/infra/typeorm/entities/UserTokens';
import factory from '../../../../../tests/utils/factory';

describe('Refresh Token Controller', () => {
  let connection: Connection;
  let usersRepository: Repository<User>;
  let usersTokensRepository: Repository<UserToken>;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    usersRepository = connection.getRepository(User);
    usersTokensRepository = connection.getRepository(UserToken);
  });

  beforeEach(async () => {
    await connection.query('DELETE FROM users_tokens');
    await connection.query('DELETE FROM users');
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to reset the password', async () => {
    const refresh_token = faker.datatype.uuid();
    const newPassword = faker.internet.password();
    const { driver_license, email, password, name } = await factory.attrs<User>(
      'User'
    );

    const { id: user_id } = await usersRepository.save(
      usersRepository.create({
        driver_license,
        email,
        name,
        password: await hash(password, 8),
      })
    );

    const userToken = await usersTokensRepository.save(
      usersTokensRepository.create({
        expires_date: dayjs().add(3, 'hours').toDate(),
        refresh_token,
        user_id,
      })
    );

    await request(app)
      .post(`/v1/password/reset?token=${refresh_token}`)
      .expect(204)
      .send({ password: newPassword });

    const user = await usersRepository.findOne(user_id);

    expect(await compare(newPassword, user.password)).toBeTruthy();
    expect(await usersTokensRepository.findOne(userToken.id)).toBeFalsy();
  });

  it('should not be able to reset the password with invalid refresh token', async () => {
    const refresh_token = faker.datatype.uuid();
    const password = faker.internet.password();

    const response = await request(app)
      .post(`/v1/password/reset?token=${refresh_token}`)
      .expect(400)
      .send({ password });

    expect(response.body).toStrictEqual({
      message: 'Invalid token',
    });
  });

  it('should not be able to reset the password with expired refresh token', async () => {
    const refresh_token = faker.datatype.uuid();
    const newPassword = faker.internet.password();
    const { driver_license, email, password, name } = await factory.attrs<User>(
      'User'
    );

    const { id: user_id } = await usersRepository.save(
      usersRepository.create({
        driver_license,
        email,
        name,
        password: await hash(password, 8),
      })
    );

    await usersTokensRepository.save(
      usersTokensRepository.create({
        expires_date: dayjs().subtract(3, 'hours').toDate(),
        refresh_token,
        user_id,
      })
    );

    const response = await request(app)
      .post(`/v1/password/reset?token=${refresh_token}`)
      .expect(400)
      .send({ password: newPassword });

    expect(response.body).toStrictEqual({
      message: 'Token expired',
    });
  });
});
