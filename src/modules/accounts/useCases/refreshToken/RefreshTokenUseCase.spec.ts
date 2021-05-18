import 'dotenv/config';
import faker from 'faker';
import { sign } from 'jsonwebtoken';
import dayjs from 'dayjs';

import auth from '@config/auth';
import DayjsDateProvider from '@shared/container/providers/DateProvider/implementations/DayjsDateProvider';
import UsersTokensRepositoryInMemory from '@modules/accounts/repositories/in-memory/UsersTokensRepositoryInMemory';
import RefreshTokenUseCase from './RefreshTokenUseCase';
import AppError from '@shared/errors/AppError';

describe('Refresh Token', () => {
  let dateProvider: DayjsDateProvider;
  let usersTokensRepositoryInMemory: UsersTokensRepositoryInMemory;
  let refreshTokenUseCase: RefreshTokenUseCase;

  beforeEach(() => {
    dateProvider = new DayjsDateProvider();
    usersTokensRepositoryInMemory = new UsersTokensRepositoryInMemory();
    refreshTokenUseCase = new RefreshTokenUseCase(
      usersTokensRepositoryInMemory,
      dateProvider
    );
  });

  it('should be able to retrieve a new token and refresh token', async () => {
    const email = faker.internet.email();
    const user_id = faker.datatype.uuid();

    const refresh_token = sign({ email }, auth.secret_refresh_token, {
      subject: user_id,
      expiresIn: auth.expires_in_refresh_token,
    });

    const userToken = await usersTokensRepositoryInMemory.create({
      expires_date: dayjs()
        .add(Number(auth.expires_in_refresh_token_days), 'days')
        .toDate(),
      refresh_token,
      user_id,
    });

    const result = await refreshTokenUseCase.execute(refresh_token);

    expect(
      usersTokensRepositoryInMemory.usersTokens.includes(userToken)
    ).toBeFalsy();

    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('refresh_token');
    expect(
      await usersTokensRepositoryInMemory.findByRefreshToken(
        result.refresh_token
      )
    ).toBeTruthy();
  });

  it('should not be able to retrieve a new token and refresh token with non existing refresh token', async () => {
    const email = faker.internet.email();
    const user_id = faker.datatype.uuid();

    const refresh_token = sign({ email }, auth.secret_refresh_token, {
      subject: user_id,
      expiresIn: auth.expires_in_refresh_token,
    });

    await expect(refreshTokenUseCase.execute(refresh_token)).rejects.toEqual(
      new AppError('Refresh Token does not exists', 144)
    );
  });
});
