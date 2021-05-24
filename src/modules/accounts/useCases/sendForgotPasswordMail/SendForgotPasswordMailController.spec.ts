import request from 'supertest';
import { Connection, Repository } from 'typeorm';
import faker from 'faker';
import { hash } from 'bcrypt';

import app from '@shared/infra/http/app';
import User from '@modules/accounts/infra/typeorm/entities/User';
import createConnection from '@shared/infra/typeorm';
import UserToken from '@modules/accounts/infra/typeorm/entities/UserTokens';
import { sendMail } from '../../../../../mocks/nodemailer';
import factory from '../../../../../tests/utils/factory';

describe('Send Forgot Password Mail Controller', () => {
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

  it('should be able to send a forgot password mail to user', async () => {
    const user = await factory.attrs<User>('User');

    const { id: user_id } = await usersRepository.save(
      usersRepository.create({
        ...user,
        password: await hash(user.password, 8),
      })
    );

    await request(app)
      .post('/v1/password/forgot')
      .expect(204)
      .send({ email: user.email });

    const token = await usersTokensRepository.findOne({
      user_id,
    });

    expect(token).toStrictEqual(
      usersTokensRepository.create({
        id: expect.any(String),
        user_id,
        refresh_token: expect.any(String),
        expires_date: expect.any(Date),
        created_at: expect.any(Date),
      })
    );
    expect(sendMail).toHaveBeenCalledWith({
      to: user.email,
      from: `Rentx <${process.env.MAIL_SENDER}>`,
      subject: 'Recuperação de senha',
      html: expect.any(String),
    });
  }, 10000);

  it('should not be able to send a forgot password mail to non existing user', async () => {
    const response = await request(app)
      .post('/v1/password/forgot')
      .expect(400)
      .send({ email: faker.internet.email() });

    expect(response.body).toStrictEqual({
      message: 'User does not exists',
    });
  });
});
