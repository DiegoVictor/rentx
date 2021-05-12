import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

import AppError from '@shared/errors/AppError';
import auth from '@config/auth';

interface IPayload {
  sub: string;
}

export default async function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const { authorization } = request.headers;

  if (!authorization) {
    throw new AppError('Missing authorization token', 742, 401);
  }

  const [, token] = authorization.split(' ');

  try {
    const { sub: user_id } = verify(token, auth.secret_token) as IPayload;

    request.user = { id: user_id };

    next();
  } catch (err) {
    throw new AppError('Invalid token', 743, 401);
  }
}
