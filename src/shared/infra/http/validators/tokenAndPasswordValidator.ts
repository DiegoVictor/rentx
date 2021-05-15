import { celebrate, Joi, Segments } from 'celebrate';

export const tokenAndPasswordValidator = celebrate({
  [Segments.BODY]: Joi.object().keys({
    password: Joi.string().required(),
  }),
  [Segments.QUERY]: Joi.object().keys({
    token: Joi.string().required(),
  }),
});
