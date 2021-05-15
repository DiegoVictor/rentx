import { inject, injectable } from 'tsyringe';

import IUsersRepository from '@modules/accounts/repositories/contracts/IUsersRepository';
import IUserResponseDTO from '@modules/accounts/dtos/IUserResponseDTO';
import UserMap from '@modules/accounts/mappers/UserMap';
import AppError from '@shared/errors/AppError';

@injectable()
class ProfileUserUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository
  ) {}

  async execute(id: string): Promise<IUserResponseDTO> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new AppError('User does not exists', 245);
    }

    return UserMap.toDTO(user);
  }
}

export default ProfileUserUseCase;
