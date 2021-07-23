import { inject, injectable } from 'tsyringe';
import { v4 as uuidV4 } from 'uuid';
import { resolve } from 'path';

import IUsersRepository from '@modules/accounts/repositories/contracts/IUsersRepository';
import IUsersTokensRepository from '@modules/accounts/repositories/contracts/IUsersTokensRepository';
import AppError from '@shared/errors/AppError';
import IDateProvider from '@shared/container/providers/DateProvider/contracts/IDateProvider';
import IMailProvider from '@shared/container/providers/MailProvider/contracts/IMailProvider';

@injectable()
class SendForgotPasswordMailUseCase {
  constructor(
    @inject('UsersRepository')
    private userRepository: IUsersRepository,

    @inject('UsersTokensRepository')
    private usersTokensRepository: IUsersTokensRepository,

    @inject('DayjsDateProvider')
    private dateProvider: IDateProvider,

    @inject('MailProvider')
    private mailProvider: IMailProvider
  ) {}

  async execute(email: string) {
    const user = await this.userRepository.findByEmail(email);
    const templatePath = resolve(
      __dirname,
      '..',
      '..',
      'views',
      'emails',
      'forgotPassword.hbs'
    );

    if (!user) {
      throw new AppError('User does not exists', 244);
    }

    const token = uuidV4();

    const expires_date = this.dateProvider.add(new Date(), 3, 'hours');

    await this.usersTokensRepository.create({
      refresh_token: token,
      user_id: user.id,
      expires_date,
    });

    const variables = {
      name: user.name,
      link: `${process.env.RESET_PASSWORD_URL}/${token}`,
    };

    await this.mailProvider.sendMail(
      email,
      'Recuperação de senha',
      variables,
      templatePath
    );
  }
}

export default SendForgotPasswordMailUseCase;
