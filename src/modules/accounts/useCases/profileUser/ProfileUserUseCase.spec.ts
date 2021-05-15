import faker from 'faker';

import AppError from '@shared/errors/AppError';
import UsersRepositoryInMemory from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import ProfileUserUseCase from './ProfileUserUseCase';

describe('Profile User', () => {
  let profileUserUseCase: ProfileUserUseCase;
  let usersRepositoryInMemory: UsersRepositoryInMemory;

  beforeEach(() => {
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    profileUserUseCase = new ProfileUserUseCase(usersRepositoryInMemory);
  });

  it('should be able to retrieve profile', async () => {
    const user = {
      driver_license: '000001',
      email: 'johndoe@example.com',
      name: 'John Doe',
    };
    const { id } = await usersRepositoryInMemory.create({
      password: '123456',
      ...user,
    });

    const result = await profileUserUseCase.execute(id);

    expect(result).toStrictEqual({
      id: expect.any(String),
      avatar_url: null,
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
