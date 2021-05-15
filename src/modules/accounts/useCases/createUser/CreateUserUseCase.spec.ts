import AppError from '@shared/errors/AppError';
import UsersRepositoryInMemory from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import CreateUserUseCase from './CreateUserUseCase';

describe('Create User', () => {
  let createUserUseCase: CreateUserUseCase;
  let usersRepositoryInMemory: UsersRepositoryInMemory;

  beforeEach(() => {
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it('should be able to create a new user', async () => {
    const user = await createUserUseCase.execute({
      driver_license: '000001',
      email: 'johndoe@example.com',
      password: '123456',
      name: 'John Doe',
    });

    expect(user).toHaveProperty('id');
  });

  it('should not be able to create an user with duplicated email', async () => {
    const user = {
      driver_license: '000001',
      email: 'johndoe@example.com',
      password: '123456',
      name: 'John Doe',
    };

    await createUserUseCase.execute(user);

    await expect(createUserUseCase.execute(user)).rejects.toEqual(
      new AppError('User already exists', 240)
    );
  });
});
