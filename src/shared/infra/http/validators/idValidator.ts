import { celebrate, Joi, Segments } from 'celebrate';

export const idValidator = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
});
