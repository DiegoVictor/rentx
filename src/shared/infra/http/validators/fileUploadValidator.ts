import { Joi } from 'celebrate';
import { NextFunction, Request, Response } from 'express';

export const fileUploadValidator = (fieldName) => (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const schema = Joi.object().keys({
    [fieldName]: Joi.object().required(),
  });
  const { error } = schema.validate(
    { [fieldName]: request.file },
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
          keys: [fieldName],
          message,
        },
      },
    });
  }

  next();
};
