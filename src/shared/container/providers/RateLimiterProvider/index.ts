import { container } from 'tsyringe';

import IRateLimiterProvider from './contracts/IRateLimiterProvider';
import RateLimiterProvider from './implementations/RateLimiterProvider';

container.registerSingleton<IRateLimiterProvider>(
  'RateLimiterProvider',
  RateLimiterProvider
);
