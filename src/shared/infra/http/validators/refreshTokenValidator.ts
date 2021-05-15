import { Joi } from 'celebrate';
import { NextFunction, Request, Response } from 'express';

export const refreshTokenValidator = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { body, headers, query } = request;
  const schema = Joi.object()
    .keys({
      token: Joi.string(),
      'x-access-token': Joi.string(),
    })
    .or('token', 'x-access-token')
    .unknown();

  const { error } = schema.validate(
    { ...body, ...headers, ...query },
    { abortEarly: false }
  );

  if (error) {
    const { message } = error.details.pop();
    return response.status(400).json({
      statusCode: 400,
      error: 'Bad Request',
      message: 'celebrate request validation failed',
      validation: {
        body: {
          source: 'body',
          keys: ['token'],
          message,
        },
        headers: {
          source: 'headers',
          keys: ['x-access-token'],
          message,
        },
      },
    });
  }

  next();
};
