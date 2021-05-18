import { classToClass } from 'class-transformer';

import IUserResponseDTO from '../dtos/IUserResponseDTO';
import User from '../infra/typeorm/entities/User';

class UserMap {
  static toDTO({
    email,
    name,
    id,
    avatar,
    driver_license,
    avatar_url,
  }: User): IUserResponseDTO {
    return classToClass({
      email,
      name,
      id,
      avatar,
      driver_license,
      avatar_url,
    });
  }
}

export default UserMap;
