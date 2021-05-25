import request from 'supertest';
import {
  Connection,
  createConnection,
  getConnectionManager,
  Repository,
} from 'typeorm';

import app from '@shared/infra/http/app';
import User from '@modules/accounts/infra/typeorm/entities/User';
import factory from '../../../../../tests/utils/factory';
import Category from '@modules/cars/infra/typeorm/entities/Category';
import { hash } from 'bcrypt';

describe('List Categories Controller', () => {
  let usersRepository: Repository<User>;
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();

    usersRepository = connection.getRepository(User);
  });

  beforeEach(async () => {
    await connection.query('DELETE FROM categories');
  });

  afterAll(async () => {
    await connection.dropDatabase();

    const manager = getConnectionManager();
    await Promise.all(
      manager.connections.map((conn) => {
        return conn.close();
      })
    );
  });

  it('should be able to list categories', async () => {
    const user = await factory.attrs<User>('User', { isAdmin: true });
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

    const { name, description } = await factory.attrs<Category>('Category');

    await request(app)
      .post('/v1/categories')
      .set({ Authorization: `Bearer ${token}` })
      .expect(201)
      .send({ name, description });

    const response = await request(app)
      .get('/v1/categories')
      .set({
        Authorization: `Bearer ${token}`,
      })
      .expect(200);

    expect(response.body.length).toBe(1);
    expect(response.body).toContainEqual({
      id: expect.any(String),
      name,
      description,
      created_at: expect.any(String),
    });
  });
});
