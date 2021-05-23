import path from 'path';
import fs from 'fs';
import faker from 'faker';

import upload from '@config/upload';
import UsersRepositoryInMemory from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import LocalStorageProvider from '@shared/container/providers/StorageProvider/implementations/LocalStorageProvider';
import UpdateUserAvatarUseCase from './UpdateUserAvatarUseCase';
import User from '@modules/accounts/infra/typeorm/entities/User';
import factory from '../../../../../tests/utils/factory';

describe('Update User Avatar', () => {
  let updateUserAvatarUseCase: UpdateUserAvatarUseCase;
  let storageProvider: LocalStorageProvider;
  let usersRepositoryInMemory: UsersRepositoryInMemory;

  beforeEach(() => {
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    storageProvider = new LocalStorageProvider();
    updateUserAvatarUseCase = new UpdateUserAvatarUseCase(
      usersRepositoryInMemory,
      storageProvider
    );
  });

  it('should be able to set user avatar', async () => {
    const avatarFile = `${faker.datatype.uuid()}.png`;
    const filePath = path.resolve(upload.tmpFolder, avatarFile).toString();
    const { driver_license, email, password, name } = await factory.attrs<User>(
      'User'
    );

    await fs.promises.writeFile(
      filePath,
      'iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAARElEQVR42u3PMREAAAgEoDe50TWDqwcNqGQ6D5SIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIyMUCOcRKz8cX394AAAAASUVORK5CYII='
    );

    const user = await usersRepositoryInMemory.create({
      password,
      driver_license,
      email,
      name,
    });

    expect(user.avatar).toBe(undefined);

    await updateUserAvatarUseCase.execute({
      user_id: user.id,
      avatar_file: avatarFile,
    });

    expect(user.avatar).toBe(avatarFile);

    const avatarPath = path
      .resolve(upload.tmpFolder, 'avatar', avatarFile)
      .toString();
    expect(await fs.promises.stat(avatarPath)).toBeTruthy();

    await fs.promises.unlink(avatarPath);
  });

  it('should be able to update user avatar', async () => {
    const oldAvatarFile = `${faker.datatype.uuid()}.png`;
    const oldFilePath = path
      .resolve(upload.tmpFolder, 'avatar', oldAvatarFile)
      .toString();
    const avatarFile = `${faker.datatype.uuid()}.png`;
    const filePath = path.resolve(upload.tmpFolder, avatarFile).toString();

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

    const { driver_license, email, password, name } = await factory.attrs<User>(
      'User'
    );
    const user = await usersRepositoryInMemory.create({
      password,
      driver_license,
      email,
      name,
    });

    user.avatar = oldAvatarFile;

    await updateUserAvatarUseCase.execute({
      user_id: user.id,
      avatar_file: avatarFile,
    });

    expect(user.avatar).toBe(avatarFile);

    const avatarPath = path
      .resolve(upload.tmpFolder, 'avatar', avatarFile)
      .toString();

    expect(await fs.promises.stat(avatarPath)).toBeTruthy();
    await expect(fs.promises.stat(oldFilePath)).rejects.toThrowError();

    await fs.promises.unlink(avatarPath);
  });
});
