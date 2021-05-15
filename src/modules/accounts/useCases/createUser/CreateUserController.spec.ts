import request from 'supertest';
import { Connection, Repository } from 'typeorm';
import faker from 'faker';

import app from '@shared/infra/http/app';
import User from '@modules/accounts/infra/typeorm/entities/User';
import createConnection from '@shared/infra/typeorm';

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
    const user = {
      email: faker.internet.email(),

      name: faker.name.findName(),
      driver_license: faker.random.alphaNumeric(11),
    };
    const response = await request(app)
      .post('/v1/users')
      .expect(201)
      .send({
        ...user,
        username: faker.internet.userName(),
        password: faker.internet.password(),
      });

    expect(response.body).toStrictEqual({
      id: expect.any(String),
      avatar_url: expect.any(String),
      ...user,
    });
  });

  it('should not be able to create a new user', async () => {
    const user = {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      name: faker.name.findName(),
      driver_license: faker.random.alphaNumeric(11),
    };

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
