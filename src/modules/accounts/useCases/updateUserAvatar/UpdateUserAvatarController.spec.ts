import request from 'supertest';
import { Connection, Repository } from 'typeorm';
import faker from 'faker';
import { hash } from 'bcrypt';
import path from 'path';
import fs from 'fs';

import app from '@shared/infra/http/app';
import createConnection from '@shared/infra/typeorm';
import User from '@modules/accounts/infra/typeorm/entities/User';
import upload from '@config/upload';
import factory from '../../../../../tests/utils/factory';

describe('Update User Controller', () => {
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

  it('should be able to set user avatar', async () => {
    const user = await factory.attrs<User>('User');

    const { id: user_id } = await usersRepository.save(
      usersRepository.create({
        ...user,
        password: await hash(user.password, 8),
      })
    );

    const fileName = `${faker.datatype.uuid()}.png`;
    const filePath = path
      .resolve(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        '..',
        'tests',
        'files',
        fileName
      )
      .toString();

    await fs.promises.writeFile(
      filePath,
      'iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAARElEQVR42u3PMREAAAgEoDe50TWDqwcNqGQ6D5SIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIyMUCOcRKz8cX394AAAAASUVORK5CYII='
    );

    const {
      body: { token },
    } = await request(app)
      .post('/v1/sessions')
      .send({ email: user.email, password: user.password });

    await request(app)
      .patch('/v1/users/avatar')
      .set({ Authorization: `Bearer ${token}` })
      .attach('avatar', filePath)
      .expect(204);

    const { avatar } = await usersRepository.findOne(user_id);

    const avatarPath = path
      .resolve(upload.tmpFolder, 'avatar', avatar)
      .toString();
    expect(await fs.promises.stat(avatarPath)).toBeTruthy();

    await Promise.all([
      fs.promises.unlink(filePath),
      fs.promises.unlink(avatarPath),
    ]);
  });

  it('should be able to update user avatar', async () => {
    const user = await factory.attrs<User>('User');

    const oldFileName = `${faker.datatype.uuid()}.png`;
    const { id: user_id } = await usersRepository.save(
      usersRepository.create({
        ...user,
        password: await hash(user.password, 8),
        avatar: oldFileName,
      })
    );

    const oldFilePath = path
      .resolve(upload.tmpFolder, 'avatar', oldFileName)
      .toString();

    const fileName = `${faker.datatype.uuid()}.png`;
    const filePath = path
      .resolve(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        '..',
        'tests',
        'files',
        fileName
      )
      .toString();

    await Promise.all([
      fs.promises.writeFile(
        oldFilePath,
        'iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAARElEQVR42u3PMREAAAgEoDe50TWDqwcNqGQ6D5SIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIyMUCOcRKz8cX394AAAAASUVORK5CYII='
      ),
      fs.promises.writeFile(
        filePath,
        'iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAARElEQVR42u3PMREAAAgEoDe50TWDqwcNqGQ6D5SIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIyMUCOcRKz8cX394AAAAASUVORK5CYII='
      ),
    ]);

    const {
      body: { token },
    } = await request(app)
      .post('/v1/sessions')
      .send({ email: user.email, password: user.password });

    await request(app)
      .patch('/v1/users/avatar')
      .set({ Authorization: `Bearer ${token}` })
      .attach('avatar', filePath)
      .expect(204);

    const { avatar } = await usersRepository.findOne(user_id);

    const avatarPath = path
      .resolve(upload.tmpFolder, 'avatar', avatar)
      .toString();

    expect(await fs.promises.stat(avatarPath)).toBeTruthy();
    await expect(fs.promises.stat(oldFilePath)).rejects.toThrowError();

    await Promise.all([
      fs.promises.unlink(filePath),
      fs.promises.unlink(avatarPath),
    ]);
  });
});
