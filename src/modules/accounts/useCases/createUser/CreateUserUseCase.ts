import { hash } from 'bcrypt';
import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IUsersRepository from '@modules/accounts/repositories/contracts/IUsersRepository';
import ICreateUserDTO from '@modules/accounts/dtos/ICreateUserDTO';
import UserMap from '@modules/accounts/mappers/UserMap';
import IUserResponseDTO from '@modules/accounts/dtos/IUserResponseDTO';

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
  }: ICreateUserDTO): Promise<IUserResponseDTO> {
    const hashedPassword = await hash(password, 8);

    if (await this.usersRepository.findByEmail(email)) {
      throw new AppError('User already exists', 240);
    }

    const user = await this.usersRepository.create({
      name,
      email,
      driver_license,
      password: hashedPassword,
    });

    return UserMap.toDTO(user);
  }
}

export default CreateUserUseCase;
