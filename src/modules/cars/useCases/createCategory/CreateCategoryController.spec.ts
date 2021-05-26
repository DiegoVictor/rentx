import request from 'supertest';
import {
  Connection,
  createConnection,
  getConnectionManager,
  Repository,
} from 'typeorm';
import { hash } from 'bcrypt';

import app from '@shared/infra/http/app';

describe('Create Category Controller', () => {
  let connection: Connection;
  let usersRepository: Repository<User>;

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

  it('should be able to create a new category', async () => {
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

    await request(app)
      .post('/v1/categories')
      .set({ Authorization: `Bearer ${token}` })
      .expect(201)
      .send({
        name: 'Category A',
        description: 'Lorem Ipsum Dolor Sit Amet',
      });
  });

  it('should not be able to create a new category with duplicated name', async () => {
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

    await request(app)
      .post('/v1/categories')
      .set({ Authorization: `Bearer ${token}` })
      .expect(201)
      .send({
        name: 'Category A',
        description: 'Lorem Ipsum Dolor Sit Amet',
      });

    await request(app)
      .post('/v1/categories')
      .set({ Authorization: `Bearer ${token}` })
      .expect(400)
      .send({
        name: 'Category A',
        description: 'Lorem Ipsum Dolor Sit Amet',
      });
  });
});
