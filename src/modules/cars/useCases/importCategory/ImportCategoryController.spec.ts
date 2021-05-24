import request from 'supertest';
import { Connection, Repository } from 'typeorm';
import faker from 'faker';
import { hash } from 'bcrypt';
import path from 'path';
import fs from 'fs';

import app from '@shared/infra/http/app';
import createConnection from '@shared/infra/typeorm';
import User from '@modules/accounts/infra/typeorm/entities/User';
import Category from '@modules/cars/infra/typeorm/entities/Category';
import factory from '../../../../../tests/utils/factory';

describe('Import Category Controller', () => {
  let connection: Connection;
  let categoriesRepository: Repository<Category>;
  let usersRepository: Repository<User>;

  const csvFolder = path
    .resolve(__dirname, '..', '..', '..', '..', '..', 'tests', 'files')
    .toString();
  const samplePath = path.resolve(csvFolder, 'sample.csv');

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    categoriesRepository = connection.getRepository(Category);
    usersRepository = connection.getRepository(User);

    if (!(await fs.promises.stat(samplePath))) {
      await fs.promises.writeFile(
        samplePath,
        'SUV,Utilitário esportivo\nSedan,Automóvel de três volumes\nHatch,Carro curto'
      );
    }
  });

  beforeEach(async () => {
    await connection.query('DELETE FROM categories');
    await connection.query('DELETE FROM users_tokens');
    await connection.query('DELETE FROM users');
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to import categories', async () => {
    const user = await factory.attrs<User>('User', { isAdmin: true });

    await usersRepository.save(
      usersRepository.create({
        ...user,
        password: await hash(user.password, 8),
      })
    );

    const fileName = faker.datatype.uuid();
    const csvPath = path.resolve(csvFolder, fileName + '.csv').toString();

    await fs.promises.copyFile(samplePath, csvPath);

    const categories = [];

    await new Promise((resolve) => {
      fs.createReadStream(csvPath)
        .on('data', (chunk) => {
          const data = chunk.toString('utf8');
          data.split('\n').forEach((line) => {
            if (line.length > 0) {
              const [name, description] = line.replace('\r', '').split(',');
              categories.push({
                name,
                description,
              });
            }
          });
        })
        .on('end', resolve);
    });

    const {
      body: { token },
    } = await request(app)
      .post('/v1/sessions')
      .send({ email: user.email, password: user.password });

    await request(app)
      .post('/v1/categories/import')
      .set({ Authorization: `Bearer ${token}` })
      .attach('file', csvPath)
      .expect(201);

    const responses = await Promise.all(
      categories.map(({ name }) => categoriesRepository.findOne({ name }))
    );

    categories.forEach(({ name, description }) => {
      expect(responses).toContainEqual({
        id: expect.any(String),
        name,
        description,
        created_at: expect.any(Date),
      });
    });

    await fs.promises.unlink(csvPath);
  });

  it('should be able to import categories without duplicate', async () => {
    const user = await factory.attrs<User>('User', { isAdmin: true });

    await usersRepository.save(
      usersRepository.create({
        ...user,
        password: await hash(user.password, 8),
      })
    );

    const fileName = faker.datatype.uuid();
    const csvPath = path.resolve(csvFolder, fileName + '.csv').toString();

    await fs.promises.copyFile(samplePath, csvPath);

    const categories = [];

    await new Promise((resolve) => {
      fs.createReadStream(csvPath)
        .on('data', (chunk) => {
          const data = chunk.toString('utf8');
          data.split('\n').forEach((line) => {
            if (line.length > 0) {
              const [name, description] = line.replace('\r', '').split(',');
              categories.push({
                name,
                description,
              });
            }
          });
        })
        .on('end', resolve);
    });

    await categoriesRepository.save(
      categoriesRepository.create(categories.slice(0, 1).pop())
    );

    const {
      body: { token },
    } = await request(app)
      .post('/v1/sessions')
      .send({ email: user.email, password: user.password });

    await request(app)
      .post('/v1/categories/import')
      .set({ Authorization: `Bearer ${token}` })
      .attach('file', csvPath)
      .expect(201);

    const responses = await Promise.all(
      categories.map(({ name }) => categoriesRepository.findOne({ name }))
    );

    categories.forEach(({ name, description }) => {
      expect(responses).toContainEqual({
        id: expect.any(String),
        name,
        description,
        created_at: expect.any(Date),
      });
    });

    await fs.promises.unlink(csvPath);
  });

  it('should not be able to import categories without valid csv', async () => {
    const user = await factory.attrs<User>('User', { isAdmin: true });

    await usersRepository.save(
      usersRepository.create({
        ...user,
        password: await hash(user.password, 8),
      })
    );

    const fileName = `${faker.datatype.uuid()}.csv`;
    const csvPath = path.resolve(csvFolder, fileName).toString();

    await fs.promises.writeFile(csvPath, '{ "name": "description" }');

    const {
      body: { token },
    } = await request(app)
      .post('/v1/sessions')
      .send({ email: user.email, password: user.password });

    const response = await request(app)
      .post('/v1/categories/import')
      .set({ Authorization: `Bearer ${token}` })
      .attach('file', csvPath)
      .expect(500);

    await fs.promises.unlink(csvPath);

    expect(response.body).toStrictEqual({
      status: 'error',
      message: expect.any(String),
    });
  });
});
