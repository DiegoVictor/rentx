import { getRepository, Repository } from 'typeorm';

import ICreateUserTokenDTO from '@modules/accounts/dtos/ICreateUserTokenDTO';
import IUsersTokensRepository from '@modules/accounts/repositories/contracts/IUsersTokensRepository';
import UserToken from '../entities/UserTokens';

class UsersTokensRepository implements IUsersTokensRepository {
  private repository: Repository<UserToken>;

  constructor() {
    this.repository = getRepository(UserToken);
  }

  async create({
    expires_date,
    user_id,
    refresh_token,
  }: ICreateUserTokenDTO): Promise<UserToken> {
    const user_token = this.repository.create({
      expires_date,
      user_id,
      refresh_token,
    });

    await this.repository.save(user_token);

    return user_token;
  }

  async findByUserIdAndRefreshToken(
    user_id: string,
    refresh_token: string
  ): Promise<UserToken> {
    return await this.repository.findOne({ where: { user_id, refresh_token } });
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findByRefreshToken(refresh_token: string): Promise<UserToken> {
    return await this.repository.findOne({ refresh_token });
  }
}

export default UsersTokensRepository;
