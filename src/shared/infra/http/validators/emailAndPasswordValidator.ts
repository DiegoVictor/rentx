import { celebrate, Joi, Segments } from 'celebrate';

export const emailAndPasswordValidator = celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
});
