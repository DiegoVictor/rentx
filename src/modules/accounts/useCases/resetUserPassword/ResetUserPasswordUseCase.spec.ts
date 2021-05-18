import faker from 'faker';
import dayjs from 'dayjs';
import { compare, hash } from 'bcrypt';

import UsersRepositoryInMemory from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import UsersTokensRepositoryInMemory from '@modules/accounts/repositories/in-memory/UsersTokensRepositoryInMemory';
import DayjsDateProvider from '@shared/container/providers/DateProvider/implementations/DayjsDateProvider';
import ResetUserPasswordUseCase from './ResetUserPasswordUseCase';
import AppError from '@shared/errors/AppError';

describe('Reset Password', () => {
  let usersTokensRepositoryInMemory: UsersTokensRepositoryInMemory;
  let dateProvider: DayjsDateProvider;
  let usersRepositoryInMemory: UsersRepositoryInMemory;
  let resetUserPasswordUseCase: ResetUserPasswordUseCase;

  beforeEach(() => {
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    usersTokensRepositoryInMemory = new UsersTokensRepositoryInMemory();
    dateProvider = new DayjsDateProvider();

    resetUserPasswordUseCase = new ResetUserPasswordUseCase(
      usersTokensRepositoryInMemory,
      dateProvider,
      usersRepositoryInMemory
    );
  });

  it('should be able to reset the password', async () => {
    const password = faker.internet.password();
    const user = await usersRepositoryInMemory.create({
      driver_license: faker.vehicle.vrm(),
      email: faker.internet.email(),
      name: faker.name.findName(),
      password: await hash(faker.internet.password(), 8),
    });
    const refresh_token = faker.datatype.uuid();

    const userToken = await usersTokensRepositoryInMemory.create({
      expires_date: dayjs().add(3, 'hours').toDate(),
      refresh_token,
      user_id: user.id,
    });

    await resetUserPasswordUseCase.execute({
      password,
      refresh_token,
    });

    expect(await compare(password, user.password)).toBeTruthy();
    expect(
      usersTokensRepositoryInMemory.usersTokens.includes(userToken)
    ).toBeFalsy();
  });

  it('should not be able to reset the password with invalid refresh token', async () => {
    const password = faker.internet.password();
    const refresh_token = faker.datatype.uuid();

    await expect(
      resetUserPasswordUseCase.execute({
        password,
        refresh_token,
      })
    ).rejects.toEqual(new AppError('Invalid token', 141));
  });

  it('should not be able to reset the password with expired refresh token', async () => {
    const password = faker.internet.password();
    const user = await usersRepositoryInMemory.create({
      driver_license: faker.vehicle.vrm(),
      email: faker.internet.email(),
      name: faker.name.findName(),
      password: await hash(faker.internet.password(), 8),
    });
    const refresh_token = faker.datatype.uuid();

    await usersTokensRepositoryInMemory.create({
      expires_date: dayjs().subtract(3, 'hours').toDate(),
      refresh_token,
      user_id: user.id,
    });

    await expect(
      resetUserPasswordUseCase.execute({
        password,
        refresh_token,
      })
    ).rejects.toEqual(new AppError('Token expired', 142));
  });
});
