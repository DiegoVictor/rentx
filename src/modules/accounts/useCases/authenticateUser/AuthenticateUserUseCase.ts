import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IUsersRepository from '@modules/accounts/repositories/contracts/IUsersRepository';
import IUsersTokensRepository from '@modules/accounts/repositories/contracts/IUsersTokensRepository';
import auth from '@config/auth';
import IDateProvider from '@shared/container/providers/DateProvider/contracts/IDateProvider';

interface IRequest {
  email: string;
  password: string;
}

interface IResponse {
  user: {
    name: string;
    email: string;
  };
  token: string;
  refresh_token: string;
}

@injectable()
class AuthenticateUserUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('UsersTokensRepository')
    private usersTokensRepository: IUsersTokensRepository,

    @inject('DayjsDateProvider')
    private dateProvider: IDateProvider
  ) {}

  async execute({ email, password }: IRequest): Promise<IResponse> {
    const user = await this.usersRepository.findByEmail(email);

    const {
      secret_token,
      expires_in_token,
      secret_refresh_token,
      expires_in_refresh_token,
      expires_in_refresh_token_days,
    } = auth;

    if (!user || !(await compare(password, user.password))) {
      throw new AppError('Email or password incorrect', 140);
    }

    const token = sign({}, secret_token, {
      subject: user.id,
      expiresIn: expires_in_token,
    });

    const refresh_token = sign({ email }, secret_refresh_token, {
      subject: user.id,
      expiresIn: expires_in_refresh_token,
    });

    const expires_date = this.dateProvider.add(
      new Date(),
      parseInt(expires_in_refresh_token_days, 10),
      'days'
    );
    await this.usersTokensRepository.create({
      user_id: user.id,
      refresh_token,
      expires_date,
    });

    return {
      token,
      user: {
        name: user.name,
        email: user.email,
      },
      refresh_token,
    };
  }
}

export default AuthenticateUserUseCase;
