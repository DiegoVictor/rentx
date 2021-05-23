import AppError from '@shared/errors/AppError';
import UsersRepositoryInMemory from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import CreateUserUseCase from './CreateUserUseCase';
import User from '@modules/accounts/infra/typeorm/entities/User';
import factory from '../../../../../tests/utils/factory';

describe('Create User', () => {
  let createUserUseCase: CreateUserUseCase;
  let usersRepositoryInMemory: UsersRepositoryInMemory;

  beforeEach(() => {
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it('should be able to create a new user', async () => {
    const { driver_license, email, password, name } = await factory.attrs<User>(
      'User'
    );
    const user = await createUserUseCase.execute({
      driver_license,
      email,
      password,
      name,
    });

    expect(user).toHaveProperty('id');
  });

  it('should not be able to create an user with duplicated email', async () => {
    const user = await factory.attrs<User>('User');

    await createUserUseCase.execute(user);

    await expect(createUserUseCase.execute(user)).rejects.toEqual(
      new AppError('User already exists', 240)
    );
  });
});
