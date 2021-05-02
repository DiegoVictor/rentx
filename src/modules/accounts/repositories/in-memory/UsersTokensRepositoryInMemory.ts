import ICreateUserTokenDTO from '@modules/accounts/dtos/ICreateUserTokenDTO';
import UserToken from '@modules/accounts/infra/typeorm/entities/UserTokens';
import IUsersTokensRepository from '../contracts/IUsersTokensRepository';

class UsersTokensRepositoryInMemory implements IUsersTokensRepository {
  usersTokens: UserToken[] = [];

  async create({
    expires_date,
    user_id,
    refresh_token,
  }: ICreateUserTokenDTO): Promise<UserToken> {
    const userToken = new UserToken();

    Object.assign(userToken, {
      expires_date,
      user_id,
      refresh_token,
    });

    this.usersTokens.push(userToken);

    return userToken;
  }

  async findByUserIdAndRefreshToken(
    user_id: string,
    refresh_token: string
  ): Promise<UserToken> {
    return this.usersTokens.find(
      (userToken) =>
        userToken.user_id === user_id &&
        userToken.refresh_token === refresh_token
    );
  }

  async deleteById(id: string): Promise<void> {
    const index = this.usersTokens.findIndex(
      (userToken) => userToken.id === id
    );
    this.usersTokens.splice(index, 1);
  }

  async findByRefreshToken(refresh_token: string): Promise<UserToken> {
    return this.usersTokens.find(
      (userToken) => userToken.refresh_token === refresh_token
    );
  }
}

export default UsersTokensRepositoryInMemory;
