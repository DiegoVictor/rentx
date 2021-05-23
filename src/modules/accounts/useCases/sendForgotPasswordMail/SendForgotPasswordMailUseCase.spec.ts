import { v4 } from 'uuid';

import UsersRepositoryInMemory from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import UsersTokensRepositoryInMemory from '@modules/accounts/repositories/in-memory/UsersTokensRepositoryInMemory';
import DayjsDateProvider from '@shared/container/providers/DateProvider/implementations/DayjsDateProvider';
import MailProviderInMemory from '@shared/container/providers/MailProvider/in-memory/MailProviderInMemory';
import AppError from '@shared/errors/AppError';
import SendForgotPasswordMailUseCase from './SendForgotPasswordMailUseCase';
import User from '@modules/accounts/infra/typeorm/entities/User';
import factory from '../../../../../tests/utils/factory';

const refresh_token = v4();
jest.mock('uuid', () => {
  return {
    v4: () => {
      return refresh_token;
    },
  };
});

describe('Send Forgot Password Mail', () => {
  let usersRepository: UsersRepositoryInMemory;
  let usersTokensRepository: UsersTokensRepositoryInMemory;
  let dateProvider: DayjsDateProvider;
  let mailProvider: MailProviderInMemory;
  let sendForgotPasswordMailUseCase: SendForgotPasswordMailUseCase;

  beforeEach(() => {
    usersRepository = new UsersRepositoryInMemory();
    usersTokensRepository = new UsersTokensRepositoryInMemory();
    dateProvider = new DayjsDateProvider();
    mailProvider = new MailProviderInMemory();

    sendForgotPasswordMailUseCase = new SendForgotPasswordMailUseCase(
      usersRepository,
      usersTokensRepository,
      dateProvider,
      mailProvider
    );
  });

  it('should be able to send a forgot password mail to user', async () => {
    const user = await factory.attrs<User>('User');
    await usersRepository.create(user);

    const sendMail = jest.spyOn(mailProvider, 'sendMail');
    await sendForgotPasswordMailUseCase.execute(user.email);

    expect(sendMail).toHaveBeenCalledWith(
      user.email,
      'Recuperação de senha',
      { name: user.name, link: expect.any(String) },
      expect.any(String)
    );
  });

  it('should not be able to send a forgot password mail to non existing user', async () => {
    const email = 'john@example.com';

    await expect(sendForgotPasswordMailUseCase.execute(email)).rejects.toEqual(
      new AppError('User does not exists', 244)
    );
  });

  it('should be able to create reset password token', async () => {
    const create = jest.spyOn(usersTokensRepository, 'create');
    const { driver_license, email, password, name } = await factory.attrs<User>(
      'User'
    );

    await usersRepository.create({
      driver_license,
      email,
      name,
      password,
    });
    const user = await usersRepository.findByEmail(email);

    const expires_date = new Date();
    expires_date.setDate(expires_date.getDate() + 1);

    jest.spyOn(dateProvider, 'add').mockImplementation(() => {
      return expires_date;
    });

    await sendForgotPasswordMailUseCase.execute(user.email);

    expect(create).toHaveBeenCalledWith({
      expires_date,
      user_id: user.id,
      refresh_token,
    });
  });
});
