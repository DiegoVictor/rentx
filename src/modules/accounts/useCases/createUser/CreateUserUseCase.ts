import { hash } from 'bcrypt';
import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IUsersRepository from '@modules/accounts/repositories/contracts/IUsersRepository';
import ICreateUserDTO from '@modules/accounts/dtos/ICreateUserDTO';

@injectable()
class CreateUserUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository
  ) {}

  async execute({
    name,
    email,
    driver_license,
    password,
  }: ICreateUserDTO): Promise<void> {
    const hashedPassword = await hash(password, 8);

    const user = await this.usersRepository.findByEmail(email);
    if (user) {
      throw new AppError('User already exists', 240);
    }

    await this.usersRepository.create({
      name,
      email,
      driver_license,
      password: hashedPassword,
    });
  }
}

export default CreateUserUseCase;
