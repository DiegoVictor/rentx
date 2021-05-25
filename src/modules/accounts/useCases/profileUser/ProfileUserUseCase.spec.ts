import 'dotenv/config';
import faker from 'faker';

import AppError from '@shared/errors/AppError';
import UsersRepositoryInMemory from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import ProfileUserUseCase from './ProfileUserUseCase';
import User from '@modules/accounts/infra/typeorm/entities/User';
import factory from '../../../../../tests/utils/factory';

describe('Profile User', () => {
  let profileUserUseCase: ProfileUserUseCase;
  let usersRepositoryInMemory: UsersRepositoryInMemory;

  beforeEach(() => {
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    profileUserUseCase = new ProfileUserUseCase(usersRepositoryInMemory);
  });

  it('should be able to retrieve profile', async () => {
    const user = await factory.attrs<User>('User');

    const { id } = await usersRepositoryInMemory.create(user);
    const result = await profileUserUseCase.execute(id);

    delete user.password;

    expect(result).toStrictEqual({
      id: expect.any(String),
      avatar_url: '',
      avatar: undefined,
      ...user,
    });
  });

  it('should not be able to retrieve profile from an non existing user', async () => {
    await expect(
      profileUserUseCase.execute(faker.datatype.uuid())
    ).rejects.toEqual(new AppError('User does not exists', 245));
  });
});
