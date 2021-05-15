import { celebrate, Joi, Segments } from 'celebrate';

export const specificationsIdValidator = celebrate({
  [Segments.BODY]: Joi.object().keys({
    specifications_id: Joi.array().items(Joi.string().uuid()).required(),
  }),
});
