import { celebrate, Joi, Segments } from 'celebrate';

export const emailValidator = celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
});
