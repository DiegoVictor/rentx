import { container } from 'tsyringe';

import IDateProvider from './contracts/IDateProvider';
import DayjsDateProvider from './implementations/DayjsDateProvider';

container.registerSingleton<IDateProvider>(
  'DayjsDateProvider',
  DayjsDateProvider
);
