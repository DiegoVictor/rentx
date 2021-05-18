import path from 'path';
import fs from 'fs';
import faker from 'faker';

import upload from '@config/upload';
import UsersRepositoryInMemory from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import LocalStorageProvider from '@shared/container/providers/StorageProvider/implementations/LocalStorageProvider';
import UpdateUserAvatarUseCase from './UpdateUserAvatarUseCase';

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

    await fs.promises.writeFile(
      filePath,
      'iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAARElEQVR42u3PMREAAAgEoDe50TWDqwcNqGQ6D5SIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIyMUCOcRKz8cX394AAAAASUVORK5CYII='
    );

    const user = await usersRepositoryInMemory.create({
      password: faker.internet.password(),
      driver_license: faker.random.alphaNumeric(11),
      email: faker.internet.email(),
      name: faker.name.findName(),
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

    const user = await usersRepositoryInMemory.create({
      password: faker.internet.password(),
      driver_license: faker.random.alphaNumeric(11),
      email: faker.internet.email(),
      name: faker.name.findName(),
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
