import { container } from 'tsyringe';

import '@shared/container/providers';

import IUsersRepository from '@modules/accounts/repositories/contracts/IUsersRepository';
import UsersRepository from '@modules/accounts/infra/typeorm/repositories/UsersRepository';
import { ICategoriesRepository } from '@modules/cars/repositories/contracts/ICategoriesRepository';
import CategoriesRepository from '@modules/cars/infra/typeorm/repositories/CategoriesRepository';
container.registerSingleton<ICategoriesRepository>(
  'CategoriesRepository',
  CategoriesRepository
);


container.registerSingleton<IUsersRepository>(
  'UsersRepository',
  UsersRepository
);
