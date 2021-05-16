import { Joi } from 'celebrate';
import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'joi';

export const fileUploadValidator = (fieldName: string, isMultiple = false) => (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  let error: ValidationError;
  if (isMultiple) {
    const schema = Joi.object().keys({
      [fieldName]: Joi.array().required(),
    });
    ({ error } = schema.validate(
      { [fieldName]: request.files },
      { abortEarly: false }
    ));
  } else {
    const schema = Joi.object().keys({
      [fieldName]: Joi.object().required(),
    });
    ({ error } = schema.validate(
      { [fieldName]: request.file },
      { abortEarly: false }
    ));
  }

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
