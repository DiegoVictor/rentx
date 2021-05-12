import { NextFunction, Request, Response } from 'express';
import { container } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IRateLimiterProvider from '@shared/container/providers/RateLimiterProvider/contracts/IRateLimiterProvider';

const rateLimitProvider = container.resolve<IRateLimiterProvider>(
  'RateLimiterProvider'
);

export default async function rateLimiter(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    await rateLimitProvider.consume(request.ip);
    return next();
  } catch (err) {
    throw new AppError('Too many requests', 749, 429);
  }
}
