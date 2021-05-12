import { sign, verify } from 'jsonwebtoken';
import { inject, injectable } from 'tsyringe';

import auth from '@config/auth';
import IUsersTokensRepository from '@modules/accounts/repositories/contracts/IUsersTokensRepository';
import AppError from '@shared/errors/AppError';
import IDateProvider from '@shared/container/providers/DateProvider/contracts/IDateProvider';

interface IPayload {
  sub: string;
  email: string;
}

interface IResponse {
  token: string;
  refresh_token: string;
}

@injectable()
class RefreshTokenUseCase {
  constructor(
    @inject('UsersTokensRepository')
    private usersTokensRepository: IUsersTokensRepository,

    @inject('DayjsDateProvider')
    private dateProvider: IDateProvider
  ) {}

  async execute(current_token: string): Promise<IResponse> {
    const { sub: user_id, email } = verify(
      current_token,
      auth.secret_refresh_token
    ) as IPayload;

    const userToken = await this.usersTokensRepository.findByUserIdAndRefreshToken(
      user_id,
      current_token
    );
    if (!userToken) {
      throw new AppError('Refresh Token does not exists', 144);
    }

    await this.usersTokensRepository.deleteById(userToken.id);

    const refresh_token = sign({ email }, auth.secret_refresh_token, {
      subject: user_id,
      expiresIn: auth.expires_in_refresh_token,
    });

    const expires_date = this.dateProvider.add(
      new Date(),
      parseInt(auth.expires_in_refresh_token_days, 10),
      'days'
    );
    await this.usersTokensRepository.create({
      user_id: user_id,
      refresh_token,
      expires_date,
    });

    const token = sign({}, auth.secret_token, {
      subject: user_id,
      expiresIn: auth.expires_in_token,
    });

    return {
      token,
      refresh_token,
    };
  }
}

export default RefreshTokenUseCase;
