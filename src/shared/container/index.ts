import { container } from 'tsyringe';

import '@shared/container/providers';

import IUsersRepository from '@modules/accounts/repositories/contracts/IUsersRepository';
import UsersRepository from '@modules/accounts/infra/typeorm/repositories/UsersRepository';
import { ICategoriesRepository } from '@modules/cars/repositories/contracts/ICategoriesRepository';
import { ISpecificationsRepository } from '@modules/cars/repositories/contracts/ISpecificationsRepository';
import CategoriesRepository from '@modules/cars/infra/typeorm/repositories/CategoriesRepository';
import SpecificationsRepository from '@modules/cars/infra/typeorm/repositories/SpecificationsRepository';
import ICarsRepository from '@modules/cars/repositories/contracts/ICarsRepository';
import CarsRepository from '@modules/cars/infra/typeorm/repositories/CarsRepository';
import ICarsImagesRepository from '@modules/cars/repositories/contracts/ICarsImagesRepository';
import CarsImagesRepository from '@modules/cars/infra/typeorm/repositories/CarsImagesRepository';
import RentalsRepository from '@modules/rentals/infra/typeorm/repositories/RentalsRepository';
import IRentalsRepository from '@modules/rentals/repositories/contracts/IRentalsRepository';
import IUsersTokensRepository from '@modules/accounts/repositories/contracts/IUsersTokensRepository';
import UsersTokensRepository from '@modules/accounts/infra/typeorm/repositories/UsersTokensRepository';

container.registerSingleton<ICategoriesRepository>(
  'CategoriesRepository',
  CategoriesRepository
);

container.registerSingleton<ISpecificationsRepository>(
  'SpecificationsRepository',
  SpecificationsRepository
);

container.registerSingleton<IUsersRepository>(
  'UsersRepository',
  UsersRepository
);

container.registerSingleton<ICarsRepository>('CarsRepository', CarsRepository);

container.registerSingleton<ICarsImagesRepository>(
  'CarsImagesRepository',
  CarsImagesRepository
);

container.registerSingleton<IRentalsRepository>(
  'RentalsRepository',
  RentalsRepository
);

container.registerSingleton<IUsersTokensRepository>(
  'UsersTokensRepository',
  UsersTokensRepository
);
