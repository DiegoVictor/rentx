import { hash } from 'bcrypt';
import { inject, injectable } from 'tsyringe';

import IUsersRepository from '@modules/accounts/repositories/contracts/IUsersRepository';
import IUsersTokensRepository from '@modules/accounts/repositories/contracts/IUsersTokensRepository';
import IDateProvider from '@shared/container/providers/DateProvider/contracts/IDateProvider';
import AppError from '@shared/errors/AppError';

interface IRequest {
  refresh_token: string;
  password: string;
}

@injectable()
class ResetUserPasswordUseCase {
  constructor(
    @inject('UsersTokensRepository')
    private usersTokensRepository: IUsersTokensRepository,

    @inject('DayjsDateProvider')
    private dateProvider: IDateProvider,

    @inject('UsersRepository')
    private usersRepository: IUsersRepository
  ) {}

  async execute({ refresh_token, password }: IRequest): Promise<void> {
    const userToken = await this.usersTokensRepository.findByRefreshToken(
      refresh_token
    );

    if (!userToken) {
      throw new AppError('Invalid token', 141);
    }

    if (!this.dateProvider.isBefore(new Date(), userToken.expires_date)) {
      throw new AppError('Token expired', 142);
    }

    const user = await this.usersRepository.findById(userToken.user_id);

    user.password = await hash(password, 8);
    await Promise.all([
      this.usersRepository.create(user),
      this.usersTokensRepository.deleteById(userToken.id),
    ]);
  }
}

export default ResetUserPasswordUseCase;
