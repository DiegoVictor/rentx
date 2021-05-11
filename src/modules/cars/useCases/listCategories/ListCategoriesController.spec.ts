import request from 'supertest';
import { Connection, createConnection, getConnectionManager } from 'typeorm';
import { hash } from 'bcrypt';
import { v4 as uuidV4 } from 'uuid';

import app from '@shared/infra/http/app';

describe('List Categories Controller', () => {
  const email = 'admin@rentx.com.br';
  let password = 'admin';
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();

    const id = uuidV4();
    const passwordHash = await hash(password, 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, "isAdmin", created_at, driver_license)
      values('${id}', 'admin', '${email}', '${passwordHash}', true, 'now()', '7623487234')`
    );
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
    const {
      body: { token },
    } = await request(app).post('/v1/sessions').send({
      email,
      password,
    });

    const category = {
      name: 'Category A',
      description: 'Lorem Ipsum Dolor Sit Amet',
    };

    await request(app)
      .post('/v1/categories')
      .set({ Authorization: `Bearer ${token}` })
      .expect(201)
      .send(category);

    const response = await request(app)
      .get('/v1/categories')
      .set({
        Authorization: `Bearer ${token}`,
      })
      .expect(200);

    expect(response.body.length).toBe(1);
    expect(response.body).toContainEqual({
      ...category,
      id: expect.any(String),
      created_at: expect.any(String),
    });
  });
});
